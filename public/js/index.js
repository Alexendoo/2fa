import { recallEntries } from './storage'

let timerRunning = false
updateUI()

function updateUI () {
  timerRunning = false
  recallEntries.then(result => {
    const entries = document.getElementById('entries')

    while (entries.firstChild) entries.removeChild(entries.firstChild)

    for (let row of result.rows) {
      const entry = document.createElement('div')
      entry.setAttribute('id', row.doc._id)

      const entryIssuer = document.createElement('div')
      entryIssuer.classList.add('entryIssuer')
      entryIssuer.textContent = row.doc.issuer

      const entryTimer = document.createElement('canvas')
      entryTimer.classList.add('entryTimer')
      entryTimer.setAttribute('data-period', row.doc.period)
      entryTimer.setAttribute('width', 48)
      entryTimer.setAttribute('height', 48)

      entry.appendChild(entryIssuer)
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
    drawTimer(entryTimer)
  }

  window.requestAnimationFrame(timer)
}

function drawTimer (canvas) {
  if (!canvas.getContext) return
  const radius = canvas.width / 2
  const period = canvas.getAttribute('data-period')
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
