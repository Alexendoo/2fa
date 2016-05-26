/* global asmCrypto */
;(function () {
  function importJwk (jwk) {
    const alg = {
      HS1: 'HMAC_SHA1',
      HS256: 'HMAC_SHA256',
      HS512: 'HMAC_SHA512'
    }[jwk.alg]

    const bytes = asmCrypto.base64_to_bytes(jwk.k)

    return {bytes, alg}
  }

  function exportJwk (bytes, alg) {
    return {
      alg,
      ext: true,
      k: asmCrypto.bytes_to_base64(bytes),
      key_ops: [ 'sign' ],
      kty: 'oct'
    }
  }



  // TODO : rename
  window.c = {importJwk, exportJwk}
})()
