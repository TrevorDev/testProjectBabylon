import * as BABYLON from 'babylonjs';
import { MapArea } from './src/mapArea';
import { Stage } from './src/stage';
import { AnimationArea } from './src/animationArea';
import 'babylonjs-loaders';
import { ParticleArea } from './src/particleArea';
import { ShapeAndRotationArea } from './src/shapesAndRotationArea';
import { PhysicsArea } from './src/physicsArea';
import { SpaceDoor } from './src/spaceDoor';



var main = async ()=>{
    var stage = new Stage()
    stage.scene.getEngine().displayLoadingUI()
    var helper = stage.scene.createDefaultVRExperience()

    // Load assets
    var assets = await Promise.all([
        BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "SpawnRoom_greybox.glb", stage.scene),
        BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "HoloRoom_greybox.gltf", stage.scene),
        BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "DemoRoom_greybox.gltf", stage.scene),
        BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "DemoRoom_greybox.gltf", stage.scene)
    ])

    // Hide collision meshes
    assets.forEach((container)=>{
        container.addAllToScene()
        container.meshes.forEach((m)=>{
            if(m.name.indexOf("Collision_")!=-1){
                if(m.name.indexOf("Collision_Floor")==-1){
                    m.isVisible = false
                }else{
                    m.position.y += 0.1
                    m.scaling.scaleInPlace(100)
                    var floorMeshes:Array<any> = [m]
                    helper.enableTeleportation({floorMeshes: floorMeshes})
                }
            }
        })
    })

    // Convert each room asset to a map area class
    var areas = assets.map((container, i)=>{
        var area = new MapArea(stage.scene)
        area.rootMesh.addChild(container.meshes[0])
        if(i == 1){
            area.rootMesh.position.z = 15.067
        }else if(i == 2){
            area.rootMesh.position.x = 25.06
        }else if(i == 3){
            area.rootMesh.position.x = -25.06
            area.rootMesh.rotation.y = Math.PI
        }
        return area
    })

    // Animation demo
    var animationArea = new AnimationArea(stage.scene)
    await animationArea.init()
    animationArea.root.position.x = 34
    animationArea.root.rotation.y=Math.PI/2
    stage.scene.removeMesh(animationArea.root)

    // Paritcle demo
    var particleArea = new ParticleArea(stage.scene)
    await particleArea.init()
    particleArea.root.position.x = -34
    particleArea.root.rotation.y=-Math.PI/2

    // Physics demo
    var physicsArea = new PhysicsArea(stage.scene, helper)
    await physicsArea.init()
    physicsArea.root.position.z = 3
    physicsArea.root.position.x = 3
    physicsArea.root.rotation.y = Math.PI/4

    // Shapes demo
    var shapesAndRotationArea = new ShapeAndRotationArea(stage.scene)
    await shapesAndRotationArea.init()
    shapesAndRotationArea.root.position.z = -4
    shapesAndRotationArea.root.rotation.y = Math.PI

    // Lighting
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0,0,0), stage.scene);
    light.intensity = 1
    light = new BABYLON.PointLight("light", new BABYLON.Vector3(0,2,20), stage.scene);
    light.intensity = 1
    light = new BABYLON.PointLight("light", new BABYLON.Vector3(30,2,0), stage.scene);
    light.intensity = 1
    light = new BABYLON.PointLight("light", new BABYLON.Vector3(-30,2,0), stage.scene);
    light.intensity = 1

    for(var i =0;i<3;i++){
        var door = new SpaceDoor(stage.scene)
        await door.init()
        if(i==0){
            door.root.position.z = 15.067
        }else if(i==1){
            door.root.rotation.y = Math.PI/2
            door.root.position.x = 25.06
        }else if(i==2){
            door.root.rotation.y = Math.PI/2
            door.root.position.x = -25.06
        }
    }
    
    
    stage.scene.getEngine().hideLoadingUI()
}
main();