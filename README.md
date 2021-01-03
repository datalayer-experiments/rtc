[![Datalayer](https://raw.githubusercontent.com/datalayer/datalayer/main/res/logo/datalayer-25.svg?sanitize=true)](https://datalayer.io)

# Datalayer Experiments RTC

```bash
# Clone, install and build submodules.
git clone https://github.com/datalayer-experiments/rtc.git && \
  cd rtc && \
  git submodule update --init && \
  ./build_submodules.sh
```

```bash
# From the root of rtc-experiments folder, install the python package.
pip install -e .
```

```bash
# From the root of rtc-experiments folder, install the python package.
cd externals/jupyter-proxy-server && \
  git checkout no-check-origin && \
  pip install .
```

```bash
# From the root of rtc-experiments folder, install, build and start the textarea application.
yarn       # Install the node modules.
yarn build # Build.
```

```bash
# Launch your favorite textarea UI accessible on http://localhost:3001.
yarn textarea:automerge # Start the textarea example with only the automerge wasm version.
yarn textarea:yjs       # Start the textarea example with only the yjs version.
yarn textarea           # Start the textarea example which will mix both automerge and yjs.
```

#### Credits

This repository contains sources taken from various repositories:

- https://github.com/yjs/yjs
- https://github.com/yjs/y-websocket
- https://github.com/yjs/y-webrtc
- https://github.com/automerge/automerge
- https://gitlab.com/codewitchbella/automerge-client-server
- https://github.com/anirrudh/collaborative-edit/tree/server
- https://github.com/pierrotsmnrd/proto-rtc-yjs

#### To Do

```
[x] yjs textarea + node.js server
[x] automerge textarea + node.js server
[x] yjs textarea + node.js server (simple version)
[x] automerge textarea + node.js server (simple version)
[x] automerge textarea + node.js server (simple version performance branch) (A)
[x] jupyter-server extension with websocket + call to node.js server [link](https://github.com/datalayer/examples/tree/main/jupyter-server-extension)
[x] rust as python module
[x] automerge performance branch + rust test with wasm
[x] yjs rust test
[ ] port (A) to jupyter-server (python + node.js)
[ ] port (A) to jupyter-server (python + rust as python module)
```
