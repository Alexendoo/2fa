var gulp = require('gulp')
var nodemon = require('gulp-nodemon')
var sourcemaps = require('gulp-sourcemaps')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var cssmin = require('gulp-cssmin')
var del = require('del')
var path = require('path')

var client = {
  js: {
    src: 'client/js',
    dest: 'public/js'
  },
  css: {
    src: 'client/css',
    dest: 'public/css'
  }
}

gulp.task('default', ['js', 'css', 'start'])

gulp.task('start', function () {
  nodemon({
    script: 'bin/www',
    ext: 'js css',
    ignore: ['public', 'logs'],
    tasks: function (files) {
      var tasks = []
      files.forEach(function (file) {
        console.log(`file changed: ${file}`)
        if (!path.relative(client.js.src, file).startsWith('..') &&
          !tasks.includes('js')) {
          tasks.push('js')
        }
        if (!path.relative(client.css.src, file).startsWith('..') &&
          !tasks.includes('css')) {
          tasks.push('css')
        }
      })
      return tasks
    }
  })
})

gulp.task('js:clean', function () {
  return del([client.js.dest])
})

gulp.task('css:clean', function () {
  return del([client.css.dest])
})

gulp.task('js', ['js:clean'], function () {
  return gulp.src(client.js.src + '/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('graph.js'))
    .pipe(uglify())
    .pipe(gulp.dest(client.js.dest))
})

gulp.task('css', ['css:clean'], function () {
  return gulp.src(client.css.src + '/**/*.css')
    .pipe(concat('style.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(client.css.dest))
})
