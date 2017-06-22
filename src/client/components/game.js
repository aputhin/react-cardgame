import './game.scss'

import React from 'react'
import * as A from '../actions'
import {ContainerBase} from '../lib/component'

class GameContainer extends ContainerBase {
  componentWillMount() {
    const {stores: {app}} = this.context
    const {params} = this.props
    const gameId = parseInt(params.gameId)

    this.subscribe(app.reconnected$, () => this.request(A.gameJoin(gameId)))

    this.request(A.gameJoin(gameId))
  }
  render() {
    return <p>GAME</p>
  }
}

class GameSidebar extends ContainerBase {
  render() {
    return <p>GAME SIDEBAR</p>
  }
}

export default {
  main: GameContainer,
  sidebar: GameSidebar
}