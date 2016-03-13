// camera.js
// Provides a Camera with ModelView and Projection matrices

import {Vec3, Mat4} from './math';
import {merge} from './utils';

class Camera {

  constructor(opts) {
    opts = merge({
      fov: 45,
      near: 0.1,
      far: 500,
      aspect: 1,
      position: new Vec3(0, 0, 0),
      target: new Vec3(0, 0, -1),
      up: new Vec3(0, 1, 0)
    }, opts);
    this.fov = opts.fov;
    this.near = opts.near;
    this.far = opts.far;
    this.aspect = opts.aspect;
    this.position = opts.position;
    this.target = opts.target;
    this.up = opts.up;
    this.view = new Mat4();
    this.uniforms = {};
    Object.seal(this);

    this.update();
  }

  getUniforms() {
    return this.uniforms;
  }

  // TODO - should we remove this method?
  // It creates a dependency between Camera.js and Program.js
  // Camera could just expose uniforms that can be used in shaders
  // apps would do Program.setUniforms(camera.getUniforms())
  setStatus(program) {
    program.setUniforms(this.getUniforms());
  }

  _updateUniforms() {
    const pos = this.position;
    const viewProjection = this.view.mulMat4(this.projection);
    const viewProjectionInverse = viewProjection.invert();
    this.uniforms = {
      cameraPosition: [pos.x, pos.y, pos.z],
      projectionMatrix: this.projection,
      viewMatrix: this.view,
      viewProjectionMatrix: viewProjection,
      viewInverseMatrix: this.view.invert(),
      viewProjectionInverseMatrix: viewProjectionInverse
    };
  }

}

export class PerspectiveCamera extends Camera {

  update() {
    this.projection =
      new Mat4().perspective(this.fov, this.aspect, this.near, this.far);
    this.view.lookAt(this.position, this.target, this.up);
    this._updateUniforms();
  }

}

export class OrthoCamera {

  update() {
    const ymax = this.near * Math.tan(this.fov * Math.PI / 360);
    const ymin = -ymax;
    const xmin = ymin * this.aspect;
    const xmax = ymax * this.aspect;
    this.projection =
      new Mat4().ortho(xmin, xmax, ymin, ymax, this.near, this.far);
    this.view.lookAt(this.position, this.target, this.up);
    this._updateUniforms();
  }

}
