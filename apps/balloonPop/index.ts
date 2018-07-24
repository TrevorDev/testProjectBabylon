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
               
        summonAwesome(scene, windowAnchor);

    }, 
    dispose: async ()=>{

    }
})



function summonAwesome(scene: BABYLON.Scene, windowAnchor: BABYLON.Mesh) {
    var fountain = BABYLON.Mesh.CreateBox("fountain", 0.01, scene);
    fountain.visibility = 0.1;
    windowAnchor.addChild(fountain);
    let createNewSystem = function (): BABYLON.ParticleSystem {
        var particleSystem;
        if (BABYLON.GPUParticleSystem.IsSupported) {
            console.log("GPU supported!");
            particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity: 1000 }, scene);
            particleSystem.activeParticleCount = 1000;
        }
        else {
            particleSystem = new BABYLON.ParticleSystem("particles", 10, scene);
        }
        particleSystem.parent = windowAnchor;
        particleSystem.emitRate = 100;
        particleSystem.particleEmitterType = new BABYLON.SphereParticleEmitter(1);
        particleSystem.particleTexture = new BABYLON.Texture("/public/textures/awesome.png", scene);
        particleSystem.maxLifeTime = 1;
        particleSystem.minSize = 1;
        particleSystem.maxSize = 10;
        particleSystem.emitter = fountain;
        particleSystem.disposeOnStop = false;
        particleSystem.targetStopDuration = 3;
        particleSystem.minEmitPower = 10;
        particleSystem.maxEmitPower = 20;
        return particleSystem;
    };
    var particleSystem = createNewSystem();
    var awesomeMaterial = new BABYLON.StandardMaterial("amiga", scene);
    awesomeMaterial.diffuseTexture = new BABYLON.Texture("public/textures/awesome2.png", scene);
    awesomeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 10, scene);
    sphere.rotation.y = -Math.PI / 2;
    sphere.material = awesomeMaterial;
    sphere.position = new BABYLON.Vector3(0, 1, 100);
    windowAnchor.addChild(sphere);
    var vel = new BABYLON.Vector3(0, 20, -20);
    scene.onBeforeRenderObservable.add(() => {
        if (sphere.position.y > 0) {
            var delta = scene.getEngine().getDeltaTime() / 1000;
            vel.addInPlace(new BABYLON.Vector3(0, -9.8, 0).scale(delta));
            sphere.position.addInPlace(vel.scale(delta));
            if (sphere.position.y <= 0) {
                sphere.position.y = 0;
                fountain.position.copyFrom(sphere.position);
                particleSystem.targetStopDuration = 3;
                particleSystem.start();
                sphere.dispose();
            }
        }
    });
}
