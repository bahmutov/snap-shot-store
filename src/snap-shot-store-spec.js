'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const R = require('ramda')
const itsName = require('its-name')

/* eslint-env mocha */
const { initStore } = require('.')

describe('snap-shot-store', () => {
  it('is a function', () => {
    la(is.fn(initStore))
  })

  it('initializes with empty object by default', () => {
    const snapshot = initStore()
    la(is.fn(snapshot))
  })

  it('returns a function to compare and store values', () => {
    const store = {}
    const snapshot = initStore(store)
    // synchronous
    snapshot({
      what: 42,
      name: 'first assertion'
    })
    // get updated store by calling without arguments
    const updatedStore = snapshot({})
    la(is.object(updatedStore), 'should return an object', updatedStore)
    // it is a different reference
    la(updatedStore !== store, 'returns different object')
    // it was modified
    la(
      !R.equals(updatedStore, store),
      'should have been modified',
      updatedStore
    )
  })

  it('stores several values', () => {
    const snapshot = initStore()
    snapshot({
      name: 'foo',
      what: 1
    })
    snapshot({
      name: 'bar',
      what: 2
    })
    const expected = {
      foo: 1,
      bar: 2
    }
    const values = snapshot()
    la(R.equals(values, expected), values)
  })

  it('throws on different value', () => {
    const store = {
      'first assertion': 40
    }
    const snapshot = initStore(store)
    la(
      is.raises(() => {
        snapshot({
          what: 42,
          name: 'first assertion'
        })
        console.error('somehow updated value')
        console.error(snapshot())
      })
    )
    la(R.equals(snapshot(), store), 'store is unchanged')
  })

  context('nested test name', () => {
    it('saves under test name', function () {
      const names = itsName(this)
      const store = {}
      const snapshot = initStore(store)
      // synchronous
      snapshot({
        what: 42,
        name: names
      })
      const updated = snapshot()
      const expected = {
        'snap-shot-store': {
          'nested test name': {
            'saves under test name': 42
          }
        }
      }
      la(R.equals(updated, expected), updated)
    })
  })
})
