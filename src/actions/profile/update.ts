import * as types from "../../constants/profile";
// @ts-ignore
import SocketConnector from "../../api/SocketConnector";
import IError from "../../interfaces/IError";
import IUser from "../../interfaces/IUser";
// @ts-ignore
import { CALL_BACKEND_API } from "../middlewares/backendMiddleware";

const socketConnector = SocketConnector.instance;

const updateCurrentUserRequest = () => ({ type: types.UPDATE_PROFILE_REQUEST });

const updateCurrentUserSuccess = (response: IUser) => ({
  type: types.UPDATE_PROFILE_SUCCESS,
  payload: { ...response },
});

const updateCurrentUserFailure = (error: IError) => ({
  type: types.UPDATE_PROFILE_FAILURE,
  payload: { ...error },
});

/**
 * Изменяет информацию о текущем пользователе
 *
 * @param {string} email email пользователя
 * @param {string} fullName полное фио
 * @param {string} position должность
 * @param {string} password пароль пользователя
 * @return {{}}
 */
export const updateProfile = (
  email: string,
  fullName: string,
  position: string,
  password: string
) => ({
  [CALL_BACKEND_API]: {
    actions: [
      updateCurrentUserRequest,
      updateCurrentUserSuccess,
      updateCurrentUserFailure,
    ],
    promise: () =>
      socketConnector.updateCurrentUser(email, fullName, position, password),
  },
});
