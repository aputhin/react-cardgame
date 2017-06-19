import _ from 'lodash'
import * as A from '../actions'

export default class AppStore {
  constructor({dispatcher}) {
    this.dialogs$ = dispatcher
      .on$(A.DIALOG_SET)
      .scan((stack, action) => {
        _.remove(stack, {id: action.id})

        action.isOpen && stack.push({id: action.id, props: action.props})

        return stack
      }, [])
      .publishReplay(1)

    this.dialogs$.connect()
  }
}