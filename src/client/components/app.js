import './app.scss'

import React from 'react'
import { ContainerBase } from '../lib/component'
import dialogTypes from './dialogs'

class AppContainer extends ContainerBase {
  componentDidMount() {
    const {stores: {app}} = this.context

    this.subscribe(app.dialogs$, dialogs => this.setState({dialogs}))
  }

  render() {
    const {main, sidebar} = this.props;

    return (
      <div className={`c-application`}>
        <div className="inner">
          <div className="sidebar">
            {sidebar}
          </div>
          <div className="main">
            {main}
          </div>
        </div>
      </div>
    )
  }

  _click() {
    console.log('-')
  }
}

export default AppContainer