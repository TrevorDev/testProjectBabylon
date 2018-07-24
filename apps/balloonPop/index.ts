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
        windowAnchor.addChild(fountain);
        
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
        materialAmiga.diffuseTexture = new BABYLON.Texture("textures/amiga.jpg", scene);
        materialAmiga.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        for (var index = 0; index < 10; index++) {
            let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 1, scene);
            sphere.material = materialAmiga
            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
            sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
            windowAnchor.addChild(sphere)

            y += 2;
            spheres.push(sphere)
        }

        scene.onPointerObservable.add((e)=>{
            if(e.type == BABYLON.PointerEventTypes.POINTERDOWN && spheres.indexOf(e.pickInfo.pickedMesh)!=-1){
                fountain.position.copyFrom(e.pickInfo.pickedMesh.position);
                particleSystem.targetStopDuration = 3;
                particleSystem.start();
                e.pickInfo.pickedMesh.dispose();
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


