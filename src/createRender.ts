import invariant from 'invariant';
import React from 'react';
import ReactDOM from 'react-dom';
import Provider from './Provider';
import { isFunction, isString, isHTMLElement } from './utils';
import { RenderCallbacks, App } from './createApp';

function getCallbacks(callbacks: RenderCallbacks | RenderCallbacks['beforeRender'] | RenderCallbacks['afterRender']): RenderCallbacks {
  if (isFunction(callbacks)) {
    return { afterRender: callbacks };
  }
  return callbacks as RenderCallbacks || {};
}


// * 返回一个 renderer 函数，callback 中 有 beforeRender 和 afterRender 两个钩子
export default function createRender(app: App, component: React.ReactNode, container: Element | string, callback: RenderCallbacks) {
  // return a render function
  return (_component: React.ReactNode, _container: Element | string, _callback: RenderCallbacks | RenderCallbacks['beforeRender'] | RenderCallbacks['afterRender'] | undefined) => {
    const { beforeRender, afterRender } = getCallbacks(_callback || callback);
    // real render function
    const innerRender = (componentFromPromise: React.ReactNode, containerFromPromise: Element | string) => {
      const innerComponent = componentFromPromise || component;
      let innerContainer = containerFromPromise || container;

      if (innerContainer) {
        if (isString(innerContainer)) {
          innerContainer = document.querySelector(innerContainer as string) as Element;
          invariant(innerContainer, `container with selector "${container}" not exist`);
        }

        invariant(isHTMLElement(innerContainer), 'container should be HTMLElement');
      }

      const canRender = innerComponent && innerContainer;
      if (canRender) {
        ReactDOM.render(
          React.createElement(Provider, { app }, innerComponent),
          innerContainer as Element,
        );

        if (afterRender) {
          afterRender(app);
        }
      }
    }

    let result: boolean | Promise<any> = true;
    if (beforeRender) {
      result = beforeRender(app);
    }

    if (result && (result as Promise<any>).then) {
      (result as Promise<any>).then((val: any) => {
        if (val) {
          if (Array.isArray(val)) {
            (innerRender as any)(...val);
          } else {
            innerRender(val, _container);
          }
        } else {
          innerRender(_component, _container);
        }
      }, () => { });
    } else if (result !== false) {
      innerRender(_component, _container);
    }
  }
}
