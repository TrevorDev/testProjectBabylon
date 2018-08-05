export function createCanvas() {
    // Get rid of margin
    document.documentElement.style["overflow"]="hidden"
    document.documentElement.style.overflow ="hidden"
    document.documentElement.style.width ="100%"
    document.documentElement.style.height ="100%"
    document.documentElement.style.margin ="0"
    document.documentElement.style.padding ="0"
    document.body.style.overflow ="hidden"
    document.body.style.width ="100%"
    document.body.style.height ="100%"
    document.body.style.margin ="0"
    document.body.style.padding ="0"

    // Create canvas html element on webpage
    var canvas = document.createElement('canvas')
    canvas.style.width="100%"
    canvas.style.height="100%"

    //canvas = document.getElementById("renderCanvas")
    document.body.appendChild(canvas)
    return canvas;
}