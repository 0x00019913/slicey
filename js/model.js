function Model(numSlices) {
  this.triangles = [];
  this.xmin = null;
  this.xmax = null;
  this.ymin = null;
  this.ymax = null;
  this.zmin = null;
  this.zmax = null;
  this.count = 0;
  this.sliceCount = null;
  this.numSlices = numSlices;
}

Model.prototype.add = function(triangle) {
  this.triangles.push(triangle);
  this.count++;
  if (this.count==1) {
    this.xmin = triangle.xmin;
    this.xmax = triangle.xmax;
    this.ymin = triangle.ymin;
    this.ymax = triangle.ymax;
    this.zmin = triangle.zmin;
    this.zmax = triangle.zmax;
  }
  this.xmin = triangle.xmin<this.xmin ? triangle.xmin : this.xmin;
  this.xmax = triangle.xmax>this.xmax ? triangle.xmax : this.xmax;
  this.ymin = triangle.ymin<this.ymin ? triangle.ymin : this.ymin;
  this.ymax = triangle.ymax>this.ymax ? triangle.ymax : this.ymax;
  this.zmin = triangle.zmin<this.zmin ? triangle.zmin : this.zmin;
  this.zmax = triangle.zmax>this.zmax ? triangle.zmax : this.zmax;
}

Model.prototype.getCenter = function() {
  return [
    (this.xmax + this.xmin)/2,
    (this.ymax + this.ymin)/2,
    (this.zmax + this.zmin)/2
  ]
}

Model.prototype.buildSliceLists = function() {
  // slice thickness
  this.delta = (this.ymax-this.ymin)/this.numSlices;
  var slice0 = this.ymin + this.delta/2;
  var slicek = this.ymax - this.delta/2;
  var sliceLists = [];
  // initialize sliceLists
  for (var i=0; i<=this.numSlices; i++) {
    sliceLists[i] = [];
  }
  for (var i=0; i<this.count; i++) {
    var index;
    var triangle = this.triangles[i];
    if (triangle.ymin<slice0) index = 0;
    else if (triangle.ymin>slicek) index = this.numSlices;
    else index = Math.floor((triangle.ymin-slice0)/this.delta) + 1;
    sliceLists[index].push(triangle);
  }

  console.log(sliceLists);
}

/* debugging method - shows full model, unsliced */
Model.prototype.renderPlainModel = function(scene) {
  /* set up camera, put in model */
  var center = model.getCenter();
  cam.origin = new THREE.Vector3(center[0], center[1], center[2]);
  cam.r = 5;
  var geo = new THREE.Geometry();
  for (var i=0; i<model.count; i++) {
    for (j=0; j<3; j++) {
      geo.vertices.push(model.triangles[i].vertices[j]);
    }
    geo.faces.push(new THREE.Face3(i*3, i*3+1, i*3+2));
  }
  var mat = new THREE.MeshPhongMaterial({
    color: new THREE.Color(0xffffff),
    shininess: 0,
    specular: 0
  });
  scene.add(new THREE.Mesh(geo, mat));
  var light = new THREE.PointLight(0xffffff, 50);
  light.position = new THREE.Vector3(center[0], center[1]+5, center[2]);
  scene.add(light);
}
