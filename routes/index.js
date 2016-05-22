const router = require('koa-router')()

router.get('/', function *(next) {
  yield this.render('index', {
    title: '2 Factor Authentication'
  })
})

module.exports = router
