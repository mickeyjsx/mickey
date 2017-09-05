# API

[查看中文](../zh-CN/api.md)

## Overview

- [createApp(options)](#createappoptions)
  - [options.hooks](#optionshooks)
  - [options.historyMode](#optionshistorymode)
  - [options.initialState](#optionsinitialstate)
  - [options.initialReducer](#optionsinitialreducer)
  - [options.extensions](#optionsextensions)
    - [options.extensions.createReducer](#createreducer)
    - [options.extensions.combineReducers](#combinereducers)
- [app.model(model)](#appmodelmodel)
  - [model.namespace](#modelnamespace)
  - [model.state](#modelstate)
  - [model.subscriptions](#modelsubscriptions)
  - [model.enhancers](#modelenhancers)
  - [model.createReducer](#modelcreatereducer)
  - [model[...actionsAndEffects]](#modelactionsandeffects)
- [app.eject(namespace)](#appejectnamespace)
- [app.has(namespace)](#apphasnamespace)
- [app.load(pattern)](#apploadpattern)
- [app.render(component, container, callback)](#apprendercomponent-container-callback)
- [app.hook(hooks)](#apphookhooks)
  - [hooks.onError](#hooksonerror)
  - [hooks.onAction](#hooksonaction)
  - [hooks.onEffect](#hooksoneffect)
  - [hooks.onReducer](#hooksonreducer)
  - [hooks.onStateChange](#hooksonstatechange)
  - [hooks.extraReducers](#hooksextrareducers)
  - [hooks.extraEnhancers](#hooksextraenhancers)

## Module export
