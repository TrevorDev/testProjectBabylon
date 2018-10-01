import { Vector3 } from "babylonjs";

var verts = [new BABYLON.Vector3(),new BABYLON.Vector3(),new BABYLON.Vector3()]
var normal = new BABYLON.Vector3()
export default {
    /**
     * Currently has a hack to calculate the correct normals for -z scale for gltf loader quirk
     */
    forEachFace:(mesh:BABYLON.Mesh, fn:(v:Array<BABYLON.Vector3>, n:BABYLON.Vector3)=>void)=>{
        var ind = mesh.getIndices()
        var vertData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
        mesh.computeWorldMatrix()
        var normals = mesh.getFacetLocalNormals();
        var faceCount = ind.length/3
        for(var i =0;i<faceCount;i++){
            for(var point = 0;point<3;point++){
                var v = verts[point]
                v.x = vertData[(ind[(i*3)+point]*3)+0]
                v.y = vertData[(ind[(i*3)+point]*3)+1]
                v.z = vertData[(ind[(i*3)+point]*3)+2]
                BABYLON.Vector3.TransformCoordinatesToRef(v, mesh.computeWorldMatrix(), v);
            }
            normal.copyFrom(normals[i])
            // handle -z scale
            // TODO recurse this
            if(mesh.parent && (<any>mesh.parent).scaling.z < 0 || (mesh.parent && mesh.parent.parent && (<any>mesh.parent.parent).scaling.z < 0)){
                normal.x *= -1
                normal.z *= -1
            }
            mesh.computeWorldMatrix().getRotationMatrixToRef(BABYLON.Tmp.Matrix[0])
            BABYLON.Vector3.TransformCoordinatesToRef(normal, BABYLON.Tmp.Matrix[0], normal)
            
            fn(verts, normal)
        }
    },
    /**
     * Checks if ray hits a triangle
     * @returns number between 0-1 for ratio of ray distance away the hit occured (eg. for ray of length 20, if this returned 0.5 the collision was 10 away)
     */
    rayIntersectsTriangle:(ray:BABYLON.Ray, tri:Array<BABYLON.Vector3>, normal?:BABYLON.Vector3):BABYLON.Nullable<number>=>{
        // See https://github.com/TrevorDev/outLine/blob/master/public/custom/moreSpace/collision.js
        //when line collides with plane:
        //from + x*line = face.a + y*planeX + z*planeY
        //x*line + y*-planeX + z*-planeY = face.a - from
        //x y z = right
        
        if(normal){
            ray.direction.normalizeToRef(BABYLON.Tmp.Vector3[0])
            var dot = BABYLON.Vector3.Dot(normal.normalize(), BABYLON.Tmp.Vector3[0])
            if(dot > 0){
                return null;
            }
        }    

        var direction = ray.direction;
        var originToPlaneMainPoint = BABYLON.Tmp.Vector3[0]
        var planeX = BABYLON.Tmp.Vector3[1]
        var planeY = BABYLON.Tmp.Vector3[2]

        tri[0].subtractToRef(ray.origin, originToPlaneMainPoint)
        tri[0].subtractToRef(tri[1], planeX)
        tri[0].subtractToRef(tri[2], planeY)

        // 3 equations 3 unknowns solve
        var det = direction.x*((planeX.y*planeY.z)-(planeX.z*planeY.y)) - planeX.x*((direction.y*planeY.z)-(direction.z*planeY.y)) + planeY.x*((direction.y*planeX.z)-(direction.z*planeX.y));
        var detX = originToPlaneMainPoint.x*((planeX.y*planeY.z)-(planeX.z*planeY.y)) - planeX.x*((originToPlaneMainPoint.y*planeY.z)-(originToPlaneMainPoint.z*planeY.y)) + planeY.x*((originToPlaneMainPoint.y*planeX.z)-(originToPlaneMainPoint.z*planeX.y));
        var detY = direction.x*((originToPlaneMainPoint.y*planeY.z)-(originToPlaneMainPoint.z*planeY.y)) - originToPlaneMainPoint.x*((direction.y*planeY.z)-(direction.z*planeY.y)) + planeY.x*((direction.y*originToPlaneMainPoint.z)-(direction.z*originToPlaneMainPoint.y));
        var detZ = direction.x*((planeX.y*originToPlaneMainPoint.z)-(planeX.z*originToPlaneMainPoint.y)) - planeX.x*((direction.y*originToPlaneMainPoint.z)-(direction.z*originToPlaneMainPoint.y)) + originToPlaneMainPoint.x*((direction.y*planeX.z)-(direction.z*planeX.y));
        
        if(det!=0){
            var x = detX/det;
            var y = detY/det;
            var z = detZ/det;

            // If inifinite plane needs support
            // if(infiniteLength || (x>=0&&x<=1&&y>=0&&y<=1&&z>=0&&z<=1&&(y+z)<=1)){
            if((x>=0&&x<=1&&y>=0&&y<=1&&z>=0&&z<=1&&(y+z)<=1)){ 
                return x;
            }
        }
        return null;
        
    },
    projectVectorOnPlaneToRef:(vec:BABYLON.Vector3, planeNormal:BABYLON.Vector3, vecOut:BABYLON.Vector3)=>{
        planeNormal.scaleToRef(Vector3.Dot(planeNormal, vec), BABYLON.Tmp.Vector3[0])
        vec.subtractToRef(BABYLON.Tmp.Vector3[0], vecOut)
    },
    rotateVectorByQuaternionToRef:(vec:BABYLON.Vector3, quaternion:BABYLON.Quaternion, vecOut:BABYLON.Vector3)=>{
        quaternion.toRotationMatrix(BABYLON.Tmp.Matrix[0])
        BABYLON.Vector3.TransformCoordinatesToRef(vec, BABYLON.Tmp.Matrix[0], vecOut)
    },
    directionConstants: {
        FORWARD: BABYLON.Vector3.Forward(),
        BACKWARD: BABYLON.Vector3.Forward().scale(-1),
        LEFT: BABYLON.Vector3.Right().scale(-1),
        RIGHT: BABYLON.Vector3.Right()
    }
    
}