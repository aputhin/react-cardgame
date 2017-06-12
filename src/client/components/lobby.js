import './lobby.scss'

import React, {Component} from 'react'

class LobbyContainer extends Component {
  render() {
    return <p>LOBBY</p>
  }
}

class LobbySidebar extends Component {
  render() {
    return <p>LOBBY SIDEBAR</p>
  }
}

export default {
  main: LobbyContainer,
  sidebar: LobbySidebar
}