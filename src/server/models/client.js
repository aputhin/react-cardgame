import * as A from '../actions'
import {Dispatcher} from '../shared/dispatcher'

export class Client extends Dispatcher {
  get details() {
    return {
      id: this.id,
      isLoggedIn: this.isLoggedIn,
      name: this.name
    }
  }

  constructor(socket, app) {
    super()
    this.id = socket.id
    this.isLoggedIn = false
    this.name = null
    this.app = app

    this._socket = socket
    this._onDisposes = []

    this._onDisposes.push(app.addClient(this))
    this.emit(A.userDetailsSet(this.details))

    socket.on('action', action => super.emit(action))
    socket.on('disconnect', () => this.dispose())

    this._installHandlers()
  }

  emit(action) {
    this._socket.emit('action', action)
  }

  dispose() {
    this._onDisposes.forEach(a => a())
    this._onDisposes = []
  }

  _installHandlers() {
  }
}