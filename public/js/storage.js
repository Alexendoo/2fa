import PouchDB from 'pouchdb'
import { base32ToArrayBuffer } from './base32'
import { exportKey, importKey } from './crypto'

PouchDB.debug.enable('*')

const db = new PouchDB('test-002')

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
export function storeEntry (secret, issuer = null, label = null, algorithm = 'SHA-1', period = 30, digits = 6) {
  return new Promise((resolve, reject) => {
    if (!secret) reject(Error('secret missing'))

    resolve(base32ToArrayBuffer(secret))
  }).then(buffer => {
    return importKey(buffer, algorithm)
  }).then(cryptoKey => {
    return exportKey(cryptoKey, 'jwk')
  }).then(jwk => {
    return db.put({
      _id: Date.now(),
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
export function recallEntries () {
  return db.allDocs({
    include_docs: true
  })
}
