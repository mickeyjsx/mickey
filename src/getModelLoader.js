import warning from 'warning'
import { getNamespace } from './utils'


export default function getModelLoader(app, dir) {
  // 只能通过 webpack-plugin-pease-hmr 来解
  // app.setModelDir(dir)
  // app.load(path)

  const params = [dir, true, /\.js$/]
  const context = require.context(...params)
  const modelMap = {}

  if (module.hot) {
    module.hot.accept(context.id, () => {
      try {
        const hmrContext = require.context(...params)
        hmrContext.keys()
          .map(path => [path, hmrContext(path)])
          .filter(item => modelMap[item[0]] !== item[1])
          .forEach((item) => {
            const [path, raw] = item
            const namespace = getNamespace(path)
            const model = {
              ...raw,
              namespace,
            }

            modelMap[path] = model
            app.unmodel(namespace)
            app.model(model)
          })
      } catch (e) {
        console.error(e) // eslint-disable-line no-console
      }
    })
  }

  const load = (path) => {
    const raw = context(path)
    if (raw) {
      const model = {
        ...raw,
        namespace: getNamespace(path),
      }
      modelMap[path] = model
      app.model(model)
    } else {
      warning(
        process.env.NODE_ENV === 'production',
        `The model "${path}" is unavailable.`,
      )
    }
  }

  return (path) => {
    if (path) {
      load(path)
    } else {
      context.keys().forEach(load)
    }
  }
}

