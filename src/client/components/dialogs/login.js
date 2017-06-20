import './login.scss'

import React from 'react'
import * as A from '../../actions'
import {ContainerBase} from '../../lib/component'

class LoginDialog extends ContainerBase {
  render() {
    return (
      <section className="c-login-dialog">
        <h1>Login</h1>
        <p>Stuff and things!</p>
      </section>
    )
  }
}

export default {
  id: A.DIALOG_LOGIN,
  component: LoginDialog
}