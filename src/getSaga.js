/* eslint-disable func-names */
import warning from 'warning'
import invariant from 'invariant'
import {
  takeEveryHelper as takeEvery,
  takeLatestHelper as takeLatest,
  throttleHelper as throttle,
} from 'redux-saga/lib/internal/sagaHelpers'
import { delay, CANCEL as CANCEL_DELAY } from 'redux-saga'
import * as sagaEffects from 'redux-saga/effects'
import { prefixType, unfixType, prefixAndValidate } from './utils'
import { getModelActions } from './actions'


function applyOnEffect(onEffect, effect, model, type) {
  return onEffect.reduce(
    (memo, handler) => handler(memo, sagaEffects, model, type),
    effect,
  )
}

function getEffects(model) {
  const { put, take } = sagaEffects
  const { namespace } = model

  function assertAction(type, name) {
    invariant(type, `${name}: action should be a plain Object with type`)
    warning(
      type.indexOf(prefixType(namespace, '')) !== 0,
      `${name}: ${type} should not be prefixed with namespace "${namespace}"`,
    )
  }

  function innerPut(action) {
    const { type } = action
    assertAction(type, 'innerPut')
    return put({ ...action, type: prefixAndValidate(type, model) })
  }

  function innerTake(type) {
    if (typeof type === 'string') {
      assertAction(type, 'innerTake')
      return take(prefixAndValidate(type, model))
    }
    return take(type)
  }

  return {
    ...sagaEffects,
    delay,
    CANCEL_DELAY,
    innerPut,
    innerTake,
  }
}

function getCallbacks(model, actionType) {
  const { put } = sagaEffects
  const { namespace, effects, callbacks } = model
  const callbackEffects = {}
  if (effects[actionType] && callbacks[actionType]) {
    callbacks[actionType].forEach((callback) => {
      callbackEffects[callback] = (payload) => {
        const actionName = unfixType(namespace, actionType)
        const prefixed = prefixType(actionName, callback)
        const fullType = prefixAndValidate(prefixed, model)
        return put({ payload, type: fullType })
      }
    })
  }

  return callbackEffects
}

function getWatcher({ resolve, reject, onError, onEffect, type, effect, app, model }) {
  let effectFn = effect
  let effectType = 'takeEvery'
  let ms

  if (Array.isArray(effect)) {
    effectFn = effect[0]
    const options = effect[1]
    if (options && options.type) {
      effectType = options.type
      if (effectType === 'throttle') {
        invariant(
          options.ms,
          'getSaga: options.ms should be defined if type is throttle',
        )
        ms = options.ms
      }
    }
    invariant(
      ['watcher', 'takeEvery', 'takeLatest', 'throttle'].includes(effectType),
      'getSaga: effect type should be takeEvery, takeLatest, throttle or watcher',
    )
  }

  function* sagaWithCatch(...args) {
    const { put } = sagaEffects
    try {
      yield put({ type: prefixType(type, '@@start') })
      const { payload } = args[0]
      const result = yield effectFn(
        payload,
        getEffects(model),
        getCallbacks(model, type),
        getModelActions(model, put),
        app.actions,
      )
      yield put({ type: prefixType(type, '@@end') })
      resolve(type, result)
    } catch (err) {
      onError(err)
      reject(type, err)
    }
  }

  const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, type)

  switch (effectType) {
    case 'watcher':
      return sagaWithCatch
    case 'takeLatest':
      return function* () {
        yield takeLatest(type, sagaWithOnEffect)
      }
    case 'throttle':
      return function* () {
        yield throttle(ms, type, sagaWithOnEffect)
      }
    default:
      return function* () {
        yield takeEvery(type, sagaWithOnEffect)
      }
  }
}

export default function getSaga(resolve, reject, onError, onEffect, app, model) {
  return function* () {
    const { effects, namespace } = model
    const keys = Object.keys(effects)
    for (let i = 0, l = keys.length; i < l; i += 1) {
      const type = keys[i]
      const watcher = getWatcher({
        resolve,
        reject,
        onError,
        onEffect,
        type,
        effect: effects[type],
        app,
        model,
      })
      const task = yield sagaEffects.fork(watcher)
      yield sagaEffects.fork(function* () {
        yield sagaEffects.take(prefixType(namespace, '@@CANCEL_EFFECTS'))
        yield sagaEffects.cancel(task)
      })
    }
  }
}
