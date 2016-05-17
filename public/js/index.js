import PouchDB from 'pouchdb'

PouchDB.debug.enable('*')

const db = new PouchDB('test-001')

db.changes({
  since: 'now',
  live: true
}).on('change', change => {
  console.log(change)
  updateUI()
})

db.get('001').then(doc => {
  console.log(doc)
  return db.put({
    _id: '001',
    _rev: doc._rev,
    text: `goodbye ${doc._rev}`
  })
}).catch(err => {
  if (err.status !== 404) throw err
  db.put({
    _id: '001',
    text: 'hello'
  })
})

function updateUI () {
  const entries = document.getElementById('entries')

  db.allDocs({
    include_docs: true
  }).then(result => {
    console.log(result)
  })
}
