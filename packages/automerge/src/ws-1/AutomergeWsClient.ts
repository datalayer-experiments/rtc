import Automerge, { DocSet } from 'automerge'
import { Doc } from './AutomergeWsServer';

/*
Returns true if all components of clock1 are less than or equal to those of clock2.
Returns false if there is at least one component in which clock1 is greater than clock2
(that is, either clock1 is overall greater than clock2, or the clocks are incomparable).
*/

// https://github.com/automerge/automerge/issues/117
// https://github.com/automerge/automerge/issues/117#issuecomment-690951978
/*
function lessOrEqual(doc1, doc2) {
  const clock1 = doc1._state.getIn(['opSet', 'clock'])
  const clock2 = doc2._state.getIn(['opSet', 'clock'])
  return clock1
    .keySeq()
    .concat(clock2.keySeq())
    .reduce(
      (result, key) => result && clock1.get(key, 0) <= clock2.get(key, 0),
      true,
    )
}
*/
function lessOrEqual(doc1, doc2) {
  const clock1 = Automerge.Frontend.getBackendState(doc1).getIn(['opSet', 'clock'])
  const clock2 = Automerge.Frontend.getBackendState(doc2).getIn(['opSet', 'clock'])
  return clock1
    .keySeq()
    .concat(clock2.keySeq())
    .reduce(
      (result, key) => result && clock1.get(key, 0) <= clock2.get(key, 0),
      true
    );
}

function unique(el, i, list) {
  return list.indexOf(el) === i;
}

function doSave(docs) {
  const ret = {}
  for (const [k, v] of Object.entries(docs)) {
    ret[k] = Automerge.save(v);
  }
  return JSON.stringify(ret);
}

function doLoad(string) {
  if (!string) return {};
  const docs = JSON.parse(string);
  const ret = {};
  for (const [k, v] of Object.entries(docs)) {
    ret[k] = Automerge.load(v as any);
  }
  return ret;
}

// AutomergeClient

class AutomergeWsClient {
  private socket = null;
  private save = null;
  private docs = null;
  private onChange = null;
  private onMessage = null;
  private subscribeList = null;
  private autocon = null;
  private docSet = null;

  public constructor({socket, save, savedData, onChange, onMessage} ) {
    if (!socket)
      throw new Error('You have to specify websocket as socket param')
    this.socket = socket
    this.save = save
    this.docs = doLoad(savedData)
    this.onChange = onChange || (() => {})
    this.onMessage = onMessage || ((message: any) => {})
    this.subscribeList = []
    socket.addEventListener('message', this._onMessage.bind(this))
    socket.addEventListener('open', this._onOpen.bind(this))
    socket.addEventListener('close', this._onClose.bind(this))
    socket.addEventListener('error', evt => console.log("CLIENT> Error", evt))
    socket.addEventListener('connecting', evt => console.log("CLIENT> Connecting", evt))    
  }

  public subscribe(ids) {
    console.log('CLIENT> Trying to subscribe to ' + JSON.stringify(ids));
        if (ids.length <= 0) return;
    this.subscribeList = this.subscribeList.concat(ids).filter(unique);
    if (this.socket.readyState === 1) {
      // Open.
      this.socket.send(
        JSON.stringify({ action: 'subscribe', ids: ids.filter(unique) })
      );
    }
  }

  public applyChanges(id, changes) {
    console.log('CLIENT> apply changes', id, changes);
    if (!(id in this.docs)) {
      return false;
    }
    this.docs[id] = Automerge.applyChanges(this.docs[id], changes);
    if (this.docSet) {
      this.docSet.setDoc(id, this.docs[id]);
    }
    return true;
  }

  public change(id, changer) {
    if (!(id in this.docs)) {
      return false;
    }
    this.docs[id] = Automerge.change(this.docs[id], changer);
    if (this.docSet) {
      this.docSet.setDoc(id, this.docs[id]);
    }
    return true;
  }

  public diff(id, pos: number | null, remove: number | null, insert: string) {
    if (!(id in this.docs)) {
      return false;
    }
    this.docs[id] = Automerge.change(this.docs[id], (d: Doc) => {
      if (insert.length > 0) {
        d.textArea.insertAt(pos, insert);
      }
      if (remove > 0) {
        d.textArea.deleteAt(pos, remove);
      }
    });
    if (this.docSet) {
      this.docSet.setDoc(id, this.docs[id]);
    }
    return true;
  }

  private _onOpen() {
    const docSet = (this.docSet = new DocSet());
    docSet.registerHandler((docId, doc) => {
      if (!this.docs[docId] || lessOrEqual(this.docs[docId], doc)) {
        // local changes are reflected in new doc
        this.docs[docId] = doc;
      } else {
        // local changes are NOT reflected in new doc.
        const merged = Automerge.merge(this.docs[docId], doc);
        setTimeout(() => docSet.setDoc(docId, merged), 0);
      }
      this.subscribeList = this.subscribeList.filter(el => el !== docId);
      if (this.save) {
        this.save(doSave(this.docs));
      }
      console.log("CLIENT> document", docSet.getDoc(docId));
      this.onChange(docId, docSet.getDoc(docId));
    });
    const send = data => {
      this.socket.send(JSON.stringify({ action: 'automerge', data }));
    }
    this.autocon = new Automerge.Connection(docSet, send);
    this.autocon.open();
    this.subscribe(Object.keys(this.docs).concat(this.subscribeList));
  }

  private _onMessage(msg) {
    const frame = JSON.parse(msg.data)
    console.log('"CLIENT> Message', frame)
    this.onMessage(frame);
    if (frame.action === 'automerge') {
      this.autocon.receiveMsg(frame.data)
    } else if (frame.action === 'error') {
      console.error('Received server-side error ' + frame.message)
    } else if (frame.action === 'subscribed') {
      console.error('Subscribed to ' + JSON.stringify(frame.id))
    } else {
      console.error('Unknown action "' + frame.action + '"')
    }
  }

  private _onClose() {
    if (this.autocon) {
      this.autocon.close()
    }
    this.docSet = null
    this.autocon = null
  }

}

export default AutomergeWsClient;
