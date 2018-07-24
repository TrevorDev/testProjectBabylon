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
    name: "videoplayer", 
    iconUrl: "public/appicons/test_app_logo.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{

        // Get scene
        var scene = windowAnchor.getScene();
        
        var videoPlayerPane = BABYLON.MeshBuilder.CreatePlane("Plane1", {height: 1.0, width: 2.0}, scene);

        videoPlayerPane.position.y = 2;
        videoPlayerPane.position.x = -2;

        videoPlayerPane.parent = windowAnchor

        var buttonPane = BABYLON.MeshBuilder.CreatePlane("buttonPlane", {width: 0.2, height: 0.2}, scene)
        
        buttonPane.position.y= -0.7
        buttonPane.position.x = -0.9
        buttonPane.parent = videoPlayerPane
        var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(buttonPane)
        
        var guiPanel = new Stage.GUI.StackPanel()  
        guiPanel.top = "0px"
        guiTexture.addControl(guiPanel)

        var playbutton = Stage.GUI.Button.CreateSimpleButton("play", "▶")

        playbutton.fontSize = 300
        playbutton.color = "white"
        playbutton.background = "#4AB3F4"
        playbutton.cornerRadius = 200
        playbutton.thickness = 20

        guiPanel.addControl(playbutton)

        // var pauseButton = Stage.GUI.Button.CreateSimpleButton("pause", "⏸️")
        
        // pauseButton.fontSize = 300
        // pauseButton.color = "white"
        // pauseButton.background = "#4AB3F4"
        // pauseButton.cornerRadius = 200
        // pauseButton.thickness = 20

        // guiPanel.addControl(pauseButton)

        //pauseButton.position.y = -0.7;
        //pauseButton.position.x = -0.6;

        var videoTexture = new BABYLON.VideoTexture("video", ["public/mov_bbb.mp4"], scene, true);
        var videoMaterial = new BABYLON.StandardMaterial("", scene);
        videoMaterial.diffuseTexture = videoTexture
        videoPlayerPane.material = videoMaterial

        videoTexture.video.pause()

    }, 
    dispose: async ()=>{

    }
})