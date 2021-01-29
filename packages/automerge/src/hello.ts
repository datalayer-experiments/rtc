import Automerge, { Frontend, Backend } from 'automerge';

type String = {value: Automerge.Text}

// const t1 = Automerge.from({t: 'hello'})

const t1 = Automerge.init<String>()
const t2 = Automerge.change(t1, doc => {
   doc.value = new Automerge.Text('id', ['hello'])
})

// console.log(Automerge.getChanges(t1, t2)[0].ops)
// console.log(Automerge.getAllChanges(t2))
const t3 = Automerge.change(t2, doc => {
  doc.value.insertAt(0, 'H')
})
console.log(Automerge.getAllChanges(t3)[1].ops)
// console.log(t3.value.toString())
const [t4, change] = Automerge.Frontend.change(t3, doc => {
  doc.value.insertAt(0, 'chaffinch')
  doc.value.insertAt(2, 'greenfinch')
})
// console.log(t4)
console.log(change)

const t5 = Automerge.applyChanges(t4, [change])

// -----

interface NumberBox {
  number: number
}

const ddoc0 = Frontend.init<NumberBox>()
const db0 = Backend.init()
console.log(Frontend.canUndo(ddoc0), false)

const [ddoc1, dreq1] = Frontend.change(ddoc0, doc => (doc.number = 1))
const [db1, dpatch1] = Backend.applyLocalChange(db0, dreq1)
console.log(dpatch1)
const ddoc1a = Frontend.applyPatch(ddoc1, dpatch1)
console.log(Frontend.canUndo(ddoc1a), true)

const [ddoc2, dreq2] = Frontend.undo(ddoc1a)
console.log(dreq2.requestType, 'undo')
console.log(dreq2.actor, Frontend.getActorId(ddoc0))
console.log(dreq2.seq, 2)

const [b2, patch2] = Backend.applyLocalChange(db1, dreq2)
const doc2a = Frontend.applyPatch(ddoc2, patch2)
console.log(doc2a, {})

// -----

//console.log(Automerge.getChanges(new Automerge.Text(), t))

// Let's say doc1 is the application state on device 1.
// Further down we'll simulate a second device.
// We initialize the document to initially contain an empty list of cards.
let doc1 = Automerge.from({ cards: [] })

// The doc1 object is treated as immutable -- you must never change it
// directly. To change it, you need to call Automerge.change() with a callback
// in which you can mutate the state. You can also include a human-readable
// description of the change, like a commit message, which is stored in the
// change history (see below).
doc1 = Automerge.change(doc1, 'Add card', doc => {
  doc.cards.push({ title: 'Rewrite everything in Clojure', done: false })
})
// Now the state of doc1 is:
// { cards: [ { title: 'Rewrite everything in Clojure', done: false } ] }
console.log(doc1);

// Automerge also defines an insertAt() method for inserting a new element at
// a particular position in a list. Or you could use splice(), if you prefer.
doc1 = Automerge.change(doc1, 'Add another card', doc => {
  doc.cards.splice(0, 0, { title: 'Rewrite everything in Haskell', done: false });
})
// { cards:
//    [ { title: 'Rewrite everything in Haskell', done: false },
//      { title: 'Rewrite everything in Clojure', done: false } ] }
console.log(doc1)

// Now let's simulate another device, whose application state is doc2. We
// initialise it separately, and merge doc1 into it. After merging, doc2 has
// a copy of all the cards in doc1.

// let doc2 = Automerge.init()
let doc2 = Automerge.from({ cards: [] })

doc2 = Automerge.merge(doc2, doc1)
console.log(doc2)

// Now make a change on device 1:
doc1 = Automerge.change(doc1, 'Mark card as done', doc => {
  doc.cards[0].done = true
})
// { cards:
//    [ { title: 'Rewrite everything in Haskell', done: true },
//      { title: 'Rewrite everything in Clojure', done: false } ] }
console.log(doc1)

// And, unbeknownst to device 1, also make a change on device 2:
doc2 = Automerge.change(doc2, 'Delete card', doc => {
//  delete doc.cards[1]
  if (doc.cards.length > 1) {
    doc.cards.splice(1, 1);
  }
})
// { cards: [ { title: 'Rewrite everything in Haskell', done: false } ] }
console.log(doc2)

// Now comes the moment of truth. Let's merge the changes from device 2 back
// into device 1. You can also do the merge the other way round, and you'll get
// the same result. The merged result remembers that 'Rewrite everything in
// Haskell' was set to true, and that 'Rewrite everything in Clojure' was
// deleted:

let finalDoc = Automerge.merge(doc1, doc2)
// { cards: [ { title: 'Rewrite everything in Haskell', done: true } ] }
console.log(finalDoc);

// As our final trick, we can inspect the change history. Automerge
// automatically keeps track of every change, along with the "commit message"
// that you passed to change(). When you query that history, it includes both
// changes you made locally, and also changes that came from other devices. You
// can also see a snapshot of the application state at any moment in time in the
// past. For example, we can count how many cards there were at each point:

const history = Automerge.getHistory(finalDoc).map(state => [state.change.message, state.snapshot.cards.length])
// [ [ 'Initialization', 0 ],
//   [ 'Add card', 1 ],
//   [ 'Add another card', 2 ],
//   [ 'Mark card as done', 2 ],
//   [ 'Delete card', 1 ] ]
console.log(history);
