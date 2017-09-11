import { expect } from 'chai'
import { getNamespaceFromPath } from '../../src/utils'

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
})
