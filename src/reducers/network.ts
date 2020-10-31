import createReducer from "../utils/createReducer";
import * as types from "../constants/network";
import { ConnectionStatus } from "../enums/ConnectionStatus";
import ICachingStatus from "../interfaces/ICachingStatus";

interface INetworkState {
  connectionStatus: ConnectionStatus;
  cachingStatus: ICachingStatus;
}

const initialState = {
  connectionStatus: "ok",
  cachingStatus: "proposed",
} as INetworkState;

const network = createReducer<INetworkState>(initialState, {
  [types.CHANGE_CONNECTION_STATUS]: (state, payload: ConnectionStatus) => ({
    ...state,
    connectionStatus: payload !== undefined ? payload : state.connectionStatus,
  }),
  [types.CHANGE_CACHING_STATUS]: (state, payload: ICachingStatus) => ({
    ...state,
    cachingStatus: payload !== undefined ? payload : state.cachingStatus,
  }),
});

export type { INetworkState };
export default network;
