const normalize = (err) => {
  if (typeof err === 'string') {
    return new Error(err)
  }
  return err
}

const defaultErrorHandler = (err) => { throw err }

export default function createErrorHandler(app) {
  return (err) => {
    if (err) {
      const handler = app.plugin.apply('onError', defaultErrorHandler)
      handler(normalize(err), app)
    }
  }
}
