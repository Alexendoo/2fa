/* globals asmCrypto */
;(function () {
  const subtle = window.crypto.subtle || window.crypto.webkitSubtle

  /**
   * Get the HMAC signature of a message
   *
   * @param  {Object} keyData Key to use, as an ArrayBuffer or
   *                          {@link https://tools.ietf.org/html/rfc7517 jwk}
   * @param  {ArrayBuffer} message Message to sign
   * @param  {String} [algorithm=SHA-1] Hash function to use in the HMAC
   *
   * @return {Promise} Resolves with the signature in an ArrayBuffer
   */
  function hmac (keyData, message, algorithm = 'SHA-1') {
    return importKey(keyData, algorithm)
      .then(key => subtle.sign(
        {
          name: 'HMAC'
        },
        key,
        message
      ))
  }

  /**
   * Import a key using the requested algorithm, or SHA-1 by default
   *
   * @param  {Object} keyData Key to use, as an ArrayBuffer or
   *                          {@link https://tools.ietf.org/html/rfc7517 jwk}
   * @param  {String} [algorithm=SHA-1] Hash Function used in the HMAC
   *
   * @return {Promise} Resolves to the generated CryptoKey
   */
  function importKey (keyData, algorithm = 'SHA-1') {
    return subtle.importKey(
      keyData instanceof ArrayBuffer ? 'raw' : 'jwk',
      keyData,
      {
        name: 'HMAC',
        hash: algorithm
      },
      true,
      ['sign']
    )
  }

  // TODO: getJwk = export(import) for native, custom for fallback

  /**
   * Export a key to the requested format, or
   * {@link https://tools.ietf.org/html/rfc7517 jwk} by default
   *
   *
   * @param {CryptoKey} key An extractable CryptoKey
   * @param {String} [format=jwk] The format to export to
   *
   * @return {Promise} Resolves to the exported key in the specfied format
   *
   * @see
   */
  function exportKey (key, format = 'jwk') {
    return subtle.exportKey(
      format, key
    )
  }

  /**
   * Genearte a HMAC-based One-Time Password
   * {@link https://tools.ietf.org/html/rfc4226}
   *
   * @param  {Object} keyData Key to use, as an ArrayBuffer or
   *                          {@link https://tools.ietf.org/html/rfc7517 jwk}
   * @param  {ArrayBuffer} counter A 32bit unsigned integer stored in an
   *                               ArrayBuffer, hashed high-order byte first
   * @param {Number} [digits=6] The length of the generated token
   *
   * @return {Promise} Resolves to the generated token (String)
   */
  function hotp (keyData, counter, digits = 6) {
    return hmac(keyData, counter).then(buffer => {
      const view = new Uint8Array(buffer)
      const offset = view[view.length - 1] & 0x0F

      const resultBuffer = new ArrayBuffer(4)
      let resultView = new DataView(resultBuffer)

      for (var i = 0; i < 4; i++) {
        resultView.setUint8(i, view[offset + i])
      }

      resultView.setUint8(
        0, resultView.getUint8(0) & 0x7F
      )

      let result = (resultView.getUint32(0, false) % Math.pow(10, digits)).toString()

      while (result.length < digits) result = '0' + result

      return result
    })
  }

  /**
   * Generate a Time-based One-Time Password
   * {@link https://tools.ietf.org/html/rfc6238}
   *
   * @param  {Object} keyData Key to use, as an ArrayBuffer or
   *                          {@link https://tools.ietf.org/html/rfc7517 jwk}
   * @param  {Number} cycle The number of time steps between the initial counter
   *                        time T0 and the current Unix time
   * @param  {Number} [digits=6] The length of the generated token
   *
   * @return {Promise} Resolves to the generated token (String)
   */
  function totp (keyData, cycle, digits = 6) {
    return new Promise((resolve, reject) => {
      const buffer = new ArrayBuffer(8)
      const view = new Uint8Array(buffer)
      let hex = cycle.toString(16)

      while (hex.length < 16) {
        hex = '0' + hex
      }

      for (var i = 0; i < view.length; i++) {
        view[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      }

      resolve(hotp(keyData, buffer, digits))
    })
  }

  window.TFA.crypto = {hmac, importKey, exportKey, hotp, totp}
})()
