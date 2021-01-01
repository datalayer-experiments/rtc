#!/bin/sh

# From the root of rtc-experiments folder.
root_dir=`pwd`


## Checkout the correct submodules branches

cd externals/automerge && \
  git fetch origin && \
  git checkout datalayer && \
  cd $root_dir

cd externals/automerge-performance && \
  git fetch origin && \
  git checkout datalayer-performance && \
  cd $root_dir

cd externals/automerge-wasm && \
  git fetch origin && \
  git checkout wasm-node-local-change && \
  cd $root_dir

cd externals/automerge-rs-nodejs && \
  git fetch origin && \
  git checkout datalayer-nodejs && \
  cd $root_dir

cd externals/automerge-rs-bundler && \
  git fetch origin && \
  git checkout datalayer-bundler && \
  cd $root_dir

## Build submodules

cd externals/automerge && \
  yarn && \ # Install node modules.
  yarn build && \ # Build node modules.
  cd $root_dir

cd externals/automerge-performance && \
  yarn && \ # Install node modules.
  yarn build && \ # Build node modules.
  cd $root_dir

cargo install wasm-pack

cd externals/automerge-rs-nodejs && \
  cargo build && \
  cd automerge-backend-wasm && \
  yarn install && \
  yarn build && \
  cd $root_dir

cd externals/automerge-rs-bundler && \
  cargo build && \
  cd automerge-backend-wasm && \
  yarn install && \
  yarn build && \
  cd $root_dir
