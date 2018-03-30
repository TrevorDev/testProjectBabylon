mkdir newProjectName
npm init

npm install babylonjs --save
npm install ts-loader --save
npm install typescript --save
npm install webxr-polyfill --save

npm install -g typescript
npm install webpack-cli -g
npm install concurrently -g

npm install
webpack -w

things i found confusing:
"xrpresent" context and a webgl context?
Not easy to figure out how to convert an original canvas and drawing session to a webXR one
switching between non xr rendering and xr rendering
session needs to be added to _render in engine so that it's requestAnimationFrame is used
why does mirroring sample have multiple canvases? cant the one be reused?
