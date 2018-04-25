import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { DemoArea } from './demoArea';
export class AnimationArea extends DemoArea {
    constructor(public scene){
        super(scene, "Animations");
    }
    async init(){
        var container = await BABYLON.SceneLoader.LoadAssetContainerAsync("http://localhost:5000/public/", "dummy3.babylon", this.scene)
        
        // Add mesh to scene
        container.meshes.forEach((m)=>{
            this.scene.addMesh(m)
        })
        container.meshes[0].rotation.y = Math.PI
        this.root.addChild(container.meshes[0])

        // get animations
        var skeleton = container.skeletons[0];
        var idleRange = skeleton.getAnimationRange("YBot_Idle");
        var walkRange = skeleton.getAnimationRange("YBot_Walk");
        var runRange = skeleton.getAnimationRange("YBot_Run");
        var idleAnim = this.scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 0.0, true);
        var walkAnim = this.scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 0.0, true);
        var runAnim = this.scene.beginWeightedAnimation(skeleton, runRange.from, runRange.to, 1, true);

        var params = [
            {name: "Idle", anim: idleAnim},
            {name: "Walk", anim: walkAnim},
            {name: "Run", anim: runAnim}
        ]
        params.forEach((param)=>{
            var header = new GUI.TextBlock();
            header.text = param.name + ":" + param.anim.weight.toFixed(2);
            header.height = "60px";
            header.color = "white";
            header.fontSize = 40
            header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            header.paddingTop = "10px";
            this.uiPanel.addControl(header); 
            var slider = new GUI.Slider();
            slider.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            slider.minimum = 0;
            slider.maximum = 1;
            slider.color = "white";
            slider.value = param.anim.weight;
            slider.height = "20px";
            slider.width = "205px";
            this.uiPanel.addControl(slider); 
            slider.onValueChangedObservable.add((v)=>{
                param.anim.weight = v;
                header.text = param.name + ":" + param.anim.weight.toFixed(2);
            }) 
            param.anim._slider = slider;
        });
    }
}