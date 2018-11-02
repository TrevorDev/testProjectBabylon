import * as BABYLON from 'babylonjs'

class StreamVideo {
    videoMaterial:BABYLON.StandardMaterial;
    videoTexture:BABYLON.DynamicTexture;
    iframe:HTMLIFrameElement
    msgHandle:any;
    videoCanvas:HTMLCanvasElement;
    constructor(scene:BABYLON.Scene, vidCode:string, width:number, height:number, fps:number){
        this.videoCanvas = document.createElement('canvas')
        this.videoCanvas.width = width;
        this.videoCanvas.height = height;
        this.videoCanvas.style.display = "none"
        document.body.appendChild(this.videoCanvas)
    
        this.iframe = document.createElement('iframe');
        var spsId = Math.random();
        this.iframe.src = "https://msit.microsoftstream.com/embed/video/"+vidCode+"?autoplay=true&showinfo=true&sharepointSpcaesId="+spsId
        this.iframe.style.display = "none";
        document.body.appendChild(this.iframe)
    
    
        this.videoMaterial = new BABYLON.StandardMaterial("mat", scene);
        this.videoTexture = new BABYLON.DynamicTexture("name", this.videoCanvas, scene, false);
        this.videoMaterial.diffuseTexture = this.videoTexture;
        // document.onkeydown = () => {
        //     this.videoTexture.update(false);
        //     console.log("update")
        // }
        
        var imgData:Uint8ClampedArray;
        this.msgHandle = (e:any)=> {
            //console.log("msg RECEIVED")
            
            if(e.data.id == spsId){
                if(e.data.msg=="connect"){
                    console.log("START SENT")
                    this.iframe.contentWindow.postMessage({msg:"start", width: width, height: height, fps: fps},"*")
                }else{
                    //console.log("hit")
                    var ctx2 = this.videoCanvas.getContext("2d")
                    var img = ctx2.createImageData(this.videoCanvas.width, this.videoCanvas.height)
                    //if(!imgData){
                        imgData = new Uint8ClampedArray(e.data.data)
                    // }else{
                    //     imgData.set(e.data.data);
                    // }
                    img.data.set(imgData);
                    ctx2.putImageData(img, 0, 0)
                    this.videoTexture.update(false);
                }
            }
        }
        window.addEventListener('message', this.msgHandle, false);
    }

    dispose(){
        window.removeEventListener('message', this.msgHandle, false)
        document.body.removeChild(this.iframe)
        document.body.removeChild(this.videoCanvas)
        this.videoMaterial.dispose();
        this.videoTexture.dispose();
    }
}

class Bullet {
    spd = new BABYLON.Vector3();
    constructor(public mesh:BABYLON.Mesh){
        mesh.isPickable = false;
    }
}

