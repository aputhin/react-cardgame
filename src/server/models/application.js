import * as A from '../actions'
import {Dispatcher} from '../shared/dispatcher'
import {RoomBase} from '../lib/room'
import {Lobby} from './lobby'

export class Application extends RoomBase {
  get view() {
    return { sets: this.cards.sets }
  }

  constructor(cards) {
    super(A.VIEW_APP)
    this.dispatcher = new Dispatcher()
    this.cards = cards
    this.lobby = new Lobby(this)
  }
}