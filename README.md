[![Datalayer](https://raw.githubusercontent.com/datalayer/datalayer/main/res/logo/datalayer-25.svg?sanitize=true)](https://datalayer.io)

# Datalayer Experiments RTC

```
[x] yjs textarea + node.js server
[x] automerge textarea + node.js server
[x] yjs textarea + node.js server (simple version)
[x] automerge textarea + node.js server (simple version)
[ ] automerge textarea + node.js server (simple version performance branch) (A)
[x] jupyter-server extension with websocket + call to node.js server [link](https://github.com/datalayer/examples/tree/main/jupyter-server-extension)
[x] rust as python module
[x] automerge performance branch + rust test with wasm
[x] yjs rust test
[ ] port (A) to jupyter-server (python + node.js)
[ ] port (A) to jupyter-server (python + rust as python module)
```

```bash
git clone https://github.com/datalayer-experiments/rtc.git && \
  cd rtc && \
  git submodule update --init
```

```bash
cd externals/automerge && \
  git fetch origin && \
  git checkout datalayer && \
  yarn && \ # Install node modules.
  yarn build # Build node modules.
```

```bash
cd externals/automerge-performance && \
  git fetch origin && \
  git checkout datalayer-performance && \
  yarn && \ # Install node modules.
  yarn build # Build node modules.
```

```bash
# From the root of rtc-experiments folder.
cd externals/automerge-rs-nodejs && \
  git fetch origin && \
  git checkout datalayer-nodejs && \
  cargo build && \
  cd automerge-backend-wasm && \
  cargo install wasm-pack && \
  yarn install && \
  yarn build && \
  yarn release
```

```bash
# From the root of rtc-experiments folder.
cd externals/automerge-rs-bundler && \
  git fetch origin && \
  git checkout datalayer-bundler && \
  cargo build && \
  cd automerge-backend-wasm && \
  cargo install wasm-pack && \
  yarn install && \
  yarn build && \
  yarn release
```

From the root of rtc-experiments folder, install, build and start the textarea application.

```bash
yarn # Install node modules.
```

```bash
yarn build # Build.
```

```bash
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
