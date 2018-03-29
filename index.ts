// import { AbstractMesh, Scene, Vector3, Engine, Mesh } from "babylonjs/core";
// console.log(Engine)

import * as BABYLON from 'babylonjs';
import WebXRPolyfill from 'webxr-polyfill';




//const polyfill = new WebXRPolyfill();
class WebXRInitializationOptions {
    engine: BABYLON.Engine;
}
var hit = 0;
class WebXR {
    gl:any = null;
    xrNavigator:any = null
    xrDevice:any = null
    xrSession:any = null
    xrFrameOfRef:any = null
    canvas:any = null;
    poseMatrix = new BABYLON.Matrix();
    constructor(){
    }

    onFrame = (t, frame)=>{
        //console.log("frame")
         let pose = frame.getDevicePose(this.xrFrameOfRef);
        // //if(!hit){
            if(pose){
                BABYLON.Matrix.FromFloat32ArrayToRefScaled(pose.poseModelMatrix, 0, 1, this.poseMatrix)
                console.log(this.poseMatrix.getTranslation().y)
            }
            
        //     // hit = 1;
        // //}
        frame.session.requestAnimationFrame(this.onFrame);
    }

    init(){
        return new Promise((res, rej)=>{
            this.xrNavigator = navigator;
            if(this.xrNavigator.xr){
                this.xrNavigator.xr.requestDevice().then((device)=>{
                    this.xrDevice = device;
                    
                    console.log("found xr device")
                    console.log(this.xrDevice)

                    
                    this.canvas = document.createElement("canvas");
                    var presentCtx = this.canvas.getContext("xrpresent");
                    
                    return this.xrDevice.requestSession({outputContext: presentCtx })
                }).then((session) => {
                    document.body.appendChild(this.canvas);
                    console.log("found session")
                    session.addEventListener('end', ()=>{console.log("end")});
                    if(!this.gl){
                        let webglCanvas = document.createElement('canvas');
                        let context = null;
                        context = webglCanvas.getContext("webgl", { compatibleXRDevice: session.device });
                      
                        if (!context) {
                          console.error('This browser does not support xr' + '.');
                          return null;
                        }
                        this.gl = context
                        console.log("gl created")
                    }
                    this.xrSession = session;
                    session.baseLayer = new XRWebGLLayer(session, this.gl);
                    return this.xrSession.requestFrameOfReference('eyeLevel')
                }).then((frameOfRef) => {
                    console.log("found frameOfRef")
                    this.xrFrameOfRef = frameOfRef;
                    this.xrSession.requestAnimationFrame(this.onFrame);
                    res()
                });    
            }else{
                res("xr not found")
            }
        })
    }
}

var webXR = new WebXR();
webXR.init().then(()=>{
    // // Get rid of margin
    // document.documentElement.style["overflow"]="hidden"
    // document.documentElement.style.overflow ="hidden"
    // document.documentElement.style.width ="100%"
    // document.documentElement.style.height ="100%"
    // document.documentElement.style.margin ="0"
    // document.documentElement.style.padding ="0"
    // document.body.style.overflow ="hidden"
    // document.body.style.width ="100%"
    // document.body.style.height ="100%"
    // document.body.style.margin ="0"
    // document.body.style.padding ="0"

    // // Create canvas html element on webpage
    // var canvas = webXR.canvas//document.createElement('canvas');
    // canvas.style.width="100%"
    // canvas.style.height="100%"
    // console.log(canvas.getContext("xrpresent"))
    // document.body.appendChild(canvas);

    // // Initialize Babylon scene and engine
    // var engine = new BABYLON.Engine(webXR.gl, true);
    // var scene = new BABYLON.Scene(engine);
    // engine.runRenderLoop(()=>{
    //     scene.render();
    // });

    // // // Create objects in the scene
    // var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
    // //camera.attachControl(canvas,true)
    // var light = new BABYLON.PointLight("light", new BABYLON.Vector3(10,10,0), scene);
    // var box = BABYLON.Mesh.CreateBox("box", 1.0, scene);
    // box.position.z = 5;

    // // Run's once per game frame
    // scene.onBeforeRenderObservable.add(()=>{
    //     box.position.x += 0.01;
    //     box.rotation.x += 0.01;
    //     box.rotation.y += 0.01;
    // });
});


