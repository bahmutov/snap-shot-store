'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const R = require('ramda')

/* eslint-env mocha */
describe('utils', () => {
  context.only('storeValue', () => {
    const {storeValue} = require('./utils')

    it('stores nested value', () => {
      const snapshots = {}
      const name = ['foo', 'bar']
      const value = 42
      const result = storeValue({snapshots, name, value})
      const expected = {
        foo: {
          bar: 42
        }
      }
      la(R.equals(result, expected), result)
    })

    it('stores a value', () => {
      const snapshots = {}
      const name = 'foo'
      const value = 42
      const result = storeValue({snapshots, name, value})
      const expected = {
        foo: 42
      }
      la(R.equals(result, expected), result)
    })

    it('returns new snapshot object', () => {
      const snapshots = {}
      const name = 'foo'
      const value = 42
      const result = storeValue({snapshots, name, value})
      la(result !== snapshots, 'returns new object')
    })

    it('does not store on dry run', () => {
      const snapshots = {}
      const name = 'foo'
      const value = 42
      const opts = {
        dryRun: true
      }
      const result = storeValue({snapshots, name, value, opts})
      la(result === snapshots, 'returns same object')
    })
  })
})
