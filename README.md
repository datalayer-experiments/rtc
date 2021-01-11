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
