const la = require('lazy-ass')
const is = require('check-more-types')
const debug = require('debug')('snap-shot-store')
const Result = require('folktale/result')

const formKey = (specName, oneIndex) => `${specName} ${oneIndex}`

function findStoredValue ({ snapshots, file, exactSpecName, opts = {} }) {
  la(is.unemptyString(file), 'missing file to find spec for', file)
  if (opts.update) {
    // let the new value replace the current value
    return
  }
  if (!snapshots) {
    debug('there are no snapshots to find "%s"', exactSpecName)
    return
  }

  const key = exactSpecName
  debug('key "%s"', key)
  if (!(key in snapshots)) {
    return
  }

  return snapshots[key]
}

function storeValue ({
  snapshots,
  file,
  exactSpecName,
  value,
  ext,
  comment,
  opts = {}
}) {
  la(value !== undefined, 'cannot store undefined value')
  la(is.unemptyString(file), 'missing filename', file)
  la(is.object(snapshots), 'missing snapshots object', snapshots)
  la(is.unemptyString(exactSpecName), 'missing exact spec name', exactSpecName)
  la(is.maybe.unemptyString(comment), 'invalid comment to store', comment)

  // TODO pass a lens
  const key = exactSpecName
  if (!opts.dryRun) {
    debug('updated snapshot by key "%s"', key)
    snapshots[key] = value
  }

  if (opts.show || opts.dryRun) {
    console.log('updated snapshot "%s" for file %s', key, file)
    console.log(value)
  }
}

const isValidCompareResult = is.schema({
  orElse: is.fn
})

// expected = schema we expect value to adhere to
// value - what the test computed right now
// expected - existing value loaded from snapshot
function raiseIfDifferent ({ value, expected, specName, compare }) {
  la(value, 'missing value to compare', value)
  la(expected, 'missing expected value', expected)
  la(is.unemptyString(specName), 'missing spec name', specName)

  const result = compare({ expected, value })
  la(
    isValidCompareResult(result),
    'invalid compare result',
    result,
    'when comparing value\n',
    value,
    'with expected\n',
    expected
  )

  result.orElse(message => {
    debug('Test "%s" snapshot difference', specName)
    la(is.unemptyString(message), 'missing err string', message)
    console.log(message)
    throw new Error(message)
  })
}

function compare ({ expected, value }) {
  const e = JSON.stringify(expected)
  const v = JSON.stringify(value)
  if (e === v) {
    return Result.Ok()
  }
  return Result.Error(`${e} !== ${v}`)
}

// make sure values in the object are "safe" to be serialized
// and compared from loaded value
function strip (o) {
  if (is.fn(o)) {
    return o
  }
  return JSON.parse(JSON.stringify(o))
}

module.exports = {
  findStoredValue: findStoredValue,
  storeValue: storeValue,
  raiseIfDifferent: raiseIfDifferent,
  compare: compare,
  strip: strip,
  formKey: formKey
}
