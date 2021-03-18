import * as THREE from "./modules/three.module.js";
import { OrbitControls } from "./modules/OrbitControls.js";

var scene;
var camera;
var renderer;
var controls;

const NUM_LORENZ = 3;

var SphereGeometry = new Array(NUM_LORENZ);
var SphereMaterial = new Array(NUM_LORENZ);
var GravitationalSphere = new Array(NUM_LORENZ);

var Gravitational = new Array(NUM_LORENZ);
var GravitationalGeometry = new Array(NUM_LORENZ);
var GravitationalMaterial = new Array(NUM_LORENZ);
var GravitationalLine = new Array(NUM_LORENZ);

var Speed = new Array(NUM_LORENZ);
var Mass = new Array(NUM_LORENZ);

var initial_masses = [1, 4, 1];
var initial_speeds = [
  [0.002, 0.003, 0],
  [0, 0.003, 0],
  [-0.002, 0.003, 0],
];
var initial_posses = [
  [0, 0, 500],
  [0, 0, 1000],
  [0, 0, 1500],
];

// We scale as follows:
// mass 1 = mass of earth ~ 6 * 10^24 kg
// 1 unit of distance = distance from earth to sun ~ 15 * 10^7 km
// So normal G = 6.674 * 10^-11 m^3 kg^-1 s^-2
// 1 kg = 6 * 10^-24 um
// 1 m = 15 * 10^-7 ud
// 1 m^3 = 3375 * 10^-21 ud^3 = 3.375 * 10^-18 ud^3
// G = 6.674 * 10^-11 * 1/6 * 10^24 * 3.375 * 10^-18 ud^3 um^-1 s^-2
// G = 3,7391085 * 10^-5 ud^3 um^-1 s^-2
const G = 3.7391085 * Math.pow(10, -5);

var LineColours = new Array(0x00ff00, 0xff0000, 0x0000ff);
var SphereColours = new Array(0x00ff00, 0xff0000, 0x0000ff);

var dt = 10; // Unit time, 10 seconds
var drawCount = 3; // how many points added so far.

var MAXPOINTS = 1000000;

var STOP = false;

var distance = function (a, b) {
  return Math.sqrt(
    Math.pow(b[0] - a[0], 2) +
      Math.pow(b[1] - a[1], 2) +
      Math.pow(b[2] - a[2], 2)
  );
};

var get_vector = function (a, b) {
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
};

var scale_vector = function (a, b) {
  return [a[0] * b, a[1] * b, a[2] * b];
};

var normalise_vector = function (a) {
  const length = distance(a, [0, 0, 0]);
  return scale_vector(a, 1 / length);
};

var add_vector = function (a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
};

var init = function () {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 0, 1000);
  controls.update();

  for (var n = 0; n < NUM_LORENZ; n++) {
    // create the geometry.
    GravitationalGeometry[n] = new THREE.BufferGeometry();

    Gravitational[n] = new Float32Array(3 * MAXPOINTS);
    Gravitational[n][0] = initial_posses[n][0];
    Gravitational[n][1] = initial_posses[n][1];
    Gravitational[n][2] = initial_posses[n][2];

    GravitationalGeometry[n].setAttribute(
      "position",
      new THREE.BufferAttribute(Gravitational[n], 3)
    );

    Speed[n] = initial_speeds[n];

    Mass[n] = initial_masses[n];

    // create the material.
    GravitationalMaterial[n] = new THREE.LineBasicMaterial({
      color: LineColours[n],
      linewidth: 10,
    });
    GravitationalLine[n] = new THREE.Line(
      GravitationalGeometry[n],
      GravitationalMaterial[n]
    );

    // add the line to the scene.
    scene.add(GravitationalLine[n]);

    SphereGeometry[n] = new THREE.SphereGeometry(
      Math.round(Math.pow(Mass[n], 1 / 3)) * 10
    );
    SphereMaterial[n] = new THREE.MeshBasicMaterial({
      color: SphereColours[n],
    });
    GravitationalSphere[n] = new THREE.Mesh(
      SphereGeometry[n],
      SphereMaterial[n]
    );

    // add the sphere to the scene.
    scene.add(GravitationalSphere[n]);

    // axis helper
    const axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);
  }
};

