import './game-board.scss'

import React from 'react'
import * as A from '../../actions'
import {ContainerBase} from '../../lib/component'

import Card from './card'
import PlayerHand from './player-hand'
import Stacks from './stacks'

const TIMER_REASONS = {
  [A.WAIT_GAME_OVER]: 'GAME OVER!',
  [A.WAIT_REASON_GAME_FINISHED]: 'Game ended',
  [A.WAIT_REASON_TOO_FEW_PLAYERS]: 'Too few players!',

  [A.WAIT_ROUND_OVER]: 'Round is over!',
  [A.WAIT_REASON_CZAR_LEFT]: 'The czar left!',
  [A.WAIT_REASON_ROUND_FINISHED]: 'Round ended!'
}

export default class GameBoard extends ContainerBase {
  constructor(props) {
    super(props)

    this.state = {isHandOpen: false}

    this._selectCard = card => 
      this.request(A.gameSelectCard(this.state.game.id, card.id))
    
    this._selectStack = stack =>
      this.request(A.gameSelectStack(this.state.game.id, stack.id))

    this._toggleHand = () => 
      this.setState({isHandOpen: !this.state.isHandOpen})
  }

  componentWillMount() {
    const {stores: {game}} = this.context
    this.subscribe(game.view$, game => this.setState({game}))
    this.subscribe(game.player$, player => this.setState({player}))
    this.subscribe(game.opSelectCard$, opSelectCard => this.setState({opSelectCard, isHandOpen: opSelectCard}))
    this.subscribe(game.opSelectStack$, opSelectStack => this.setState({opSelectStack}))
  }

  render() {
    const {game, player, opSelectCard, opSelectStack, isHandOpen} = this.state
    const round = game.round
    const timer = game.timer || {}

    if (!round) {
      return null
    }

    let message = null
    let messageIsActive = null

    switch (game.step) {
      case A.STEP_CHOOSE_WHITES:
        messageIsActive = opSelectCard.can
        message = opSelectCard.can
          ? 'Choose your cards'
          : 'Waiting for other players'
        break

      case A.STEP_JUDGE_STACKS:
        messageIsActive = opSelectStack.can
        message = opSelectStack.can
          ? 'Select the winning cards'
          : 'Waiting for the czar'
        break

      case A.STEP_WAIT:
        messageIsActive = 
        message = `${TIMER_REASONS[timer.type]}. ${TIMER_REASONS[timer.reason]}`
        break
    }

    const ownStackId = game.step == A.STEP_CHOOSE_WHITES
      && player && player.stack && player.stack.id

    const stacks = ownStackId
      ? round.stacks.map(s => s.id == ownStackId ? player.stack : s)
      : round.stacks

    return (
      <section className="c-game-board">
        <div className="black-card">
          <Card type="black" card = {round.blackCard} />
          <div className={`game-status ${messageIsActive ? 'is-active': ''}`}>
            {message}
          </div>
        </div>
        <Stacks 
          stacks={stacks} 
          ownStackId={ownStackId}
          opSelectStack={opSelectStack}
          selectStack={this._selectStack} />
        <PlayerHand
          opSelectCard={opSelectCard}
          selectCard={this._selectCard}
          hand={player.hand}
          toggle={this._toggleHand}
          isOpen={isHandOpen} />
      </section>
    )
  }
}