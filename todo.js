import { query } from '../services/todo.js'

export default {
  namespace: 'todo',
  state: {
    items: [],
    loading: false,
  },
  load: {
    * effect(payload, { call }, { success, failed }) {
      try {
        const items = yield call(query)
        yield success(items) // 触发成功回调
      } catch (error) {
        yield failed(error) // 触发失败回调
      }
    },
    // 准备
    prepare: state => ({
      ...state,
      loading: true,
    }),
    success: (state, items) => ({
      ...state,
      items: [...items],
      loading: false,
    }),
    failed: (state, error) => ({
      ...state,
      error,
      loading: false,
    }),
  },
  subscriptions: {
    setup({ history }, innerActions) {
      // 监听 history 变化，当进入 `/` 时触发 `load` action
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          innerActions.load()
        }
      })
    },
  },


  query: {
    * effect(condition, { call }, callbacks) {
      try {
        const data = yield call(query)
        yield callbacks.success(data)
      } catch (error) {
        yield callbacks.failed(error)
      }
    },
    prepare: state => ({ ...state, loading: true }),
    success: (state, data) => ({ ...state, data, loading: false }),
    failed: (state, error) => ({ ...state, error, loading: false }),
  },

}
