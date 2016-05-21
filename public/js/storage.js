import PouchDB from 'pouchdb'
import { base32ToArrayBuffer } from './base32'
import { exportKey, importKey } from './crypto'

PouchDB.debug.enable('*')

const db = new PouchDB('test-002')

export function storeEntry (secret, issuer = '', algorithm = 'SHA-1', period = 30, digits = 6) {
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
