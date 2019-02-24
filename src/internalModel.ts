// internal model to update global state when do unmodel
export default {
  namespace: '@@MICKEY',
  state: 0,
  reducers: {
    UPDATE(state: number) { return state + 1 },
  },
};
