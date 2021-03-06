/* global PouchDB */
;(function () {
  const base32ToArrayBuffer = window.TFA.base32.base32ToArrayBuffer
  const importKey = window.TFA.crypto.importKey
  const exportKey = window.TFA.crypto.exportKey

  PouchDB.debug.disable()

  const db = new PouchDB('test-003')

  /**
   * Store a TOTP record
   *
   * @param  {String} secret The base32 encoded secret
   * @param  {String} [issuer] Indicates the service the key belongs to
   * @param  {String} [label] Account name/ email address to distinquish records,
   *                          may be overridden by the user
   * @param  {String} [algorithm=SHA-1] The algorithm used by HMAC
   * @param  {Number} [period=30] Duration the generated codes are valid for,
   *                              measured in seconds
   * @param  {Number} [digits=6] Number of digits per generated code
   *
   * @return {Promise} {@link https://pouchdb.com/api.html#create_document}
   *
   * @see {@link https://github.com/google/google-authenticator/wiki/Key-Uri-Format}
   */
  function storeEntry (secret, issuer = null, label = null, algorithm = 'SHA-1', period = 30, digits = 6) {
    return new Promise((resolve, reject) => {
      if (!secret) reject(Error('secret missing'))

      resolve(base32ToArrayBuffer(secret))
    }).then(buffer => { // TODO: getjwk?
      return importKey(buffer, algorithm)
    }).then(cryptoKey => {
      return exportKey(cryptoKey, 'jwk')
    }).then(jwk => {
      return db.put({
        _id: new Date().toISOString(),
        keyData: jwk,
        issuer,
        label,
        period,
        digits
      })
    })
  }

  /**
   * Returns a promise resolving to all of the PouchDB documents
   *
   * @return {Promise} Resolves to all the PouchDB documents
   * @see {@link https://pouchdb.com/api.html#batch_fetch}
   */
  function recallEntries () {
    return db.allDocs({
      include_docs: true
    })
  }

  /**
   * Returns a promise resolving to a specified PouchDB document
   *
   * @param  {String} id The ID of the document
   *
   * @return {Promise} Resolves to the PouchDB document
   * @see {@link https://pouchdb.com/api.html#fetch_document}
   */
  function recallEntry (id) {
    return db.get(id)
  }

  window.TFA.storage = {storeEntry, recallEntries, recallEntry}
})()
