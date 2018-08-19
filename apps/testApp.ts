import * as BABYLON from 'babylonjs'

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

var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
camera.setTarget(BABYLON.Vector3.Zero())
camera.attachControl(canvas, true)
var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
light.intensity = 0.7

class Player {
    spd = new BABYLON.Vector3()
    body:BABYLON.Mesh
    constructor(scene:BABYLON.Scene){
        this.body = new BABYLON.Mesh("", scene)
        var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene)
        sphere.position.y=1
        this.body.addChild(sphere);
        this.body.position.y = 2
    }
}

var forEachFace = (mesh:BABYLON.Mesh, fn:(v:Array<BABYLON.Vector3>, n:BABYLON.Vector3)=>void)=>{
    var ind = mesh.getIndices()
    var vertData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
    mesh.computeWorldMatrix()
    var normals = mesh.getFacetLocalNormals();
    var faceCount = ind.length/3
    var verts = []
    verts.push(new BABYLON.Vector3())
    verts.push(new BABYLON.Vector3())
    verts.push(new BABYLON.Vector3())
    var normal = new BABYLON.Vector3()
    for(var i =0;i<faceCount;i++){
        for(var point = 0;point<3;point++){
            var v = verts[point]
            v.x = vertData[(ind[(i*3)+point]*3)+0]
            v.y = vertData[(ind[(i*3)+point]*3)+1]
            v.z = vertData[(ind[(i*3)+point]*3)+2]
            BABYLON.Vector3.TransformCoordinatesToRef(v, mesh.computeWorldMatrix(), v);
        }
        BABYLON.Vector3.TransformCoordinatesToRef(normals[i], mesh.computeWorldMatrix().getRotationMatrix(), normal);
        fn(verts, normal)
    }
}



var rayIntersectsTriangle = (ray:BABYLON.Ray, tri:Array<BABYLON.Vector3>, normal?:BABYLON.Vector3) => {

    var diff = new BABYLON.Vector3();
    var edge1 = new BABYLON.Vector3();
    var edge2 = new BABYLON.Vector3();

    tri[1].subtractToRef(tri[0], edge1)
    tri[2].subtractToRef(tri[0], edge2)
    //if(!normal){
        normal = new BABYLON.Vector3();
        
        BABYLON.Vector3.CrossToRef(edge1, edge2, normal)
        
    //}
    
    var DdN = BABYLON.Vector3.Dot(ray.direction, normal)
    
    
    var sign;

    if ( DdN > 0 ) {

        //if ( backfaceCulling ) return null;
        sign = 1;

    } else if ( DdN < 0 ) {

        sign = - 1;
        DdN = - DdN;

    } else {

        return null;

    }
    
    ray.origin.subtractToRef(tri[0], diff)
    BABYLON.Vector3.CrossToRef(diff, edge2, edge2)
    var DdQxE2 = sign * BABYLON.Vector3.Dot(ray.direction, edge2 );
    //console.log(DdQxE2)
    // b1 < 0, no intersection
    if ( DdQxE2 < 0 ) {
        
        return null;
    }

    BABYLON.Vector3.CrossToRef(edge1, diff, edge1)
    var DdE1xQ = sign * BABYLON.Vector3.Dot(ray.direction,  edge1);
    
    // b2 < 0, no intersection
    if ( DdE1xQ < 0 ) {

        return null;

    }

    // b1+b2 > 1, no intersection
    if ( DdQxE2 + DdE1xQ > DdN ) {

        return null;

    }

    // Line intersects triangle, check if ray does.
    var QdN = - sign * BABYLON.Vector3.Dot(diff, normal);

    // t < 0, no intersection
    if ( QdN < 0 ) {
        
        return null;

    }

    var rayDist = QdN / DdN;
    if(rayDist < ray.length && rayDist > 0){
         // Ray intersects triangle.
        return rayDist
    }else{
        return null
    }
   

}

var player = new Player(scene)

var colliders = new Array<BABYLON.Mesh>()
for(var i=0;i<3;i++){
    var ground = BABYLON.MeshBuilder.CreatePlane("", {size:6,sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene)
    ground.rotation.x = Math.PI/2
    ground.material = new BABYLON.StandardMaterial("", scene)
    ground.material.wireframe=true
    ground.position.z+=6*i
    ground.position.y+=i
    colliders.push(ground)
}


// forEachFace(ground, (verts, normal)=>{
//     console.log("face")
//     verts.forEach((v)=>{
//         console.log(v)
//     })
//     console.log(normal)
// })


player.body.position.x=2
var physicsSteps = 4;
scene.onBeforeRenderObservable.add(()=>{
    var delta = scene.getEngine().getDeltaTime()/1000
    if(delta > 0.4){
        return;
    }
    player.spd.y += -9.8*delta
    player.body.position.addInPlace(player.spd.scale(delta))

    colliders.forEach((collider)=>{
        forEachFace(collider, (verts, normal)=>{
            //console.log(normal)
            var ray = new BABYLON.Ray(player.body.position, BABYLON.Vector3.Up(), 1)
            var dist = rayIntersectsTriangle(ray, verts, normal);
            if(dist){
                player.body.position.addInPlace(ray.direction.scaleInPlace(dist))
                
                var component = normal.scale(BABYLON.Vector3.Dot(player.spd, normal))
                player.spd.subtractInPlace(component)
                // player.body.position.subtractInPlace(player.spd.scale(delta)) // remove this
                // player.spd.scaleInPlace(-1)
                // console.log("hit")
            }
        })
    })
})


document.onkeydown=(e)=>{
    if(e.key == "w"){
        player.spd.z += 1;
    }
    if(e.key == "a"){
        player.spd.x -= 1;
    }
    if(e.key == "s"){
        player.spd.z -= 1;
    }
    if(e.key == "d"){
        player.spd.x += 1;
    }
    if(e.key == "c"){
        player.spd.y += 10;
    }
    if(e.key == "r"){
        colliders[0].rotation.x+=0.1
    }
    if(e.key == "t"){
        colliders[0].rotation.x-=0.1
    }
    if(e.key == "y"){
        colliders[0].position.y+=0.1
    }
}