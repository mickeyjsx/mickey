import { MUTATE } from './constants'

// * 基本的 model reducer，可以直接 mutate 一个 model 的 state
export default {
  [MUTATE]: <S extends {} = {}, P extends {} = {}>(state: S, payload: P) => ({
    ...state,
    ...payload,
  }),
};
