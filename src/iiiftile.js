/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifTile');

goog.require('goog.events');



/**
 * @param {number} tileSize
 * @param {ol.TileCoord} tileCoord Tile coordinate.
 * @param {ol.TileState} state State.
 * @param {string} src Image source URI.
 * @param {?string} crossOrigin Cross origin.
 * @param {ol.TileLoadFunctionType} tileLoadFunction Tile load function.
 * @constructor
 * @extends {ol.ImageTile}
 */
klokantech.IiifTile =
    function(tileSize, tileCoord, state, src, crossOrigin, tileLoadFunction) {
  goog.base(this, tileCoord, state, src, crossOrigin, tileLoadFunction);

  /**
   * @private
   * @type {!HTMLCanvasElement|!HTMLImageElement}
   */
  this.fullImage_ = klokantech.IiifTile.superClass_.getImage.apply(this);

  /**
   * @private
   * @type {Object.<number, Image>}
   */
  this.fullImageByContext_ = {};

  /**
   * @type {number}
   * @private
   */
  this.tileSize_ = tileSize;

  if (ol.has.CANVAS) {
    goog.events.listen(this, goog.events.EventType.CHANGE, function() {
      var image = klokantech.IiifTile.superClass_.getImage.apply(this);
      if (image.naturalWidth > 0 &&
          (image.naturalWidth != this.tileSize_ ||
           image.naturalHeight != this.tileSize_)) {
        this.fullImage_ = goog.dom.createElement('canvas');
        this.fullImage_.width = this.tileSize_;
        this.fullImage_.height = this.tileSize_;

        var ctx = this.fullImage_.getContext('2d');
        ctx.drawImage(image, 0, 0);
      }
    }, false, this);
  }
};
goog.inherits(klokantech.IiifTile, ol.ImageTile);


/** @inheritDoc */
klokantech.IiifTile.prototype.getImage = function(opt_context) {
  if (goog.isDef(opt_context)) {
    var image;
    var key = goog.getUid(opt_context);
    if (key in this.fullImageByContext_) {
      return this.fullImageByContext_[key];
    } else if (goog.object.isEmpty(this.fullImageByContext_)) {
      image = this.fullImage_;
    } else {
      image = /** @type {!HTMLCanvasElement|!HTMLImageElement} */
              (this.fullImage_.cloneNode(false));
    }
    this.fullImageByContext_[key] = image;
    return image;
  } else {
    return this.fullImage_;
  }
};
