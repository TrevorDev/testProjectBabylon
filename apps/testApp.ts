
import Controller from "./libs/controller"
import Stage from "./libs/stage";
import Player from "./libs/player"
import NiftyGameServer from "./libs/niftyGameServer"
import bmath from "./libs/math"

var main = async ()=>{
    var server = new NiftyGameServer('http://localhost:3001')

    var room = await server.joinRoom({roomdId: "test"});

    var stage = new Stage();
    var scene = stage.scene
    
    // Create camera and light
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
    camera.rotationQuaternion = new BABYLON.Quaternion()
    camera.setTarget(BABYLON.Vector3.Zero())
    // camera.attachControl(canvas, true)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7
    
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
    
    // setup environment
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
    sphere.position.x = 8
    
    // Create walls
    var colliders = new Array<BABYLON.Mesh>()
    for(var i=0;i<3;i++){
        // var ground = BABYLON.MeshBuilder.CreatePlane("", {size:6,sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene)
        // ground.rotation.x = Math.PI/2
        var ground = BABYLON.MeshBuilder.CreateGround("", {width:6, height:6}, scene)
        ground.position.z+=6*i
        ground.position.y+=i*0.2
        colliders.push(ground)
        if(i==2){
            ground.rotation.z = Math.PI
            ground.position.z = 0
            ground.position.y+=5
        }
    }
    
    player.body.position.x=2
    var physicsSteps = 4;
    var camYOffset = 0;
    scene.onBeforeRenderObservable.add(()=>{
        // Delta time
        var delta = scene.getEngine().getDeltaTime()/1000
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
    
        // Place camera in first person of player
        camera.position.copyFrom(player.body.position.add(player.body.up))
        camera.setTarget(camera.position.add(player.body.forward))
    
        //player.body.getWorldMatrix()
        camera.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Right(), camYOffset))
    })
}
main()