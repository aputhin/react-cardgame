import _ from 'lodash'
import * as A from '../actions'
import {Validator} from '../shared/validation'
import {RoomBase} from '../lib/room'

export const HAND_SIZE = 10
export class Player extends RoomBase {
  constructor(game, id, name) {
    super(A.VIEW_PLAYER)
    this.name = name
    this.id = id
    this.game = game
    this.score = 0
    this.hand = []
    this._isDisposed = false
  }

  get view() {
    return {
      id: this.id,
      hand: this.hand.slice(),
      stack: (this.game.round && this.stack)
        ? this.game.round.getStackDetails(this.stack, true)
        : null
    }
  }

  get summary() {
    const { round } = this.game
    return {
      id: this.id,
      name: this.name,
      score: this.score,

      isCzar: !!(round && round.czar == this),
      isPlaying: !!(round && round.isPlayerPlaying(this)),
      isWinner: !!(round && round.winningStack && round.winningStack.player == this),
    }
  }

  addPoints(points) {
    this._tick(() => this.score += points)
  }

  onGameStart() {
    this._tick(() => {
      this.score = 0
      this.setHandSize(HAND_SIZE)
    })
  }

  onRoundStart() {
    this._tick(() => {
      this.stack = this.game.round.getStackByPlayerId(this.id)
      this.setHandSize(HAND_SIZE)
    })
  }

  onRoundEnd() {
    this._tick(() => this.stack = null)
  }

  addCards(cards) {
    this._tick(() => this.hand.push(...cards))
  }

  setHandSize(count) {
    const {deck} = this.game
    if (!deck) return

    if (this.hand.length < count)
      this.addCards(deck.drawWhiteCards(count - this.hand.length))
  }

  selectCard(cardId) {
    if (!this.stack) return Validator.fail('You are not in this round!')

    const cardIndex = _.findIndex(this.hand, {id: cardId})
    if (cardIndex === -1) return Validator.fail('Invalid card!')

    const result = this.game.addCardToStack(
      this.hand[cardIndex],
      this.stack
    )

    if (result.didSucceed) {
      this._tick(() => this.hand.splice(cardIndex, 1))
    }

    return result
  }

  selectStack(stackId) {
    if (!this.game.round || this.game.round.czar != this)
      return Validator.fail('You are not the czar!')

    return this.game.selectStack(stackId)
  }

  dispose() {
    if (this._isDisposed) return

    this.hand = []
    this._isDisposed = true
    this.game.app.dispatcher.emit(A.playerDisposed(this.game.id, this.id))
  }
}