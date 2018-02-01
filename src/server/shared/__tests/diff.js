import _ from 'lodash'
import {makeDiff, mergeDiff, IS_UNCHANGED} from '../diff'

runDiffTests({
  scalar: {
    'change on numbers': [
      1, 2,
      2,
    ],
    'unchanged on type': [
      1, 1,
      IS_UNCHANGED,
    ],
    'changed on type': [
      1, '1',
      '1',
    ],
    'unchanged on null': [
      null, null,
      IS_UNCHANGED,
    ],
  },
  array: {
    'throws on invalid type': () => {
      expect(() => makeDiff('whoa', [])).toThrow()
    },
    'unchanged on empty': () => {
      [], [],
      IS_UNCHANGED
    },
    'empties array': [
      [1, 2, 3], [],
      { $splice: [0, 3] }
    ],
    simple: {
      'unchanged': [
        [1, 2, 3], [1, 2, 3],
        IS_UNCHANGED
      ],
      'splice': [
        [1, 2, 3], [1, 2, 4, 5],
        {$splice: [2, 1, 4, 5]}
      ],
      'add one at end': [
        [1, 2, 3], [1, 2, 3, 4],
        {$splice: [3, 0, 4]}
      ],
      'remove one at end': [
        [1, 2, 3], [1, 2],
        {$splice: [2, 1]}
      ],
      'remove on in middle': [
        [1, 2, 3], [1, 3],
        {$splice: [1, 2, 3]}
      ]
    },
    complex: {
      'unchanged': [
        [
          { id: 1, text: 'old' },
          { id: 2, text: 'whoa' },
          { id: 3, text: 'hey' }
        ],
        [
          { id: 1, text: 'old' },
          { id: 2, text: 'whoa' },
          { id: 3, text: 'hey' }
        ],
        IS_UNCHANGED
      ],
      'removes one': [
        [
          { id: 1, text: 'old' },
          { id: 2, text: 'whoa' }
        ],
        [
          { id: 1, text: 'old' }
        ],
        {$update: {}, ids: [1]}
      ],
      'reorders': [
        [
          { id: 1, text: 'old' },
          { id: 2, text: 'whoa' }
        ],
        [
          { id: 2, text: 'whoa' },
          { id: 1, text: 'old' }
        ],
        {$update: {}, ids: [2, 1]}
      ],
      'update': [
        [
          { id: 1, text: 'old' },
          { id: 2, text: 'whoa' }
        ],
        [
          { id: 1, text: 'old' },
          { id: 2, text: 'heywhoa' }
        ],
        {$update: {2: {text: 'heywhoa'}}}
      ],
      'update & reorder': [
        [
          { id: 1, text: 'old' },
          { id: 2, text: 'whoa' }
        ],
        [
          { id: 2, text: 'heywhoa' },
          { id: 1, text: 'old' }
        ],
        {$update: {2: {text: 'heywhoa'}}, ids: [2, 1]}
      ]
    }
  },
  objects: {
    'throws on invalid type': () => {
      expect(() => makeDiff('whoa', {})).toThrow()
    },
    'set nested': [
      {whoa: {hey: {stuff: 1, test: 'blegh'}}},
      {whoa: {hey: {stuff: 2, test: 'blegh'}}},
      {whoa: {hey: {stuff: 2}}}
    ],
    'add property': [
      {unchanged: 'hey'},
      {unchanged: 'hey', added: 'whoa'},
      {added: 'whoa'}
    ],
    'remove property': [
      {unchanged: 'hey', removed: 'whoa'},
      {unchanged: 'hey'},
      {removed: {$remove: true}}
    ],
  }
})

function runDiffTests(tests) {
  _.forOwn(tests, (test, key) => {
    if (_.isFunction(test)) {
      it(key, test)
    } else if (_.isArray(test)) {
      const [before, after, diff] = test
      const result = makeDiff(before, after)

      describe(`${key}: `, () => {
        it('diff', () => {
          expect(result).toEqual(diff)
        })

        if (result != IS_UNCHANGED) {
          it('merge', () => {
            const mergedBack = mergeDiff(before, result)
            expect(mergedBack).toEqual(after)
          })
        }
      })
    } else if (_.isObject(test)) {
      describe(`${key}: `, () => runDiffTests(test))
    }
  })
}
