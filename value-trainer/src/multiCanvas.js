import {defProp} from "./utils.js"

const COPIEDSTYLEATTRS = ["height", "width", "position", "top", "left"]

function Layer(canvas) {
    defProp(this, "width", () => canvas.width);
    defProp(this, "height", () => canvas.height);
    this.canvas = canvas;
    this.domElem = canvas;
    this.drawables = [];
    this.draw = function() {
	this.drawables.forEach( elem => {
	    elem.draw(canvas)
	});
    }
    this.clear = function() {
	let ctx = this.canvas.getContext("2d");
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.redraw = function() {
	this.clear();
	this.draw();
    }
    this.resize = function(newWidth, newHeight, oldWidth, oldHeight) {
	canvas.style.width = newWidth;
	canvas.style.height = newHeight;
	this.drawables.forEach(drawable =>
			       drawable.resize(newWidth,
					       newHeight,
					       oldWidth,
					       oldHeight));
	this.redraw();
    }
    this.addDrawable = function(drawable) {
	this.drawables.push(drawable);
    }
}

function LayeredCanvas(div) {
    console.log("making ml canvas");
    console.log(div);
    // We create the first canvas and have it fill out the div
    // We save a reference to this canvas because it will be
    // used to create all the other canvases.
    let layer0Canvas = document.createElement("canvas");
    
    // The elem.style attribute of an object doesn't have a value until it is
    // set by javascript itself. To fetch these values when they are set by CSS,
    // we need to use window.getComputedStyle(ELEM).ATTR
    let getDivWidth = () => parseInt(window.getComputedStyle(div).width, 10);
    let getDivHeight = () => parseInt(window.getComputedStyle(div).height, 10);
    layer0Canvas.style.position = "absolute";
    layer0Canvas.style.top = 0;
    layer0Canvas.style.left = 0;
    layer0Canvas.style.zIndex = 0;
    layer0Canvas.style.display = window.getComputedStyle(div, "display");
    layer0Canvas.style.height = getDivHeight();
    layer0Canvas.style.width = getDivWidth();
    layer0Canvas.width = getDivWidth();
    layer0Canvas.height = getDivHeight();
    div.appendChild(layer0Canvas);

    defProp(this, "canvas", () => layer0Canvas);
    defProp(this, "width", () => layer0Canvas.width);
    defProp(this, "height", () => layer0Canvas.height);
    this.layers = [];
    this.draw = () => this.layers.forEach(layer => layer.draw());
    this.clear = () => this.layers.forEach(layer => layer.clear());
    this.redraw = () => this.layers.forEach(layer => layer.redraw());
    this.resize = (width, height) => {
	this.clear();
	let oldWidth = this.width;
	let oldHeight = this.height;
	this.layers.forEach(layer =>
			    layer.resize(width, height, oldWidth, oldHeight));
	this.redraw();
    }
    this.resizeFromDiv = () => {
	this.resize(getDivWidth(), getDivHeight());
    }
    this.newLayer = function() {
	// Make a layer from the base canvas if this is the first layer
	// we are giving out
	let layer;
	if (this.layers.length === 0) {
	    layer = new Layer(layer0Canvas);
	}
	else {
	    let newCanvas = document.createElement("canvas");
	    COPIEDSTYLEATTRS.forEach(attr => {
		newCanvas.style[attr] = layer0Canvas.style[attr];
	    });
	    newCanvas.style.zIndex = this.layers.length;
	    newCanvas.width = this.width;
	    newCanvas.height = this.height;
	    div.appendChild(newCanvas);
	    layer = new Layer(newCanvas);
	}
	this.layers.push(layer);
	return layer;
    }
    // When the window changes, make sure we resize the canvas
    // Some elements may have been produced relative to the canvas's size,
    // so we provide a callback to notify them when the canvas is resizing.
    let onResizeCallbacks = []
    this.onResize = function(callback) {
	onResizeCallbacks.push(callback);
    }
    window.addEventListener("resize",(e) => {
	onResizeCallbacks.forEach((fn) => {
	    fn(getDivWidth(),
	       getDivHeight(),
	       layer0Canvas.width,
	       layer0Canvas.height);
	})
	this.resizeFromDiv();
    });
    this.destory = function() {
	this.layers.forEach( layer => div.removeChild(layer.domElem) );
    }
}

export {LayeredCanvas};
