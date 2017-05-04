import Texture from './texture';
import {withParameters} from './context';
import assert from 'assert';

// Literal constants, should be "folded" during minification
const GL_TEXTURE_CUBE_MAP = 0x8513;
// To check the current texture binding, gl.getParameter(gl.TEXTURE_BINDING_CUBE_MAP)
// const GL_TEXTURE_BINDING_CUBE_MAP = 0x8514;
const GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
const GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
const GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
const GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
const GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
const GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;

const GL_RGBA = 0x1908;
const GL_UNSIGNED_BYTE = 0x1401;

export default class TextureCube extends Texture {
  constructor(gl, opts = {}) {
    super(gl, Object.assign({}, opts, {target: GL_TEXTURE_CUBE_MAP}));
    this.initialize(opts);
    Object.seal(this);
  }

  /* eslint-disable max-len, max-statements */
  initialize(opts = {}) {
    const {
      [GL_TEXTURE_CUBE_MAP_POSITIVE_X]: dataPosX,
      [GL_TEXTURE_CUBE_MAP_POSITIVE_Y]: dataPosY,
      [GL_TEXTURE_CUBE_MAP_POSITIVE_Z]: dataPosZ,
      [GL_TEXTURE_CUBE_MAP_NEGATIVE_X]: dataNegX,
      [GL_TEXTURE_CUBE_MAP_NEGATIVE_Y]: dataNegY,
      [GL_TEXTURE_CUBE_MAP_NEGATIVE_Z]: dataNegZ,
      format = GL_RGBA,
      border = 0,
      mipmaps = false
    } = opts;

    let {
      width = 1,
      height = 1,
      type = GL_UNSIGNED_BYTE,
      dataFormat
    } = opts;

    // Deduce width and height
    ({type, dataFormat} = this._deduceTypeAndDataFormat({format, type, dataFormat}));
    ({width, height} = this._deduceSize({data: dataPosX, width, height}));

    // Enforce cube
    assert(width === height);

    // Temporarily apply any pixel store settings and build textures
    withParameters(this.gl, opts, () => {
      this._setImage({target: GL_TEXTURE_CUBE_MAP_POSITIVE_X, data: dataPosX, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL_TEXTURE_CUBE_MAP_POSITIVE_Y, data: dataPosY, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL_TEXTURE_CUBE_MAP_POSITIVE_Z, data: dataPosZ, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL_TEXTURE_CUBE_MAP_NEGATIVE_X, data: dataNegX, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, data: dataNegY, width, height, format, type, dataFormat, border, mipmaps});
      this._setImage({target: GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, data: dataNegZ, width, height, format, type, dataFormat, border, mipmaps});
    });
    this.setCubeMapImageData(opts);

    // Called here so that GL.
    // TODO - should genMipmap() be called on the cubemap or on the faces?
    if (mipmaps) {
      this.generateMipmap(opts);
    }

    // Store opts for accessors
    this.opts.width = width;
    this.opts.height = height;
    this.opts.format = format;
    this.opts.type = type;
    this.opts.dataFormat = dataFormat;
    this.opts.border = border;

    // TODO - Store data to enable auto recreate on context loss
    if (opts.recreate) {
      this.opts[GL_TEXTURE_CUBE_MAP_POSITIVE_X] = dataPosX;
      this.opts[GL_TEXTURE_CUBE_MAP_POSITIVE_Y] = dataPosY;
      this.opts[GL_TEXTURE_CUBE_MAP_POSITIVE_Z] = dataPosZ;
      this.opts[GL_TEXTURE_CUBE_MAP_NEGATIVE_X] = dataNegX;
      this.opts[GL_TEXTURE_CUBE_MAP_NEGATIVE_Y] = dataNegY;
      this.opts[GL_TEXTURE_CUBE_MAP_NEGATIVE_Z] = dataNegZ;
    }
  }

  subImage(face, {data, x = 0, y = 0, mipmapLevel = 0}) {
    return this._subImage({target: face, data, x, y, mipmapLevel});
  }

  bind({index} = {}) {
    assert(index !== undefined);
    this.gl.activeTexture(GL_TEXTURE0 + index);
    this.gl.bindTexture(GL_TEXTURE_CUBE_MAP, this.handle);
    return index;
  }

  unbind() {
    this.gl.bindTexture(GL_TEXTURE_CUBE_MAP, null);
    return this;
  }

  /* eslint-disable max-statements, max-len */
  setCubeMapImageData({
    width,
    height,
    pixels,
    data,
    border = 0,
    format = GL.RGBA,
    type = GL.UNSIGNED_BYTE,
    generateMipmap = false
  }) {
    const {gl} = this;
    pixels = pixels || data;
    this.bind();
    if (this.width || this.height) {
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X,
        0, format, width, height, border, format, type, pixels.pos.x);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y,
        0, format, width, height, border, format, type, pixels.pos.y);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z,
        0, format, width, height, border, format, type, pixels.pos.z);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X,
        0, format, width, height, border, format, type, pixels.neg.x);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y,
        0, format, width, height, border, format, type, pixels.neg.y);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z,
        0, format, width, height, border, format, type, pixels.neg.z);
    } else {
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X,
        0, format, format, type, pixels.pos.x);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y,
        0, format, format, type, pixels.pos.y);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z,
        0, format, format, type, pixels.pos.z);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X,
        0, format, format, type, pixels.neg.x);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y,
        0, format, format, type, pixels.neg.y);
      gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z,
        0, format, format, type, pixels.neg.z);
    }
  }
}
