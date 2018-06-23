import { Stage } from './src/stage'
import { Vector3, Material, Color3 } from 'babylonjs';
import 'babylonjs-materials';

var colors = {
    seaFoam: BABYLON.Color3.FromHexString("#16a085"),
    green: BABYLON.Color3.FromHexString("#27ae60"),
    blue: BABYLON.Color3.FromHexString("#2980b9"),
    purple: BABYLON.Color3.FromHexString("#8e44ad"),
    navy: BABYLON.Color3.FromHexString("#2c3e50"),
    yellow: BABYLON.Color3.FromHexString("#f39c12"),
    orange: BABYLON.Color3.FromHexString("#d35400"),
    red: BABYLON.Color3.FromHexString("#c0392b"),
    white: BABYLON.Color3.FromHexString("#bdc3c7"),
    gray: BABYLON.Color3.FromHexString("#7f8c8d")
}



var createMat = (scene, color)=>{
    var mat = new BABYLON.StandardMaterial("", scene)
    mat.diffuseColor = color
    mat.specularColor = BABYLON.Color3.FromHexString("#555555")
    mat.specularPower = 1;
    mat.emissiveColor = color.clone().scale(0.7)
    return mat
}

var main = async ()=>{
    // Initialize full screen rendering
    var stage = new Stage()
    var scene = stage.scene
    var canvas = stage.engine.getRenderingCanvas()

    var defaultMat = createMat(scene, colors.white)

    // Create basic world
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
    camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.2
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
    sphere.position.y = 4
    var ground = BABYLON.Mesh.CreateBox("sphere1", 1, scene)
    ground.scaling.x = 10
    ground.scaling.z = 10
    ground.material =defaultMat
    ground.rotation.z = 0.8
    scene.enablePhysics(new BABYLON.Vector3(0,-9.8,0), new BABYLON.CannonJSPlugin())

    var materialSphere3 = new BABYLON.StandardMaterial("texture3", scene);
    materialSphere3.diffuseTexture = new BABYLON.Texture("textures/misc.jpg", scene);
    sphere.material = createMat(scene, colors.red)

    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.0, friction: 0 }, this.scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.8 }, this.scene);

    sphere.physicsImpostor.executeNativeFunction(function (world, body) {
        body.fixedRotation = true;
        body.updateMassProperties();
    });

    //sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,1,5))
    sphere.physicsImpostor.onCollideEvent = (a,b)=>{
        //sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0,1,0))
    }

    scene.clearColor = BABYLON.Color4.FromHexString("#3498dbFF")
}
main()

