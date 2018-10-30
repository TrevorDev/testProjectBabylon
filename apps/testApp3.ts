// console.log("foobar2")

// var iframeEl = document.createElement('iframe');
// iframeEl.src = "http://localhost:3000/?app=testApp2"
// document.body.appendChild(iframeEl)
import * as BABYLON from 'babylonjs'




// window.addEventListener('message', function(e) {
//     console.log("hit")
// }, false);

var button = document.createElement('button')
button.textContent = "open page"
document.body.appendChild(button)
button.onclick = ()=>{
    window.open("https://msit.microsoftstream.com/video/c44a1b8c-b663-4955-acbe-5092d1bdc5f0?list=trending")
}


var main = async ()=>{
    // Get rid of margin
    document.documentElement.style["overflow"]="hidden"
    document.documentElement.style.overflow ="hidden"
    document.documentElement.style.width ="100%"
    document.documentElement.style.height ="100%"
    document.documentElement.style.margin ="0"
    document.documentElement.style.padding ="0"
    document.body.style.overflow ="hidden"
    document.body.style.width ="100%"
    document.body.style.height ="100%"
    document.body.style.margin ="0"
    document.body.style.padding ="0"

    // Create canvas html element on webpage
    var canvas = document.createElement('canvas')
    canvas.style.width="100%"
    canvas.style.height="100%"

    //canvas = document.getElementById("renderCanvas")
    document.body.appendChild(canvas)

    // Initialize Babylon scene and engine
    var engine = new BABYLON.Engine(canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true })
    engine.enableOfflineSupport = false
    var scene = new BABYLON.Scene(engine)
    engine.runRenderLoop(()=>{
        scene.render()
    })
    window.addEventListener("resize", ()=> {
        engine.resize()
    })

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 3, -4), scene)
    //camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7


    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
    sphere.position.y = 1

    var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 1, scene)
    ground.material = new BABYLON.StandardMaterial("",scene)

    // var plane = BABYLON.Mesh.CreatePlane("plane1", 8, scene);
    // plane.scaling.x = 1920/1080; // set aspect ratio

    var pathArray:any = [];
    var sphereRadius = 5;
    var width = 0.16*4;
    var height = 0.09*4;
    var widthPoints = 20;
    var heightPoints = 20;
    var rot = new BABYLON.Vector3();
    for (var y = 0; y < widthPoints; y++) {
        pathArray[y] = [];
        for (var x = 0; x < heightPoints; x++) {
            rot.set(y*Math.PI*height/(heightPoints-1),x*Math.PI*width/(widthPoints-1),0);
            rot.addInPlace(new BABYLON.Vector3(-Math.PI*height/2,-Math.PI*width/2,0))
            var forward = new BABYLON.Vector3(0,0,sphereRadius);
            forward.rotateByQuaternionToRef(BABYLON.Quaternion.FromEulerVector(rot),forward);
            //forward.rotateByQuaternionToRef(BABYLON.Quaternion.FromEulerAngles(-Math.PI*height/2,-Math.PI*width/2,0),forward);
            forward.y += 3
            forward.z -= 3
            pathArray[y][x] = forward
        }    
    }
    var plane = BABYLON.MeshBuilder.CreateRibbon("ribbon", { pathArray }, scene);




    var videoCanvas = document.createElement('canvas')
    videoCanvas.style.width="300px"
    videoCanvas.style.height="136px"
    document.body.appendChild(videoCanvas)
    
   




    var mat = new BABYLON.StandardMaterial("mat", scene);
    var myDynamicTexture = new BABYLON.DynamicTexture("name", videoCanvas, scene, false );
    //videoCanvas =  myDynamicTexture.getContext().canvas
    mat.diffuseTexture = myDynamicTexture;
    plane.material = mat;
    document.onkeydown = ()=>{
        myDynamicTexture.update(false);
        console.log("update")
    }

    window.addEventListener('message', function(e) {
        console.log("hit")
        var ctx2 = videoCanvas.getContext("2d")
        var img = ctx2.createImageData(videoCanvas.width, videoCanvas.height)
        var imgData = new Uint8ClampedArray(e.data.data)
        img.data.set(imgData);
        ctx2.putImageData(img,0,0)
        myDynamicTexture.update(false);
    }, false);
    
    scene.createDefaultVRExperience();


}
main();