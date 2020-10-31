import { Action, ActionCreator, AnyAction, Middleware } from "redux";
import { IState } from "../modules";
import { AppThunkAction } from "../interfaces/thunk";

const API_ACTION_TYPE = "callApi";
const connectionErrors = [502, 503, 504, 0];

export interface ApiAction<R = unknown> extends Action<string> {
  type: typeof API_ACTION_TYPE;
  request: ActionCreator<AnyAction | AppThunkAction>;
  success: ActionCreator<AnyAction | AppThunkAction>;
  failure: ActionCreator<AnyAction | AppThunkAction>;
  call: () => Promise<R>;
}

export type ApiDispatch<R = unknown> = (action: ApiAction<R>) => Promise<R>;

type UpdateTokensActionCreator = () => AppThunkAction<Promise<unknown>>;

type ChangeConnStatusActionCreator = (
  status: string
) => Action | AppThunkAction;

// type MergedAction = Action | ThunkAction<unknown, IState, never, Action>;

// type MergedDispatch = Dispatch | ThunkDispatch<IState, never, AnyAction>;

type ApiMiddleware = Middleware<ApiDispatch, IState, any>;

/**
 * Middleware для обработки вызовов к backend api
 *
 * @param updateTokens действие, вызываемое для обновления токенов
 * @param changeConnStatus действие, вызываемое при отсутствии соединения с сервером
 */
export default (
  updateTokens: UpdateTokensActionCreator,
  changeConnStatus: ChangeConnStatusActionCreator
): ApiMiddleware => ({ dispatch }) => (next) => (
  action: Action | ApiAction
) => {
  if (action.type !== API_ACTION_TYPE) {
    return next(action);
  }

  const { request, success, failure, call } = action as ApiAction;
  dispatch(request());

  return call()
    .then((response) => {
      dispatch(success(response));
      return response;
    })
    .catch((error) => {
      // TODO Оставить только error.statusCode после перехода на nest
      const status =
        error.statusCode ||
        error.status ||
        error.code ||
        (error.target && error.target.status);

      if (status === 401) {
        return dispatch(updateTokens())
          .then(() => call())
          .then((response: any) => {
            dispatch(success(response));
            return response;
          })
          .catch((updateTokensError: any) => {
            dispatch(failure(updateTokensError));
            return Promise.reject(updateTokensError);
          });
      }
      if (connectionErrors.includes(status)) {
        dispatch(changeConnStatus("error"));
      }
      dispatch(failure(error));
      return Promise.reject(error);
    });
};

export const createApiAction = <R>(
  request: ActionCreator<Action | AppThunkAction>,
  success: ActionCreator<Action | AppThunkAction>,
  failure: ActionCreator<Action | AppThunkAction>,
  call: () => Promise<R>
): ApiAction<R> => ({
  type: API_ACTION_TYPE,
  request,
  success,
  failure,
  call,
});
