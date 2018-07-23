import { Stage } from './src/stage'

class App {
    constructor(public name:string, public launch:Function, public dispose:Function){

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
        this.positionSphere(sphere)
        var anchor = new BABYLON.Mesh("", this.scene);
        anchor.scaling.scaleInPlace(0)
     
        sphere.rotation.y=Math.PI/4
        this.apps.push(app)
        // app.launch(anchor, this.vrHelper)

        var b = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)})
        sphere.addBehavior(b)
        this.scene.onBeforeRenderObservable.add(()=>{
           // console.log(sphere.position.x)
            anchor.position.copyFrom(sphere.position)
            anchor.rotation.copyFrom(anchor.rotation)
        })

        var state = 0;
        this.scene.onPointerObservable.add((e)=>{
            if (e.type == BABYLON.PointerEventTypes.POINTERDOWN) {
                if(e.pickInfo.pickedMesh == sphere) {
                    console.log(e)
                    this.apps.push(app)
                    app.launch(anchor, this.vrHelper)
                    if (state == 0)
                    {
                        for (var i = 0; i < 100; i++)
                        {
                            // TODO - use onBeforeRenderObservable instead of setTimeout
                            // to remove chopiness and avoid overloading the event queue
                            setTimeout( () => { anchor.scaling.addInPlace(new BABYLON.Vector3(0.01, 0.01, 0.01)); }, 1);
                        }
                        state = 1
                    }
                    else
                    {
                        for (var i = 0; i < 100; i++)
                        {
                            // TODO - use onBeforeRenderObservable instead of setTimeout
                            // to remove chopiness and avoid overloading the event queue
                            setTimeout( () => { anchor.scaling.subtractInPlace(new BABYLON.Vector3(0.01, 0.01, 0.01)); }, 1);
                        }
                        state = 0
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
var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 2, -1), scene)

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
    