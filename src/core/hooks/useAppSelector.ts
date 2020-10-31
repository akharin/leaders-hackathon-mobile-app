import { useSelector } from "react-redux";
import { IState } from "../../store/modules";

export default <R = unknown>(
  selector: (state: IState) => R,
  equalityFn?: (left: R, right: R) => boolean
) => useSelector<IState, ReturnType<typeof selector>>(selector, equalityFn);
