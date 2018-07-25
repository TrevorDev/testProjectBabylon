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
            /*
                Alternative syntax for typescript devs.
                if (event instanceof SDK.RecognitionTriggeredEvent)
            */
            switch (event.Name) {
                case "ListeningStartedEvent":
                    //UpdateStatus("Listening");
                    break;
                case "SpeechHypothesisEvent":
                    console.log(JSON.stringify(event.Result)); 
                    hypothesisCallback(event.Result.Text);
                    break;
                case "SpeechSimplePhraseEvent":
                    console.log(JSON.stringify(event.Result));
                    phraseCallback(JSON.stringify(event.Result));
                    break;
                case "RecognitionEndedEvent":
                    console.log(JSON.stringify(event));
                    this.recognizer.AudioSource.TurnOff();
                    break;
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
class Shell {
    private apps:Array<App> = []
    private x: number = 1
    constructor(public scene:BABYLON.Scene, public vrHelper:BABYLON.VRExperienceHelper, public recognizer:SpeechRecognizer){}
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
        //anchor.scaling.scaleInPlace(0)
     
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

        this.scene.onBeforeRenderObservable.add(()=>{
           // console.log(sphere.position.x)
            anchor.position.copyFrom(sphere.position)
            anchor.rotation.copyFrom(anchor.rotation)
        })

        var state = 0;
        let launched = false;
        this.scene.onPointerObservable.add((e)=>{
            if (e.type == BABYLON.PointerEventTypes.POINTERDOWN) {
                if(e.pickInfo.pickedMesh == sphere) {
                    if(!launched){
                        this.apps.push(app)
                        app.launch(anchor, this.vrHelper) // BUG: this is launch new app with each click? 
                    }
                    launched = true;
                    
                    // if (state == 0)
                    // {
                    //     for (var i = 0; i < 100; i++)
                    //     {
                    //         // TODO - use onBeforeRenderObservable instead of setTimeout
                    //         // to remove chopiness and avoid overloading the event queue
                    //         setTimeout( () => { anchor.scaling.addInPlace(new BABYLON.Vector3(0.01, 0.01, 0.01)); }, 1);
                    //     }
                    //     state = 1
                    // }
                    // else
                    // {
                    //     for (var i = 0; i < 100; i++)
                    //     {
                    //         // TODO - use onBeforeRenderObservable instead of setTimeout
                    //         // to remove chopiness and avoid overloading the event queue
                    //         setTimeout( () => { anchor.scaling.subtractInPlace(new BABYLON.Vector3(0.01, 0.01, 0.01)); }, 1);
                    //     }
                    //     state = 0
                    // }
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
//light.intensity = 0.7

// Setup vr
var vrHelper = scene.createDefaultVRExperience({floorMeshes: [env.ground]})
vrHelper.raySelectionPredicate = (mesh:BABYLON.AbstractMesh):boolean=>{
    return mesh.isVisible && mesh.isPickable;
}

var recognizer = new SpeechRecognizer(SDK, SDK.RecognitionMode.Conversation, "en-us", SDK.SpeechResultFormat.Simple, "92069ee289b84e5594a9564ab77ed2ba");

var win:any = window
win.shell = new Shell(scene, vrHelper, recognizer);