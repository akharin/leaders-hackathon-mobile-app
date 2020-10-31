import { IState } from "../modules"; //проверено
import { AnyAction } from "redux";
import { ApiAction } from "../middlewares/api";
import { ThunkAction, ThunkDispatch } from "redux-thunk";

export type AppThunkAction<R = void> = ThunkAction<
  R,
  IState,
  never,
  AnyAction | ApiAction
> & {
  // type: unknown;
};

export interface AppThunkDispatch
  extends ThunkDispatch<IState, never, AnyAction> {
  <R = unknown>(apiAction: ApiAction<R>): Promise<R>;
}
