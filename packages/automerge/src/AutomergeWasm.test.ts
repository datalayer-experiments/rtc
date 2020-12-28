/**
 * @jest-environment jsdom
 */
import * as assert from 'assert'
import * as Automerge from 'automerge'

import * as wasmBackend from 'automerge-backend-wasm'
// Automerge.setDefaultBackend(wasmBackend)

interface Birds {
  birds: [string]
}

interface Fish {
  fish: string
}

interface BirdList {
  birds: Automerge.List<string>
}

// https://github.com/automerge/automerge/issues/273

describe('Automerge Changes', () => {
  it('Automerge Changes 1', async () => {
    let s1 = Automerge.init<BirdList>()
    s1 = Automerge.change(s1, doc => (doc.birds = ['goldfinch']))
    let s2 = Automerge.change(s1, 'add chaffinch', doc => doc.birds.push('chaffinch'))
    const changes = Automerge.getChanges(s1, s2)
    assert.strictEqual(changes.length, 1)
    assert.strictEqual(changes[0].message, 'add chaffinch')
    assert.strictEqual(changes[0].actor, Automerge.getActorId(s2))
    assert.strictEqual(changes[0].seq, 2)
    let s3 = Automerge.init<BirdList>()
//    const [state, patch1] = Backend.applyChanges(s3, changes)
//    let s4 = Automerge.applyChanges(s3, patch1);
    console.log(s2.birds)

  })

  it('should reconstitute queued changes', () => {
    let s1 = Automerge.init<Fish>()
    s1 = Automerge.change(s1, doc => doc.fish = 'trout')
    s1 = Automerge.change(s1, doc => doc.fish = 'salmon')
    const changes = Automerge.getAllChanges(s1)
//    let s2 = Automerge.applyChanges<Fish>(Automerge.init(), [changes[1]])
//    s2 = Automerge.load(Automerge.save(s2))
//    s2 = Automerge.applyChanges(s2, [changes[0]])
    let s2 = Automerge.applyChanges<Fish>(Automerge.init(), changes)
    assert.strictEqual(s2.fish, 'salmon')
  })

  it('should incrementally apply changes since the last given version', () => {
    let s1 = Automerge.change(Automerge.init<Birds>(), 'Add Chaffinch', doc => doc.birds = ['Chaffinch'])
    let s2 = Automerge.change(s1, 'Add Bullfinch', doc => doc.birds.push('Bullfinch'))
    let changes1 = Automerge.getAllChanges(s1)
    console.log(changes1)
    let changes2 = Automerge.getChanges(s1, s2)
    let s3 = Automerge.applyChanges(Automerge.init<Birds>(), changes1)
    let s4 = Automerge.applyChanges(s3, changes2)
    console.log(s4.birds)
    assert.deepEqual(s3.birds, ['Chaffinch'])
    assert.deepEqual(s4.birds, ['Chaffinch', 'Bullfinch'])
  })

})
