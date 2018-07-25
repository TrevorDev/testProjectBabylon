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
    name: "balloonPop", 
    iconUrl: "public/appicons/balloonPop.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();
        
        // Physics
        //scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin());
       
        var fountain = BABYLON.Mesh.CreateBox("foutain", 0.01, scene);
        fountain.visibility = 0.1;
        fountain.parent = windowAnchor;
        
        let createNewSystem = function():BABYLON.ParticleSystem {
            var particleSystem;
            if (BABYLON.GPUParticleSystem.IsSupported) {
                console.log("GPU supported!")
                particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity:1000 }, scene);
                particleSystem.activeParticleCount = 1000;
            } else {
                particleSystem = new BABYLON.ParticleSystem("particles", 1000 , scene);
            }
            particleSystem.parent = windowAnchor;
        
            particleSystem.emitRate = 100;
            particleSystem.particleEmitterType = new BABYLON.SphereParticleEmitter(1);
            particleSystem.particleTexture = new BABYLON.Texture("/public/textures/flare.png", scene);
            particleSystem.maxLifeTime = 1;
            particleSystem.minSize = 0.01;
            particleSystem.maxSize = 0.1;
            particleSystem.emitter = fountain;
            particleSystem.disposeOnStop = false;
            particleSystem.targetStopDuration = 3;
            return particleSystem;;
        }  

        var particleSystem = createNewSystem();  

        // Spheres
        var y = 0;
        var spheres = []
        var materialAmiga = new BABYLON.StandardMaterial("amiga", scene);
        materialAmiga.diffuseTexture = new BABYLON.Texture("public/textures/amiga.jpg", scene);
        materialAmiga.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        for (var index = 0; index < 10; index++) {
            let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 1, scene);
            sphere.material = materialAmiga
            sphere.parent = windowAnchor
            sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
            y += 2;
            spheres.push(sphere)
        }

        // Reset button
        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 0.2, height: 0.2}, scene)
        plane.position.y= 1
        plane.parent = windowAnchor // set windowAnchor as parent
        var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane)
        guiTexture
        var guiPanel = new Stage.GUI.StackPanel()  
        guiPanel.top = "0px"
        guiTexture.addControl(guiPanel)
        var button = Stage.GUI.Button.CreateSimpleButton("", "Replay ↺")
        button.fontSize = 300
        button.color = "white"
        button.background = "#4AB3F4"
        button.cornerRadius = 200
        button.thickness = 20
        

        var counter = 0;
        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 1, height: 1}, scene)
        plane.position.y= 2
        plane.parent = windowAnchor // set windowAnchor as parent
        var guiTexture2 = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane)
        var guiPanel2 = new Stage.GUI.StackPanel()  
        guiPanel2.top = "0px"
        guiTexture2.addControl(guiPanel2)
        let input = new Stage.GUI.InputText();
        input.text = "Score: "+counter;
        input.color = "blue";
        input.fontSize = "200px;";
        input.background = "white";
        input.autoStretchWidth = false;
        guiPanel2.addControl(input);  

        button.onPointerClickObservable.add(()=>{
            y = 0;
            counter = 0
            input.text = "Score: 0"
            spheres.forEach((sphere)=>{
                sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
                y += 2;
            })
        })
        guiPanel.addControl(button)
        
        scene.onPointerObservable.add((e)=>{
            if(e.type == BABYLON.PointerEventTypes.POINTERDOWN && spheres.indexOf(e.pickInfo.pickedMesh)!=-1){
                fountain.position.copyFrom(e.pickInfo.pickedMesh.position);
                particleSystem.targetStopDuration = 3;
                particleSystem.start();
                e.pickInfo.pickedMesh.position.z = 1000000;
                input.text = "Score: "+(++counter);
            }
        })

        scene.onBeforeRenderObservable.add(()=>{
            spheres.forEach((s)=>{
                s.position.y-=0.01
            })
        })

        
    }, 
    dispose: async ()=>{

    }
})


