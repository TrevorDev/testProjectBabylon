import  merge  from 'lodash/merge';
//import { start } from 'repl';
import io from 'socket.io-client';

const port = 4705;
const socket = io.connect("http://localhost:"+port);
socket.emit('add user', 'test_user');

socket.on('new message', (data) => {
    console.log(data);
});

export interface ChatLogItem {
    left: string | undefined;
    right: string | undefined;
}

/*export class ChatLog {
    private static instance : ChatLog;
    private static chatWindowTextLog = new Map<string, any>();
    private static contextMap = new Map<string, any>();
    private static personaMap = new Map<string, string>();

    private static checkInstance(): boolean{
        return typeof this.instance === 'undefined';
    }

    private add(key: string, value: ChatLogItem | ChatLogItem[]){
        
    }

    private refresh(id: string){

    }

    public static refresh(id: string): boolean {

    }
    
    public static add(key: string, value: ChatLogItem, persona?: string): boolean{

    }

    public static set(key: string, value: ChatLogItem[]){

    }

    public static initilize(): boolean{

    }

    public static setContext(newContext){

    }
}*/

interface ContextConfig {
    Font: string;
    Color: string;
    Alignment: string;
    LineHeight: number;
}

interface Cord {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    text?: string[];
    depth?: number;
    contextConfig?: ContextConfig;
}

export class ChatLogRender {
    private textItemQueue: string[] = [];
    private cordQueue: Cord[] = [];
    private context: any;
    private currentLogY: number;
    private maxHight: number;
    private height: number;
    private width: number;
    private margin: number;
    private texture: any;
    private defaultCfg: ContextConfig = {
        Font: ChatLogRender.Font,
        Color: "orange",
        Alignment: ChatLogRender.Alignment,
        LineHeight: ChatLogRender.LineHeight,
    }
    private static Font: string = "40px arial";
    private static Alignment: string = "left";
    private static LineHeight: number = 50;
    private clientCfgs: {left: ContextConfig, right: ContextConfig} = 
        {
            left: {
                Font: ChatLogRender.Font,
                Color: "Fuchsia",
                Alignment: ChatLogRender.Alignment,
                LineHeight: ChatLogRender.LineHeight,
            },
            right: {
                Font: ChatLogRender.Font,
                Color: "Aqua",
                Alignment: ChatLogRender.Alignment,
                LineHeight: ChatLogRender.LineHeight,
            }
        }
    constructor(height: number, width: number, context: any, texture: any, marginPercent?: number, defaultCfg?: ContextConfig){
        this.height = height;
        this.maxHight = height;
        this.width = width;
        this.context = context;
        this.margin = width * marginPercent;
        this.texture = texture;
        if(defaultCfg){
            this.defaultCfg = defaultCfg;
        }
    }

