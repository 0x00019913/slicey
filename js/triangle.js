function Triangle() {
  this.vertices = [];
  this.xmin = null;
  this.xmax = null;
  this.ymin = null;
  this.ymax = null;
  this.zmin = null;
  this.zmax = null;
  this.count = 0;
}

Triangle.prototype.add = function(vertex) {
  if (this.count>=3) {
    console.log("ERROR: tried to push a fourth vertex onto a triangle");
    return;
  }
  this.vertices.push(vertex);
  this.count++;
  if (this.count==1) {
    this.xmin = vertex.x;
    this.xmax = vertex.x;
    this.ymin = vertex.y;
    this.ymax = vertex.y;
    this.zmin = vertex.z;
    this.zmax = vertex.z;
  }
  else {
    this.xmin = vertex.x<this.xmin ? vertex.x : this.xmin;
    this.xmax = vertex.x>this.xmax ? vertex.x : this.xmax;
    this.ymin = vertex.y<this.ymin ? vertex.y : this.ymin;
    this.ymax = vertex.y>this.ymax ? vertex.y : this.ymax;
    this.zmin = vertex.z<this.zmin ? vertex.z : this.zmin;
    this.zmax = vertex.z>this.zmax ? vertex.z : this.zmax;
  }
};
