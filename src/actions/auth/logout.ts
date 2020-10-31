import { ThunkAction } from "redux-thunk";
import { IState } from "../../store/modules";
import { Action } from "redux";
import * as types from "../../constants/auth";
import { logout as apiLogout } from "../../api/backend/auth";

/**
 * Сбрасывает аутентификацию и перенаправляет на страницу входа
 *
 * @returns {function} action
 */
export const logout = (): ThunkAction<
  Promise<void>,
  IState,
  null,
  Action
> => async (dispatch, getState) => {
  const state = getState();

  dispatch({ type: types.LOGOUT });
  dispatch({ type: types.CLEAR_STORE });

  try {
    await apiLogout();
  } catch (error) {
    //
  }
};
