import * as BABYLON from 'babylonjs';
import { MapArea } from './src/mapArea';
import { Stage } from './src/stage';
import 'babylonjs-loaders';

var cleanGLTF = (meshes, stage)=>{
    var floorMeshes = []
    meshes.forEach((m)=>{
        //console.log(m.name)
        if(m.name.indexOf("Floor") != -1){
            floorMeshes.push(m)
            //console.log(m.name)
            //m.position.y = 2
            //floorMeshes.push(m)
        }
        if(m.name.indexOf("Collision_") != -1){
            // console.log(m.name)
            // console.log(m.rotationQuaternion)
            //m.isVisible = false

            // Fix physics rotation to be left handed
            // if(m.name.indexOf("Collision_Wall5") != -1){
            //     //m.isVisible = false
            //     // m.rotationQuaternion = null
            //     // m.rotation.y = Math.PI/4
            
            m.rotationQuaternion.x *=-1
            m.rotationQuaternion.y *=-1
            //}

            //collisionMeshes.push(m)
            var ground = m
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7, ignoreParent: true }, stage.scene);
            // m.showBoundingBox = true

            m.isVisible = false
        }else{
            
            
           
            //m.showBoundingBox = true
        }
    })
    return floorMeshes
}

var main = async ()=>{
    var stage = new Stage();
    stage.scene.enablePhysics(null);
    // Create objects in the scene
    var helper = stage.scene.createDefaultVRExperience()
    
    // var box = BABYLON.Mesh.CreateBox("box", 1.0, stage.scene);
    // box.position.z = 5;

    // var area1 = new MapArea(stage.scene)
    // //area1.rootMesh.position = new BABYLON.Vector3(0,0,0)
    // var area2 = new MapArea(stage.scene)
    // //area2.rootMesh.position = new BABYLON.Vector3(10,0,0)
    // var area3 = new MapArea(stage.scene)
    // //area3.rootMesh.position = new BABYLON.Vector3(0,0,10)
    // var area4 = new MapArea(stage.scene)
    // //area4.rootMesh.position = new BABYLON.Vector3(-10,0,0)
    // var areas = [area1, area2, area3, area4]


    // BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "SpawnRoom_greybox.gltf", stage.scene).then((container)=>{
        
    //     container.addAllToScene()
          
    //     container.meshes.forEach((m)=>{
    //         if(m.name.indexOf("Collision_")!=-1){
    //             m.isVisible = false
    //         }
    //         if(m.name.indexOf("Collision_Floor")!=-1){
    //             console.log("hit")
    //                 //var h = stage.scene.createDefaultVRExperience()
    //                 helper.enableTeleportation({floorMeshes: [m]})
    //                 m.isVisible = true
    //                 m.material.alpha = 0;
    //         }else{
    //             //m.isVisible = false
    //         }
    //     })
    // })
    BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "SpawnRoom_greybox.gltf", stage.scene).then((container)=>{
        cleanGLTF(container.meshes, stage)    
        container.addAllToScene()
        container.meshes.forEach((m:any)=>{
            if(m.name.indexOf("Collision_Floor") != -1){
                m.position.y=-0.1
                m.parent = null
                m.isVisible = true
                //m.scaling.x = -1
                m.rotationQuaternion = BABYLON.Quaternion.Identity()
                helper.enableTeleportation({floorMeshes: [m]})
                //m.visibility = 0.1
                console.log("gltf")
                console.log(m.material.sideOrientation)
            }else{
                m.isVisible = false
            }
        })
        
    })

    // // BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "HoloRoom_greybox.gltf", stage.scene).then((container)=>{
    // //     container.meshes[0].position.z = 15.067
    // //     cleanGLTF(container.meshes, stage)    
    // //     container.addAllToScene()
    // // })

    // // BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "DemoRoom_greybox.gltf", stage.scene).then((container)=>{
    // //     container.meshes[0].position.x = 25.06
    // //     cleanGLTF(container.meshes, stage)    
    // //     container.addAllToScene()
    // // })

    // // BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "DemoRoom_greybox.gltf", stage.scene).then((container)=>{
    // //     container.meshes[0].rotation.y = Math.PI
    // //     container.meshes[0].position.x = -25.06
    // //     cleanGLTF(container.meshes, stage)    
    // //     container.addAllToScene()
    // // })

    // // var containers = await Promise.all([
    // //     BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "DemoRoom_greybox.gltf", stage.scene),
    // //     BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "HoloRoom_greybox.gltf", stage.scene),
        
    // // ])
    // // var container = await BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "DemoRoom_greybox.gltf", stage.scene);
    // // container.addAllToScene()
    // // container.meshes[0].position.x = 25.06
    // // container = await BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "DemoRoom_greybox.gltf", stage.scene);
    // // container.addAllToScene()
    // // container.meshes[0].rotation.y = Math.PI
    // // container.meshes[0].position.x = -25.06
    // // container = await BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "HoloRoom_greybox.gltf", stage.scene);
    // // container.addAllToScene()
    // // container.meshes[0].position.z = 15.067
    // // var container = await BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "SpawnRoom_greybox.gltf", stage.scene);
    // // container.addAllToScene()
    // // var collisionMeshes = []
    // // stage.scene.getBoundingBoxRenderer()
    // // var floorMeshes = []
    // // container.meshes.forEach((m)=>{
    // //     if(m.name.indexOf("Collision_Floor") != -1){
    // //         console.log(m.name)
    // //         m.position.y = 0.05
    // //         floorMeshes.push(m)
    // //     }
    // //     if(m.name.indexOf("Collision_") != -1){
    // //         // console.log(m.name)
    // //         // console.log(m.rotationQuaternion)
    // //         //m.isVisible = false

    // //         // Fix physics rotation to be left handed
    // //         // if(m.name.indexOf("Collision_Wall5") != -1){
    // //         //     //m.isVisible = false
    // //         //     // m.rotationQuaternion = null
    // //         //     // m.rotation.y = Math.PI/4
            
    // //         m.rotationQuaternion.x *=-1
    // //         m.rotationQuaternion.y *=-1
    // //         //}

    // //         collisionMeshes.push(m)
    // //         var ground = m
    // //         ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7, ignoreParent: true }, stage.scene);
    // //         m.showBoundingBox = true

    // //         m.isVisible = false
    // //     }else{
            
            
           
    // //         //m.showBoundingBox = true
    // //     }
    // // })

    // var ball = BABYLON.Mesh.CreateSphere("", 10, 0.3, stage.scene);
    // ball.position.set(0, 4, 0)
    // ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.8 }, stage.scene);
    // //ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(2,0,1))
    
    // // var ground = BABYLON.Mesh.CreatePlane("ground1", 6, stage.scene);
    // // ground.rotation.y = Math.PI/4
    // // ground.position.y = 0.5
    // // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, stage.scene);

    // var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, stage.scene);
    // console.log("bab")
    // console.log(ground)
    //helper.enableTeleportation({floorMeshes: [ground]})
    
    // helper.raySelectionPredicate = (m)=>{
    //     return m.name.indexOf("Collision_") != -1
    // }
    // helper.meshSelectionPredicate = (m)=>{
    //     return m.name.indexOf("Collision_") != -1
    // }
    // console.log("hit")
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0,0,0), stage.scene);
    light.intensity = 10
    // light.parent = ball

    // // light = new BABYLON.PointLight("light", new BABYLON.Vector3(0,2,20), stage.scene);
    // // light.intensity = 10

    // // light = new BABYLON.PointLight("light", new BABYLON.Vector3(30,2,0), stage.scene);
    // // light.intensity = 10
    // // light = new BABYLON.PointLight("light", new BABYLON.Vector3(-30,2,0), stage.scene);
    // // light.intensity = 10

    

    // stage.scene.onPointerDown = ()=>{
    //     ball.position.copyFrom(helper.currentVRCamera.position)
    //     ball.physicsImpostor.setLinearVelocity(helper.currentVRCamera.getForwardRay().direction.scale(5))
    //     ball.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0,0,0))
    // }

    // var counter = 0
    // // Run's once per game frame
    // stage.scene.onBeforeRenderObservable.add(()=>{
    //     box.position.x += 0.01;
    //     box.rotation.x += 0.01;
    //     box.rotation.y += 0.01;
    //     counter++
    //     if(counter == 60){
    //         counter = 0;
    //         if(helper && helper._teleportationTarget){
    //             console.log(helper._teleportationTarget.position)
    //         }
    //     }
        
    //     // areas.forEach((a)=>{
    //     //     var renderDist = 20;
    //     //     if(a.rendering && stage.scene.activeCamera.position.subtract(a.rootMesh.position).length() < renderDist){
    //     //         a.addToSceneRecursive(a.rootMesh, stage.scene)
    //     //         a.rendering = false
    //     //     }else if(!a.rendering && stage.scene.activeCamera.position.subtract(a.rootMesh.position).length() >= renderDist){
    //     //         a.removeFromSceneRecursive(a.rootMesh, stage.scene)
    //     //         a.rendering = true
    //     //     }
    //     // })
    // });
}
main();











