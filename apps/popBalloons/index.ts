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
        scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
        scene.enablePhysics(null, new BABYLON.OimoJSPlugin())
        
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
            //vrHelper.enableTeleportation({floorMeshName: meshName});
            
            sphere.material = materialAmiga;
    
            sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
            
            shadowGenerator.addShadowCaster(sphere);
    
            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
        
            var goToColorAction = new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPickTrigger, light, "diffuse", BABYLON.Color3.Red(), 1000, null, true);
    
            var popAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => { createNewSystem() });
    
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

        // Box
        var box0 = BABYLON.Mesh.CreateBox("Box0", 3, scene);
        box0.position = new BABYLON.Vector3(3, 30, 0);
        var materialWood = new BABYLON.StandardMaterial("wood", scene);
        materialWood.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
        materialWood.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        box0.material = materialWood;
        box0.parent = windowAnchor
    
        shadowGenerator.addShadowCaster(box0);
    
        // Compound
        var part0 = BABYLON.Mesh.CreateBox("part0", 3, scene);
        part0.position = new BABYLON.Vector3(3, 30, 0);
        part0.material = materialWood;
        part0.parent = windowAnchor
    
        var part1 = BABYLON.Mesh.CreateBox("part1", 3, scene);
        part1.parent = part0; // We need a hierarchy for compound objects
        part1.position = new BABYLON.Vector3(0, 3, 0);
        part1.material = materialWood;
        part1.parent = windowAnchor
    
        shadowGenerator.addShadowCaster(part0);
        shadowGenerator.addShadowCaster(part1);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 32;
               
                
        // Playground
        var ground = BABYLON.Mesh.CreateBox("Ground", 1, scene);
        ground.scaling = new BABYLON.Vector3(100, 1, 100);
        ground.position.y = -5.0;
        ground.checkCollisions = true;
        ground.parent = windowAnchor
    
        var border0 = BABYLON.Mesh.CreateBox("border0", 1, scene);
        border0.scaling = new BABYLON.Vector3(1, 100, 100);
        border0.position.y = -5.0;
        border0.position.x = -50.0;
        border0.checkCollisions = true;
        border0.parent = windowAnchor
    
        var border1 = BABYLON.Mesh.CreateBox("border1", 1, scene);
        border1.scaling = new BABYLON.Vector3(1, 100, 100);
        border1.position.y = -5.0;
        border1.position.x = 50.0;
        border1.checkCollisions = true;

        border1.parent = windowAnchor
    
        var border2 = BABYLON.Mesh.CreateBox("border2", 1, scene);
        border2.scaling = new BABYLON.Vector3(100, 100, 1);
        border2.position.y = -5.0;
        border2.position.z = 50.0;
        border2.checkCollisions = true;
        border2.parent = windowAnchor
    
        var border3 = BABYLON.Mesh.CreateBox("border3", 1, scene);
        border3.scaling = new BABYLON.Vector3(100, 100, 1);
        border3.position.y = -5.0;
        border3.position.z = -50.0;
        border3.checkCollisions = true;
        border2.parent = windowAnchor
    
        var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        groundMat.backFaceCulling = false;
        ground.material = groundMat;
        border0.material = groundMat;
        border1.material = groundMat;
        border2.material = groundMat;
        border3.material = groundMat;
        ground.receiveShadows = true;
        border2.parent = windowAnchor

        // Physics
        box0.physicsImpostor = new BABYLON.PhysicsImpostor(box0, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 2, friction: 0.4, restitution: 0.3 }, scene);
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);
        border0.physicsImpostor = new BABYLON.PhysicsImpostor(border0, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
        border1.physicsImpostor = new BABYLON.PhysicsImpostor(border1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
        border2.physicsImpostor = new BABYLON.PhysicsImpostor(border2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
        border3.physicsImpostor = new BABYLON.PhysicsImpostor(border3, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
        border3.parent = windowAnchor
        
        part0.physicsImpostor = new BABYLON.PhysicsImpostor(part0, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 2, friction: 0.4, restitution: 0.3 }, scene);
    

        return scene;
    
    }, 
    dispose: async ()=>{

    }
})