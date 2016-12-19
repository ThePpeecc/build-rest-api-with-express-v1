//getting our gulp parts
const gulp = require('gulp'),
   nodemon = require('gulp-nodemon')

//Default is just build
gulp.task('default', function() {

})

//Starts the express server
gulp.task('start', function() {
  nodemon({
    script: 'src/index.js'
  , ext: 'js'
  , env: { 'NODE_ENV': 'development' }
  })
})
