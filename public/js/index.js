import { recallEntries, recallEntry, storeEntry } from './storage'
import { getToken } from './crypto'

let timerRunning = false
updateEntries()

// storeEntry('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ', 'company', 'example@email.com', 'SHA-1', 30)
//   .then(entry => console.log(entry))

function updateEntries () {
  timerRunning = false
  recallEntries().then(result => {
    const entries = document.getElementById('entries')

    while (entries.firstChild) entries.removeChild(entries.firstChild)

    for (let row of result.rows) {
      const entry = document.createElement('div')
      entry.classList.add('entry')
      entry.setAttribute('id', row.doc._id)
      entry.setAttribute('data-period', row.doc.period)
      entry.setAttribute('data-cycle', 0)

      const entryToken = document.createElement('div')
      entryToken.classList.add('entryToken')

      const entryIssuer = document.createElement('div')
      entryIssuer.classList.add('entryIssuer')
      entryIssuer.textContent = row.doc.issuer

      const entryLabel = document.createElement('div')
      entryLabel.classList.add('entryLabel')
      entryLabel.textContent = row.doc.label

      const entryTimer = document.createElement('canvas')
      entryTimer.classList.add('entryTimer')
      entryTimer.setAttribute('width', 48)
      entryTimer.setAttribute('height', 48)

      entry.appendChild(entryToken)
      entry.appendChild(entryIssuer)
      entry.appendChild(entryLabel)
      entry.appendChild(entryTimer)
      entries.appendChild(entry)
    }

    timerRunning = true
    window.requestAnimationFrame(timer)
  })
}

function timer () {
  if (!timerRunning) return

  const entries = document.getElementById('entries')

  for (let entry of entries.children) {
    const entryTimer = entry.querySelector('.entryTimer')
    const period = entry.getAttribute('data-period') * 1000

    const cycle = Math.floor(Date.now() / period)
    const lastCycle = entry.getAttribute('data-cycle')

    drawTimer(entryTimer, period)

    if (cycle > lastCycle) {
      const entryToken = entry.querySelector('.entryToken')
      entry.setAttribute('data-cycle', cycle)

      recallEntry(entry.id).then(doc => {
        const buffer = new ArrayBuffer(8)
        const view = new Uint8Array(buffer)
        let hex = cycle.toString(16)

        while (hex.length < 16) {
          hex = '0' + hex
        }

        for (var i = 0; i < view.length; i++) {
          console.log('idx', i, 'hex', hex.slice(i * 2, i * 2 + 2))
          view[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
        }

        return getToken(doc.keyData, buffer)
      }).then(token => {
        entryToken.textContent = token
      })
    }
  }

  window.requestAnimationFrame(timer)
}

function drawTimer (canvas, period) {
  if (!canvas.getContext) return
  const radius = canvas.width / 2
  const time = Date.now() % period
  const endAngle = 1.5 * Math.PI + 2 * time * Math.PI / period

  let ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.width)
  ctx.strokeStyle = '#42A5F5'
  ctx.fillStyle = '#42A5F5'

  ctx.beginPath()
  ctx.arc(radius, radius, radius, 0, 2 * Math.PI)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(radius, radius, radius, 1.5 * Math.PI, endAngle, true)
  ctx.lineTo(radius, radius)
  ctx.lineTo(radius, 0)
  ctx.fill()
}
