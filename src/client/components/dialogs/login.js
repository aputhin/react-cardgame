import './login.scss'

import React from 'react'
import * as A from '../../actions'
import {ContainerBase} from '../../lib/component'

class LoginDialog extends ContainerBase {
  render() {
    return (
      <section class="c-login-dialog">
        <h1>Login</h1>
        <p>Stuff and things!</p>
      </section>
    )
  }
}

export default {
  id: A.LOGIN_DIALOG,
  component: LoginDialog
}