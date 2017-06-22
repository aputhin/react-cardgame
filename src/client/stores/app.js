import _ from 'lodash'
import {Observable, BehaviorSubject} from 'rxjs'
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
      .startWith([])
      .publishReplay(1)

    this.dialogs$.connect()

    this.connection$ = new BehaviorSubject(A.CONNECTION_CONNECTED)
    this.reconnected$ = Observable.empty()
  }
}