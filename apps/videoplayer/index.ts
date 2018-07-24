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

        // material for video plane
        var mat = new BABYLON.StandardMaterial("mat1", scene);
        mat.alpha = 1.0;
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
        mat.backFaceCulling = false;
        mat.wireframe = true;
        
        var pathArray = [];
    
        for (var i = 0; i < 5; i++) {
            pathArray[i] = [];
    
            for (var j = 0; j < 10; j++) {
                pathArray[i][j] = new BABYLON.Vector3(i, j, Math.sin(Math.PI*(j/9)));
            }    
        }

        var ribbon = BABYLON.MeshBuilder.CreateRibbon("ribbon", { pathArray }, scene);

        ribbon.rotation.z = Math.PI/2;

        ribbon.position.x = 4;
        ribbon.position.y = 2;
        ribbon.parent = windowAnchor

        // Play button panel
        var playButtonPane = BABYLON.MeshBuilder.CreatePlane("buttonPlane", {width: 0.2, height: 0.2}, scene)
        playButtonPane.position.y= -0.7
        playButtonPane.position.x = -0.9
        playButtonPane.rotation.z = -Math.PI/2;
        playButtonPane.parent = ribbon
        var playGuiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(playButtonPane)

        // Play button
        var playbutton = Stage.GUI.Button.CreateSimpleButton("play", "▶️")
        playbutton.fontSize = 900
        playbutton.color = "white"
        playbutton.background = "#4AB3F4"
        playbutton.thickness = 20
        playGuiTexture.addControl(playbutton)

        // Pause button panel
        var pauseButtonPane = BABYLON.MeshBuilder.CreatePlane("pauseButtonPlane", {width: 0.2, height: 0.2}, scene)
        pauseButtonPane.position.y= -0.7
        pauseButtonPane.position.x = -0.6
        pauseButtonPane.rotation.z = -Math.PI/2;
        pauseButtonPane.parent = ribbon
        var pauseGuiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(pauseButtonPane)

        // Pause button
        var pauseButton = Stage.GUI.Button.CreateSimpleButton("pause", "⏸️")        
        pauseButton.fontSize = 900
        pauseButton.color = "white"
        pauseButton.background = "#4AB3F4"
        pauseButton.thickness = 20
        pauseGuiTexture.addControl(pauseButton)

        // Progress bar
        var progressBarPane = BABYLON.MeshBuilder.CreatePlane("progressBarPlane", {width: 1.4, height: 0.2}, scene)
        progressBarPane.position.y = -0.7
        progressBarPane.position.x = .3
        progressBarPane.rotation.z = -Math.PI/2;
        progressBarPane.parent = ribbon

        var progressBarTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(progressBarPane)
        var progressBar = new Stage.GUI.Slider()
        progressBar.minimum = 0
        progressBar.value = 0
        progressBar.color = "white"
        progressBar.background = "#0078d7"
        progressBar.borderColor = "black"        

        // Video texture
        var videoTexture = new BABYLON.VideoTexture("video", ["public/mov_bbb.mp4"], scene, true);
        var videoMaterial = new BABYLON.StandardMaterial("", scene);
        videoMaterial.emissiveColor = new BABYLON.Color3(1,1,1)
        videoMaterial.diffuseTexture = videoTexture
        ribbon.material = videoMaterial

        videoTexture.video.pause()

        // Events
        playbutton.onPointerClickObservable.add(()=>{
            videoTexture.video.play()
            progressBar.value = videoTexture.video.currentTime
        })

        pauseButton.onPointerClickObservable.add(()=>{
            videoTexture.video.pause()
        })

        videoTexture.video.ontimeupdate = function(){
            progressBar.value = videoTexture.video.currentTime
        }

        progressBar.onPointerClickObservable.add(function() {
            if(videoTexture.video.paused){
                videoTexture.video.currentTime = progressBar.value
            }
            else{
                videoTexture.video.pause()
                videoTexture.video.currentTime = progressBar.value
            }
        })

        videoTexture.video.onloadedmetadata = function(){
            progressBar.maximum = videoTexture.video.duration
            progressBarTexture.addControl(progressBar)
        }
    }, 
    dispose: async ()=>{
    }
})