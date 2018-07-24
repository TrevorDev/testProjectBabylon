import { VRExperienceHelper } from "babylonjs";
import {Stage} from "../../src/stage"
var shell:any = (<any>window).shell

var makeNotPickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m)=>{
        makeNotPickable(m)
    })
}

shell.registerApp({
    name: "testApp", 
    iconUrl: "public/appicons/test_app_logo.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();

        // Load gltf model and add to scene
        var container = await BABYLON.SceneLoader.LoadAssetContainerAsync("https://raw.githubusercontent.com/TrevorDev/gltfModels/master/facebook.glb", "", scene)
        var loadedModel = container.createRootMesh()
        makeNotPickable(loadedModel) // This needs to be done on large models to save on perf when doing ray collisions from controllers
        loadedModel.position.y = 2
        scene.addMesh(loadedModel, true)
        // Any mesh created MUST have the windowAnchor as it's parent
        loadedModel.parent = windowAnchor

        // Create GUI button
        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 0.2, height: 0.2}, scene)
        plane.position.y= 1
        plane.parent = windowAnchor // set windowAnchor as parent

        // TODO - I commented this code because CreateForMesh() has a bug
        // and is preventing a second sphere from being rendered on the scene.
        // The sphere will be rendered after you click and drag the first sphere.
        // I know, it's weird.

        // var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane)
        // guiTexture
        // var guiPanel = new Stage.GUI.StackPanel()  
        // guiPanel.top = "0px"
        // guiTexture.addControl(guiPanel)
        // var button = Stage.GUI.Button.CreateSimpleButton("", "Click 🤣")
        // button.fontSize = 300
        // button.color = "white"
        // button.background = "#4AB3F4"
        // button.cornerRadius = 200
        // button.thickness = 20
        // button.onPointerClickObservable.add(()=>{
        //     console.log("hit")
        // })
        // guiPanel.addControl(button)

    }, 
    dispose: async ()=>{

    }
})