import { Stage } from './src/stage'
import rustModule from './rustDep/math/target/wasm32-unknown-unknown/release/math.wasm';/* tslint:disable */
console.log(rustModule.add(1,2))
var main = async ()=>{
    // Initialize full screen rendering
    var stage = new Stage()
    var scene = stage.scene
    var canvas = stage.engine.getRenderingCanvas()

    var env = scene.createDefaultEnvironment({})
    env.setMainColor(BABYLON.Color3.FromHexString("#7f8c8d"))
    env.skybox.scaling.scaleInPlace(10)

    // Create basic world
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
    camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 1, scene)
    sphere.position.set(0,3.5,0)

    // Load GLTF
    var root = await stage.importMesh("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf")
    root.position.y = 2
    root.scaling.scaleInPlace(10)
    scene.addMesh(root, true)

    // Create GUI button
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 1, height: 1}, this.scene)
    plane.position.y= 1
    var guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane)
    guiTexture
    var guiPanel = new BABYLON.GUI.StackPanel()  
    guiPanel.top = "0px"
    guiTexture.addControl(guiPanel)
    var button = BABYLON.GUI.Button.CreateSimpleButton("", "Click 🤣")
    button.fontSize = 300
    button.color = "white"
    button.background = "#4AB3F4"
    button.cornerRadius = 200
    button.thickness = 20
    button.onPointerClickObservable.add(()=>{
        console.log("hit")
    })
    guiPanel.addControl(button)
    
    // Setup vr
    scene.createDefaultVRExperience({floorMeshes: [env.ground]})
}
main()