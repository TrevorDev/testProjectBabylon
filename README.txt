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
"xrpresent" context and a webgl context? its weird that multiple canvases are required when you are only drawing to one
Not easy to figure out how to convert an original canvas and drawing session to a webXR one
switching between non xr rendering and xr rendering
session needs to be added to _render in engine so that it's requestAnimationFrame is used
how do i handle device connected/disconnected events



//setup
var device = engine.findXRDevices()[0];
var camera = new WebXRCamera({device: device, stage: "stage", mode: "VR"})

//get device(hmd/or phone) position and rotation which will be modified if the camera is moved
camera.postion
camera.rotationQuaternion

//move the cameras pose in babylon space
camera.rotate(quaternion)
camera.move(vector)

//start rendering to device (requires user interaction)
camera.displayOnDevice();

//gamepad are not exactly clear from the spec vs docs. It seems there is a proposal right now for xr controllers to have a hand and point vector as well as only a single button
//likely this can be added to the existing gamepad api
scene.gamepadManager.onGamepadConnectedObservable.add((gamepad)=>{
    if(gamepad.poseEnabled){
        gamepad.position/rotation
    }
});

http://localhost:1338/Playground/index-local.html#A9KEA6#1