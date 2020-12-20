[![Datalayer](https://raw.githubusercontent.com/datalayer/datalayer/main/res/logo/datalayer-25.svg?sanitize=true)](https://datalayer.io)

# Datalayer Experiments RTC

```bash
git clone https://github.com/datalayer-experiments/rtc.git && \
  cd rtc && \
  git submodule init && \
  git submodule update
```

```bash
yarn && \ # Install node modules.
  rm -fr packages/automerge/node_modules/automerge && \ # Fix me!
  yarn build && \ # Build.
  yarn textarea # Start the textarea example.
```

This repository contains codes taken from various sources:

- https://github.com/yjs/yjs
- https://github.com/yjs/y-websocket
- https://github.com/yjs/y-webrtc
- https://github.com/automerge/automerge
- https://gitlab.com/codewitchbella/automerge-client-server
- https://github.com/anirrudh/collaborative-edit/tree/server
- https://github.com/pierrotsmnrd/proto-rtc-yjs
