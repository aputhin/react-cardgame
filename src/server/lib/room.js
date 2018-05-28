import _ from 'lodash'
import * as A from '../actions'
import {makeDiff, IS_UNCHANGED} from '../shared/diff'

export class RoomBase {
  get view() {
    throw new Error('Please implement a view')
  }

  constructor(viewId) {
    this.id = undefined
    this._viewId = viewId
    this._inTick = false
    this._lastView = {}
    this.clients = []
  }

  addClient(client) {
    this.clients.push(client)
    client.emit(A.setView(this._viewId, this.view, this.id))
    return () => _.remove(this.clients, {id: client.id})
  }

  broadcast(action) {
    for (let client of this.clients) {
      client.emit(action)
    }
  }

  _tick(action) {
    if (this._inTick) {
      if (action) action()
      return null
    }

    this._inTick = true
    if (action) {
      try {
        action()
      } finally {
        this._inTick = false
      }
    }

    this._postTick()
    const newView = this.view
    const diff = makeDiff(this._lastView, newView)

    if (diff !== IS_UNCHANGED) {
      this.broadcast(A.mergeView(this._viewId, diff, this.id))
    }

    this._lastView = newView
    return diff
  }

  _postTick() {
  }
}