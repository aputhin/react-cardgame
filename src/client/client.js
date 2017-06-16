import './client.scss';

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, browserHistory as history} from 'react-router'

import * as A from './actions'
import {Dispatcher} from 'shared/dispatcher'
import createStores from './stores'

/**
 * services
 */
const dispatcher = new Dispatcher()
const services = new {dispatcher}

/**
 * stores
 */
const stores = createStores(services)

/**
 * renderer
 */
function main() {
  const routes = require('./routes').default()
  ReactDOM.render(
    <Router history={history}>
      {routes}  
    </Router>, 
    document.getElementById('mount'))
}

/**
 * misc
 */
if (module.hot) {
  module.hot.accept('./routes', () => {
    main()
  })
}

/**
 * go!
 */
main()