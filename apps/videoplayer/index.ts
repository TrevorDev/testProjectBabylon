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
    iconUrl: "public/appicons/videoPlayer.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{

        // Get scene
        var scene = windowAnchor.getScene();
        
        // Video player
        var videoPlayerPane = BABYLON.MeshBuilder.CreatePlane("Plane1", {height: 1.0, width: 2.0}, scene);

        videoPlayerPane.position.y = 2;
        videoPlayerPane.position.x = -2;
        videoPlayerPane.parent = windowAnchor

        // Play button panel
        var playButtonPane = BABYLON.MeshBuilder.CreatePlane("buttonPlane", {width: 0.2, height: 0.2}, scene)
        
        playButtonPane.position.y= -0.7
        playButtonPane.position.x = -0.9
        playButtonPane.parent = videoPlayerPane
        var playGuiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(playButtonPane)

        // Play button
        var playbutton = Stage.GUI.Button.CreateSimpleButton("play", "▶️")
        playbutton.fontSize = 900
        playbutton.color = "white"
        playbutton.background = "#4AB3F4"
        playbutton.thickness = 20

        playGuiTexture.addControl(playbutton)

        // Pause button panel
        var pauseButtonPane = BABYLON.MeshBuilder.CreatePlane("buttonPlane", {width: 0.2, height: 0.2}, scene)
        pauseButtonPane.position.y= -0.7
        pauseButtonPane.position.x = -0.6
        pauseButtonPane.parent = videoPlayerPane
        var pauseGuiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(pauseButtonPane)

        // Pause button
        var pauseButton = Stage.GUI.Button.CreateSimpleButton("pause", "⏸️")
        
        pauseButton.fontSize = 900
        pauseButton.color = "white"
        pauseButton.background = "#4AB3F4"
        pauseButton.thickness = 20

        pauseGuiTexture.addControl(pauseButton)

        // Video texture
        var videoTexture = new BABYLON.VideoTexture("video", ["public/mov_bbb.mp4"], scene, true);
        var videoMaterial = new BABYLON.StandardMaterial("", scene);
        videoMaterial.diffuseTexture = videoTexture
        videoPlayerPane.material = videoMaterial

        videoTexture.video.pause()

        playbutton.onPointerClickObservable.add(()=>{
            videoTexture.video.play()
        })
        pauseButton.onPointerClickObservable.add(()=>{
            videoTexture.video.pause()
        })

    }, 
    dispose: async ()=>{

    }
})