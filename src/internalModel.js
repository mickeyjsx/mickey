// internal model to update global state when do unmodel
export default {
  namespace: '@@INTERNAL',
  state: 0,
  reducers: {
    UPDATE(state) { return state + 1; },
  },
};
