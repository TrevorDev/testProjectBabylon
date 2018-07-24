import { Stage } from './src/stage'

class App {
    constructor(public name:string, public iconUrl:string, public launch:Function, public dispose:Function){

    }
}
class Shell {
    private apps:Array<App> = []
    private x: number = 1
    constructor(public scene:BABYLON.Scene, public vrHelper:BABYLON.VRExperienceHelper){}
    positionSphere = (sphere: any) => {
        sphere.position.x = this.x;
        this.x += 1;
    }
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

        this.positionSphere(sphere)
        var anchor = new BABYLON.Mesh("", this.scene);
        anchor.scaling.scaleInPlace(0)
     
        sphere.rotation.y=Math.PI/4
        this.apps.push(app)
        // app.launch(anchor, this.vrHelper)

        var b = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        sphere.addBehavior(b)

        var scale = 0
        enum VisibleState { Visible = 0, Hidden, Transition }
        var state = VisibleState.Hidden
        var scaleDelta = 0
        var scaleDeltaIter = 0
        this.scene.onBeforeRenderObservable.add(()=>{
            // console.log(sphere.position.x)
            anchor.position.copyFrom(sphere.position)
            anchor.rotation.copyFrom(anchor.rotation)

            if (state == VisibleState.Transition)
            {
                if (scaleDeltaIter == 50)
                {               
                    if (scaleDelta == 0.02)
                    {
                        state = VisibleState.Visible
                        scaleDelta = 0.0
                    }
                    else if (scaleDelta == -0.02)
                    {
                        state = VisibleState.Hidden
                        scaleDelta = 0.0
                    }
                    scaleDeltaIter = 0
                }
                else
                {
                    anchor.scaling.addInPlace(new BABYLON.Vector3(scaleDelta, scaleDelta, scaleDelta));
                    scaleDeltaIter++
                }
            }
        })

        let launched = false;
        this.scene.onPointerObservable.add((e)=>{
            if (e.type == BABYLON.PointerEventTypes.POINTERTAP) {
                if(e.pickInfo.pickedMesh == sphere) {
                    if(!launched){
                        this.apps.push(app)
                        app.launch(anchor, this.vrHelper) // BUG: this is launch new app with each click? 
                    }
                    launched = true;
                    
                    if (state == VisibleState.Hidden)
                    {
                        state = VisibleState.Transition
                        scaleDelta = 0.02
                    }
                    else if (state == VisibleState.Visible)
                    {
                        state = VisibleState.Transition
                        scaleDelta = -0.02
                    }
                }
            }
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
    