import { AnyAction, bindActionCreators } from "redux";
import { useDispatch } from "react-redux";
import { DependencyList, useMemo } from "react";
import { AppThunkAction } from "../../store/interfaces/thunk";

export function useActions(
  actions: AnyAction | AppThunkAction | Array<AnyAction | AppThunkAction>,
  deps: DependencyList | undefined
) {
  const dispatch = useDispatch();
  return useMemo(() => {
    if (Array.isArray(actions)) {
      //@ts-ignore
      return bindActionCreators<AnyAction | AppThunkAction>(actions, dispatch);
    }
    //@ts-ignore
    return bindActionCreators(actions, dispatch);
  }, [actions, dispatch]);
}
