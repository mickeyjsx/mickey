import { routerReducer, routerMiddleware } from 'react-router-redux'

export default function steupHistoryHooks(history, hooks) {
  if (history) {
    const routeMiddleware = routerMiddleware(history)
    if (!hooks.onAction) {
      hooks.onAction = [routeMiddleware]
    } else {
      hooks.onAction.push(routeMiddleware)
    }

    const extraReducer = { router: routerReducer }
    if (!hooks.extraReducers) {
      hooks.extraReducers = [extraReducer]
    } else {
      hooks.extraReducers.push(extraReducer)
    }
  }
}
