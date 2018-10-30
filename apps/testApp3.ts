// console.log("foobar2")

// var iframeEl = document.createElement('iframe');
// iframeEl.src = "http://localhost:3000/?app=testApp2"
// document.body.appendChild(iframeEl)

var canvas = document.createElement('canvas')
canvas.style.width="300px"
canvas.style.height="136px"
document.body.appendChild(canvas)

window.addEventListener('message', function(e) {
    console.log("hit")
    var ctx2 = canvas.getContext("2d")
    var img = ctx2.createImageData(canvas.width, canvas.height)
    var imgData = new Uint8ClampedArray(e.data.data)
    img.data.set(imgData);
    ctx2.putImageData(img,0,0)
}, false);


// window.addEventListener('message', function(e) {
//     console.log("hit")
// }, false);

window.open("https://msit.microsoftstream.com/video/c44a1b8c-b663-4955-acbe-5092d1bdc5f0?list=trending")