var main = async () => {

    // INITIALIZE BABYLON ----------------------------------------------------------------------------------------------------------------------------------
    // Get rid of margin
    document.documentElement.style["overflow"] = "hidden"
    document.documentElement.style.overflow = "hidden"
    document.documentElement.style.width = "100%"
    document.documentElement.style.height = "100%"
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.body.style.overflow = "hidden"
    document.body.style.width = "100%"
    document.body.style.height = "100%"
    document.body.style.margin = "0"
    document.body.style.padding = "0"

    // Create canvas html element on webpage
    var canvas = document.createElement('canvas')
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    document.body.appendChild(canvas)

    // Initialize Babylon scene and engine
    var engine = new BABYLON.Engine(canvas, true, { stencil: true, disableWebGL2Support: false, preserveDrawingBuffer: true })
    engine.enableOfflineSupport = false
    var scene = new BABYLON.Scene(engine)
    engine.runRenderLoop(() => {
        scene.render()
    })
    window.addEventListener("resize", () => {
        engine.resize()
    })

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 3, -4), scene)
    //camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, true)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = 0.7


    // var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
    // sphere.position.y = 1

    // var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 1, scene)
    // ground.material = new BABYLON.StandardMaterial("", scene)

    // var plane = BABYLON.Mesh.CreatePlane("plane1", 8, scene);
    // plane.scaling.x = 1920/1080; // set aspect ratio

    // Curved screen ----------------------------------------------------------------------------------------------------------------------------------
    var pathArray: any = [];
    var sphereRadius = 5;
    var width = 0.16 * 4;
    var height = 0.09 * 4;
    var widthPoints = 20;
    var heightPoints = 20;
    var rot = new BABYLON.Vector3();
    for (var y = 0; y < widthPoints; y++) {
        pathArray[y] = [];
        for (var x = 0; x < heightPoints; x++) {
            rot.set(y * Math.PI * height / (heightPoints - 1), x * Math.PI * width / (widthPoints - 1), 0);
            rot.addInPlace(new BABYLON.Vector3(-Math.PI * height / 2, -Math.PI * width / 2, 0))
            var forward = new BABYLON.Vector3(0, 0, sphereRadius);
            forward.rotateByQuaternionToRef(BABYLON.Quaternion.FromEulerVector(rot), forward);
            //forward.rotateByQuaternionToRef(BABYLON.Quaternion.FromEulerAngles(-Math.PI*height/2,-Math.PI*width/2,0),forward);
            forward.y += 3
            forward.z -= 3
            pathArray[y][x] = forward
        }
    }
    var plane = BABYLON.MeshBuilder.CreateRibbon("ribbon", { pathArray }, scene);
    plane.position.y+=2

    var ids = ["94c502ef-03dc-411b-beec-6b81ef132482", "c44a1b8c-b663-4955-acbe-5092d1bdc5f0", "e79f519d-f087-490b-9904-d9c8f551dec9"]

    // Create external video texture  ----------------------------------------------------------------------------------------------------------------------------------
    var externalVideo:StreamVideo;
    // var externalVideo = new StreamVideo(scene, ids[2], 1280, 720, 60)//, 1280, 720);
    // plane.material = externalVideo.videoMaterial;

    document.onkeydown = (e)=>{
        if(e.key == "a"){
            console.log("dispose")
            externalVideo.dispose();
        }
    }

    for(let i = 0;i<3;i++){
        let sphere = BABYLON.Mesh.CreateIcoSphere("sphere", {radius:0.2, flat:true, subdivisions: 1}, scene);
        sphere.name = "clickSphere"
        sphere.position.y = 1;
        sphere.position.x += i-1
        sphere.material = new BABYLON.StandardMaterial("sphere material",scene)
        if(i==0){
            (sphere.material as any).diffuseColor.copyFrom(BABYLON.Color3.FromHexString("#27ae60"));
        }else if(i==1){
            (sphere.material as any).diffuseColor.copyFrom(BABYLON.Color3.FromHexString("#2980b9"));
        }else{
            (sphere.material as any).diffuseColor.copyFrom(BABYLON.Color3.FromHexString("#f39c12"));
        }
        
        scene.onPointerObservable.add((e)=>{
            if(e.type == BABYLON.PointerEventTypes.POINTERDOWN && e.pickInfo.pickedMesh == sphere){
                if(externalVideo){
                    externalVideo.dispose();
                }                
                externalVideo = new StreamVideo(scene, ids[i], 1280, 720, 60)//, 1280, 720);
                plane.material = externalVideo.videoMaterial;
            }
            if(e.type == BABYLON.PointerEventTypes.POINTERMOVE){
                var m = scene.pickWithRay(e.pickInfo.ray)
                console.log(m)
                if(m.pickedMesh != sphere){
                    //console.log("hit")
                    if(i==0){
                        (sphere.material as any).diffuseColor.copyFrom(BABYLON.Color3.FromHexString("#27ae60"));
                    }else if(i==1){
                        (sphere.material as any).diffuseColor.copyFrom(BABYLON.Color3.FromHexString("#2980b9"));
                    }else{
                        (sphere.material as any).diffuseColor.copyFrom(BABYLON.Color3.FromHexString("#f39c12"));
                    }
                }else{
                    (sphere.material as any).diffuseColor.copyFrom(BABYLON.Color3.FromHexString("#FFFFFF"))
                }
                
            }
        })
    }

    var environment = scene.createDefaultEnvironment({ enableGroundShadow: true, groundYBias: 1 });
    environment.skybox.isPickable = false;
    environment.setMainColor(BABYLON.Color3.FromHexString("#b27165"))
    scene.createDefaultVRExperience({floorMeshes:[]});

    var bulletPool:Array<Bullet> = []
    var bulletPoolIndex = 0;
    for(var i = 0;i<10;i++){
        var bullet = new Bullet(BABYLON.Mesh.CreateSphere("", 10, 0.3, scene));
        bullet.mesh.position.y = -100000000;
        bullet.mesh.material = new BABYLON.StandardMaterial("", scene);
        (bullet.mesh.material as BABYLON.StandardMaterial).diffuseTexture = new BABYLON.Texture("/public/like2.png", scene)
        bulletPool.push(bullet)
    }

    scene.onPointerObservable.add((e)=>{
        if(e.type == BABYLON.PointerEventTypes.POINTERDOWN && (!e.pickInfo.pickedMesh || e.pickInfo.pickedMesh.name != "clickSphere")){
            bulletPool[bulletPoolIndex].mesh.position = e.pickInfo.ray.origin;
            bulletPool[bulletPoolIndex].spd = e.pickInfo.ray.direction.scale(10);
            bulletPoolIndex = ++bulletPoolIndex % bulletPool.length;
        }
    });
    var grav = new BABYLON.Vector3(0,-9.8, 0)
    scene.onBeforeRenderObservable.add(()=>{
        var deltaTime = engine.getDeltaTime()/1000
        bulletPool.forEach((b)=>{
            b.spd.addInPlace(grav.scale(deltaTime))
            b.mesh.position.addInPlace(b.spd.scale(deltaTime))
        })
    })
    
}
main();
