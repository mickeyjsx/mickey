import warning from 'warning';
import invariant from 'invariant';
import { Dispatch, AnyAction } from 'redux';
import { prefixAndValidate, prefixType } from './utils';
import { UnderlyingModel } from './createModel';

export default function prefixDispatch<S extends {} = {}>(dispatch: Dispatch, model: UnderlyingModel<S>) {
  return (action: AnyAction) => {
    const { type } = action;

    if (process.env.NODE_ENV !== 'production') {
      const { namespace } = model;
      invariant(type, 'innerDispatch: action should be a plain Object with type');
      warning(
        type.indexOf(prefixType(namespace, '')) !== 0,
        `innerDispatch: ${type} should not be prefixed with namespace ${namespace}`,
      );
    }

    return dispatch({ ...action, type: prefixAndValidate(type, model) });
  }
};
