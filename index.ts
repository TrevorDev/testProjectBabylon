import { Stage } from './src/stage'
import * as SDK from 'microsoft-speech-browser-sdk'
import {Recognizer} from "microsoft-speech-browser-sdk";

class App {
    constructor(public name:string, public launch:Function, public dispose:Function){

    }
}


function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {
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

    console.log(SDK.Recognizer);
    return SDK.Recognizer.Create(recognizerConfig, authentication);
}


function RecognizerStop(SDK, recognizer) {
    // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
    recognizer.AudioSource.TurnOff();
}


class Shell {

    private apps:Array<App> = []
    constructor(public scene:BABYLON.Scene, public vrHelper:BABYLON.VRExperienceHelper, public temp_recognizer:SDK.Recognizer){

        this.temp_recognizer.Recognize((event) => {

            if (event instanceof SDK.RecognitionEndedEvent)
            {
                console.log(JSON.stringify(event)); // Debug information
            }
            else {
                console.log('didnt invoke');
            }
        })
        .On(() => {
            // The request succeeded. Nothing to do here.
        },
        (error) => {
            console.error(error);
        });
    }
    
    registerApp = (app:App)=>{
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 0.5, this.scene)
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

var recognizer = RecognizerSetup(SDK, SDK.RecognitionMode.Interactive, "en-us", SDK.SpeechResultFormat.Simple, "blah")
win.shell = new Shell(scene, vrHelper, recognizer);
    