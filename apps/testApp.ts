import * as BABYLON from 'babylonjs'
declare var amp:any;

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

    scene.createDefaultVRExperience();


    class VideoLoader {
        static CreateAsync(){
            return new Promise((req, resp)=>{
                var id = "video"+Math.random();
                var videoEl = document.createElement('video');
                videoEl.style.display = "none"
                videoEl.id = id
                document.body.appendChild(videoEl)
                // AMP
                var myPlayer = amp(id, { /* Options */
                    techOrder: ["azureHtml5JS", "html5FairPlayHLS", "html5"],
                    "nativeControlsForTouch": true,
                    autoplay: true,
                    controls: true,
                    width: "960",
                    height: "540",
                    poster: ""
                }, function() {
                    var videoElement = Array.from(document.getElementsByTagName("video")).filter((v)=>{return v.id.indexOf(id) != -1})[0];
                    // console.log('Good to go!');
                    // console.log(myPlayer)
                    // console.log(myPlayer.children_[0]);
                    (<any>window).myPlayer = myPlayer
                    console.log("hit")
                    myPlayer.play()
                    var mat = new BABYLON.StandardMaterial("mat", scene);
                    var videoTexture = new BABYLON.VideoTexture("video", videoElement, scene, undefined, true);
                    mat.diffuseTexture = videoTexture;
                    //mat.emissiveTexture = videoTexture;
                    
                    plane.material = mat;
                    console.log("hit")
                    videoElement.addEventListener('loadeddata', function() {
                        console.log("load")
                        if(videoElement.readyState >= 2) {
                            setTimeout(() => {
                                console.log(videoElement.readyState)
                                console.log("play")
                                console.log(videoEl)
                                myPlayer.play()
                            }, 100);
                        }
                        });
                    
                    
                        // add an event listener
                    this.addEventListener('ended', function() {
                        console.log('Finished!');
                    });
                    
                }
            );
            myPlayer.src([{
                src: "http://samplescdn.origin.mediaservices.windows.net/e0e820ec-f6a2-4ea2-afe3-1eed4e06ab2c/AzureMediaServices_Overview.ism/manifest",
                type: "application/vnd.ms-sstr+xml"
            }]);
            })  
    }
    }

    var video = await VideoLoader.CreateAsync();
}
main();
