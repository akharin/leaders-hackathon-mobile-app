import * as types from "../../constants/auth";
import history from "../../utils/getHistory";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { IState } from "../../store/modules";
import IError from "../../interfaces/IError";
import IUser from "../../interfaces/IUser";
import { updateTokens } from "../../actions/auth/updateTokens";
import { fetchProfile } from "../../api/backend/profile";
import { HttpStatus } from "../../enums/HttpStatus";

const checkAuthRequest = () => ({ type: types.CHECK_AUTH_REQUEST });

const checkAuthSuccess = (
  response: IUser
): ThunkAction<void, IState, null, Action> => (
  dispatch,
  getState: () => IState
) => {
  const state = getState();
  if (
    state.auth.userId.previous &&
    state.auth.userId.previous !== response.id
  ) {
    dispatch({ type: types.CLEAR_STORE });
  }
  dispatch({
    type: types.CHECK_AUTH_SUCCESS,
    payload: { ...response },
  });
};

const checkAuthFailure = (error: IError) => ({
  type: types.CHECK_AUTH_FAILURE,
  payload: { ...error },
});

/**
 * Проверяет аутентификацю пользователя, запрашивая его данные
 *
 * @return {function} action
 */
export const checkAuth = (): ThunkAction<
  Promise<IUser>,
  IState,
  null,
  Action
> => async (dispatch) => {
  dispatch(checkAuthRequest());
  try {
    const response = await fetchProfile();
    dispatch(checkAuthSuccess(response));
    return response;
  } catch (error) {
    if (error.statusCode === HttpStatus.UNAUTHORIZED) {
      try {
        //@ts-ignore
        await dispatch(updateTokens());
        const res = await fetchProfile();
        dispatch(checkAuthSuccess(res));
        return res;
      } catch (err) {
        dispatch(checkAuthFailure(err));
        return Promise.reject(err);
      }
    }
    dispatch(checkAuthFailure(error));
    history.push({
      pathname: "/login",
      state: { redirect: history.location },
    });
    return Promise.reject(error);
  }
};
