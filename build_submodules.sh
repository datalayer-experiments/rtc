# From the root of rtc-experiments folder.

## Checkout the correct submodules branches

cd externals/automerge && \
  git fetch origin && \
  git checkout datalayer && \
  cd -

cd externals/automerge-performance && \
  git fetch origin && \
  git checkout datalayer-performance && \
  cd -

cd externals/automerge-wasm && \
  git fetch origin && \
  git checkout wasm-node-local-change && \
  cd -

cd externals/automerge-rs-nodejs && \
  git fetch origin && \
  git checkout datalayer-nodejs && \
  cd -

cd externals/automerge-rs-bundler && \
  git fetch origin && \
  git checkout datalayer-bundler && \
  cd -

## Build submodules

cd externals/automerge && \
  yarn && \ # Install node modules.
  yarn build && \ # Build node modules.
  cd -

cd externals/automerge-performance && \
  yarn && \ # Install node modules.
  yarn build && \ # Build node modules.
  cd -

cd externals/automerge-rs-nodejs && \
  cargo build && \
  cd automerge-backend-wasm && \
  cargo install wasm-pack && \
  yarn install && \
  yarn build && \
  yarn release && \
  cd -

cd externals/automerge-rs-bundler && \
  cargo build && \
  cd automerge-backend-wasm && \
  cargo install wasm-pack && \
  yarn install && \
  yarn build && \
  yarn release && \
  cd -
