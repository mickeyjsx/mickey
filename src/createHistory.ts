import invariant from 'invariant'
import {
  History,
  createHashHistory,
  createMemoryHistory,
  createBrowserHistory,
} from 'history'

export type HistoryMode = 'browser' | 'hash' | 'memory';

const historyModes: HistoryMode[] = ['browser', 'hash', 'memory'];

export default function createHistory(historyMode: HistoryMode): History | null {
  if (historyMode) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        historyModes.includes(historyMode),
        `historyMode "${historyMode}" is invalid, must be one of ${historyModes.join(', ')}!`,
      );
    }

    if (historyMode === 'hash') {
      return createHashHistory();
    } else if (historyMode === 'browser') {
      return createBrowserHistory();
    } else if (historyMode === 'memory') {
      return createMemoryHistory();
    }
  }

  return null;
};
