import { Stage } from './src/stage'
import $ = require("jquery")
import h2c = require("html2canvas")

class HtmlPlane{
    static canvas:HTMLCanvasElement
    texture: BABYLON.DynamicTexture
    plane: BABYLON.Mesh
    constructor(private element){
        if(!HtmlPlane.canvas){
            HtmlPlane.canvas = document.createElement("canvas");
        }
    }
    async initialize(){
        return new Promise((res, rej)=>{
            setTimeout(()=>{
                h2c(this.element).then((canvas)=>{
                    document.body.appendChild(canvas)
                    res()
                })
            },500)
        })
        
    }
}

var main = async ()=>{
    
    // Initialize full screen rendering
    var stage = new Stage()
    var scene = stage.scene
    var canvas = stage.engine.getRenderingCanvas()

    // Create basic world
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
    camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7
    // var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
    // sphere.position.y = 1

    // var env = scene.createDefaultEnvironment({})
    // env.setMainColor(BABYLON.Color3.FromHexString("#3498db"))
    // var vrHelper = scene.createDefaultVRExperience()
    // vrHelper.enableTeleportation({floorMeshes: [env.ground]})
    
//   console.log($("div")[0])
//   h2c(document.getElementById("di")).then((canvas)=>{
//     document.body.appendChild(canvas)
// })
setTimeout(() => {
    h2c(document.querySelector("#di"))
}, 1000);

    // console.log("here2")
    // var p = new HtmlPlane($("div")[0])
    // await p.initialize()
    // console.log("done")
    // var x = BABYLON.MeshBuilder.CreatePlane("", {width: 1, height: 1}, scene)
   
}
main()