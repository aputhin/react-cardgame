const path = require('path')

require('source-map-support').install()
global.appRoot = path.resolve(__dirname)
require('./build/server')