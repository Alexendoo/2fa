/**
 * Get the HMAC signature of a message
 *
 * @param  {(ArrayBuffer|Object)} keyData Key to use, as an ArrayBuffer or jwk
 *                                        {@link https://tools.ietf.org/html/rfc7517}
 * @param  {ArrayBuffer} message Message to sign
 * @param  {String} [algorithm=SHA-1] Hash function to use in the HMAC
 *
 * @return {Promise} Resolves with the signature in an ArrayBuffer
 */
export function hmac (keyData, message, algorithm = 'SHA-1') {
  return importKey(keyData, algorithm)
    .then(key => window.crypto.subtle.sign(
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
 * @param  {(ArrayBuffer|Object)} keyData Key to use, as an ArrayBuffer or jwk
 *                                        {@link https://tools.ietf.org/html/rfc7517}
 * @param  {String} [algorithm=SHA-1] Hash Function used in the HMAC
 *
 * @return {Promise} Resolves to the generated CryptoKey
 */
export function importKey (keyData, algorithm = 'SHA-1') {
  return window.crypto.subtle.importKey(
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

/**
 * Export a key to the requested format, or jwk by default
 *
 * @param {CryptoKey} key An extractable CryptoKey
 * @param {String} [format=jwk] The format to export to
 *
 * @return {Promise} Resolves to the exported key in the specfied format
 *
 * @see {@link https://tools.ietf.org/html/rfc7517}
 */
export function exportKey (key, format = 'jwk') {
  return window.crypto.subtle.exportKey(
    format, key
  )
}

/**
 * Get the final user readable TOTP token
 *
 * @param  {(ArrayBuffer|Object)} keyData Key to use, as an ArrayBuffer or jwk
 *                                        {@link https://tools.ietf.org/html/rfc7517}
 * @param  {ArrayBuffer} timeCounter unsigned 32 bit time counter
 *
 * @return {Promise} Resolves to a String, the token
 *
 * @see {@link https://tools.ietf.org/html/rfc4226#section-5.3}
 */
export function getToken (keyData, timeCounter) {
  return hmac(keyData, timeCounter).then(buffer => {
    const view = Uint8Array(buffer)
    const offest = view[view.length - 1] & 0x0F

    return offest
  })
}
