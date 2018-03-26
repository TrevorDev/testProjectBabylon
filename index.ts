// import { AbstractMesh, Scene, Vector3, Engine, Mesh } from "babylonjs/core";
// console.log(Engine)

import * as BABYLON from 'babylonjs';

// Get rid of margin
document.documentElement.style["overflow"]="hidden"
document.documentElement.style.overflow ="hidden"
document.documentElement.style.width ="100%"
document.documentElement.style.height ="100%"
document.documentElement.style.margin ="0"
document.documentElement.style.padding ="0"
document.body.style.overflow ="hidden"
document.body.style.width ="100%"
document.body.style.height ="100%"
document.body.style.margin ="0"
document.body.style.padding ="0"

// Create canvas html element on webpage
var canvas = document.createElement('canvas');
canvas.style.width="100%"
canvas.style.height="100%"
document.body.appendChild(canvas);

// Initialize Babylon scene and engine
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);
engine.runRenderLoop(()=>{
    scene.render();
});

// Create objects in the scene
var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas,true)
var light = new BABYLON.PointLight("light", new BABYLON.Vector3(10,10,0), scene);
var box = BABYLON.Mesh.CreateBox("box", 1.0, scene);
box.position.z = 5;

// Run's once per game frame
scene.onBeforeRenderObservable.add(()=>{
    box.position.x += 0.01;
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
});


class WebXRInitializationOptions {
    canvas: HTMLCanvasElement
}
class WebXR {
    xrNavigator:any = null
    xrDevice:any = null

    constructor(){
    }

    init(options: WebXRInitializationOptions){
        this.xrNavigator = navigator;
        if(this.xrNavigator.xr){
            this.xrNavigator.xr.requestDevice().then((device)=>{
                this.xrDevice = device;
                //options.canvas.getContext("webgl", {compatable})
                console.log(this.xrDevice)
                
            });
        }else{
            console.log("xr not found")
        }
    }
}

var webXR = new WebXR();
webXR.init({canvas: engine.getRenderingCanvas()});