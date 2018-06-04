import _ from 'lodash'
import {shuffle} from '../shared/utils'

export class Round {
  constructor(blackCard, czar, players) {
    this.areAllStacksRevealed = false
    this.blackCard = blackCard
    this.czar = czar
    this.stackList = []

    let stackId = 0
    this.stacks = players
      .filter(p => p != czar)
      .reduce((obj, player) => {
        stackId++;
        obj[stackId] = {
          id: stackId,
          cards: [],
          player
        }

        return obj
      }, {})
  }

  get view() {
    return {
      blackCard: this.blackCard,
      stacks: this.stackList.map(s => this.getStackDetails(s))
    }
  }

  get areAllStacksFinished() {
    return _.every(this.stacks, s => s.player == this.czar || this.isStackFinished(s))
  }

  getStack(stackOrStackId) {
    return _.isObject(stackOrStackId)
      ? stackOrStackId
      : this.getStackById(stackOrStackId)
  }

  getStackById(id) {
    return this.stacks[id]
  }

  getStackByPlayerId(playerId) {
    return _.find(this.stacks, s => s.player.id === playerId)
  }

  addCardToStack(card, stackOrStackId) {
    const stack = this.getStack(stackOrStackId)
    if (stack.cards.length === 0) this.stackList.push(stack)

    stack.cards.push(card)
  }

  getStackDetails(stackOrStackId, forceReveal = false) {
    const stack = this.getStack(stackOrStackId)
    return forceReveal || this.areAllStacksRevealed
      ? {id: stack.id, cards: stack.cards.slice(), isWinner: stack == this.winningStack}
      : {id: stack.id, count: stack.cards.length}
  }

  revealStacks() {
    this.areAllStacksRevealed = true
    shuffle(this.stackList)
  }

  selectWinner(stackOrStackId) {
    this.winningStack = this.getStack(stackOrStackId)
  }

  removeStack(stackOrStackId) {
    const stack = this.getStack(stackOrStackId)
    const index = this.stackList.indexOf(stack)

    if (index != -1) {
      this.stackList.splice(index, 1)
    }

    delete this.stacks[stack.id]
  }

  hasPlayerPlayed(playerOrPlayerId) {
    const playerId = _.isObject(playerOrPlayerId)
      ? playerOrPlayerId.id
      : playerOrPlayerId

    const stack = this.getStackByPlayerId(playerId)

    return !stack ? false : this.isStackFinished(stack)
  }

  isPlayerPlaying(playerOrPlayerId) {
    const playerId = _.isObject(playerOrPlayerId)
      ? playerOrPlayerId.id
      : playerOrPlayerId

    const stack = this.getStackByPlayerId(playerId)
    return stack ? !this.isStackFinished(stack) : false
  }

  isStackFinished(stackOrStackId) {
    return this.getStack(stackOrStackId).cards.length === this.blackCard.whiteCardCount
  }
}