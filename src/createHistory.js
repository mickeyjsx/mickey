import invariant from 'invariant'
import createHashHistory from 'history/createHashHistory'
import createMemoryHistory from 'history/createMemoryHistory'
import createBrowserHistory from 'history/createBrowserHistory'

const historyModes = ['browser', 'hash', 'memory']

export default function createHistory(historyMode) {
  if (historyMode) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        historyModes.includes(historyMode),
        `createHistory: historyMode "${historyMode}" is invalid, must be one of ${historyModes.join(', ')}!`,
      )
    }

    if (historyMode === 'hash') {
      return createHashHistory()
    } else if (historyMode === 'browser') {
      return createBrowserHistory()
    } else if (historyMode === 'memory') {
      return createMemoryHistory()
    }
  }

  return null
}
