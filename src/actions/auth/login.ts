import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { IState } from "../../store/modules";
import * as types from "../../constants/auth";
import IError from "../../interfaces/IError";
import { ILoginResponse, login as apiLogin } from "../../api/backend/auth";

export const loginRequest = () => ({ type: types.LOGIN_REQUEST });

export const loginSuccess = (
  response: ILoginResponse
): ThunkAction<void, IState, null, Action> => (
  dispatch,
  getState: () => IState
) => {
  const state = getState();
  if (
    state.auth.userId.previous &&
    state.auth.userId.previous !== response.user.id
  ) {
    dispatch({ type: types.CLEAR_STORE });
  }
  dispatch({
    type: types.LOGIN_SUCCESS,
    payload: { ...response.user },
  });
};

export const loginFailure = (error: IError) => ({
  type: types.LOGIN_FAILURE,
  payload: { ...error },
});

/**
 * Аутентифицирует по email и паролю
 *
 * @param {string} email email пользователя
 * @param {string} password пароль пользователя
 * @return {ThunkAction} action
 */
export const login = (
  email: string,
  password: string
): ThunkAction<Promise<ILoginResponse>, IState, null, Action> => async (
  dispatch
) => {
  dispatch(loginRequest());
  try {
    const response = await apiLogin(email, password);
    dispatch(loginSuccess(response));
    return response;
  } catch (error) {
    dispatch(loginFailure(error));
    return Promise.reject(error);
  }
};
