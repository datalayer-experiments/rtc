[![Datalayer](https://raw.githubusercontent.com/datalayer/datalayer/main/res/logo/datalayer-25.svg?sanitize=true)](https://datalayer.io)

# Datalayer Experiments RTC

[x] yjs textarea + node.js server
[x] automerge textarea + node.js server
[x] yjs textarea + node.js server (simple version)
[ ] automerge textarea + node.js server (simple version) (A)
[x] jupyter-server extension with websocket + call to node.js server [link](https://github.com/datalayer/examples/tree/main/jupyter-server-extension)
[x] rust as python module
[x] automerge performance branch + rust test with wasm
[x] yjs rust test
[ ] port (A) to jupyter-server (python + node.js)
[ ] port (A) to jupyter-server (python + rust as python module)

```bash
git clone https://github.com/datalayer-experiments/rtc.git && \
  cd rtc && \
  git submodule init && \
  git submodule update
```

```bash
yarn && \ # Install node modules.
  rm -fr packages/automerge/node_modules/automerge && \ # Fix me!
```

Manually update the `BackendState` declaration in `externals/automerge/@types/automerge/index.d.ts` with:

```js
  interface BackendState {
    getIn(s: any): any
  }
```

```
yarn build && \ # Build.
  yarn textarea # Start the textarea example.
```

This repository contains sources taken from various repositories:

- https://github.com/yjs/yjs
- https://github.com/yjs/y-websocket
- https://github.com/yjs/y-webrtc
- https://github.com/automerge/automerge
- https://gitlab.com/codewitchbella/automerge-client-server
- https://github.com/anirrudh/collaborative-edit/tree/server
- https://github.com/pierrotsmnrd/proto-rtc-yjs
