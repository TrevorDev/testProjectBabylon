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
        playButtonPane.parent = ribbon
        playButtonPane.position.y= 5
        playButtonPane.position.x = -0.9
        playButtonPane.rotation.z = -Math.PI/2;        
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
        pauseButtonPane.position.y= 4.8
        pauseButtonPane.position.x = -0.9
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
        progressBarPane.position.y = 4
        progressBarPane.position.x = -0.9
        progressBarPane.rotation.z = -Math.PI/2;
        progressBarPane.parent = ribbon

        var progressBarTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(progressBarPane)
        var progressBar = new Stage.GUI.Slider()
        progressBar.minimum = 0
        progressBar.value = 0
        progressBar.color = "white"
        progressBar.background = "#0078d7"
        progressBar.borderColor = "black"

        // File menu button panel
        var fileButtonPane = BABYLON.MeshBuilder.CreatePlane("fileButtonPlane", {width: 0.2, height: 0.2}, scene)
        fileButtonPane.position.y= 3.2
        fileButtonPane.position.x = -0.9
        fileButtonPane.rotation.z = -Math.PI/2;
        fileButtonPane.parent = ribbon
        var pauseGuiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(fileButtonPane)

        // File menu button
        var fileButton = Stage.GUI.Button.CreateSimpleButton("file", "🎦")        
        fileButton.fontSize = 900
        fileButton.color = "white"
        fileButton.background = "#4AB3F4"
        fileButton.thickness = 20
        pauseGuiTexture.addControl(fileButton)

        var pickerPlane = BABYLON.MeshBuilder.CreatePlane("pickerPlane", {width: 1, height: 0.5}, scene)
        var pickerPanelTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(pickerPlane)

        pickerPlane.parent = fileButtonPane
        pickerPlane.position.x = -0.15
        pickerPlane.position.y = -0.35

        var pickerPanel = new Stage.GUI.StackPanel()

        // Video texture
        var mixerVideo = new BABYLON.VideoTexture("mixer", ["public/MixerClipVid_30secondsInverted.mp4"], scene, true);
        var waterfallVideo = new BABYLON.VideoTexture("waterfall", ["public/waterfall.mp4"], scene, true);
        
        var videoMaterial = new BABYLON.StandardMaterial("", scene);
        videoMaterial.emissiveColor = new BABYLON.Color3(1,1,1)
        videoMaterial.diffuseTexture = mixerVideo
        ribbon.material = videoMaterial

        mixerVideo.video.pause()
        waterfallVideo.video.pause()

        // Events
        playbutton.onPointerClickObservable.add(()=>{
            var currentVid = videoMaterial.diffuseTexture.name

            if(currentVid=="mixer"){
                mixerVideo.video.play()
                progressBar.value = mixerVideo.video.currentTime
            }
            else if(currentVid=="waterfall"){
                waterfallVideo.video.play()
                progressBar.value = waterfallVideo.video.currentTime
            }            
        })

        pauseButton.onPointerClickObservable.add(()=>{
            var currentVid = videoMaterial.diffuseTexture.name

            if(currentVid=="mixer"){
                mixerVideo.video.pause()
            }
            else if(currentVid=="waterfall"){
                waterfallVideo.video.pause()
            }  
        })

        mixerVideo.video.ontimeupdate = function(){
            progressBar.value = mixerVideo.video.currentTime
        }

        waterfallVideo.video.ontimeupdate = function(){
            progressBar.value = waterfallVideo.video.currentTime
        }

        progressBar.onPointerClickObservable.add(function() {
            var currentVid = videoMaterial.diffuseTexture.name

            if(currentVid=="mixer"){
                mixerVideo.video.pause()
                mixerVideo.video.currentTime = progressBar.value
            }
            else if(currentVid=="waterfall"){
                waterfallVideo.video.pause()
                waterfallVideo.video.currentTime = progressBar.value
            } 
        })

        fileButton.onPointerClickObservable.add(()=>{
            pickerPanelTexture.addControl(pickerPanel)

            var waterfallButton = Stage.GUI.Button.CreateSimpleButton("", "Waterfall")
            waterfallButton.fontSize = 150
            waterfallButton.color = "white"
            waterfallButton.height = "50%"
            waterfallButton.background = "#4AB3F4"
            pickerPanel.addControl(waterfallButton)

            var mixerButton = Stage.GUI.Button.CreateSimpleButton("", "Mixer")
            mixerButton.fontSize = 150
            mixerButton.color = "white"
            mixerButton.height = "50%"
            mixerButton.background = "#4AB3F4"
            pickerPanel.addControl(mixerButton)

            waterfallButton.onPointerClickObservable.add(()=>{                
                pickerPanel.removeControl(waterfallButton)
                pickerPanel.removeControl(mixerButton)
                pickerPanelTexture.removeControl(pickerPanel)
                mixerVideo.video.pause()
                progressBar.maximum = waterfallVideo.video.duration
                progressBar.value = waterfallVideo.video.currentTime
                videoMaterial.diffuseTexture = waterfallVideo
            })

            mixerButton.onPointerClickObservable.add(()=>{
                pickerPanel.removeControl(waterfallButton)
                pickerPanel.removeControl(mixerButton)
                pickerPanelTexture.removeControl(pickerPanel)
                waterfallVideo.video.pause()
                progressBar.maximum = mixerVideo.video.duration
                progressBar.value = mixerVideo.video.currentTime
                videoMaterial.diffuseTexture = mixerVideo
            })

        })

        mixerVideo.video.onloadedmetadata = function(){
            progressBar.maximum = mixerVideo.video.duration
            progressBarTexture.addControl(progressBar)
        }
    }, 
    dispose: async ()=>{
    }
})