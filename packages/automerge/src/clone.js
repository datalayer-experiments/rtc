const Automerge = require('automerge')

function clone(obj) {
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
    return obj
  } else if (obj instanceof Automerge.Text) {
    return new Automerge.Text(obj.toString())
  } else if (Array.isArray(obj)) {
    return obj.map(clone)
  } else {
    let newObj = {}
    for (let key of Object.keys(obj)) newObj[key] = clone(obj[key])
    return newObj
  }
}

let observable = new Automerge.Observable()

let x = Automerge.from({cells: [
  {text: new Automerge.Text('asdf'), numbers: [1, 2, 3]},
  {text: new Automerge.Text('fdsa'), numbers: [3, 2, 1]}
]}, {observable})

observable.observe(x.cells[0], patch => console.log('callback observing asdf cell'))

observable.observe(x.cells[1], patch => console.log('callback observing fdsa cell'))

observable.observe(x, (patch, before, after) => {

  const cellsId = patch.props.cells && Object.keys(patch.props.cells)[0]
  if (!cellsId) return
  let cells = before.cells.slice()
  let seenRemove = false, seenInsert = false, removedId, insertedIndex

  for (let edit of patch.props.cells[cellsId].edits || []) {
    if (edit.action === 'remove') {
      if (seenRemove) throw new RangeError("can't handle removal of more than one cell right now")
      seenRemove = true
      removedId = Automerge.getObjectId(cells[edit.index])
      cells.splice(edit.index, 1)
      if (seenInsert && edit.index < insertedIndex) insertedIndex -= 1
    } else if (edit.action === 'insert') {
      if (seenInsert) throw new RangeError("can't handle insert of more than one cell right now")
      seenInsert = true
      insertedIndex = edit.index
      cells.splice(edit.index, 0, null)
    }
  }

  if (seenInsert && seenRemove) {
    let insertedId = Automerge.getObjectId(after.cells[insertedIndex])
    console.log(`moved object ${removedId} to ${insertedId}`)
    observable.observers[insertedId] = observable.observers[removedId]
    delete observable.observers[removedId]
  }

})

console.log(`IDs: ${Automerge.getObjectId(x.cells[0])}, ${Automerge.getObjectId(x.cells[1])}`)

x = Automerge.change(x, doc => doc.cells[0].numbers.push(4)) // trigger asdf observer

x = Automerge.change(x, doc => {
  const c = clone(doc.cells[0])
  doc.cells.push(c)
  delete doc.cells[0]
})

console.log(`IDs: ${Automerge.getObjectId(x.cells[0])}, ${Automerge.getObjectId(x.cells[1])}`)

x = Automerge.change(x, doc => doc.cells[1].numbers.push(4)) // trigger asdf observer (now at index 1)
