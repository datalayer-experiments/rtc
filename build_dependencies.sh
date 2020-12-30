



cd externals/automerge && \
  git fetch origin && \
  git checkout datalayer && \
  yarn && \ # Install node modules.
  yarn build && \ # Build node modules.
  cd -

cd externals/automerge-performance && \
  git fetch origin && \
  git checkout datalayer-performance && \
  yarn && \ # Install node modules.
  yarn build && \ # Build node modules.
  cd -

# From the root of rtc-experiments folder.
cd externals/automerge-rs-nodejs && \
  git fetch origin && \
  git checkout datalayer-nodejs && \
  cargo build && \
  cd automerge-backend-wasm && \
  cargo install wasm-pack && \
  yarn install && \
  yarn build && \
  yarn release && \
  cd -

# From the root of rtc-experiments folder.
cd externals/automerge-rs-bundler && \
  git fetch origin && \
  git checkout datalayer-bundler && \
  cargo build && \
  cd automerge-backend-wasm && \
  cargo install wasm-pack && \
  yarn install && \
  yarn build && \
  yarn release && \
  cd -