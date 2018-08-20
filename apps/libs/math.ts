export default {
    forEachFace:(mesh:BABYLON.Mesh, fn:(v:Array<BABYLON.Vector3>, n:BABYLON.Vector3)=>void)=>{
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
    },
    rayIntersectsTriangle:(ray:BABYLON.Ray, tri:Array<BABYLON.Vector3>)=>{ //, normal?:BABYLON.Vector3) => {

        var diff = new BABYLON.Vector3();
        var edge1 = new BABYLON.Vector3();
        var edge2 = new BABYLON.Vector3();
    
        tri[1].subtractToRef(tri[0], edge2)
        tri[2].subtractToRef(tri[0], edge1)
        
        // TODO use real normal (currently the scaling/direction is not correct for some reason)
        //if(!normal){
        var normal = new BABYLON.Vector3();
        
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
}