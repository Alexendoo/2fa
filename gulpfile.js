const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const concat = require('gulp-concat')
const cssmin = require('gulp-cssmin')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const del = require('del')
const path = require('path')

const client = {
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

gulp.task('build', ['js', 'css'])

gulp.task('start', () => {
  nodemon({
    script: 'bin/www',
    ext: 'js css',
    ignore: ['public', 'logs'],
    tasks: files => {
      let tasks = []
      files.forEach(file => {
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

gulp.task('js:clean', () => {
  return del([client.js.dest])
})

gulp.task('css:clean', () => {
  return del([client.css.dest])
})

gulp.task('js', ['js:clean'], () => {
  const index = rollup.rollup({
    entry: client.js.src + '/index.js',
    plugins: [ babel() ]
  }).then(function (bundle) {
    bundle.write({
      dest: client.js.dest + '/index.js',
      format: 'umd'
    })
  })
  return Promise.all([index])
})

gulp.task('css', ['css:clean'], () => {
  return gulp.src(client.css.src + '/**/*.css')
    .pipe(concat('style.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(client.css.dest))
})
