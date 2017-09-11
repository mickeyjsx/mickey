import { JSDOM } from 'jsdom'

const { window } = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' })

const copyProps = (source, target) => {
  Object.getOwnPropertyNames(source)
    .filter(prop => typeof target[prop] === 'undefined')
    .forEach((prop) => { target[prop] = source[prop] })
}

global.window = window
global.document = window.document
global.navigator = { userAgent: 'node.js' }

copyProps(window, global)

