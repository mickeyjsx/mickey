import invariant from 'invariant'
import { combineReducers } from 'redux'
import { NAMESPACE_SEP } from './constants'
import { isFunction } from './utils'

function parseNamespace(reducers) {
  return Object.keys(reducers).reduce((memo, key) => {
    const nss = key.split(NAMESPACE_SEP)
    let temp = memo

    nss.forEach((ns, index) => {
      if (!temp[ns]) {
        temp[ns] = index === nss.length - 1 ? reducers[key] : {}
      }
      temp = temp[ns]
    })

    return memo
  }, {})
}

export default function createReducer({
  reducers,
  asyncReducers = {},
  extraReducers,
  reducerEnhancer,
  combineReducers: globalCombineReducers,
}) {
  const combineMethod = globalCombineReducers || combineReducers
  const merged = { ...reducers, ...asyncReducers }
  const combine = section => Object.keys(section).reduce((memo, key) => ({
    ...memo,
    [key]: isFunction(section[key])
      ? section[key]
      : combineMethod(combine(section[key])),
  }), {})

  if (process.env.NODE_ENV !== 'production') {
    invariant(
      Object.keys(extraReducers).every(key => !(key in merged)),
      `createReducer: extraReducers is conflict with other reducers, reducers list: ${Object.keys(merged).join(', ')}`,
    )
  }

  const parsed = parseNamespace(merged)
  const combined = combine(parsed)

  return reducerEnhancer(combineMethod({
    ...combined,
    ...extraReducers,
  }))
}
