import warning from 'warning';
import invariant from 'invariant';
import { prefixAndValidate, prefixType } from './utils';

export default function prefixDispatch(dispatch, model) {
  return (action) => {
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
  };
}
