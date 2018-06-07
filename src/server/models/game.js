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
      ? this.players[this._nextCzarIndex % this.players.length]
      : this.players[0]

    delete this._nextCzarIndex

    this.round = new Round(this.deck.drawBlackCard(), czar, this.players)
    this.step = A.STEP_CHOOSE_WHITES
    for (let player of this.players)
      player.onRoundStart()
  }

  _postTick() {
    if (!this.isDisposed && this.step != A.STEP_WAIT && this.step != A.STEP_SETUP) {
      if (this.players.length < MINIMUM_PLAYERS) {
        this._transitionStep(A.WAIT_GAME_OVER, A.WAIT_REASON_TOO_FEW_PLAYERS)
      } else if (!this.players.includes(this.round.czar)) {
        this._transitionStep(A.WAIT_ROUND_OVER, A.WAIT_REASON_CZAR_LEFT)
      } else if (_.keys(this.round.stacks).length == 0) {
        this._transitionStep(A.WAIT_ROUND_OVER, A.WAIT_REASON_TOO_FEW_PLAYERS)
      } else if (this.step == A.STEP_CHOOSE_WHITES && this.round.areAllStacksFinished) {
        this.round.revealStacks()
        this.step = A.STEP_JUDGE_STACKS
      } else if (this.step == A.STEP_JUDGE_STACKS && this.round.winningStack) {
        this.round.winningStack.player.addPoints(1)

        if (_.some(this.players, p => p.score >= this.options.scoreLimit)) {
          this._transitionStep(A.WAIT_GAME_OVER, A.WAIT_REASON_GAME_FINISHED)
        } else {
          this._nextCzarIndex = (this.players.indexOf(this.round.czar) + 1) % this.players.length
          this._transitionStep(A.WAIT_ROUND_OVER, A.WAIT_REASON_ROUND_FINISHED)
        }
      }
    }

    if (this.players.length == 0) {
      this.dispose()
    }
  }

  _transitionStep(type, reason) {
    this._ensureActive()
    this.step = A.STEP_WAIT
    this.timer = { timeout: 5000, type, reason }
    setTimeout(() => {
      if (this.isDisposed) return

      this._tick(() => {
        this.timer = null
        if (type == A.WAIT_GAME_OVER) {
          this.step = A.STEP_SETUP
          this.round = null
        } else if (type == A.WAIT_ROUND_OVER) {
          for (let player of this.players)
            player.onRoundEnd()

          this._nextRound(reason != A.WAIT_REASON_ROUND_FINISHED)
        }
      })
    }, 5000)
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