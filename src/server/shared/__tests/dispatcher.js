import {Dispatcher} from '../dispatcher'
import * as A from '../actions'

const TEST_ACTION_1 = 'TEST_ACTION_1'
const testAction1 = (arg) => ({ type: TEST_ACTION_1, arg })

const TEST_ACTION_2 = 'TEST_ACTION_2'
const testAction2 = () => ({ type: TEST_ACTION_2 })

describe('dispatcher', () => {
  let dispatcher
  beforeEach(() => dispatcher = new Dispatcher())

  it('dispatches a simple action', () => {
    let action1Result
    dispatcher.on(TEST_ACTION_1, action => {
      action1Result = action.arg
    })

    dispatcher.emit(testAction1(42))
    expect(action1Result).toBe(42)
  })

  it('allows us to unsubscribe', () => {
    let count = 0
    const sub = dispatcher.on(TEST_ACTION_1, () => count++)

    dispatcher.emit(testAction1(4))
    sub()
    dispatcher.emit(testAction1(1))
    expect(count).toBe(1)
  })

  it('allows object syntax for action', () => {
    let action1Count = 0
    let action2Count = 0

    dispatcher.on({
      [TEST_ACTION_1]: () => action1Count++,
      [TEST_ACTION_2]: () => action2Count++,
    })

    dispatcher.emit(testAction1(12))
    dispatcher.emit(testAction2())

    expect(action1Count).toBe(1)
    expect(action2Count).toBe(1)
  })

  it('allows us to subscribe with rxjs', () => {
    let action1Arg
    dispatcher.on$(TEST_ACTION_1).subscribe(action => action1Arg = action.arg)

    dispatcher.emit(testAction1(42))
    
    expect(action1Arg).toBe(42)
  })
})