    private drawText(text: string, x: number, y: number, maxWidth: number, isRefresh: boolean) {
        let context = this.context;
        let words = text.split(' ');
        let line = '';
        let startY = y;
        let lineHeight = this.defaultCfg.LineHeight;

        let textItemQueue: string[] = [];

        for(let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = context.measureText(testLine);
          let testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            if(!isRefresh){
                //add to queue
                textItemQueue.push(line);
            }
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        let tCord;
        if(!isRefresh){
            //add to cord queue
            textItemQueue.push(line);
            tCord = {
                x: x,
                y: startY,
                width: maxWidth,
                height: y,
                depth: (y+lineHeight)-startY,
                text: textItemQueue,
            };
            //this.cordQueue.push();
        }

        this.currentLogY = y+lineHeight;
        context.fillText(line, x, y);

        return tCord;        
    }

    private testFit(text: string){
        let tCord = this.cordQueue[this.cordQueue.length - 1];
        let tContext = this.context
        let { y } = tCord;
        let words = text.split(' ');
        let line = '';
        let startY = y;
        let width = this.width/2;
        let lineHeight = this.defaultCfg.LineHeight;

        for(var n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = tContext.measureText(testLine);
          let testWidth = metrics.width;
          if (testWidth >  width && n > 0) {
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          } 
        }
        y+=lineHeight;

        let depth = y - startY;

        return {canFit: (depth + this.currentLogY <= this.maxHight), estimateDepth: depth};
    }
    private popChat(){
        let cord = this.cordQueue.shift();
        this.deleteChat(cord);
        // scroll up the number of lines within this chat client
        this.scrollUp(Math.ceil(cord.depth/this.defaultCfg.LineHeight));
    }
    private popLine(){
        let cord = this.cordQueue.shift();
        cord = this.deleteLine(cord)
        this.cordQueue.unshift(cord);
        // scrolll up exactly one line unit
        this.scrollUp(1);
    }
    private deleteChat(cord: Cord){
        this.context.clearRect(cord.x, 0, cord.width, cord.height);
        this.currentLogY -= cord.depth;
    }
    private deleteLine(cord: Cord) : Cord{
        let lineHeight = this.defaultCfg.LineHeight;
        this.context.clearRect(cord.x, 0, cord.width, lineHeight);
        cord.text.shift();
        cord.depth -= lineHeight;
        this.currentLogY -= lineHeight;
        return cord;
    }

    private setContext(ctxCfg?: Partial<ContextConfig>) :  ContextConfig{
        let mergedCfg = merge({}, this.defaultCfg, ctxCfg);
        this.context.font = mergedCfg.Font;
        this.context.textAlign = mergedCfg.Alignment;
        this.context.fillStyle = mergedCfg.Color;
        return mergedCfg;
    }

    private scrollUp(lines: number){
        this.context.clearRect(0,0,this.width,this.height);
        let lineHeight = this.defaultCfg.LineHeight*lines;
        for(let i = 1; i < this.cordQueue.length; i++){
            let tmpCord = this.cordQueue[i];
            tmpCord.y -= lineHeight;
            this.cordQueue[i] = tmpCord;
        }
    }

    private selectChannelText(item: ChatLogItem): {channel: string, text: string} | undefined{
        if(item.left){
            return {
                channel: "left",
                text: item.left,
            };
        } else if(item.right){
            return {
                channel: "right",
                text: item.right,
            };
        } else{
            return undefined;
        }
    }

    private selectXCords(item: ChatLogItem): {x: number, maxWidth: number} | undefined{
        if(item.left){
            return {
                x: this.margin,
                maxWidth: this.width/2 + this.margin,
            };
        } else if(item.right){
            return {
                x: this.width/2 - this.margin,
                maxWidth: this.width/2 - this.margin,
            };
        } else{
            return undefined;
        }
    }

    private append(item: ChatLogItem){
        let channelInfo = this.selectChannelText(item);
        if(channelInfo){
            let testText = this.testFit(channelInfo.text);
            // if we are out of scope, we need to move everything down
            if(!testText.canFit){
                while(!testText.canFit){
                    let depthNeeded = (testText.estimateDepth + this.currentLogY) - this.maxHight;
                    let cord = this.cordQueue[this.cordQueue.length - 1];
                    if(depthNeeded > cord.depth && depthNeeded < this.defaultCfg.LineHeight){
                        this.popChat();
                    } else {
                        this.popLine();
                    }
                    testText = this.testFit(channelInfo.text);
                }
                this.refresh();
            }

            //now add the chat new item
            let newCtx = this.setContext(this.clientCfgs[channelInfo.channel]);
            let cord = this.cordQueue[this.cordQueue.length - 1];
            let computedWidth =  this.selectXCords(item);
            let newCord = this.drawText(channelInfo.text,computedWidth.x, this.currentLogY, computedWidth.maxWidth, false);
            //this.currentLogY+=this.defaultCfg.LineHeight;
            newCord.contextConfig = newCtx;
            this.cordQueue.push(newCord);
            
        }
    }

    private refresh(){
        for(let i = 0; i < this.cordQueue.length; i++){
            let cord = this.cordQueue[i];
            this.setContext(cord.contextConfig);
            this.drawText(cord.text.join(' '), cord.x, cord.y, cord.width, true);
        }
    }

    public push(item: ChatLogItem){
        let channelInfo = this.selectChannelText(item);
        if(channelInfo){
            if(!this.currentLogY){
                let newCtx = this.setContext(this.clientCfgs[channelInfo.channel]);
                let newXInfo = this.selectXCords(item);
                let newCord = this.drawText(channelInfo.text, newXInfo.x, this.margin, newXInfo.maxWidth, false);
                newCord.contextConfig = newCtx;
                this.cordQueue.push(newCord);
            } else{
                this.append(item);
            }
            this.texture.update();
        }
    } 
 

    /*private transform(oldCord: Cord, currCord: Cord): Cord {
        let newDepth = oldCord.depth - currCord.depth;
        let needDepth = ((newDepth < 0 && newDepth+this.defaultCfg.LineHeight < 0)  || 
                            (newDepth > 0 && newDepth-this.defaultCfg.LineHeight >0));

        if(needDepth){
            let tDepth = newDepth;
            let check = (tDepth) => { return (newDepth < 0) ?
                (tDepth < 0 && tDepth+this.defaultCfg.LineHeight < 0) :
                (tDepth > 0 && tDepth-this.defaultCfg.LineHeight > 0);
            }

            do{
                if(newDepth>0){
                    tDepth-this.defaultCfg.LineHeight;
                } else {
                    tDepth+this.defaultCfg.LineHeight;
                }

            }while(check(tDepth));

            newDepth = tDepth;
        }
        if(newDepth<0) {
            let gap = newDepth+this.defaultCfg.LineHeight;
            oldCord.y = newDepth-gap;
            oldCord.depth = currCord.depth;
        } else if(newDepth > 0) {
            let gap = newDepth-this.defaultCfg.LineHeight;
            oldCord.y = newDepth+gap;
            oldCord.depth = currCord.depth;
        } else{
            oldCord.depth = currCord.depth;
            oldCord.y = newDepth;
        }

        return oldCord;
    }
    public init(text: ChatLogItem, ctxCfg: ContextConfig | undefined = this.defaultCfg) {
        if(this.textItemQueue&&this.cordQueue){
            this.push(text, ctxCfg);
        }
    } */

    /*public init(text: ChatLogItem, ctxCfg: ContextConfig | undefined = this.defaultCfg) {
        if(this.textItemQueue&&this.cordQueue){
            this.push(text, ctxCfg);
        }
    }

    public push(item: ChatLogItem, ctxCfg: ContextConfig){
        if(this.maxHight>=this.currentLogY){
            
        } else{

        }

    }*/
    /*public clear(){

    }*/

}