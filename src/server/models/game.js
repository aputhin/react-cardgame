import _ from 'lodash'
import * as A from '../actions'
import {Validator} from '../shared/validation'
import {RoomBase} from '../lib/room'
import {Player} from './player'
import {Round} from './round'

export const MINIMUM_PLAYERS = 2

export class Game extends RoomBase {
  constructor(id, title, app) {
    super(A.VIEW_GAME)
    this.id = id
    this.title = title
    this.app = app
    this.players = []
    this.step = A.STEP_SETUP
    this.messages = []
    this.round = null
    this.options = {
      scoreLimit: 5,
      sets: app.cards.sets.map(s => s.id)
    }

    app.dispatcher.on(A.PLAYER_DISPOSED, ({gameId, playerId}) => {
      if (gameId != this.id) return

      const playerIndex = _.findIndex(this.players, {id: playerId})
      if (playerIndex === -1) return

      this._tick(() => this.players.splice(playerIndex, 1))
      this.app.dispatcher.emit(A.gameSummaryChanged(this.id, this.summary))
    })
  }

  get view() {
    return {
      id: this.id,
      title: this.title,
      step: this.step,
      options: this.options,
      players: this.players.map(player => player.summary),
      messages: this.messages.slice(),
      round: this.round && this.round.view,
      timer: this.timer
    }
  }

  get summary() {
    return {
      id: this.id,
      title: this.title,
      players: this.players.map(player => player.name)
    }
  }

  get isDisposed() {
    return this.step === A.STEP_DISPOSED
  }

  addPlayer(id, name) {
    this._ensureActive()
    const player = new Player(this, id, name)
    this._tick(() => this.players.push(player))
    this.app.dispatcher.emit(A.gameSummaryChanged(this.id, this.summary))
    return player
  }

  sendMessage(client, message) {
    this._ensureActive()
    this._tick(() => {
      this.messages.push({
        index: this.messages.length + 1,
        name: client.name,
        message
      })
    })
  }

  setOptions(options) {
    this._ensureActive()

    const validator = new Validator()
    validator.assert(options.scoreLimit >= 3 && options.scoreLimit <= 50, 'Score limit must be between 3 and 50')
    if (validator.didFail) return validator

    this._tick(() => this.options = {
      scoreLimit: options.scoreLimit,
      sets: options.sets
    })
    return validator
  }

  start() {
    this._ensureActive()
    const validator = new Validator()
    validator.assert(this.step == A.STEP_SETUP, 'Game already started')
    validator.assert(this.players.length >= MINIMUM_PLAYERS, 'Too few players')
    validator.assert(this.options.sets.length > 0, 'Please select a set')

    if (validator.didFail) return validator

    this._tick(() => {
      this.deck = this.app.cards.generateDecks(this.options.sets)
      for (let player of this.players)
        player.onGameStart()

      this._nextRound()
    })

    return validator
  }

  addCardToStack(card, stackOrStackId) {
    this._ensureActive()
    if (this.step != A.STEP_CHOOSE_WHITES)
      return Validator.fail('You can\'t do that now')

    if (this.round.isStackFinished(stackOrStackId))
      return Validator.fail('The stack is already finished')

    this._tick(() => this.round.addCardToStack(card, stackOrStackId))
    return Validator.succeed()
  }

  selectStack(stackOrStackId) {
    this._ensureActive()
    if (this.step != A.STEP_JUDGE_STACKS)
      return Validator.fail('You can\'t do that now')

    this._tick(() => this.round.selectWinner(stackOrStackId))
    return Validator.succeed()
  }

  _nextRound(wasCanceled = false) {
    this._ensureActive()

    if (this.round) {
      if (wasCanceled) {
        for (let stack of this.round.stackList)
          stack.player.addCards(stack.cards)
      } else {
        for (let stack of this.round.stackList)
          this.deck.discardWhiteCards(stack.cards)
      }
    }

    const czar = this._nextCzarIndex
      ? this.players[this._nextCzarIndex] % this.players.length
      : this.players[0]

    delete this._nextCzarIndex

    this.round = new Round(this.deck.drawBlackCard(), czar, this.players)
    this.step = A.STEP_CHOOSE_WHITES
    for (let player of this.players)
      player.onRoundStart()
  }

  dispose() {
    if (this.step === A.STEP_DISPOSED) return

    this._tick(() => this.step = A.STEP_DISPOSED)
    this.app.dispatcher.emit(A.gameDisposed(this.id))
  }

  _ensureActive() {
    if (this.isDisposed)
      throw new Error('Game has already been disposed')
  }
}