'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const R = require('ramda')
const isCI = require('is-ci')
const debug = require('debug')('snap-shot-store')
const utils = require('./utils')

function initStore (snapshots) {
  la(is.object(snapshots), 'expected plain store object', snapshots)
  let currentSnapshots = R.clone(snapshots)

  return function snapShotCore (
    {
      what,
      file,
      __filename,
      exactSpecName,
      store = R.identity,
      compare = utils.compare,
      raiser,
      comment,
      opts = {}
    } = {}
  ) {
    if (is.empty(arguments) || is.empty(arguments[0])) {
      return currentSnapshots
    }

    const fileParameter = file || __filename
    la(is.unemptyString(fileParameter), 'missing file', fileParameter)
    la(is.unemptyString(exactSpecName), 'invalid exactSpecName', exactSpecName)

    la(is.fn(compare), 'missing compare function', compare)
    la(is.fn(store), 'invalid store function', store)
    if (!raiser) {
      raiser = utils.raiseIfDifferent
    }
    la(is.fn(raiser), 'invalid raiser function', raiser)
    la(is.maybe.unemptyString(comment), 'wrong comment type', comment)

    if (!('ci' in opts)) {
      debug('is CI environment? %s', isCI)
      opts.ci = isCI
    }

    const setOrCheckValue = any => {
      const value = utils.strip(any)
      const expected = utils.findStoredValue({
        snapshots: currentSnapshots,
        file: fileParameter,
        exactSpecName,
        opts
      })
      if (expected === undefined) {
        if (opts.ci) {
          console.log('current directory', process.cwd())
          console.log('new value to save: %j', value)
          // TODO return a lens instead!
          const key = utils.formKey(exactSpecName)
          throw new Error(
            'Cannot store new snapshot value\n' +
              'in ' +
              fileParameter +
              '\n' +
              'for spec called "' +
              exactSpecName +
              '"\n' +
              'test key "' +
              key +
              '"\n' +
              'when running on CI (opts.ci = 1)\n' +
              'see https://github.com/bahmutov/snap-shot-core/issues/5'
          )
        }

        const storedValue = store(value)
        utils.storeValue({
          snapshots: currentSnapshots,
          file: fileParameter,
          exactSpecName,
          value: storedValue,
          comment,
          opts
        })
        return storedValue
      }

      debug('found snapshot for "%s", value', exactSpecName, expected)
      raiser({
        value,
        expected,
        specName: exactSpecName,
        compare
      })
      return expected
    }

    if (is.promise(what)) {
      return what.then(setOrCheckValue)
    } else {
      return setOrCheckValue(what)
    }
  }
}

module.exports = {
  initStore: initStore
}
