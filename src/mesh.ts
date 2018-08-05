import * as twgl from "twgl.js"
import {Object3D} from "./object3D"
export class Mesh extends Object3D {
    buffers = {
        position: [],
        normal:   [],
        texcoord: [],
        indices:  [],
      };
    constructor(){
        super()
    }
}