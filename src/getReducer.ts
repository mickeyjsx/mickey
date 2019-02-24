import { handleActions, ReducerMap } from 'redux-actions';
import { ReducerEnhancer } from './plugin';
import { getEnhancer } from './utils';
import { Reducer } from 'redux';
import { MickeyReducer, UnderlyingModel } from './createModel';

export interface ReducerCreator {
  (state: any, handlers: ReducerMap<any, any>): Reducer;
};

const defaultReducerCreator: ReducerCreator = (state, handlers) => handleActions(handlers, state);

function wrap<S extends {} = {}>(reducers: { [k: string]: MickeyReducer<S> }): ReducerMap<S, any> {
  return Object.keys(reducers).reduce((memo: ReducerMap<S, any>, type: string) => ({
    ...memo,
    // call reducer with `state` and `payload`
    // eslint-disable-next-line
    [type]: (state: any, action: { payload: any }) => reducers[type](state, action.payload),
  }), {});
}

export default function getReducer<S extends {} = {}>(passedCreateReducer: ReducerCreator | undefined, model: UnderlyingModel<S>): Reducer {
  const { state, reducers, enhancers, createReducer } = model;
  const enhancer: ReducerEnhancer = getEnhancer(enhancers);
  const creator: ReducerCreator = createReducer || passedCreateReducer || defaultReducerCreator;
  return enhancer(creator(state, wrap(reducers)));
};
