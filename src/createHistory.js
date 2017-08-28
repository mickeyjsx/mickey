import createHashHistory from 'history/createHashHistory';
import createMemoryHistory from 'history/createMemoryHistory';
import createBrowserHistory from 'history/createBrowserHistory';

export default function createHistory(historyModel) {
  if (historyModel === 'hash') {
    return createHashHistory();
  } else if (historyModel === 'browser') {
    return createBrowserHistory();
  } else if (historyModel === 'memory') {
    return createMemoryHistory();
  }
  return null;
}
