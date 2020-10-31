import createReducer from "../../utils/createReducer";
import * as types from "../../constants/auth";
import IUser from "../../interfaces/IUser";

export interface IAuthUserIdState {
  previous?: string;
  current?: string;
}

const initialState: IAuthUserIdState = {
  previous: undefined,
  current: undefined,
};

const userId = createReducer<IAuthUserIdState>(initialState, {
  [types.LOGIN_REQUEST]: (state) => ({
    current: undefined,
    previous: state.previous,
  }),
  [types.LOGIN_SUCCESS]: (state, payload: IUser) => ({
    current: payload.id,
    previous: undefined,
  }),
  [types.LOGIN_FAILURE]: (state) => ({
    current: undefined,
    previous: state.previous,
  }),
  [types.CHECK_AUTH_SUCCESS]: (state, payload: IUser) => ({
    current: payload.id,
    previous: undefined,
  }),
  [types.CHECK_AUTH_FAILURE]: (state) => ({
    current: undefined,
    previous: state.current,
  }),
  [types.UPDATE_TOKENS_FAILURE]: (state) => ({
    current: undefined,
    previous: state.current,
  }),
  [types.LOGOUT]: (state) => ({
    current: undefined,
    previous: state.current,
  }),
});
export default userId;
