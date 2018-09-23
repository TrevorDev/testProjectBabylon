
import Controller from "./libs/controller"
import Stage from "./libs/stage";
import Player from "./libs/player"
import NiftyGameServer from "./libs/niftyGameServer/client/niftyGameServer"
import bmath from "./libs/math"
import PlayerBody from "./libs/trackedObjects/playerBody";

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
        rotX: "mouseX",
        rotY: "mouseY",
        click: "mouseLeft"
    }, {});
    var player = new Player(scene, controller)
    await player.trackedObject.addToServer(server);
    
    // Load level
    var level = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/testLevel.glb")
    scene.addMesh(level.meshes[0],true)
    level.meshes[0].scaling.scaleInPlace(10)

    // Create walls from level
    var colliders = new Array<BABYLON.Mesh>()
    level.meshes.forEach((m,i)=>{
        if(i==0){
            return
        }
        colliders.push(<BABYLON.Mesh>m)
    })
    
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
        var directionDown = false
        if(player.controller.isDown("up")){
            directionDown = true
            player.spd.addInPlace(player.body.forward.scale(delta*accSpd))
        }
        if(player.controller.isDown("down")){
            directionDown = true
            player.spd.subtractInPlace(player.body.forward.scale(delta*accSpd))
        }
        if(player.controller.isDown("left")){
            directionDown = true
            player.spd.subtractInPlace(player.body.right.scale(delta*accSpd))
        }
        if(player.controller.isDown("right")){
            directionDown = true
            player.spd.addInPlace(player.body.right.scale(delta*accSpd))
        }
        if(player.controller.isDown("jump")){
            player.spd.y = 5;
        }
        player.body.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.RotationAxis(player.body.up, player.controller.getValue("rotX")/-1000))
        //console.log(player.controller.getValue("rotY"))
        camYOffset += player.controller.getValue("rotY")/-1000
        camYOffset = Math.max(Math.min(camYOffset, (Math.PI/2)-0.001), (-Math.PI/2)+0.001)
    
        // Gravity
        player.spd.y += -9.8*delta
    
        // Move player
        player.body.position.addInPlace(player.spd.scale(delta))
    
        // Collision + resolution
        colliders.forEach((collider)=>{
            bmath.forEachFace(collider, (verts, normal)=>{
                var angleBetweenPlayerUpAndNormal = Math.acos(BABYLON.Vector3.Dot(player.body.up, normal));
                if(angleBetweenPlayerUpAndNormal < Math.PI/3){
                    // floor
                    var ray = new BABYLON.Ray(player.body.position, player.body.up, 1)
                    var dist = bmath.rayIntersectsTriangle(ray, verts); // todo use normals 
                    if(dist){
                        player.body.position.addInPlace(ray.direction.scaleInPlace(dist))
                        
                        var amt = BABYLON.Vector3.Dot(player.spd, normal)
                        if(amt>0){
                            var component = normal.scale(amt)
                            player.spd.subtractInPlace(component)
                        }
                        
                        if(!directionDown){
                            player.spd.subtractInPlace(player.spd.scale(0.1*delta*100))
                        }
                    }
                }else if(angleBetweenPlayerUpAndNormal < Math.PI - (Math.PI/3)){
                    // wall
                }else{
                    // ceiling
                    var ray = new BABYLON.Ray(player.body.position.add(player.body.up.scale(1.3)), player.body.up.scale(-1), 1.3)
                    var dist = bmath.rayIntersectsTriangle(ray, verts); // todo use normals 
                    if(dist){
                        player.body.position.addInPlace(ray.direction.scaleInPlace(dist))
                        
                        var amt = BABYLON.Vector3.Dot(player.spd, normal)
                        //console.log(amt)
                        if(amt<0){
                            var component = normal.scale(amt)
                            player.spd.subtractInPlace(component)
                        }
                        
                        if(!directionDown){
                            player.spd.subtractInPlace(player.spd.scale(0.1*delta*100))
                        }
                    }
                }
            })
        })
    
        // Update camera position
        // 1st person
        // camera.position.copyFrom(player.body.position.add(player.body.up))
        // camera.setTarget(camera.position.add(player.body.forward))
        // camera.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Right(), camYOffset))
        
        // 3rd person
        player.body.computeWorldMatrix()
        camera.position.copyFrom(player.body.position.add(player.body.up.scale(2)))
        camera.position.addInPlace(player.body.forward.scale(-5))
        camera.setTarget(player.body.position)
    })
}
main()