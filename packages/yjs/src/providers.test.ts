/**
 * @jest-environment jsdom
 */
import * as Y from 'yjs';

import { WebrtcProvider } from 'y-webrtc';
// import { WebsocketProvider } from 'y-websocket';
import { WebsocketProvider } from './ws/provider/y-websocket.js';
import { IndexeddbPersistence } from 'y-indexeddb';

describe('Y.js', () => {

  it('y.js providers', async () => {

    const ydoc = new Y.Doc()

    // This allows you to instantly get the (cached) documents data
    const indexeddbProvider = new IndexeddbPersistence('my-roomname', ydoc)
    indexeddbProvider.whenSynced.then(() => {
      console.log('loaded data from indexed db')
    })
    // Sync clients with the y-websocket provider
    const websocketProvider = new WebsocketProvider(
      'ws://localhost:12234', 'my-roomname', ydoc
    )
    websocketProvider.on('status', event => {
      console.log('websocketProvider', event.status) // logs "connected" or "disconnected"
    })
    // Sync clients with the y-webrtc provider.
    const webrtcProvider = new WebrtcProvider(
      'my-roomname', 
      ydoc, 
      { 
        signaling: ['wss://localhost:4444'],
        password: null,
        awareness: null,
        maxConns: 20,
        filterBcConns: true,
        peerOpts: {}
      });
    webrtcProvider.on('status', event => {
      console.log('websocketProvider', event.status) // logs "connected" or "disconnected"
    })
  
    // array of numbers which produce a sum
    const yarray = ydoc.getArray('count')
    // observe changes of the sum
    yarray.observe(event => {
      // print updates when the data changes
      console.log('new sum: ' + yarray.toArray().reduce((a: any, b: any) => a + b))
    })
    // add 1 to the sum
    yarray.push([1]) // => "new sum: 1"
  
  });

});