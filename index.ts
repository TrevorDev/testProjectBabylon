import { Stage } from './src/stage'

class App {
    constructor(public name:string, public iconUrl:string, public launch:Function, public dispose:Function){

    }
}

var makeNotPickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m)=>{
        makeNotPickable(m)
    })
}

class Shell {
    private apps:Array<App> = []
    private x: number = 0
    constructor(public scene:BABYLON.Scene, public vrHelper:BABYLON.VRExperienceHelper){}
    positionSphere = (sphere: any) => {
        sphere.position.x = this.x;
        this.x += 1;
    }
    registerApp = (app:App)=>{
        // This settimeout is needed to handle a weird bug where the spheres are not rendered
        setTimeout(() => {
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
            
            b.onDragObservable.add(()=>{
                // Rotate apps that are dragged to face you
                var camPos = this.scene.activeCamera.position
                if((<BABYLON.WebVRFreeCamera>this.scene.activeCamera).devicePosition){
                    camPos = (<BABYLON.WebVRFreeCamera>this.scene.activeCamera).devicePosition;
                }
                var angle = Math.sin((camPos.x-sphere.position.x)/(camPos.z-sphere.position.z))
                anchor.rotation.y = angle
            })
    
            // related to controls the opening and closing animation
            enum VisibleState { Visible = 0, Hidden, Transition }
            var state = VisibleState.Hidden
            var FPS = 60
            var APP_OPEN_SPEED = 3.0/FPS
            var scaleDelta = 0
            var scaleDeltaIter = 0

            this.scene.onBeforeRenderObservable.add(()=>{
               // console.log(sphere.position.x)
                anchor.position.copyFrom(sphere.position)
                anchor.rotation.copyFrom(anchor.rotation)

                if (state == VisibleState.Transition)
                {
                    if (scaleDeltaIter == 1/APP_OPEN_SPEED)
                    {               
                        if (scaleDelta == APP_OPEN_SPEED)
                        {
                            state = VisibleState.Visible
                            scaleDelta = 0.0
                        }
                        else if (scaleDelta == -APP_OPEN_SPEED)
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
                if (e.type == BABYLON.PointerEventTypes.POINTERDOWN) {
                    if(e.pickInfo.pickedMesh == sphere) {
                        if(!launched){
                            this.apps.push(app)
                            app.launch(anchor, this.vrHelper) // BUG: this is launch new app with each click? 
                        }
                        launched = true;

                        if (state == VisibleState.Hidden)
                        {
                            state = VisibleState.Transition
                            scaleDelta = APP_OPEN_SPEED
                        }
                        else if (state == VisibleState.Visible)
                        {
                            state = VisibleState.Transition
                            scaleDelta = -APP_OPEN_SPEED
                        }
                    }
                }
            })
        }, 1000)

    }
}

var main = async () => {
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
    //light.intensity = 0.7

    // Setup vr
    var vrHelper = scene.createDefaultVRExperience({floorMeshes: [env.ground]})
    vrHelper.raySelectionPredicate = (mesh:BABYLON.AbstractMesh):boolean=>{
        return mesh.isVisible && mesh.isPickable;
    }
        
    var win:any = window
    win.shell = new Shell(scene, vrHelper);

    // Model taken from https://poly.google.com/view/3oGDGMrc6rm
    // CC-BY for Google as the content creator
    // this is the 3D Phone model that will be the app launcher device
    var phoneContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync("/public/tablet/", "1327 iPhone.gltf", scene)
    var loadedPhone = phoneContainer.createRootMesh()

    // scaling the phone model to be smaller & rotated
    loadedPhone.scaling = new BABYLON.Vector3(0.06,0.06,0.06);
    loadedPhone.rotation.x = Math.PI
    loadedPhone.rotation.y = Math.PI / 2
    loadedPhone.rotation.z = Math.PI / -2

    // performance optimization
    makeNotPickable(loadedPhone)
    
    // add phone to mesh
    scene.addMesh(loadedPhone, true)

    // menu launcher plane
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 1.25, height:2}, scene);

    plane.position.z = -0.2;

    var advancedTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
    var buttons = []
    
    for (var i = 0; i < 6; i++) {
        var button = Stage.GUI.Button.CreateSimpleButton("button" + i, "App " + i);
        button.width = 1;
        button.height = 1;
        button.color = "white";
        button.fontSize = 50;
        button.background = "green";
        button.paddingLeft = "3%";
        button.paddingRight = "3%";
        button.paddingBottom = "3%";
        
        button.onPointerUpObservable.add(function() {
            alert("you launched app");
        });

        buttons.push(button)
    }

    // grid for icons
    var grid = new Stage.GUI.Grid(); 
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(0.5);
    grid.addRowDefinition(0.3);
    grid.addRowDefinition(0.3);
    grid.addRowDefinition(0.3);

    grid.addControl(buttons[0], 0, 0);   
    grid.addControl(buttons[1], 0, 1);
    grid.addControl(buttons[2], 1, 0);
    grid.addControl(buttons[3], 1, 1);
    grid.addControl(buttons[4], 2, 0);
    grid.addControl(buttons[5], 2, 1);
    
    advancedTexture.addControl(grid);

    // parent menu mesh that holds both the phone and ui
    var parentMenuMesh = new BABYLON.Mesh('parentMesh1', scene)
    
    parentMenuMesh.addChild(plane)
    parentMenuMesh.addChild(loadedPhone)

    // vrController.addChild(parentMenuMesh))
}
main()