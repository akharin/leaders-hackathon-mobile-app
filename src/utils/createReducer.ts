interface IAction {
  type: string;
  payload: any;
}

interface IReducerMap<S> {
  [type: string]: (state: S, payload: any) => S;
}

/**
 * Helper для создания reducer
 *
 * @param {*} initialState начальное состояние
 * @param {Object} reducerMap объект, где ключ - тип действия, значение - функция обработчик
 * @returns {function(state, action)} reducer
 */
export default function createReducer<S>(
  initialState: S,
  reducerMap: IReducerMap<S>
) {
  return (state: S = initialState, action: IAction): S => {
    const reducer = reducerMap[action.type];
    return reducer ? reducer(state, action.payload) : state;
  };
}
