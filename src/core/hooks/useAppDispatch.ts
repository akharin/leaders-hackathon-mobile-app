import { useDispatch } from "react-redux";
import { AppThunkDispatch } from "../../store/interfaces/thunk";

export default () => useDispatch<AppThunkDispatch>();
