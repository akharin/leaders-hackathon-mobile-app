import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';

/**
 * Предотвращает одновременное выполнение асинхронного действия
 *
 * @param key ключ для идентификации действия
 * @param action действие
 */
export default (() => {
	const loaders: {[key: string]: any} = {};

	const createLoader = <R, S, A extends Action>(
		key: string,
		action: ThunkAction<Promise<R>, S, unknown, A>
	): ThunkAction<Promise<R>, S, unknown, A> => {
		let promise: Promise<R> | undefined;

		return dispatch => {
			if (!promise) {
				promise = dispatch(action).finally(() => {
					promise = undefined;
					delete loaders[key];
				});
			}
			return promise;
		};
	};

	return <R, S, A extends Action>(key: string, action: ThunkAction<Promise<R>, S, unknown, A>): ThunkAction<Promise<R>, S, unknown, A> => {
		if (!loaders.hasOwnProperty(key)) {
			loaders[key] = createLoader<R, S, A>(key, action);
		}
		return loaders[key];
	};
})();