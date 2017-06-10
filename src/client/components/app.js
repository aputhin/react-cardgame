import './app.scss'

import React, {Component} from 'react'

class AppContainer extends Component {
  render() {
    return (
      <section>
        <h1>Hey world!</h1>
        <button onClick={this._click.bind(this)}>Please click</button>
      </section>
    )
  }

  _click() {
    console.log('-')
  }
}

export default AppContainer