import * as types from "../../constants/profile";
import IError from "../../interfaces/IError";
import IUser from "../../interfaces/IUser";
// @ts-ignore
import { CALL_BACKEND_API } from "../middlewares/backendMiddleware";
import { fetchProfile as apiGetProfile } from "../../api/backend/profile";

const getCurrentUserRequest = () => ({ type: types.GET_PROFILE_REQUEST });

const getCurrentUserSuccess = (response: IUser) => ({
  type: types.GET_PROFILE_SUCCESS,
  payload: { ...response },
});

const getCurrentUserFailure = (error: IError) => ({
  type: types.GET_PROFILE_FAILURE,
  payload: { ...error },
});

/**
 * Запрашивает информацию о текущем пользователе
 */
export const getProfile = () => ({
  [CALL_BACKEND_API]: {
    actions: [
      getCurrentUserRequest,
      getCurrentUserSuccess,
      getCurrentUserFailure,
    ],
    promise: apiGetProfile,
  },
});
