import invariant from 'invariant';
import { UnderlyingModel } from './createModel';

export default function checkModel<S extends {} = {}>(model: UnderlyingModel<S>, models: UnderlyingModel<any>[]) {
  const { namespace } = model;

  invariant(
    namespace,
    'app.model: namespace should be specified',
  );

  invariant(
    typeof namespace === 'string',
    `app.model: namespace should be string, but got ${typeof namespace}`,
  );

  invariant(
    !models.some(m => m.namespace === namespace),
    'app.model: namespace should be unique',
  );
}

