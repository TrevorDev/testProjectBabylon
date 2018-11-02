// ==UserScript==
// @name         STREAM
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://msit.microsoftstream.com/embed/video/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(()=>{
        var videoEl = document.getElementsByTagName("video")[0]

        var canvas = document.createElement('canvas')
        canvas.width=640
        canvas.height=480
        canvas.style.position="absolute"
        canvas.style.zIndex = 200;
        canvas.style.top = "0px"
        canvas.style.display = "none"
        document.body.appendChild(canvas)

        console.log("STREAM INIT")

        var origin = "*" // This needs to be changed to the trusted domain

        var queryDict = {}
        location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})

        window.parent.postMessage({id:queryDict.sharepointSpcaesId,msg:"connect"},origin);
        window.addEventListener('message', (e)=> {
            if(e.data.msg == "start"){
                canvas.width=e.data.width
                canvas.height=e.data.height
                var frame = ()=>{
                    var ctx = canvas.getContext("2d")
                    ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight, 0, 0, canvas.width, canvas.height)
                    var data = ctx.getImageData(0,0,canvas.width, canvas.height)
                    window.parent.postMessage({id:queryDict.sharepointSpcaesId, msg:"newFrame", data:data.data.buffer},origin, [data.data.buffer])
                    setTimeout(frame, 1000/e.data.fps);
                }
                frame();
            }
        });
}, 1000)
})();