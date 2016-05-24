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
          keyData: row.doc.keyData,
          canvas: null
        }

        entry.classList.add('entry')
        entry.setAttribute('id', row.doc._id)
        entry.setAttribute('data-digits', row.doc.digits)
        entry.setAttribute('data-period', row.doc.period)
        entry.setAttribute('data-cycle', 0)

        const entryTimer = document.createElement('canvas')
        entryTimer.classList.add('entryTimer')
        entryTimer.setAttribute('width', 48)
        entryTimer.setAttribute('height', 48)

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

          const image = document.createElement('img')

          image.addEventListener('load', () => {
            const canvas = document.createElement('canvas')
            canvas.setAttribute('width', 48)
            canvas.setAttribute('height', 48)

            const ctx = canvas.getContext('2d')
            const width = entryTimer.width
            const height = entryTimer.height
            const margin = 10

            ctx.drawImage(
              image,
              margin,
              margin,
              width - margin * 2,
              height - margin * 2
            )

            ctx.globalCompositeOperation = 'source-atop'
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)

            ctx.globalCompositeOperation = 'destination-over'
            ctx.fillStyle = `#${icon.hex}`
            ctx.fillRect(0, 0, width, height)

            entryProperties[row.doc._id].canvas = canvas
          })

          image.src = `icons/${title}.svg`
        }).catch(console.log.bind(console))
      }
    })
  }

  function timer () {
    const entries = document.getElementById('entries')

    for (let entry of entries.children) {
      const entryTimer = entry.querySelector('.entryTimer')
      const period = entry.getAttribute('data-period') * 1000
      const digits = entry.getAttribute('data-digits')

      const cycle = Math.floor(Date.now() / period)
      const lastCycle = entry.getAttribute('data-cycle')

      drawTimer(entryTimer, period)

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
    if (!canvas.getContext) return
    const radius = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2))
    const time = Date.now() % period
    const endAngle = 1.5 * Math.PI + 2 * time * Math.PI / period
    const baseCanvas = entryProperties[canvas.parentNode.id].canvas

    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.width)

    if (baseCanvas) ctx.drawImage(baseCanvas, 0, 0)

    ctx.globalCompositeOperation = 'exclusion'

    ctx.fillStyle = '#666'

    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, endAngle, 1.5 * Math.PI, true)
    ctx.lineTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height / 2)
    ctx.fill()
  }
})()
