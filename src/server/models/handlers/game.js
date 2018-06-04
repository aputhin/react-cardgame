import * as A from '../../actions'
import {HandlerBase} from '../../lib/handlers'
import {validateMessage} from '../../shared/validation/chat'

export default class GameHandlers extends HandlerBase {
  constructor(client, game) {
    super(client)
    this.game = game
    this.onDispose(
      game.addClient(client),

      client.onRequest(A.GAME_SEND_MESSAGE, action => {
        const validator = validateMessage(action.message)
        if (validator.didFail) {
          client.fail(action, validator.message)
          return
        }

        game.sendMessage(client, action.message)
      }),

      client.onRequest(A.GAME_SET_OPTIONS, action => {
        const validator = game.setOptions(action.options)
        client.response(action, validator)
      })
    )

    if (client.isLoggedIn) this.onLogin()
  }

  onLogin() {
    this.player = this.game.addPlayer(this.client.id, this.client.name)
    this.onDispose(
      this.player.addClient(this.client),
      () => this.player.dispose()
    )
  }
}