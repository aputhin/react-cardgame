import './client.scss';

import React from 'react'
import ReactDOM from 'react-dom'
import {Router, browserHistory as history} from 'react-router'

import { Dispatcher } from 'shared/dispatcher'
// import * as A from './actions'
import {StoreProvider} from './lib/component'
import createStores from './stores'

/**
 * services
 */
const dispatcher = new Dispatcher()
const services = {dispatcher}

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
    <StoreProvider stores={stores} services={services}>
      <Router history={history}>
        {routes}  
      </Router>
    </StoreProvider>, 
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