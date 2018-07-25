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
    registeredAppCounter = 0
    positionSphere = (sphere: any) => {
        sphere.position.x = this.x;
        this.x += 1;
    }
    
    launchApp = (app:App, maximize:boolean) => {
        //  maximize the application at the given index
        setTimeout(() => {
            var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 0.5, this.scene)
            sphere.position.y += 0.2
            var mat = new BABYLON.StandardMaterial("icon", this.scene);
            var iconTexture = new BABYLON.Texture(app.iconUrl, this.scene);
            iconTexture.uScale = -1;
            iconTexture.vScale = -1;
            mat.diffuseTexture = iconTexture;
            mat.diffuseTexture.hasAlpha = true;
            mat.backFaceCulling = false;
            sphere.material = mat;
            this.registeredAppCounter += 1
    
            this.positionSphere(sphere)
            var anchor = new BABYLON.Mesh("", this.scene);
            anchor.scaling.scaleInPlace(0)
         
            sphere.rotation.y=Math.PI/4
            // this.apps.push(app)
    
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
                        scaleDeltaIter++;
                    }
                }
            })
    
            let launched = false;
            var pDownTime:Date; 
            
            this.scene.onPointerObservable.add((e)=>{
                if (e.type == BABYLON.PointerEventTypes.POINTERDOWN) {
                    if(e.pickInfo.pickedMesh == sphere) {
                        if(!launched){
                            // this.apps.push(app)
                            app.launch(anchor, this.vrHelper) // BUG: this is launch new app with each click? 
                        }
                        launched = true;

                        pDownTime = new Date();
                    }
                }else if(e.type == BABYLON.PointerEventTypes.POINTERUP){
                    if(pDownTime && (new Date().getTime()-pDownTime.getTime())<200){
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

            if (maximize === true) {
                app.launch(anchor, this.vrHelper)
                state = VisibleState.Transition
                launched = true;
                scaleDelta = APP_OPEN_SPEED
            }
        }, 1000)
    }
    registerApp = (app:App)=>{
        // This settimeout is needed to handle a weird bug where the spheres are not rendered
        this.apps.push(app)

    }
}

var main = async () => {
    // Initialize full screen rendering
    var stage = new Stage()
    var scene = stage.scene
    var canvas = stage.engine.getRenderingCanvas()

    var env = scene.createDefaultEnvironment({createGround: false})
    env.setMainColor(BABYLON.Color3.FromHexString("#1b6eb4"))
    env.skybox.scaling.scaleInPlace(10)

    // Create basic world
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(1, 1, -4), scene)

    //camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)
    camera.minZ = 0;
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    //light.intensity = 0.7

    // Setup vr
    var vrHelper = scene.createDefaultVRExperience({floorMeshes: []})
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
    
    var available_apps = [
    {name: "videoplayer", iconUrl: "public/appicons/videoflat.png"}, 
    {name: "chatApp", iconUrl: "public/appicons/flatchat.png"}, 
    {name: "balloonPop", iconUrl: "public/appicons/baloonflat.png"}, 
    {name: "convertSite", iconUrl: "public/appicons/flatwikipedia.png"}
]
    for (let i = 0; i < available_apps.length; i++) {
        var button = Stage.GUI.Button.CreateImageWithCenterTextButton("button" + i, available_apps[i].name, available_apps[i].iconUrl);
        button.width = 1;
        button.height = 1;
        button.color = "transparent";
        button.fontSize = 50;
        button.paddingLeft = "3%";
        button.paddingRight = "3%";
        button.paddingBottom = "3%";
        

        button.onPointerUpObservable.add(function(e) {
            shell.launchApp(shell.apps[i], true)
        });

        buttons.push(button)
    }

    // grid for icons
    var grid = new Stage.GUI.Grid(); 
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(0.5);
    grid.addRowDefinition(0.5);
    grid.addRowDefinition(0.5);

    grid.addControl(buttons[0], 0, 0);   
    grid.addControl(buttons[1], 0, 1);
    grid.addControl(buttons[2], 1, 0);
    grid.addControl(buttons[3], 1, 1);

    
    advancedTexture.addControl(grid);

    // parent menu mesh that holds both the phone and ui
    var parentMenuMesh = new BABYLON.Mesh('parentMesh1', scene)
    
    parentMenuMesh.addChild(plane)
    parentMenuMesh.addChild(loadedPhone)
    //https://poly.google.com/search/beachside
    var container = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/beach/model.gltf", "", scene)  
    container.addAllToScene();
    container.meshes[0].position.set(1, 0.7, 0)
    container.meshes[0].scaling.scaleInPlace(3)
    container.meshes[0].rotation.y = -Math.PI/2
    var box = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, scene)
    var mat = new BABYLON.StandardMaterial("beach mat",scene)
    mat.diffuseColor = BABYLON.Color3.FromHexString("#1dc0ff")
    box.material=mat;
    box.scaling.z = 1000
    box.scaling.x = 1000
    box.position.y = -3

    // console.log("loaded")
    // var loadedModel = container.createRootMesh()
    // loadedModel.scaling.scaleInPlace(0.001)
    // scene.addMesh(loadedModel)
    //makeNotPickable(loadedModel)

    parentMenuMesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
    parentMenuMesh.rotation.x = Math.PI / 8;
    parentMenuMesh.rotation.y = 0;
    parentMenuMesh.rotation.z = 0;

    var phoneIsUp = false;

    parentMenuMesh.setEnabled(true); // TODO CHANGE THIS FOR VR USE

    function togglePhone(controller) {
        if (phoneIsUp === false) {
            controller.mesh.addChild(parentMenuMesh);
            parentMenuMesh.setEnabled(true);
    
            parentMenuMesh.position.x = -0.1
            parentMenuMesh.position.y = 0.1
            parentMenuMesh.position.z = -0.1;
        }
        else {
            controller.mesh.removeChild(parentMenuMesh);
            parentMenuMesh.setEnabled(false);
        }

        phoneIsUp = !phoneIsUp;
    }
    
    vrHelper.onControllerMeshLoaded.add(function(controller) {
        // secondary button is the select button
        controller.onSecondaryButtonStateChangedObservable.add(function (stateObject) {
            if (stateObject.value === 1) {
                togglePhone(controller);
            }
        });
    });

}
main()