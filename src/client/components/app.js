import './app.scss'

import React from 'react'
import { ContainerBase } from '../lib/component'
import dialogTypes from './dialogs'

class AppContainer extends ContainerBase {
  componentWillMount() {
    const {stores: {app}} = this.context
    this.subscribe(app.dialogs$, dialogs => this.setState({dialogs}))
  }

  render() {
    const {main, sidebar} = this.props
    const {dialogs} = this.state

    const dialogStack = dialogs.map(dialog => {
      const DialogComponent = dialogTypes[dialog.id]
      return <DialogComponent {...dialog.props} key={dialog.id} />
    })

    return (
      <div className={`c-application ${dialogStack.length ? 'dialogs-open' : 'dialogs-closed'}`}>
        <div className="dialogs">
          {dialogStack}
        </div>
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