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
        // Physics
        //scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin());
       
        var fountain = BABYLON.Mesh.CreateBox("foutain", 0.01, scene);
        fountain.visibility = 0.1;
        windowAnchor.addChild(fountain);
        
        let createNewSystem = function():BABYLON.ParticleSystem {
            var particleSystem;
            if (BABYLON.GPUParticleSystem.IsSupported) {
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
            sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);
            windowAnchor.addChild(sphere)

            y += 2;
            spheres.push(sphere)
        }

    var cloudMaterial = new BABYLON.ShaderMaterial("cloud", scene,
    "./public/shaders/cloud",
    {
        needAlphaBlending: true,
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection"],
        samplers: ["textureSampler"]
    });
    cloudMaterial.setTexture("textureSampler", new BABYLON.Texture("public/textures/cloud.png", scene));
    cloudMaterial.setFloat("fogNear", -100);
    cloudMaterial.setFloat("fogFar", 3000);
    cloudMaterial.setColor3("fogColor", BABYLON.Color3.FromInts(69, 132, 180));

    var globalVertexData;
        // loading oalf
        var materialCarrot = new BABYLON.StandardMaterial("carrot", scene);
        materialCarrot.diffuseTexture = new BABYLON.Texture("public/textures/carrot.jpg", scene);
        var materialSnow = new BABYLON.StandardMaterial("carrot", scene);
        materialSnow.diffuseTexture = new BABYLON.Texture("public/textures/snow.jpg", scene);
        var materialBranch = new BABYLON.StandardMaterial("carrot", scene);
        materialBranch.diffuseTexture = new BABYLON.Texture("public/textures/wood.jpg", scene);

        BABYLON.SceneLoader.ImportMesh(null, "public/", "olaf.obj", scene, function (meshes, particleSystems, skeletons) {
            for(let m of meshes){
                 m.parent = windowAnchor
                 m.position = new BABYLON.Vector3(5, 5, 5);
                 m.rotate(new BABYLON.Vector3(0, 1, 0), 180);
                 m.scaling.scaleInPlace(0.02);
                 if(m.name == "Nose"){
                     m.material = materialCarrot
                 }
                 else if(m.name == "L_Arms" || m.name == "R_Arms"){
                    m.material = materialBranch
                 }
                 else{
                    m.material = materialSnow;
                 }
/*
                 m.material = cloudMaterial;

                 var planeVertexData = BABYLON.VertexData.ExtractFromMesh(m as BABYLON.Mesh, true, true); //BABYLON.VertexData.CreatePlane({ size: 16 });
                 delete planeVertexData.normals; // We do not need normals
    
                 // Transform
                 var randomScaling = Math.random()  * 1.15 + 0.05;
                 var transformMatrix = BABYLON.Matrix.Scaling(randomScaling, randomScaling, 1.0);
                 transformMatrix = transformMatrix.multiply(BABYLON.Matrix.RotationZ(Math.random() * Math.PI));
                 transformMatrix = transformMatrix.multiply(BABYLON.Matrix.Translation(Math.random() * 0.01 - 0.005, -Math.random() * Math.random() * 0.01, 3));
         
                 planeVertexData.transform(transformMatrix);
         
                 // Merge
                 if (!globalVertexData) {
                     globalVertexData = planeVertexData;
                 } else {
                     globalVertexData.merge(planeVertexData);
                     
                 }
                 globalVertexData.transform(transformMatrix);
                 */

     //  var clouds = new BABYLON.Mesh("Clouds", scene);

     //  globalVertexData.applyToMesh(clouds)
     //  clouds.material = cloudMaterial;
     //  clouds.position = m.position;
    //   clouds.parent = windowAnchor

             //   m.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (evt) => { 
             //       m.material = cloudMaterial;
             //   }));
            }
        });
        var count = 80;

        for (var i = 0; i < count; i++) {
            var planeVertexData = BABYLON.VertexData.CreatePlane({ size: 16 });
    
            delete planeVertexData.normals; // We do not need normals
    
            // Transform
            var randomScaling = Math.random() * Math.random() * 2 + 0.2;
            var transformMatrix = BABYLON.Matrix.Scaling(randomScaling, randomScaling, 1.0);
            transformMatrix = transformMatrix.multiply(BABYLON.Matrix.RotationZ(Math.random() * Math.PI));
            transformMatrix = transformMatrix.multiply(BABYLON.Matrix.Translation(Math.random() * 0.01 - 0.005, -Math.random() * Math.random() * 0.01, count - i));
    
            planeVertexData.transform(transformMatrix);
    
            // Merge
            if (!globalVertexData) {
                globalVertexData = planeVertexData;
            } else {
                globalVertexData.merge(planeVertexData);
            }
        }
       var clouds = new BABYLON.Mesh("Clouds", scene);

       globalVertexData.applyToMesh(clouds)
       clouds.material = cloudMaterial;
       clouds.parent = windowAnchor
       clouds.position = new BABYLON.Vector3(3, 3, 3);

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


