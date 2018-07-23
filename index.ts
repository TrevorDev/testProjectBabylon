import { Stage } from './src/stage'

class App {
    constructor(public name:string, public iconUrl:string, public launch:Function, public dispose:Function){

    }
}
class Shell {
    private apps:Array<App> = []
    constructor(public scene:BABYLON.Scene, public vrHelper:BABYLON.VRExperienceHelper){}
    registerApp = (app:App)=>{
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 0.5, this.scene)

        var mat = new BABYLON.StandardMaterial("icon", this.scene);
        var iconTexture = new BABYLON.Texture(app.iconUrl, this.scene);
        iconTexture.uScale = -1;
        iconTexture.vScale = -1;
        mat.diffuseTexture = iconTexture;
        mat.diffuseTexture.hasAlpha = true;
        mat.backFaceCulling = false;
        sphere.material = mat;

        var anchor = new BABYLON.Mesh("", this.scene);
        sphere.position.x = 1
        sphere.rotation.y=Math.PI/4
        this.apps.push(app)
        app.launch(anchor, this.vrHelper)

        var b = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        sphere.addBehavior(b)
        this.scene.onBeforeRenderObservable.add(()=>{
            anchor.position.copyFrom(sphere.position)
            anchor.rotation.copyFrom(anchor.rotation)
        })
    }
}

// Initialize full screen rendering
var stage = new Stage()
var scene = stage.scene
var canvas = stage.engine.getRenderingCanvas()

var env = scene.createDefaultEnvironment({})
env.setMainColor(BABYLON.Color3.FromHexString("#7f8c8d"))
env.skybox.scaling.scaleInPlace(10)

// Create basic world
var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(1, 1, -4), scene)

//camera.setTarget(BABYLON.Vector3.Zero())
camera.attachControl(canvas, true)
camera.minZ = 0;
var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
light.intensity = 0.7

// Setup vr
var vrHelper = scene.createDefaultVRExperience({floorMeshes: [env.ground]})
vrHelper.raySelectionPredicate = (mesh:BABYLON.AbstractMesh):boolean=>{
    return mesh.isVisible && mesh.isPickable;
}

var win:any = window
win.shell = new Shell(scene, vrHelper);
    