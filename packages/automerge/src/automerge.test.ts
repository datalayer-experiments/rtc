/**
 * @jest-environment jsdom
 */
import Automerge from 'automerge';

describe('Automerge', () => {

  it('Automerge 1', async () => {

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

  });

  it('Automerge 2', async () => {
    // Automerge.init() creates a new, empty Automerge document.
    const doc = Automerge.init() // doc = {}
    // Automerge.from(initialState) creates a new Automerge document and populates it with the contents of the object initialState.
    const doc2 = Automerge.from({ 
      property: null,
      stringValue: null,
      numberValue: null,
      boolValue: null,
      nullValue: null,
      nestedObject: null,
      otherObject: null,
      list: null,
      cards: [] 
    }) // doc = { cards: [] }
    const newDoc = Automerge.change(doc2, doc => {
      // NOTE: never modify `currentDoc` directly, only ever change `doc`!
      doc.property = 'value' // assigns a string value to a property
      doc['property'] = 'value' // equivalent to the previous line

      delete doc['property'] // removes a property
    
      // all JSON primitive datatypes are supported
      doc.stringValue = 'value'
      doc.numberValue = 1
      doc.boolValue = true
      doc.nullValue = null
    
      doc.nestedObject = {} // creates a nested object
      doc.nestedObject.property = 'value'
    
      // you can also assign an object that already has some properties
      doc.otherObject = { key: 'value', number: 42 }
    
      // Arrays are fully supported
      doc.list = [] // creates an empty list object
      doc.list.push(2, 3) // push() adds elements to the end
      doc.list.unshift(0, 1) // unshift() adds elements at the beginning
      doc.list[3] = Math.PI // overwriting list element by index
      // now doc.list is [0, 1, 2, 3.141592653589793]
    
      // Looping over lists works as you'd expect:
      for (let i = 0; i < doc.list.length; i++) doc.list[i] *= 2
      // now doc.list is [0, 2, 4, 6.283185307179586]
    
      doc.list.splice(2, 2, 'automerge')
      // now doc.list is [0, 'hello', 'automerge', 4]
    
    //  doc.list[4] = { key: 'value' } // objects can be nested inside lists as well
    
      // Arrays in Automerge offer the convenience functions `insertAt` and `deleteAt`
      doc.list.insertAt(1, 'hello', 'world') // inserts elements at given index
      doc.list.deleteAt(2) // deletes element at given index
      // now doc.list is [0, 'hello', 'world', 2, 4]
    })

    /*

The newDoc returned by Automerge.change() is a regular JavaScript object containing all the edits you made in the callback. Any parts of the document that you didn't change are carried over unmodified. The only special things about it are:

It is treated as immutable, so all changes must go through Automerge.change().
Every object has a unique ID, which you can get by passing the object to the Automerge.getObjectId() function. This ID is used by Automerge to track which object is which.
Objects also have information about conflicts, which is used when several users make changes to the same property concurrently (see below). You can get conflicts using the Automerge.getConflicts() function.
Making fine-grained changes
If you have previously worked with immutable state in JavaScript, you might be in the habit of using idioms like these:

state = Automerge.change(state, 'Add card', doc => {
  const newItem = { id: 123, title: 'Rewrite everything in Rust', done: false }
  doc.cards = {
    ids: [...doc.cards.ids, newItem.id],
    entities: { ...doc.cards.entities, [newItem.id]: newItem }
  }
})
While this pattern works fine outside of Automerge, please don't do this in Automerge! Please use mutable idioms to update the state instead, like this:

state = Automerge.change(state, 'Add card', doc => {
  const newItem = { id: 123, title: 'Rewrite everything in Rust', done: false }
  doc.cards.ids.push(newItem.id)
  doc.cards.entities[newItem.id] = newItem
})
Even though you are using mutating APIs, Automerge ensures that the code above does not actually mutate state, but returns a new copy of state in which the changes are reflected. The problem with the first example is that from Automerge's point of view, you are replacing the entire doc.cards object (and everything inside it) with a brand new object. Thus, if two users concurrently update the document, Automerge will not be able to merge those changes (instead, you will just get a conflict on the doc.cards property).

The second example avoids this problem by making the changes at a fine-grained level: adding one item to the array of IDs with ids.push(newItem.id), and adding one item to the map of entities with entities[newItem.id] = newItem. This code works much better, since it tells Automerge exactly which changes you are making to the state, and this information allows Automerge to deal much better with concurrent updates by different users.

As a general principle with Automerge, you should make state updates at the most fine-grained level possible. Don't replace an entire object if you're only modifying one property of that object; just assign that one property instead.

Persisting a document
Automerge.save(doc) serializes the state of Automerge document doc to a string, which you can write to disk. The string contains an encoding of the full change history of the document (a bit like a git repository).

Automerge.load(str) unserializes an Automerge document from a string that was produced by Automerge.save().

Note: Specifying actorId
The Automerge init, from, and load functions take an optional actorId parameter:

const actorId = '1234-abcd-56789-qrstuv'
const doc1 = Automerge.init(actorId)
const doc2 = Automerge.from({ foo: 1 }, actorId)
const doc3 = Automerge.load(str, actorId)
The actorId is a string that uniquely identifies the current node; if you omit actorId, a random UUID is generated. If you pass in your own actorId, you must ensure that there can never be two different processes with the same actor ID. Even if you have two different processes running on the same machine, they must have distinct actor IDs.

Unless you know what you are doing, you should stick with the default, and let actorId be auto-generated.

To get the actorId of the current node, call Automerge.getActorId(doc).

Undo and redo
Automerge makes it easy to support an undo/redo feature in your application. Note that undo is a somewhat tricky concept in a collaborative application! Here, "undo" is taken as meaning "what the user expects to happen when they hit ctrl+Z/⌘ Z". In particular, the undo feature undoes the most recent change by the local user; it cannot currently be used to revert changes made by other users.

Moreover, undo is not the same as jumping back to a previous version of a document; see the next section on how to examine document history. Undo works by applying the inverse operation of the local user's most recent change, and redo works by applying the inverse of the inverse. Both undo and redo create new changes, so from other users' point of view, an undo or redo looks the same as any other kind of change.

To check whether undo is currently available, use the function Automerge.canUndo(doc). It returns true if the local user has made any changes since the document was created or loaded. You can then call Automerge.undo(doc) to perform an undo. The functions canRedo() and redo() do the inverse:

let doc = Automerge.change(Automerge.init(), doc => {
  doc.birds = []
})
doc = Automerge.change(doc, doc => {
  doc.birds.push('blackbird')
})
doc = Automerge.change(doc, doc => {
  doc.birds.push('robin')
})
// now doc is {birds: ['blackbird', 'robin']}

Automerge.canUndo(doc) // returns true
doc = Automerge.undo(doc) // now doc is {birds: ['blackbird']}
doc = Automerge.undo(doc) // now doc is {birds: []}
doc = Automerge.redo(doc) // now doc is {birds: ['blackbird']}
doc = Automerge.redo(doc) // now doc is {birds: ['blackbird', 'robin']}
You can pass an optional message as second argument to Automerge.undo(doc, message) and Automerge.redo(doc, message). This string is used as "commit message" that describes the undo/redo change, and it appears in the change history.

Sending and receiving changes
The Automerge library itself is agnostic to the network layer — that is, you can use whatever communication mechanism you like to get changes from one node to another. There are currently a few options, with more under development:

Use Automerge.getChanges() and Automerge.applyChanges() to manually capture changes on one node and apply them on another.
Automerge.Connection is an implementation of a protocol that syncs up two nodes by determining missing changes and sending them to each other. The automerge-net repository contains an example that runs the Connection protocol over a simple TCP connection.
Cevitxe uses Automerge behind a familiar Redux interface. It provides multiple database adapters for persistence, and synchronization via a tiny relay server that allows peers to connect to each other via WebSockets.
automerge-client-server (usage example) runs the Automerge.Connection protocol over WebSocket.
MPL runs the Automerge.Connection protocol over WebRTC.
Hypermerge is a peer-to-peer networking layer that combines Automerge with Hypercore, part of the Dat project.
Perge is a minimal library that runs the Automerge.Connection protocol over PeerJS.
The getChanges()/applyChanges() API works as follows:

// On one node
newDoc = Automerge.change(currentDoc, doc => {
  // make arbitrary change to the document
})
let changes = Automerge.getChanges(currentDoc, newDoc)
network.broadcast(JSON.stringify(changes))

// On another node
let changes = JSON.parse(network.receive())
newDoc = Automerge.applyChanges(currentDoc, changes)
Note that Automerge.getChanges(oldDoc, newDoc) takes two documents as arguments: an old state and a new state. It then returns a list of all the changes that were made in newDoc since oldDoc. If you want a list of all the changes ever made in doc, you can call Automerge.getAllChanges(doc).

The counterpart, Automerge.applyChanges(oldDoc, changes) applies the list of changes to the given document, and returns a new document with those changes applied. Automerge guarantees that whenever any two documents have applied the same set of changes — even if the changes were applied in a different order — then those two documents are equal. That property is called convergence, and it is the essence of what Automerge is all about.

Automerge.merge(doc1, doc2) is a related function that is useful for testing. It looks for any changes that appear in doc2 but not in doc1, and applies them to doc1, returning an updated version of doc1. This function requires that doc1 and doc2 have different actor IDs (that is, they originated from different calls to Automerge.init()). See the Usage section above for an example using Automerge.merge().

Conflicting changes
Automerge allows different nodes to independently make arbitrary changes to their respective copies of a document. In most cases, those changes can be combined without any trouble. For example, if users modify two different objects, or two different properties in the same object, then it is straightforward to combine those changes.

If users concurrently insert or delete items in a list (or characters in a text document), Automerge preserves all the insertions and deletions. If two users concurrently insert at the same position, Automerge will arbitrarily place one of the insertions first and the other second, while ensuring that the final order is the same on all nodes.

The only case Automerge cannot handle automatically, because there is no well-defined resolution, is when users concurrently update the same property in the same object (or, similarly, the same index in the same list). In this case, Automerge arbitrarily picks one of the concurrently written values as the "winner":

// Initialize documents with known actor IDs
let doc1 = Automerge.change(Automerge.init('actor-1'), doc => {
  doc.x = 1
})
let doc2 = Automerge.change(Automerge.init('actor-2'), doc => {
  doc.x = 2
})
doc1 = Automerge.merge(doc1, doc2)
doc2 = Automerge.merge(doc2, doc1)

// Now, doc1 might be either {x: 1} or {x: 2} -- the choice is random.
// However, doc2 will be the same, whichever value is chosen as winner.
assert.deepEqual(doc1, doc2)
Although only one of the concurrently written values shows up in the object, the other values are not lost. They are merely relegated to a conflicts object. Suppose doc.x = 2 is chosen as the "winning" value:

doc1 // {x: 2}
doc2 // {x: 2}
Automerge.getConflicts(doc1, 'x') // {'actor-1': 1}
Automerge.getConflicts(doc2, 'x') // {'actor-1': 1}
Here, we've recorded a conflict on property x. The key actor-1 is the actor ID that "lost" the conflict. The associated value is the value actor-1 assigned to the property x. You might use the information in the conflicts object to show the conflict in the user interface.

The next time you assign to a conflicting property, the conflict is automatically considered to be resolved, and the conflict disappears from the object returned by Automerge.getConflicts().

Examining document history
An Automerge document internally saves a complete history of all the changes that were ever made to it. This enables a nice feature: looking at the document state at past points in time, a.k.a. "time travel"!

Automerge.getHistory(doc) returns a list of all edits made to a document. Each edit is an object with two properties: change is the internal representation of the change (in the same form that Automerge.getChanges() returns), and snapshot is the state of the document immediately after the change was applied.

Automerge.getHistory(doc2)
// [ { change: { message: 'Set x to 1', ... }, snapshot: { x: 1 } },
//   { change: { message: 'Set x to 2', ... }, snapshot: { x: 2 } } ]
Within the change object, the property message is set to the free-form "commit message" that was passed in as second argument to Automerge.change() (if any). The rest of the change object is specific to Automerge implementation details, and normally shouldn't need to be interpreted.

If you want to find out what actually changed in a particular edit, rather than inspecting the change object, it is better to use Automerge.diff(oldDoc, newDoc). This function returns a list of edits that were made in document newDoc since its prior version oldDoc. You can pass in snapshots returned by Automerge.getHistory() in order to determine differences between historic versions.

The data returned by Automerge.diff() has the following form:

let history = Automerge.getHistory(doc2)
Automerge.diff(history[2].snapshot, doc2) // get all changes since history[2]
// [ { action: 'set', type: 'map', obj: '...', key: 'x', value: 1 },
//   { action: 'set', type: 'map', obj: '...', key: 'x', value: 2 } ]
In the objects returned by Automerge.diff(), obj indicates the object ID of the object being edited (the same as returned by Automerge.getObjectId()), and type indicates whether that object is a map, list, or text.

The available values for action depend on the type of object. For type: 'map', the possible actions are:

action: 'set': Then the property key is the name of the property being updated. If the value assigned to the property is a primitive (string, number, boolean, null), then value contains that value. If the assigned value is an object (map, list, or text), then value contains the ID of that object, and additionally the property link: true is set. Moreover, if this assignment caused conflicts, then the conflicting values are additionally contained in a conflicts property.
action: 'remove': Then the property key is the name of the property being removed.
For type: 'list' and type: 'text', the possible actions are:

action: 'insert': Then the property index contains the list index at which a new element is being inserted, and value contains the value inserted there. If the inserted value is an object, the value property contains its ID, and the property link: true is set.
action: 'set': Then the property index contains the list index to which a new value is being assigned, and value contains that value. If the assigned value is an object, the value property contains its ID, and the property link: true is set.
action: 'remove': Then the property index contains the list index that is being removed from the list.
Custom CRDT types
Counter
If you have a numeric value that is only ever changed by adding or subtracting (e.g. counting how many times the user has done a particular thing), you should use the Automerge.Counter datatype instead of a plain number, because it deals with concurrent changes correctly.

Note: Using the Automerge.Counter datatype is safer than changing a number value yourself using the ++ or += 1 operators. For example, suppose the value is currently 3:

If two users increment it concurrently, they will both register 4 as the new value, whereas the two increments should result in a value of 5.
If one user increments twice and the other user increments three times before the documents are merged, we will now have conflicting changes (5 vs. 6), rather than the desired value of 8 (3 + 2 + 3).
To set up a Counter:

state = Automerge.change(state, doc => {
  // The counter is initialized to 0 by default. You can pass a number to the
  // Automerge.Counter constructor if you want a different initial value.
  doc.buttonClicks = new Automerge.Counter()
})
To get the current counter value, use doc.buttonClicks.value. Whenever you want to increase or decrease the counter value, you can use the .increment() or .decrement() method:

state = Automerge.change(state, doc => {
  doc.buttonClicks.increment() // Add 1 to counter value
  doc.buttonClicks.increment(4) // Add 4 to counter value
  doc.buttonClicks.decrement(3) // Subtract 3 from counter value
})
Note: In relational databases it is common to use an auto-incrementing counter to generate primary keys for rows in a table, but this is not safe in Automerge, since several users may end up generating the same counter value! See the Table datatype below for implementing a relational-like table with a primary key.

Text
Automerge.Text provides support for collaborative text editing. Under the hood, text is represented as a list of characters, which is edited by inserting or deleting individual characters. Compared to using a regular JavaScript array, Automerge.Text offers better performance.

Note: Technically, text should be represented as a list of Unicode grapheme clusters. What the user thinks of as a "character" may actually be a series of several Unicode code points, including accents, diacritics, and other combining marks. A grapheme cluster is the smallest editable unit of text: that is, the thing that gets deleted if you press the delete key once, or the thing that the cursor skips over if you press the right-arrow key once. Emoji make a good test case, since many emoji consist of a sequence of several Unicode code points (for example, the skintone modifier is a combining mark).

You can create a Text object inside a change callback. Then you can use insertAt() and deleteAt() to insert and delete characters (same API as for list modifications, shown above):

newDoc = Automerge.change(currentDoc, doc => {
  doc.text = new Automerge.Text()
  doc.text.insertAt(0, 'h', 'e', 'l', 'l', 'o')
  doc.text.deleteAt(0)
  doc.text.insertAt(0, 'H')
})
To inspect a text object and render it, you can use the following methods (outside of a change callback):

newDoc.text.length // returns 5, the number of characters
newDoc.text.get(0) // returns 'H', the 0th character in the text
newDoc.text.toString() // returns 'Hello', the concatenation of all characters
for (let char of newDoc.text) console.log(char) // iterates over all characters
Table
Automerge.Table provides a collection datatype that is similar to a table in a relational database. It is intended for a set of objects (rows) that have the same properties (columns in a relational table). Unlike a list, the objects have no order. You can scan over the objects in a table, or look up individual objects by their primary key. An Automerge document can contain as many tables as you want.

Each object is assigned a primary key (a unique ID) by Automerge. When you want to reference one object from another, it is important that you use this Automerge-generated ID; do not generate your own IDs.

You can create new tables and insert rows like this:

let database = Automerge.change(Automerge.init(), doc => {
  doc.authors = new Automerge.Table()
  doc.publications = new Automerge.Table()

  // Automerge.Table.add() inserts a new row into the database
  // and returns the primary key (unique ID) of the new row
  const martinID = doc.authors.add({ surname: 'Kleppmann', forename: 'Martin' })

  // Adding a publication that references the above author ID
  const ddia = doc.publications.add({
    type: 'book',
    authors: [martinID],
    title: 'Designing Data-Intensive Applications',
    publisher: "O'Reilly Media",
    year: 2017
  })
})
You can read the contents of a table like this:

// Array of row objects
database.publications.rows

// Array of row IDs (primary keys)
database.publications.ids

// Looking up a row by primary key
database.publications.byId('29f6cd15-61ff-460d-b7fb-39a5594f32d5')

// Number of rows in the table
database.publications.count

// Like "SELECT * FROM publications WHERE title LIKE 'Designing%'"
database.publications.filter(pub => pub.title.startsWith('Designing'))

// Like "SELECT publisher FROM publications"
database.publications.map(pub => pub.publisher)
You can modify rows in a table like this:

database = Automerge.change(database, doc => {
  // Update a row
  let book = doc.publications.byId('29f6cd15-61ff-460d-b7fb-39a5594f32d5')
  book.isbn = '1449373321'

  // Delete a row
  doc.publications.remove('29f6cd15-61ff-460d-b7fb-39a5594f32d5')
})
Note that currently the Automerge.Table type does not enforce a schema. By convention, the row objects that you add to a table should have the same properties (like columns in a table), but Automerge does not enforce this. This is because different users may be running different versions of your app, which might be using different properties.

*/
  });

  it('Automerge 3', async () => {
    const currentDoc = Automerge.init();
    // This is kind of like the staging platform
    // for changes to be staged and then computed later
    const newDoc = Automerge.change(currentDoc, "first message", (doc: any) => {
      doc.text = new Automerge.Text();
      console.log(doc.text);
    });
    //const changes = Automerge.getChanges(currentDoc, newDoc);
  });

  it('Automerge 4', async () => {
    const newDoc = Automerge.change(
      Automerge.init(),
      "first message",
      (doc: any) => {
        doc.text = new Automerge.Text();
        doc.text.insertAt(0, "h");
        console.log(doc.text);
      }
    );
    const changes = Automerge.getChanges(Automerge.init(), newDoc);
    console.log(changes);
  });

});