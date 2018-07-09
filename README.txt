# How I start a local babylon project

 - clone this repo
 - npm install parcel -g
 - npm install
 - parcel index.html
 - open http://localhost:1234/

 # setup rust wasm
 cd rustDep
 cargo new math --bin
 cd math
 rustup target add wasm32-unknown-unknown
 cargo build --target=wasm32-unknown-unknown --release