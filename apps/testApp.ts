
import Controller from "./libs/controller"
import Stage from "./libs/stage";
import Player from "./libs/player"
import NiftyGameServer from "./libs/niftyGameServer/client/niftyGameServer"
import bmath from "./libs/math"
import PlayerBody from "./libs/trackedObjects/playerBody";
import { Nullable, Vector3 } from "babylonjs";
import { NiftyWorldController } from "./libs/niftyWolrdController";

var main = async ()=>{    
    var stage = new Stage()
    var scene = stage.scene

    // Connect to server and join room
    var server = new NiftyGameServer(':4001', [PlayerBody])
    await server.joinRoom({roomId: "test"})
    
    // Create camera
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
    camera.rotationQuaternion = new BABYLON.Quaternion()
    camera.minZ = 0;
    camera.setTarget(BABYLON.Vector3.Zero())
    
    // Create lighting
    var light = new BABYLON.DirectionalLight("",  new BABYLON.Vector3(3, -5, 3), scene)
    light.intensity = 1.5

    var ambLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene)
	ambLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5)
	ambLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5)
    ambLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5)
    
    // Create player
    var controller = new NiftyWorldController(NiftyWorldController.MODES.TOUCHSCREEN)
    var player = new Player(scene, controller)
    await player.trackedObject.addToServer(server);
    
    // Load level
    // var level = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/level2.glb")
    // scene.addMesh(level.meshes[0],true)
    // level.meshes[0].scaling.scaleInPlace(30)
    // level.meshes[0].position.y -= 40
    // level.meshes[0].position.x -= 50
    // level.meshes[0].position.z = 30

    var level = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/level4.glb")
    scene.addMesh(level.meshes[0],true)
    level.meshes[0].scaling.scaleInPlace(30)
    level.meshes[0].position.y = 0
    level.meshes[0].position.x = 20
    level.meshes[0].position.z = 26

    // Create walls from level
    var colliders = new Array<BABYLON.Mesh>()
    level.meshes.forEach((m,i)=>{
        if(i==0){
            return
        }
        // Add inner meshes it has children
        if(m.getChildMeshes().length > 0){
            m.getChildMeshes().forEach((m2)=>{
                colliders.push(<BABYLON.Mesh>m2)
            })
        }else{
            colliders.push(<BABYLON.Mesh>m)
        }
    })    
    
    // Test single ground level
    // var colliders = new Array<BABYLON.Mesh>()
    // var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 1, scene);
    // ground.position.y -=1
    // colliders.push(ground)

    // Convert geometry from gpu to cpu a single time
    // This will break if objects move
    // TODO instead of multiplying all verts by world matrix, just multiply ray by inverse of matrix
    var triangles:Array<{verts:Array<Vector3>, normal:Vector3}> = []
    setTimeout(() => {
        colliders.forEach((collider)=>{
            bmath.forEachFace(collider, (verts, normal)=>{
                triangles.push({verts: verts.map((v)=>{return v.clone()}),normal: normal.clone()})
            })
        })
    }, 1000);
    
    
    player.body.position.x=2
    var camYOffset = 1
    scene.onBeforeRenderObservable.add(()=>{
        // Delta time
        var delta = scene.getEngine().getDeltaTime()
        server.applyDeltaTime(delta)
        delta = delta/1000
        if(delta > 0.4){
            return;
        }
    
        // Handle input
        var accSpd = 10;

        // Compute input direction
        var inputDirection = new BABYLON.Vector3()
        inputDirection.copyFrom(player.controller.leftJoystick)
        if(inputDirection.z > 0){
            player.body.rotationQuaternion.copyFrom(player.cameraRotation)
        }
        if(player.controller.restart){
            player.body.position.set(0,0,0)
            player.spd.set(0,0,0)
            player.controller.restart = false
        }

        // Jumping logic
        if(player.controller.jump && player.canJump){
            console.log(player.body.position)
            console.log(player)
            if(player.spd.y < 5){
                player.spd.y = 5
            }
            player.canJump = false
            player.controller.jump = false
        }

        // Update player rotation based on mouse move
        var rotX = player.controller.rightJoystick.x
        var rotY = player.controller.rightJoystick.y
        player.controller.rightJoystick.set(0,0,0)

        player.cameraRotation.multiplyInPlace(BABYLON.Quaternion.RotationAxis(player.body.up, rotX))
        camYOffset += rotY
        camYOffset = Math.max(Math.min(camYOffset, (Math.PI/2)-0.001), (-Math.PI/2)+0.001)

        // Update player speed based on input direction
        var rotatedInputDirection = new BABYLON.Vector3() 
        bmath.rotateVectorByQuaternionToRef(inputDirection, player.cameraRotation, rotatedInputDirection)
        player.spd.addInPlace(rotatedInputDirection.scale(delta*accSpd))
    
        // Gravity
        player.spd.y += -9.8*delta
    
        // Move player
        var direction = player.spd.scale(delta)
        var count = 0
        do{
            count++;
            var closestHit = {
                distRatio:  <Nullable<number>>null,
                normal: <Nullable<BABYLON.Vector3>>new BABYLON.Vector3()
            }
            
            var ray = new BABYLON.Ray(player.body.position, direction)
            // Collision + resolution
            triangles.forEach((tri:any)=>{
                 // Ray based collision\
                 var dist = bmath.rayIntersectsTriangle(ray, tri.verts, tri.normal)
                 if(dist && (!closestHit.distRatio || dist < closestHit.distRatio)){
                     closestHit.distRatio = dist
                     closestHit.normal.copyFrom(tri.normal)
                 }
            })

            // If it hit an object adjust direction/speed to be projected onto ground
            if(closestHit.distRatio){
                player.canJump = true
                var deltaToHitPoint = direction.scale(closestHit.distRatio).add(direction.normalizeToNew().scale(-0.001))
                player.body.position.addInPlace(deltaToHitPoint)
                
                var prjected = new BABYLON.Vector3()
                bmath.projectVectorOnPlaneToRef(direction.subtract(deltaToHitPoint), closestHit.normal, prjected)
                direction.copyFrom(prjected)
                
                bmath.projectVectorOnPlaneToRef(player.spd, closestHit.normal, player.spd)
            }else{
                player.body.position.addInPlace(direction)
            }
        //Recurse up to 2 times
        }while(closestHit.distRatio != null && count < 2)
        
        // if(count > 1){
        //     player.spd.scaleInPlace(0.9)
        // }
    
        // Update camera position
        // 1st person
        // camera.position.copyFrom(player.body.position.add(player.body.up))
        // camera.setTarget(camera.position.add(player.body.forward))
        // camera.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Right(), camYOffset))
        
        // 3rd person
        player.body.computeWorldMatrix()
        camera.position.copyFrom(player.body.position.add(player.body.up.scale(camYOffset*10)))
        var forward = BABYLON.Vector3.Forward()
        bmath.rotateVectorByQuaternionToRef(forward, player.cameraRotation, forward)
        camera.position.addInPlace(forward.scale(-10))
        camera.setTarget(player.bodyCenterPostion())

        // camera ray test, TODO smoothen snapping
        var closestHit = {
            distRatio:  <Nullable<number>>null,
            normal: <Nullable<BABYLON.Vector3>>new BABYLON.Vector3()
        }
        var ray = new BABYLON.Ray(player.bodyCenterPostion(), camera.position.subtract(player.bodyCenterPostion()))
        triangles.forEach((tri:any)=>{
            // Ray based collision\
            var dist = bmath.rayIntersectsTriangle(ray, tri.verts, tri.normal)
            if(dist && (!closestHit.distRatio || dist < closestHit.distRatio)){
                closestHit.distRatio = dist
                closestHit.normal.copyFrom(tri.normal)
            }
       })
       if(closestHit.distRatio){
           camera.position.copyFrom( player.bodyCenterPostion().add(ray.direction.scale(closestHit.distRatio-0.1)))
       }
    })
}
main()
