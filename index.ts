import { Stage } from './src/stage'
import * as SDK from 'microsoft-speech-browser-sdk'


class SpeechRecognizer {
    private recognizer: SDK.Recognizer
    constructor(SDK, recognitionMode, language, format, subscriptionKey) {
        let recognizerConfig = new SDK.RecognizerConfig(
            new SDK.SpeechConfig(
                new SDK.Context(
                    new SDK.OS(navigator.userAgent, "Browser", null),
                    new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
            recognitionMode, // SDK.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation)
            language, // Supported languages are specific to each recognition mode Refer to docs.
            format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)

        // Alternatively use SDK.CognitiveTokenAuthentication(fetchCallback, fetchOnExpiryCallback) for token auth
        let authentication = new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);

        this.recognizer = SDK.CreateRecognizer(recognizerConfig, authentication);
    }

    StartOneShotRecognition(hypothesisCallback, phraseCallback) {
        this.recognizer.Recognize((event) => {
            if (event instanceof SDK.RecognitionTriggeredEvent) {
                //Do something here
            }
            else if (event instanceof SDK.SpeechHypothesisEvent) {
                hypothesisCallback(event.Result.Text);
            }
            else if (event instanceof SDK.SpeechSimplePhraseEvent) {
                phraseCallback(event.Result.DisplayText);
            }
            else if (event instanceof SDK.RecognitionEndedEvent) {
                //Do something here
            }
        })
            .On(() => {
                // The request succeeded. Nothing to do here.
            },
                (error) => {
                    console.error(error);
                });
    }

    RecognizerStop() {
        // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
        this.recognizer.AudioSource.TurnOff();
    }
}

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
    constructor(public scene:BABYLON.Scene, public vrHelper:BABYLON.VRExperienceHelper, public recognizer:SpeechRecognizer){}
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
                var angle = Math.atan((camPos.x-sphere.position.x)/(camPos.z-sphere.position.z))
                if((camPos.z-sphere.position.z) > 0){
                    angle+=Math.PI
                }
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
    var recognizer = new SpeechRecognizer(SDK, SDK.RecognitionMode.Conversation, "en-us", SDK.SpeechResultFormat.Simple, "92069ee289b84e5594a9564ab77ed2ba");
    var win:any = window
    win.shell = new Shell(scene, vrHelper, recognizer);
    
    (<BABYLON.FreeCamera>scene.activeCamera).speed *= 0.3

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
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: 1.5, height:1.5}, scene);

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


    var cloudMaterial = new BABYLON.ShaderMaterial("cloud", scene, "./public/shaders/cloud",
    {
        needAlphaBlending: true,
        attributes: ["position", "uv", "normal"],
        uniforms: ["worldViewProjection"],
        samplers: ["textureSampler"]
    });
    cloudMaterial.setTexture("textureSampler", new BABYLON.Texture("public/textures/cloud.png", scene));
    cloudMaterial.setFloat("fogNear", -100);
    cloudMaterial.setFloat("fogFar", 3000);
    cloudMaterial.setColor3("fogColor", BABYLON.Color3.FromInts(69, 132, 180));
    var time = 0
    
    // loading oalf
    var materialCarrot = new BABYLON.StandardMaterial("carrot", scene);
    materialCarrot.diffuseTexture = new BABYLON.Texture("public/textures/carrot.jpg", scene);
    var materialSnow = new BABYLON.StandardMaterial("carrot", scene);
    materialSnow.diffuseTexture = new BABYLON.Texture("public/textures/snow.jpg", scene);
    var materialBranch = new BABYLON.StandardMaterial("carrot", scene);
    materialBranch.diffuseTexture = new BABYLON.Texture("public/textures/wood.jpg", scene);

    BABYLON.SceneLoader.ImportMesh(null, "public/", "olaf.obj", scene, function (meshes, particleSystems, skeletons) {
        for(let m of meshes){
                m.position = new BABYLON.Vector3(7, 7, 7);
                m.rotate(new BABYLON.Vector3(0, 1, 0), 180);
                m.scaling.scaleInPlace(0.02);
                if(m.name == "Nose"){
                    m.material = materialCarrot
                }
                else if(m.name == "L_Arms" || m.name == "R_Arms"){
                    m.material = materialBranch
                }
                else{
                m.material = cloudMaterial;
                }
        }
    });
    
    scene.registerBeforeRender(function () {
        time += 0.005
        cloudMaterial.setFloat("time", time)
    })

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

    var listening = false;
    var appMap = new Map([["launch video player.", 0], ["launch mixer.", 0], ["launch chat app.", 1], ["launch teams.", 1], ["launch balloon pop.", 2], ["launch game.", 2], ["launch wikipedia.", 3]]);
    function toggleRecognizer() {
        if (listening == false) {
            win.shell.recognizer.StartOneShotRecognition(
                function (trex) {
                    console.log(trex);
                },
                function (text) {
                    text = text.toLowerCase();
                    if (appMap.has(text)) {
                        win.shell.launchApp(win.shell.apps[appMap.get(text)], true);
                    }
                });
            listening = true;
        }
        else {
            win.shell.recognizer.RecognizerStop();
            listening = false;
        }
    }
    
    vrHelper.onControllerMeshLoaded.add(function(controller) {
        // secondary button is the select button
        controller.onSecondaryButtonStateChangedObservable.add(function (stateObject) {
            if (stateObject.value === 1) {
                togglePhone(controller);
                toggleRecognizer();
            }
        });
    });

}
main()
