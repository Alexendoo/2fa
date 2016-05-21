import PouchDB from 'pouchdb'
import { base32ToArrayBuffer } from './base32'

PouchDB.debug.enable('*')

const db = new PouchDB('test-001')
let timerRunning = false

db.changes({
  since: 'now',
  live: true
}).on('change', change => {
  console.log('change: ', change)
  updateUI()
})

db.get('001').then(doc => {
  console.log(doc)
  return db.put({
    _id: '001',
    _rev: doc._rev,
    text: `supersedes ${doc._rev}`,
    period: 30000
  })
}).catch(err => {
  if (err.status !== 404) throw err
  db.put({
    _id: '001',
    text: 'hello'
  })
})

db.get('002').then(doc => {
  console.log(doc)
  return db.put({
    _id: '002',
    _rev: doc._rev,
    text: `supersedes ${doc._rev}`,
    period: 60000
  })
}).catch(err => {
  if (err.status !== 404) throw err
  db.put({
    _id: '002',
    text: 'hello'
  })
})

function updateUI () {
  timerRunning = false
  db.allDocs({
    include_docs: true
  }).then(result => {
    const entries = document.getElementById('entries')

    while (entries.firstChild) entries.removeChild(entries.firstChild)

    for (let row of result.rows) {
      const entry = document.createElement('div')

      const entryText = document.createElement('div')
      entryText.classList.add('entryText')
      entryText.textContent = row.doc.text

      const entryTimer = document.createElement('canvas')
      entryTimer.classList.add('entryTimer')
      entryTimer.setAttribute('data-period', row.doc.period)
      entryTimer.setAttribute('width', 48)
      entryTimer.setAttribute('height', 48)

      entry.appendChild(entryText)
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
  ctx.arc(radius, radius, radius, Math.PI * 1.5, endAngle, true)
  ctx.lineTo(radius, radius)
  ctx.lineTo(radius, 0)
  ctx.fill()
}

function storeEntry (secret, issuer = '', algorithm = 'SHA1', period = 30, digits = 6) {
  return new Promise((resolve, reject) => {
    if (!secret) reject('secret missing')
  })
}

// TODO: HMAC
