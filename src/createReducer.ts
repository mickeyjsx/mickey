import invariant from 'invariant';
import { combineReducers, ReducersMapObject, Reducer } from 'redux';
import { History } from 'history';
import { connectRouter } from 'connected-react-router';
import { NAMESPACE_SEP } from './constants';
import { isFunction } from './utils';
import { RecurReducer } from './createApp';
import { ReducerEnhancer } from './plugin';

// Escape namespaced key into recursive form
function parseNamespace(reducers: RecurReducer): RecurReducer {
  return Object.keys(reducers).reduce((memo, key) => {
    const nss: string[] = key.split(NAMESPACE_SEP);
    let temp = memo;

    nss.forEach((ns, index) => {
      if (!temp[ns]) {
        temp[ns] = index === nss.length - 1 ? reducers[key] : {};
      }
      temp = temp[ns] as any;
    });

    return memo;
  }, {} as RecurReducer);
}

interface CreateReducerParam {
  history?: History;
  reducers?: RecurReducer;
  asyncReducers?: RecurReducer;
  extraReducers?: ReducersMapObject;
  reducerEnhancer: ReducerEnhancer;
  combineReducers?: (<S extends {} = {}>(rdm: ReducersMapObject<S, any>) => Reducer<S>);
}
// * 把 app 的 reducers, asyncReducers, extraReducers 合起来，其中 app 的 reducers 和 asyncReducers 利用 combineReducers 函数合并，最后返回总的 reducer，中间会被 reducerEnhander 增强
export default function createReducer(param: CreateReducerParam): Reducer {
  const {
    history,
    reducers,
    asyncReducers = {},
    extraReducers,
    reducerEnhancer,
    combineReducers: globalCombineReducers,
  } = param;
  const combineMethod = globalCombineReducers || combineReducers;
  const mergedReducers = { ...reducers, ...asyncReducers };
  const combine = (section: RecurReducer): ReducersMapObject => Object.keys(section).reduce((memo, key: string) => ({
    ...memo,
    [key]: isFunction(section[key])
      ? section[key]
      : combineMethod(combine(section[key] as RecurReducer)),
  }), {});

  if (process.env.NODE_ENV !== 'production') {
    invariant(
      Object.keys(extraReducers as ReducersMapObject).every(key => !(key in mergedReducers)),
      `createReducer: extraReducers is conflict with other reducers, reducers list: ${Object.keys(mergedReducers).join(', ')}`,
    );
  }

  const parsedReducersWithNamespace: RecurReducer = parseNamespace(mergedReducers);
  const combinedReducer = combine(parsedReducersWithNamespace);
  const rootReducer: Reducer = combineMethod({
    ...combinedReducer,
    ...extraReducers,
  });

  return reducerEnhancer(
    history
      ? {...connectRouter(history), ...rootReducer} as Reducer
      : rootReducer,
  );
};
