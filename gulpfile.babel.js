import gulp from 'gulp'
import path from 'path'
import rimraf from 'rimraf'
import childProcess from 'child_process'
import webpackConfig from './webpack.config.js' 
import webpack from 'webpack'
import webpackDevServer from 'webpack-dev-server'

const $ = require('gulp-load-plugins')()

/**
 * Server  
 */
gulp.task('server:clean', cb => {
  rimraf('./build', () => cb())
})

gulp.task('server:build',
  gulp.series(
    'server:clean',
    compileServer
  )
)

gulp.task(
  'server:watch',
  gulp.series(
    'server:build',
    watchServer
  )
)

gulp.task(
  'server:dev',
  gulp.series(
    'server:build',
    gulp.parallel(
      'server:watch',
      runServer
    )
  )
)

gulp.task( 
  'server:test',
  gulp.series(
    'server:build',
    testServer
  )
)

gulp.task(
  'server:test:dev',
  gulp.series(
    'server:build',
    gulp.parallel(
      watchServer,
      runTestServer
    )
  )
)

function compileServer() {
  return gulp.src('./src/server/**/*.js')
    .pipe($.changed('./build'))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.', {sourceroot: path.join(__dirname, 'src', 'server')}))
    .pipe(gulp.dest('./build'))
}

function watchServer() {
  return gulp
    .watch('./src/server/**/*.js', gulp.series(compileServer))
    .on('error', () => {})
}

function runServer() {
  return $.nodemon({
    script: './server.js',
    watch: 'build',
    ignore: ['**/__tests'],
    exec: 'node --debug'
  })
}

function testServer(cb) {
  childProcess.exec('node ./tests.js', (err, stdout, stderr) => {
    console.log(stdout)
    console.log(stderr)

    if (err) {
      cb(new $.util.PluginError('testServer', 'Tests Failed!'))
      return
    }
    cb()
  })
}

function runTestServer() {
  return $.nodemon({
    script: './tests.js',
    watch: 'build'
  })
}

/**
 * Client
 */
const consoleStats = {
  colors: true,
  exclude: ['node_modules'],
  chunks: false,
  assets: false,
  timrings: true,
  modules: false,
  hash: false,
  version: false
}

gulp.task('client:clean', (cb) => {
  rimraf('./public/build', () => cb())
})

gulp.task(
  'client:build',
  gulp.series( 
   'client:clean',   
    buildClient
  )
)

gulp.task(
  'client:dev', 
  gulp.series( 
   'client:clean',  
   watchClient
  )
)

function buildClient(cb) {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      cb(err)
      return
    }

    console.log(stats.toString(consoleStats))
    cb()
  })
}

function watchClient() {
  const compiler = webpack(webpackConfig)
  const server = new webpackDevServer(compiler, {
    publicPath: '/build/',
    hot: true,
    stats: consoleStats,
    headers: { 'Access-Control-Allow-Origin': '*' }
  })

  server.listen(8080, () => {})
}

/**
 * Misc
 */
gulp.task('dev', gulp.parallel('server:dev', 'client:dev'))
gulp.task('build', gulp.parallel('server:build', 'client:build'))
