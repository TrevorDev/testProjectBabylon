
import Controller from "./libs/controller"
import Stage from "./libs/stage";
import Player from "./libs/player"
import NiftyGameServer from "./libs/niftyGameServer/client/niftyGameServer"
import bmath from "./libs/math"
import PlayerBody from "./libs/trackedObjects/playerBody";
import { Nullable, Vector3 } from "babylonjs";

var main = async ()=>{    
    var stage = new Stage()
    var scene = stage.scene

    // Connect to server and join room
    var server = new NiftyGameServer('http://localhost:3001', [PlayerBody])
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
    var controller = new Controller({
        up: "w",
        down: "s",
        left: "a",
        right: "d",
        jump: " ",
        reset: "r",
        rotX: "mouseX",
        rotY: "mouseY",
        click: "mouseLeft"
    }, {});
    var player = new Player(scene, controller)
    await player.trackedObject.addToServer(server);
    
    // Load level
    var level = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/level2.glb")
    scene.addMesh(level.meshes[0],true)
    level.meshes[0].scaling.scaleInPlace(30)
    level.meshes[0].position.y -= 40
    level.meshes[0].position.x -= 50
    level.meshes[0].position.z = 30
    // Create walls from level
    var colliders = new Array<BABYLON.Mesh>()
    level.meshes.forEach((m,i)=>{
        if(i==0){
            return
        }
        colliders.push(<BABYLON.Mesh>m)
    })

    // Test single ground level
    // var colliders = new Array<BABYLON.Mesh>()
    // var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 1, scene);
    // colliders.push(ground)
    
    player.body.position.x=2
    var physicsSteps = 4;
    var camYOffset = 0;
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
        if(player.controller.isDown("up")){
            inputDirection.addInPlace(bmath.directionConstants.FORWARD)
        }
        if(player.controller.isDown("down")){
            inputDirection.addInPlace(bmath.directionConstants.BACKWARD)
        }
        if(player.controller.isDown("left")){
            inputDirection.addInPlace(bmath.directionConstants.LEFT)
        }
        if(player.controller.isDown("right")){
            inputDirection.addInPlace(bmath.directionConstants.RIGHT)
        }
        if(player.controller.isDown("reset")){
            player.body.position.set(0,0,0)
            player.spd.set(0,0,0)
        }

        inputDirection.normalize()

        // Jumping logic
        if(player.controller.isDown("jump") && player.canJump){
            if(player.spd.y < 5){
                player.spd.y = 5
            }
            player.canJump = false
        }

        // Update player rotation based on mouse move
        player.body.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.RotationAxis(player.body.up, player.controller.getValue("rotX")/-1000))
        camYOffset += player.controller.getValue("rotY")/-1000
        camYOffset = Math.max(Math.min(camYOffset, (Math.PI/2)-0.001), (-Math.PI/2)+0.001)

        // Update player speed based on input direction
        var rotatedInputDirection = new BABYLON.Vector3() 
        bmath.rotateVectorByQuaternionToRef(inputDirection, player.body.rotationQuaternion, rotatedInputDirection)
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
            
            // Collision + resolution
            colliders.forEach((collider)=>{
                bmath.forEachFace(collider, (verts, normal)=>{
                    // Ray based collision
                    var ray = new BABYLON.Ray(player.body.position, direction)
                    var dist = bmath.rayIntersectsTriangle(ray, verts, normal)
                    if(dist && (!closestHit.distRatio || dist < closestHit.distRatio)){
                        closestHit.distRatio = dist
                        closestHit.normal.copyFrom(normal)
                    }
                })
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
    
        // Update camera position
        // 1st person
        // camera.position.copyFrom(player.body.position.add(player.body.up))
        // camera.setTarget(camera.position.add(player.body.forward))
        // camera.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Right(), camYOffset))
        
        // 3rd person
        player.body.computeWorldMatrix()
        camera.position.copyFrom(player.body.position.add(player.body.up.scale(camYOffset*5)))
        camera.position.addInPlace(player.body.forward.scale(-5))
        camera.setTarget(player.body.position)
    })
}
main()