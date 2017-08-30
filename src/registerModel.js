import checkModel from './checkModel'
import createModel from './createModel'
import { addActions } from './actions'

export default function registerModel(app, raw) {
  const model = createModel(raw)
  if (process.env.NODE_ENV !== 'production') {
    checkModel(model, app.models)
  }
  app.models.push(model)
  addActions(app, model)
  return model
}
