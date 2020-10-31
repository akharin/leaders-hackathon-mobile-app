import * as types from "../../constants/auth";
import history from "../../utils/getHistory";
import IError from "../../interfaces/IError";
import {
  IUpdateTokensResponse,
  updateTokens as apiUpdateTokens,
} from "../../api/backend/auth";
import preventExtraLoading from "../../core/preventExtraLoading";
import { AppThunkAction } from "../../store/interfaces/thunk";

const updateTokensRequest = () => ({ type: types.UPDATE_TOKENS_REQUEST });

const updateTokensSuccess = () => ({ type: types.UPDATE_TOKENS_SUCCESS });

const updateTokensFailure = (error: IError) => {
  history.push({
    pathname: "/login",
    state: { redirect: history.location },
  });
  return {
    type: types.UPDATE_TOKENS_FAILURE,
    payload: { ...error },
  };
};

/**
 * Обновляет токены
 */
export const updateTokens = () =>
  preventExtraLoading("tokensUpdate", (dispatch) => {
    dispatch(updateTokensRequest());
    return apiUpdateTokens()
      .then((response) => {
        dispatch(updateTokensSuccess());
        return response;
      })
      .catch((error: IError) => {
        dispatch(updateTokensFailure(error));
        return Promise.reject(error);
      });
  }) as AppThunkAction<Promise<IUpdateTokensResponse>>;
