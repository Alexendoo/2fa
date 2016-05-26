/* eslint-env browser */
;(function () {
  window.TFA = window.TFA || {}

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log(err)
    })
  }
})()
