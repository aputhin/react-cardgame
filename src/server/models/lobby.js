import _ from 'lodash'
import * as A from '../actions'
import {RoomBase} from '../lib/room'

export class Lobby extends RoomBase {
  constructor(app) {
    super(A.VIEW_LOBBY)
    this.messages = []
    this.games = []
    this.app = app

    this._nextGameId = 1
  }

  get view() {
    return {
      messages: this.messages.slice(),
      games: this.games.map(game => ({
        id: game.id,
        title: game.title,
        players: game.players.map(p => p.name)
      }))
    }
  }

  sendMessage(client, message) {
    if (!client.isLoggedIn)
      throw new Error('Client must be logged in')

    this._tick(() => {
      this.messages.push({
        index: this.messages.length + 1,
        name: client.name,
        message
      })
    })
  }
}