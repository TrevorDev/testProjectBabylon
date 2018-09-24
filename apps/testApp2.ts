console.log("foobar")

// Super Mario 64 collission
                //     var angleBetweenPlayerUpAndNormal = Math.acos(BABYLON.Vector3.Dot(player.body.up, normal));
                //     if(angleBetweenPlayerUpAndNormal < Math.PI/3){
                //         // floor
                //         var ray = new BABYLON.Ray(player.body.position, player.body.up, 1)
                //         var dist = bmath.rayIntersectsTriangle(ray, verts); // todo use normals 
                //         if(dist){
                //             player.body.position.addInPlace(ray.direction.scaleInPlace(dist))
                            
                //             var amt = BABYLON.Vector3.Dot(player.spd, normal)
                //             if(amt>0){
                //                 var component = normal.scale(amt)
                //                 player.spd.subtractInPlace(component)
                //             }
                            
                //             if(inputDirection.lengthSquared() == 0){
                //                 player.spd.subtractInPlace(player.spd.scale(0.1*delta*100))
                //             }
                //         }
                //     }else if(angleBetweenPlayerUpAndNormal < Math.PI - (Math.PI/3)){
                //         // wall
                //     }else{
                //         // ceiling
                //         var ray = new BABYLON.Ray(player.body.position.add(player.body.up.scale(1.3)), player.body.up.scale(-1), 1.3)
                //         var dist = bmath.rayIntersectsTriangle(ray, verts); // todo use normals 
                //         if(dist){
                //             player.body.position.addInPlace(ray.direction.scaleInPlace(dist))
                            
                //             var amt = BABYLON.Vector3.Dot(player.spd, normal)
                //             //console.log(amt)
                //             if(amt<0){
                //                 var component = normal.scale(amt)
                //                 player.spd.subtractInPlace(component)
                //             }
                            
                //             if(inputDirection.lengthSquared() == 0){
                //                 player.spd.subtractInPlace(player.spd.scale(0.1*delta*100))
                //             }
                //         }
                //     }