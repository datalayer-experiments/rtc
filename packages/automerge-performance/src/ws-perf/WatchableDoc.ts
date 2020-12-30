import { Frontend, Backend } from 'automerge'
import { Set } from 'immutable'

class WatchableDoc {
  private doc: any
  private handlers: Set<any>

  constructor (doc) {
    if (!doc) throw new Error("doc argument is required")
    this.doc = doc
    this.handlers = Set()
  }

  get() {
    return this.doc
  }

  set (doc) {
    this.doc = doc
  }

  applyChanges (changes) {
    console.log('------>>>>', changes)
    const oldState = Frontend.getBackendState(this.doc)
    const [newState, patch] = Backend.applyChanges(oldState, changes);
    (patch as any).state = newState
    const newDoc = Frontend.applyPatch(this.doc, patch)
    this.set(newDoc)
    this.handlers.forEach(handler => handler(newDoc, changes))
    return newDoc
  }

  registerHandler (handler) {
    this.handlers = this.handlers.add(handler)
  }

  unregisterHandler (handler) {
    this.handlers = this.handlers.remove(handler)
  }
}

export default WatchableDoc;
