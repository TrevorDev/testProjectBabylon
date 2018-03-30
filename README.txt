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

plan:
canvas0 - main canvas babylon already creates (regular canvas when in no mode, magic window when in non-exclusive mode, mirror when in exclusive mode)
  glContext is converted to xr by setting the xr device (session.baseLayer.framebuffer is drawn to the device using this context for exclusive mode)
canvas1 - used as dummy canvas to activate xr device in non-exclusive mode, not added to the webpage or drawn to
  glContext just used to initialize non-exclusive session
