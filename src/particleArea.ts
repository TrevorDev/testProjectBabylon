import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { DemoArea } from './demoArea';
export class ParticleArea extends DemoArea {
    constructor(public scene){
        super(scene, "Particless");
    }
    async init(){
        var fountain = BABYLON.Mesh.CreateBox("foutain", 0.1, this.scene);
        fountain.visibility = 0.1;
        var particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity:10000 }, this.scene);
        particleSystem.activeParticleCount = 1000;
        particleSystem.emitRate = 1000;
        particleSystem.particleEmitterType = new BABYLON.SphereParticleEmitter(1);
        particleSystem.particleTexture = new BABYLON.Texture("http://localhost:5000/public/flare.png", this.scene);
        particleSystem.maxLifeTime = 10;
        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.1;
        particleSystem.emitter = fountain;
        particleSystem.start();
        this.root.addChild(fountain)
    }
}