var updateLorenz = function () {
  if (drawCount > MAXPOINTS) return;

  if (STOP) return;

  for (let n = 0; n < NUM_LORENZ; n++) {
    // compute new x y z

    const scale = 100.0;

    var GravitationalPoints =
      GravitationalLine[n].geometry.attributes.position.array;
    var x = GravitationalPoints[drawCount - 3] / scale;
    var y = GravitationalPoints[drawCount - 2] / scale;
    var z = GravitationalPoints[drawCount - 1] / scale;

    // console.debug({ x, y, z });

    var Force = Array(3);

    var total_force_vector = [0, 0, 0];

    for (let m = 0; m < NUM_LORENZ; m++) {
      if (m == n) continue;

      const NeighbourGravitationalPoints =
        GravitationalLine[m].geometry.attributes.position.array;
      const x_p = NeighbourGravitationalPoints[drawCount - 3] / scale;
      const y_p = NeighbourGravitationalPoints[drawCount - 2] / scale;
      const z_p = NeighbourGravitationalPoints[drawCount - 1] / scale;

      const r = distance([x, y, z], [x_p, y_p, z_p]);

      const F = (G * Mass[n] * Mass[m]) / Math.pow(r, 2);

      const force_vector = scale_vector(
        normalise_vector(get_vector([x, y, z], [x_p, y_p, z_p])),
        F
      );

      total_force_vector = add_vector(total_force_vector, force_vector);

      //   console.debug({
      //     n,
      //     m,
      //     x_p,
      //     y_p,
      //     z_p,
      //     r,
      //     F,
      //     force_vector,
      //     total_force_vector,
      //     Speed: Speed[n],
      //   });
    }

    var acceleration_vector = [
      total_force_vector[0] / Mass[n],
      total_force_vector[1] / Mass[n],
      total_force_vector[2] / Mass[n],
    ];

    Speed[n][0] += acceleration_vector[0] * dt;
    Speed[n][1] += acceleration_vector[1] * dt;
    Speed[n][2] += acceleration_vector[2] * dt;

    x += Speed[n][0] * dt;
    y += Speed[n][1] * dt;
    z += Speed[n][2] * dt;

    x *= scale;
    y *= scale;
    z *= scale;

    // update shere
    GravitationalSphere[n].position.set(x, y, z);

    // add new point to the array of points
    GravitationalPoints[drawCount] = x;
    GravitationalPoints[drawCount + 1] = y;
    GravitationalPoints[drawCount + 2] = z;

    GravitationalLine[n].geometry.setDrawRange(0, drawCount / 3 + 1);
    GravitationalLine[n].geometry.attributes.position.needsUpdate = true;
  }
  drawCount += 3;
};

var animate = function () {
  requestAnimationFrame(animate);
  updateLorenz();
  controls.update();
  renderer.render(scene, camera);
};

// var reset = function () {
//   drawCount = 3;

//   for (var n = 0; n < NUM_LORENZ; n++) {
//     var LorenzPoints = LorenzLine[n].geometry.attributes.position.array;
//     LorenzPoints = new Float32Array(3 * MAXPOINTS);
//     LorenzPoints[0] = LorenzStart[n][0];
//     LorenzPoints[1] = LorenzStart[n][1];
//     LorenzPoints[2] = LorenzStart[n][2];

//     LorenzLine.geometry.setDrawRange(0, drawCount / 3);
//     LorenzLine.geometry.attributes.position.needsUpdate = true;
//   }
// };

init();
animate();
document.addEventListener(
  "keydown",
  function (event) {
    const key = event.key;
    // S
    if (key == "s") STOP = !STOP;
    // M
    if (key == "m") {
      scene.traverse(function (child) {
        if (child instanceof THREE.AxesHelper) {
          debugger;
          child.visible = !child.visible;
        }
      });
    }
    // -
    if (key == "-") dt -= 1;
    // +
    if (key == "+") dt += 1;
  },
  false
);
