#!/bin/sh

# From the root of the repository folder.
root_dir=`pwd`

# Checkout the correct submodules branches
function checkout() {

  cd $root_dir/externals/automerge && \
    git fetch origin && \
    git checkout datalayer

  cd $root_dir/externals/automerge-performance && \
    git fetch origin && \
    git checkout datalayer-performance

  cd $root_dir/externals/automerge-wasm-nodejs && \
    git fetch origin && \
    git checkout wasm-nodejs

  cd $root_dir/externals/automerge-wasm-bundler && \
    git fetch origin && \
    git checkout wasm-bundler

  cd $root_dir/externals/automerge-rs-nodejs && \
    git fetch origin && \
    git checkout datalayer-nodejs

  cd $root_dir/externals/automerge-rs-bundler && \
    git fetch origin && \
    git checkout datalayer-bundler

}

function build_automerge() {

  cd $root_dir/externals/automerge && \
    yarn && \ # Install node modules.
    yarn build # Build node modules.

  cd $root_dir/externals/automerge-performance && \
    yarn && \ # Install node modules.
    yarn build # Build node modules.

#  cd $root_dir/externals/automerge-wasm-node && \
#    yarn && \ # Install node modules.
#    yarn build # Build node modules.

#  cd $root_dir/externals/automerge-wasm-bundler && \
#    yarn && \ # Install node modules.
#    yarn build # Build node modules.

}

function build_automerge_rs() {

  cargo install wasm-pack

  cd $root_dir/externals/automerge-rs-nodejs && \
    cargo build && \
    cd automerge-backend-wasm && \
    yarn install && \
    yarn build

  cd $root_dir/externals/automerge-rs-bundler && \
    cargo build && \
    cd automerge-backend-wasm && \
    yarn install && \
    yarn build

}

checkout
build_automerge
# build_automerge_rs
