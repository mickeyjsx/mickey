import checkModel from './checkModel';
import createModel, { BaseRawModel, UnderlyingModel } from './createModel';
import { addActions } from './actions';
import { App } from './createApp';

// * 转化 model 为内部使用的 model，并且把 model 都 push 到 app 的 models 里，把 action 都塞进 app 的 actions 里
export default function registerModel<S>(app: App, raw: BaseRawModel<S>): UnderlyingModel<S> {
  const model: UnderlyingModel<S> = createModel(raw);
  if (process.env.NODE_ENV !== 'production') {
    checkModel(model, app.models);
  }
  app.models.push(model);
  addActions(app, model);
  return model;
}
