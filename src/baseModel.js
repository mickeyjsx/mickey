import { MUTATE } from './constants'

export default {
  [MUTATE]: (state, payload) => ({
    ...state,
    ...payload,
  }),
}