// // Get rid of margin
// document.documentElement.style["overflow"]="hidden"
// document.documentElement.style.overflow ="hidden"
// document.documentElement.style.width ="100%"
// document.documentElement.style.height ="100%"
// document.documentElement.style.margin ="0"
// document.documentElement.style.padding ="0"
// document.body.style.overflow ="hidden"
// document.body.style.width ="100%"
// document.body.style.height ="100%"
// document.body.style.margin ="0"
// document.body.style.padding ="0"

// // Create canvas html element on webpage
// var canvas = document.createElement('canvas');
// canvas.style.width="100%"
// canvas.style.height="100%"
// document.body.appendChild(canvas);

// // Initialize Babylon scene and engine
// var engine = new BABYLON.Engine(canvas, true);
// var scene = new BABYLON.Scene(engine);
// engine.runRenderLoop(()=>{
//     scene.render();
// });

// var scene = new BABYLON.Scene(engine);

//     var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 20, -20), scene);
//     camera.attachControl(canvas, true);
//     // camera.checkCollisions = true;
//     // camera.applyGravity = true;
//     camera.setTarget(new BABYLON.Vector3(0, 0, 0));

//     var light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, -1, 0), scene);
//     light.position = new BABYLON.Vector3(0, 80, 0);


//     // Physics
//     scene.enablePhysics(null, new BABYLON.CannonJSPlugin());

//     //sphere
//     var sphere = BABYLON.Mesh.CreateSphere("Sphere0", 16, 3, scene);
//     sphere.position = new BABYLON.Vector3(2,0,-5);
//     sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
//     sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,0,5))

//     //ground
//     // var ground = BABYLON.Mesh.CreateBox("Ground", 1, scene);
//     // ground.scaling = new BABYLON.Vector3(100, 1, 100);
//     // ground.position.y = -5.0;
//     // ground.checkCollisions = true;
    
//     // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);

//      var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
//     ground.position.z =20
//     // load gltf
//     BABYLON.SceneLoader.ImportMesh("","http://localhost:5000/public/","SpawnRoom_greybox.gltf",scene, (meshes)=>{
//         meshes.forEach((m)=>{
//             if(m.name.indexOf("Collision_Floor")!=-1){
//                 console.log("hit")
//                     var h = scene.createDefaultVRExperience()
//                     h.enableTeleportation({floorMeshes: [m, ground]})
//             }else{
//                 m.isVisible = false
//             }
//         })
//         // meshes[1].parent = null
//         // meshes[1].physicsImpostor = new BABYLON.PhysicsImpostor(meshes[1], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7, ignoreParent: true }, scene);
       
//     })