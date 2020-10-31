import {HttpStatus} from '../enums/HttpStatus';

/**
 * Отслеживает длительность времени ожидания ответа
 *
 * @param callback callback
 * @param delay время ожидания
 */
export default function(callback: (...args: any[]) => any, delay = 30) {
	let called = false;

	const interval = setTimeout(() => {
		if (called) {
			return;
		}
		called = true;
		callback({
			code: 680,
			statusCode: HttpStatus.REQUEST_TIMEOUT,
			error: 'TimeoutError',
			message: 'Timeout exceeded'
		});
	}, delay * 1000);

	return (...args: any[]) => {
		if (called) {
			return;
		}
		called = true;
		clearTimeout(interval);
		callback(...args);
	};
}
