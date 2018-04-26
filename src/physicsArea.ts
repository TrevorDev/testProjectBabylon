import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { DemoArea } from './demoArea';
export class PhysicsArea extends DemoArea {
    constructor(public scene:BABYLON.Scene, public vrExperienceHelper:BABYLON.VRExperienceHelper){
        super(scene, "Physics");
        this.scene.enablePhysics(new BABYLON.Vector3(0,0,0), new BABYLON.CannonJSPlugin())
        var ball = BABYLON.Mesh.CreateSphere("", 10, 0.1, this.scene);
        var startPos = new BABYLON.Vector3(3, 1.6, 3)
        ball.position.set(startPos.x,startPos.y,startPos.z)
        ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.8 }, this.scene);

        // Create hands
        var leftHand = BABYLON.Mesh.CreateBox("",0.1, this.scene)
        leftHand.scaling.z = 1;
        leftHand.physicsImpostor = new BABYLON.PhysicsImpostor(leftHand, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);
        var rightHand = leftHand.clone("", null, null, false)
        rightHand.physicsImpostor = new BABYLON.PhysicsImpostor(rightHand, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);

        var rotateMatrix = new BABYLON.Matrix()
        var tempVector = new BABYLON.Vector3(0,0,0)
        // Logic to be run every frame
        this.scene.onBeforeRenderObservable.add(()=>{
            // Left and right hand position/rotation
            var controllers = [this.vrExperienceHelper.webVRCamera.leftController, this.vrExperienceHelper.webVRCamera.rightController]
            var meshes = [leftHand, rightHand]
            var indexes= [0,1]
            indexes.forEach((i)=>{
                if(controllers[i]){
                    // Set hand to controller position
                    meshes[i].position = controllers[i].devicePosition.clone()
                    meshes[i].rotationQuaternion = controllers[i].deviceRotationQuaternion.clone()

                    if(meshes[i].position.subtract(ball.position).length() < 0.5){
                        meshes[i].isVisible=true
                    }else{
                        meshes[i].isVisible = false
                    }
                    
                    // Set angular/linear velocity to let physics engine know the hands are moving
                    // Note: These values need to be rotated if the webVRCamera is rotated
                    var angVel = controllers[i].rawPose.angularVelocity;
                    var linVel = controllers[i].rawPose.linearVelocity;
                    this.vrExperienceHelper.webVRCamera.rotationQuaternion.toRotationMatrix(rotateMatrix)
                    if(angVel){
                        BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(angVel[0], angVel[1], -angVel[2], rotateMatrix, tempVector)
                        meshes[i].physicsImpostor.setAngularVelocity(tempVector)
                    }
                    if(linVel){
                        BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(linVel[0], linVel[1], -linVel[2], rotateMatrix, tempVector)
                        meshes[i].physicsImpostor.setLinearVelocity(tempVector)
                    }
                }
            })

            // Move back to center
            var towardsStart = startPos.subtract(ball.position)
            towardsStart.scaleInPlace(15)
            ball.physicsImpostor.applyForce(towardsStart, ball.position)
            ball.physicsImpostor.setLinearVelocity(ball.physicsImpostor.getLinearVelocity().scale(0.9))
        })
    }
    async init(){
        
    }
}