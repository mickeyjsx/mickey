import { expect } from 'chai'
import { getNamespaceFromPath, getEnhancer } from '../../src/utils'

describe('utils', () => {
  describe('getNamespaceFromPath', () => {
    it('should work with relative path', () => {
      expect(getNamespaceFromPath('./a/b/c.js')).to.be.equal('a.b.c')
      expect(getNamespaceFromPath('../a/b/c.js')).to.be.equal('a.b.c')
    })

    it('should work with absolute path', () => {
      expect(getNamespaceFromPath('/a/b/c.js')).to.be.equal('a.b.c')
      expect(getNamespaceFromPath('a/b/c.js')).to.be.equal('a.b.c')
    })
  })

  describe('getEnhancer', () => {
    it('should return a function which just return the input if enhancers is null', () => {
      const enhancer = getEnhancer()
      expect(enhancer(1)).to.be.eql(1)
    })

    it('should return a function which when enhancers is a function', () => {
      const enhancer = getEnhancer(reducer => reducer + 1)
      expect(enhancer(1)).to.be.eql(2)
    })

    it('should return a function which when enhancers is an array', () => {
      const enhancer = getEnhancer([reducer => reducer + 1, reducer => reducer - 1])
      expect(enhancer(1)).to.be.eql(1)
    })
  })
})
