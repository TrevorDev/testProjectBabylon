import * as twgl from "twgl.js"

export class Object3D {
    private parent: Object3D | null = null;
    name: string = ""
    matrix: twgl.Mat4 = twgl.m4.identity();
    worldMatrix: twgl.Mat4 = twgl.m4.identity();
    constructor(){
    }
}