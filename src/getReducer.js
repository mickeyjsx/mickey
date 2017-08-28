import { handleActions } from 'redux-actions';
import { getEnhancer } from './utils';


const defaultReducerCreator = (state, handlers) => handleActions(handlers, state);

function wrapReducers(reducers) {
  return Object.keys(reducers).reduce((memo, type) => ({
    ...memo,
    // call reducer with `state` and `payload`
    [type]: (state, action) => reducers[type](state, action.payload),
  }), {});
}

export default function getReducer(globalReducerCreator, model) {
  const { state, reducers, enhancers, reducerCreator } = model;
  const enhancer = getEnhancer(enhancers);
  const creator = reducerCreator || globalReducerCreator || defaultReducerCreator;
  return enhancer(creator(state, wrapReducers(reducers)));
}
