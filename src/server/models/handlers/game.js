import * as A from '../../actions'
import {HandlerBase} from '../../lib/handlers'
import {validateMessage} from '../../shared/validation/chat'

export default class GameHandlers extends HandlerBase {
  constructor(client, game) {
    super(client)
    this.game = game
  }
}