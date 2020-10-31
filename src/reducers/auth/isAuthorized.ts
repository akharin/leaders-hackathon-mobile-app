import * as types from "../../constants/auth";
import createReducer from "../../utils/createReducer";

const isAuthorized = createReducer<boolean>(false, {
  [types.LOGIN_REQUEST]: () => false,
  [types.LOGIN_SUCCESS]: () => true,
  [types.LOGIN_FAILURE]: () => false,
  [types.CHECK_AUTH_SUCCESS]: () => true,
  [types.CHECK_AUTH_FAILURE]: () => false,
  [types.UPDATE_TOKENS_FAILURE]: () => false,
  [types.LOGOUT]: () => false,
});

export default isAuthorized;
