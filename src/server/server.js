import express from 'express'
import http from 'http'

import {isDev} from './settings'


/**
 * Setup
 */
const app = express()
const server = new http.Server(app)

/**
 * Configuration
 */
app.set('view engine', 'pug')
app.use(express.static('public'))

const useExternalStyles = !isDev
const scriptRoot = isDev
  ? 'http://localhost:8080/build'
  : '/build'

app.get('*', (req, res) => {
  res.render('index', {
    useExternalStyles,
    scriptRoot
  })
})

/**
 * Startup
 */
const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Started http server on ${port}`)
})
