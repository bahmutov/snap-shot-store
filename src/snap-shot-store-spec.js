'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const R = require('ramda')

/* eslint-env mocha */
const { initStore } = require('.')

describe('snap-shot-store', () => {
  it('is a function', () => {
    la(is.fn(initStore))
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

  it('throws on different value', () => {
    const store = {
      'first assertion': 40
    }
    const snapshot = initStore(store)
    la(
      is.raises(() => {
        snapshot({
          what: 42,
          file: 'foo.js',
          exactSpecName: 'first assertion'
        })
        console.log(snapshot())
      })
    )
    la(R.equals(snapshot(), store), 'store is unchanged')
  })
})
