var model = new Model();

var handleFile = function(file) {
  fr = new FileReader();
  fr.onload = function() {
    parseArray(fr.result);
  };
  fr.readAsArrayBuffer(file);
};

var parseArray = function(array) {
  var numSlices = document.getElementById('numSlices').value;
  if (!numSlices) {
    document.getElementById('numSlices').value = "30";
    numSlices = 30;
  }
  model.numSlices = parseInt(numSlices);

  // mimicking http://tonylukasavage.com/blog/2013/04/10/web-based-stl-viewing-three-dot-js/
  var dv = new DataView(array, 80);
  var isLittleEndian = true;

  var offset = 16;
  var n = dv.getUint32(0, isLittleEndian);
  for (var tri=0; tri<n; tri++) {
    var triangle = new Triangle();
    for (var vert=0; vert<3; vert++) {
      var vector = new THREE.Vector3(
        dv.getFloat32(offset, isLittleEndian),
        dv.getFloat32(offset+4, isLittleEndian),
        dv.getFloat32(offset+8, isLittleEndian)
      );
      offset += 12;
      triangle.add(vector);
    }
    // ignore "attribute byte count" (2 bytes) plus 12 bytes for next normal
    offset += 14;
    model.add(triangle);
  }

  model.renderLineModel(scene);
};


/* SETUP FOR THE WEBGL VIEWPORT AND CAM CONTROLS, NOTHING INTERESTING HERE */

var container;
var camera, scene, renderer;
var mouseX = 0, mouseY = 0, mouseXprev, mouseYprev, dX, dY;
var width, height;

var mouseButton = -1;

init();
animate();

function init() {
  container = document.getElementById('container');
  height = container.offsetHeight;
  width = container.offsetWidth;

  camera = new THREE.PerspectiveCamera(45, height/width, .1, 100000);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x999999);

  positionCamera(camera);

  /* RENDER */
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  addEventListeners();
}

function addEventListeners() {
  document.body.addEventListener('mousemove', onMousemove, false);
  document.body.addEventListener('mousedown', onMouseDown, false);
  document.body.addEventListener('mouseup', onMouseUp, false);
  document.body.addEventListener('mouseenter', onMouseEnter, false);
  document.body.addEventListener('mousewheel', onMousewheel, false);
  document.body.addEventListener('DOMMouseScroll', onMousewheel, false); //Firefox
  window.addEventListener('resize', onWindowResize, false);
}

function onMousemove (e) {
  mouseXprev = mouseX;
  mouseYprev = mouseY;
  mouseX = (e.clientX / width) * 2 - 1;
  mouseY = (e.clientY / height) * 2 - 1;
  dX = mouseX-mouseXprev;
  dY = mouseY-mouseYprev;

  if (mouseButton==0) { // LMB
    handleLMB(dX, dY);
  }

  if (mouseButton==1) { // MMB
    handleMMB(dX, dY);
  }
}

function onMousewheel(e) {
  var d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):(e.detail));
  handleWheel(d);
}

function onMouseDown(e) { mouseButton = e.button; }
function onMouseUp(e) { mouseButton = -1; }
function onMouseEnter(e) { mouseButton = -1; }

function onWindowResize() {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (!camera || !scene) return;
  positionCamera(camera);
  renderer.render(scene, camera);
}
