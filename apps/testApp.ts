import * as BABYLON from 'babylonjs'




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
var canvas = document.createElement('canvas')
canvas.style.width="100%"
canvas.style.height="100%"

//canvas = document.getElementById("renderCanvas")
document.body.appendChild(canvas)

// Initialize Babylon scene and engine
var engine = new BABYLON.Engine(canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true })
engine.enableOfflineSupport = false
var scene = new BABYLON.Scene(engine)
engine.runRenderLoop(()=>{
    scene.render()
})

window.addEventListener("resize", ()=> {
    engine.resize()
})

var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

// Move the sphere upward 1/2 its height
sphere.position.y = 1;

// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 1, scene);
ground.material = new BABYLON.StandardMaterial("",scene)
ground.material.wireframe = true;

console.log("hello world2")