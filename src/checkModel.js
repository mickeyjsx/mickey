import invariant from 'invariant'

export default function checkModel(model, existModels) {
  const { namespace } = model

  invariant(
    namespace,
    'app.model: namespace should be specified',
  )

  invariant(
    typeof namespace === 'string',
    `app.model: namespace should be string, but got ${typeof namespace}`,
  )

  invariant(
    !existModels.some(m => m.namespace === namespace),
    'app.model: namespace should be unique',
  )
}

