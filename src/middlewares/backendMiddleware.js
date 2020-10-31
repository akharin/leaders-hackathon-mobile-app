/* eslint-disable no-shadow */
const connectionErrors = [502, 503, 504, 0];

export const CALL_BACKEND_API = Symbol('Call API');

/**
 * Middleware для обработки вызовов к backend api
 * @param {Function} updateTokens действие, вызываемое для обновления токенов
 * @param {Function} changeConnectionStatus действие, вызываемое при отсутствии соединения с сервером
 */
export default (updateTokens, changeConnectionStatus) => ({dispatch}) => next => action => {
	const callAPI = action[CALL_BACKEND_API];
	if (typeof callAPI === 'undefined') {
		return next(action);
	}

	const {actions, promise} = callAPI;
	if (!Array.isArray(actions) || actions.length !== 3) {
		throw new Error('Отсутствует массив actions с тремя элементами.');
	}
	if (!actions.every(act => typeof act === 'function')) {
		throw new Error('Элементы в actions должны быть функциями.');
	}
	if (!promise || typeof promise !== 'function') {
		throw new Error('Promise function is not found');
	}

	const [request, success, failure] = actions;
	dispatch(request());

	return promise()
		.then(response => {
			dispatch(success(response));
			return response;
		})
		.catch(error => {
			// TODO Оставить только error.code после полноценного внедрения кодов ошибок
			const status = error.statusCode || error.status || error.code || (error.target && error.target.status);

			if (status === 401) {
				return dispatch(updateTokens())
					.then(() => promise())
					.then(response => {
						dispatch(success(response));
						return response;
					})
					.catch(error => {
						dispatch(failure(error));
						return Promise.reject(error);
					});
			}
			if (connectionErrors.includes(status)) {
				dispatch(changeConnectionStatus('error'));
			}

			dispatch(failure(error));
			return Promise.reject(error);
		});
};
