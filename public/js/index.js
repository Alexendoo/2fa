/* eslint-env browser */
;(function () {
  const recallEntries = window.TFA.storage.recallEntries
  const storeEntry = window.TFA.storage.storeEntry
  const totp = window.TFA.crypto.totp

  const iconsPromise = fetch('icons.json').then(response => {
    return response.json()
  }).then(json => {
    return json.icons
  })

  let entryProperties = {}

  updateEntries()
  window.requestAnimationFrame(timer)

  // storeEntry('HXDMVJECJJWSRB3HWIZR4IFUGFTM',
  //   'company', 'example@email.com', 'SHA-1', 30)
  //     .then(entry => console.log(entry))

  function updateEntries () {
    recallEntries().then(result => {
      const entries = document.getElementById('entries')
      entryProperties = {}

      while (entries.firstChild) entries.removeChild(entries.firstChild)

      for (let row of result.rows) {
        const entry = document.createElement('div')

        entryProperties[row.doc._id] = {
          keyData: row.doc.keyData
        }

        // TODO: better naming

        entry.classList.add('entry')
        entry.setAttribute('id', row.doc._id)
        entry.setAttribute('data-digits', row.doc.digits)
        entry.setAttribute('data-period', row.doc.period)
        entry.setAttribute('data-cycle', 0)

        const entryTimer = document.createElement('div')
        entryTimer.classList.add('entryTimer')

        const entryTimerCanvas = document.createElement('canvas')
        entryTimerCanvas.classList.add('entryTimerCanvas')
        entryTimerCanvas.setAttribute('width', 200)
        entryTimerCanvas.setAttribute('height', 200)

        const entryDetails = document.createElement('div')
        entryDetails.classList.add('entryDetails')

        const entryToken = document.createElement('div')
        entryToken.classList.add('entryToken')

        const entryIssuer = document.createElement('div')
        entryIssuer.classList.add('entryIssuer')
        entryIssuer.textContent = row.doc.issuer

        const entryLabel = document.createElement('div')
        entryLabel.classList.add('entryLabel')
        entryLabel.textContent = row.doc.label

        entryTimer.appendChild(entryTimerCanvas)

        entryDetails.appendChild(entryToken)
        entryDetails.appendChild(entryIssuer)
        entryDetails.appendChild(entryLabel)

        entry.appendChild(entryTimer)
        entry.appendChild(entryDetails)

        entries.appendChild(entry)

        iconsPromise.then(icons => {
          const icon = icons.find(icon => icon.title === row.doc.issuer)
          if (!icon) throw new Error(`${row.doc.issuer} has no icon`)

          const title = row.doc.issuer
            .replace(' ', '')
            .replace('.', '')
            .replace('+', 'plus')
            .toLowerCase()

          return fetch(`icons/${title}.svg`)
        }).then(response => {
          return response.text()
        }).then(text => {
          entryTimer.innerHTML += text
        }).catch(
          console.log.bind(console)
        )
      }
    })
  }

  function timer () {
    const entries = document.getElementById('entries')

    for (let entry of entries.children) {
      const entryTimerCanvas = entry.querySelector('.entryTimerCanvas')
      const period = entry.getAttribute('data-period') * 1000
      const digits = entry.getAttribute('data-digits')

      const cycle = Math.floor(Date.now() / period)
      const lastCycle = entry.getAttribute('data-cycle')

      drawTimer(entryTimerCanvas, period)

      if (cycle > lastCycle) {
        const entryToken = entry.querySelector('.entryToken')
        entry.setAttribute('data-cycle', cycle)

        totp(entryProperties[entry.id].keyData, cycle, digits).then(token => {
          entryToken.textContent = token
        })
      }
    }

    window.requestAnimationFrame(timer)
  }

  function drawTimer (canvas, period) {
    if (!canvas.getContext) throw new TypeError('expected canvas')
    const radius = 100
    const time = Date.now() % period
    const endAngle = 1.5 * Math.PI + 2 * time * Math.PI / period

    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.width)

    ctx.fillStyle = '#111'

    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI)
    ctx.fill()

    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 24

    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, endAngle, 1.5 * Math.PI, true)
    ctx.stroke()
  }
})()
