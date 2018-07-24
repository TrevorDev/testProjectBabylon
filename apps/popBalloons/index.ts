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
    name: "popBalloons", 
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        var scene = windowAnchor.getScene();

        var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, -20), scene);
        camera.parent = windowAnchor
        camera.checkCollisions = true;
        camera.applyGravity = true;
        camera.setTarget(new BABYLON.Vector3(0, 0, 0))

        var light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, -1, 0), scene);
        light.position = new BABYLON.Vector3(0, 80, 0);
        light.parent = windowAnchor;

        var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
        
        // Physics
        //scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
        scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.OimoJSPlugin())
        
        var fountain = BABYLON.Mesh.CreateBox("foutain", 0.01, scene);
        fountain.visibility = 0.1;
        fountain.parent = windowAnchor;
        
        let createNewSystem = function() {
            var particleSystem;
            if (BABYLON.GPUParticleSystem.IsSupported) {
                console.log("GPU supported!")
                particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity:1000000 }, scene);
                particleSystem.activeParticleCount = 200000;
            } else {
                particleSystem = new BABYLON.ParticleSystem("particles", 50000 , scene);
            }
        
            particleSystem.emitRate = 10000;
            particleSystem.particleEmitterType = new BABYLON.SphereParticleEmitter(1);
            particleSystem.particleTexture = new BABYLON.Texture("public/textures/flare.png", scene);
            particleSystem.maxLifeTime = 10;
            particleSystem.minSize = 0.01;
            particleSystem.maxSize = 0.1;
            particleSystem.emitter = fountain;
            particleSystem.disposeOnStop = false;
            particleSystem.targetStopDuration = 1;
            return particleSystem;;
        }  

        var particleSystem = createNewSystem();
        var materialAmiga = new BABYLON.StandardMaterial("amiga", scene);
        materialAmiga.diffuseTexture = new BABYLON.Texture("public/textures/amiga.jpg", scene);
        materialAmiga.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        //materialAmiga.diffuseTexture.uScale = 5;
        //materialAmiga.diffuseTexture.vScale = 5;
    
        var materialAmiga2 = new BABYLON.StandardMaterial("amiga", scene);
        materialAmiga2.diffuseTexture = new BABYLON.Texture("public/textures/amiga.jpg", scene);
        materialAmiga2.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5)        

        // Spheres
        var y = 0;
        var particleSystems = {};
        var originalSphere = null;
        for (var index = 0; index < 100; index++) {
            // Material
            var sphere = null;

            var meshName = "Sphere" + index;
            
            if(index == 0) 
            {
                originalSphere = BABYLON.Mesh.CreateSphere(meshName, 16, 1, scene);
                sphere = originalSphere;
            }
            else
            {
                sphere = originalSphere.clone(meshName);
            }
            
            sphere.parent = windowAnchor
            
            sphere.material = materialAmiga;
    
            sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
            
            shadowGenerator.addShadowCaster(sphere);
    
            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
        
            sphere.actionManager = new BABYLON.ActionManager(scene);
    
            sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (evt) => { 
                evt.source.dispose();
                fountain.position = evt.source.absolutePosition;
                console.log(particleSystem);
                particleSystem.start();
            }));
    
            sphere.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, sphere, "scaling", new BABYLON.Vector3(1, 1, 1), 150));
            sphere.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, sphere, "scaling", new BABYLON.Vector3(1.1, 1.1, 1.1), 150));
    
            y += 2;
        }

        var ground = BABYLON.Mesh.CreateBox("Ground", 1, scene);
        ground.scaling = new BABYLON.Vector3(100, 1, 100);
        ground.position.y = -5.0;
        ground.checkCollisions = true;
        ground.parent = windowAnchor;
        var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        groundMat.backFaceCulling = false;
        ground.material = groundMat;
        ground.receiveShadows = true;

        return scene;
    
    }, 
    dispose: async ()=>{

    }
})