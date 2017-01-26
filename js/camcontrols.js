// Free Cam
// Characterized by:
//  origin
//  radial distance r (from origin)
//  angles theta (0-pi), phi (0-2pi)
// Angles signify rotation about origin.
// Origin can move by panning with MMB. Rotate w/ LMB. Camera always
// looks at origin.
var FreeCam = 0;
// Cyl Cam - moves on the surface of a cylinder and pivots around that point
// Characterized by:
//  radius of rail r
//  angle around rail phi
//  z (vertical displacement of rail, may not use)
//  origin pivot params or, otheta, ophi (around camera's location on rail)
// Camera's position on rail is set w/ MMB. Camera's rotation around pivot
// is set w/ LMB; this moves the origin and tells camera to look at it. Zooming
// adds a displacement vector to camera and origin, which rotates w/ phi.
var CylCam = 1;

var cam;
epsilon = .01;
initCam();

function initCam(params) {
  if (!params) params = { type: FreeCam };
  if (params.type==FreeCam) {
    cam = {
      type: FreeCam,
      r: 5,
      phi: Math.PI/2,
      theta: Math.PI/2,
      rRate: .1,
      thetaRate: -3,
      phiRate: 3,
      xPanRate: 1,
      yPanRate: 1,
      thetaLL: epsilon,
      thetaUL: Math.PI-epsilon,
      rLL: epsilon,
      rUL: 100,
      origin: new THREE.Vector3(0,0,0)
    };
  }
  if (params.type==CylCam) {
    cam = {
      type: CylCam,
      r: 15,
      phi: Math.PI/2,
      z: -2, // may not use
      or: 1,
      otheta: Math.PI/2,
      ophi: Math.PI, // likely won't use
      rRate: .1,
      phiRate: 5,
      zRate: 1.5,
      othetaRate: -1,
      ophiRate: -0.5,
      xPanRate: 2.5,
      yPanRate: 2.5,
      othetaLL: epsilon,
      othetaUL: Math.PI-epsilon,
      rLL: epsilon,
      rUL: 100,
      origin: new THREE.Vector3(0,0,0)
    };
  }

  for (var key in params) {
    cam[key] = params[key];
  }
}

function positionCamera(camera) {
  if (!cam || !camera) return;
  if (cam.type==FreeCam) {
    camera.position.x = cam.r * Math.cos(cam.phi) * Math.sin(cam.theta) + cam.origin.x;
    camera.position.z = cam.r * Math.sin(cam.phi) * Math.sin(cam.theta) + cam.origin.z;
    camera.position.y = cam.r * Math.cos(cam.theta) + cam.origin.y;
    camera.lookAt(cam.origin);
  }
  if (cam.type==CylCam) {
    camera.position.x = cam.r * Math.cos(cam.phi);
    camera.position.z = cam.r * Math.sin(cam.phi);
    camera.position.y = cam.z;
    cam.origin.x = cam.or * Math.cos(cam.ophi) * Math.sin(cam.otheta);
    cam.origin.z = cam.or * Math.sin(cam.ophi) * Math.sin(cam.otheta);
    cam.origin.y = cam.or * Math.cos(cam.otheta);
    cam.origin.applyAxisAngle(new THREE.Vector3(0,1,0),-cam.phi);
    cam.origin.add(camera.position);
    camera.lookAt(cam.origin);
  }
}

function handleLMB(dX, dY) {
  if (cam.type==FreeCam) {
    cam.theta += cam.thetaRate * dY;
    if ("thetaLL" in cam && cam.theta < cam.thetaLL) cam.theta = cam.thetaLL;
    if ("thetaUL" in cam && cam.theta > cam.thetaUL) cam.theta = cam.thetaUL;
    cam.phi += cam.phiRate * dX;
    if ("phiLL" in cam && cam.phi < cam.phiLL) cam.phi = cam.phiLL;
    if ("phiUL" in cam && cam.phi > cam.phiUL) cam.phi = cam.phiUL;
  }
  if (cam.type==CylCam) {
    cam.otheta -= cam.othetaRate * dY;
    if (cam.otheta < cam.othetaLL) cam.otheta = cam.othetaLL;
    if (cam.otheta > cam.othetaUL) cam.otheta = cam.othetaUL;
    cam.phi += cam.phiRate * dX;
    if ("phiLL" in cam && cam.phi < cam.phiLL) cam.phi = cam.phiLL;
    if ("phiUL" in cam && cam.phi > cam.phiUL) cam.phi = cam.phiUL;
  }
}

function handleMMB(dX, dY) {
  if (cam.type==FreeCam) {
    // Not obvious:
    // default plane (theta=phi=0) is Y up, Z right, so put displacement
    // vector in that plane (larger for larger r), rotate around Z to adjust
    // for theta, then rotate around Y to adjust for phi
    if ("allowPan" in cam && !cam.allowPan) return;
    var displacement = new THREE.Vector3(0, dY*cam.yPanRate*cam.r, dX*cam.xPanRate*cam.r);
    displacement.applyAxisAngle(new THREE.Vector3(0,0,-1),Math.PI/2-cam.theta);
    displacement.applyAxisAngle(new THREE.Vector3(0,1,0),cam.phi);
    // minus is necessary; I think it's because we're in a left-handed coord system
    displacement.x *= -1;
    cam.origin.add(displacement);
  }
  if (cam.type==CylCam) {
    cam.z += dY*cam.zRate*cam.r;
    if ("zLL" in cam && cam.z < cam.zLL) cam.z = cam.zLL;
    if ("zUL" in cam && cam.z > cam.zUL) cam.z = cam.zUL;
  }
}

function handleWheel(d) {
  if (cam.type==FreeCam) {
    cam.r += cam.r * ((d>0)?cam.rRate:(-1*cam.rRate));
    if (cam.r<cam.rLL) cam.r = cam.rLL;
    if (cam.r>cam.rUL) cam.r = cam.rUL;
  }
  if (cam.type==CylCam) {
    cam.r += cam.r * ((d>0)?cam.rRate:(-1*cam.rRate));
    if (cam.r<cam.rLL) cam.r = cam.rLL;
    if (cam.r>cam.rUL) cam.r = cam.rUL;
  }
}
