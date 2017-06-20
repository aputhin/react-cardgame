import {Observable, BehaviorSubject} from 'rxjs'
import {validateName} from 'shared/validation/user'
import {mapOp$} from 'shared/observable'
import * as A from '../actions'

const defaultDetails = {
  isLogedIn: false,
  id: null,
  name: null
}

export default class UserStore {
  constructor({dispatcher}) {
    this.details$ = new BehaviorSubject(defaultDetails)
    this.details$.subscribe(details => {
      Object.keys(details).forEach(k => this[k] = details[k])
    })

    dispatcher.onRequest({
      [A.USER_LOGIN]: (action) => {
        const validator = validateName(action.name)
        if (validator.didFail) {
          dispatcher.fail(action, validator.message)
          return
        }
        
        dispatcher.succeed(action)
        this.details$.next({
          isLoggedIn: true,
          id: 4432,
          name: action.name
        })
      }
    })

    this.opLogin$ = mapOp$(
      dispatcher.on$(A.USER_LOGIN),
      this.details$.map(details => !details.isLogedIn)
    )
  }
}