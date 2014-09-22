/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifSource');

goog.require('klokantech.IiifGrid');
goog.require('klokantech.IiifTile');


/**
 * @typedef {{resolutions: !Array.<number>,
 *            baseUrl: string,
 *            width: number,
 *            height: number,
 *            projection: ol.proj.ProjectionLike,
 *            extension: (string|undefined),
 *            quality: (string|undefined),
 *            tileSize: (number|undefined)}}
 */
klokantech.IiifSourceOptions;



/**
 * @constructor
 * @extends {ol.source.TileImage}
 * @param {klokantech.IiifSourceOptions} options
 */
klokantech.IiifSource = function(options) {
  var baseUrl = options.baseUrl,
      extension = options.extension || 'jpg',
      quality = options.quality || 'native',
      width = options.width,
      height = options.height,
      tileSize = options.tileSize || 256;

  var ceil_log2 = function(x) {
    return Math.ceil(Math.log(x) / Math.LN2);
  };

  var maxZoom = Math.max(ceil_log2(width / tileSize),
                         ceil_log2(height / tileSize));

  var tierSizes = [];
  for (var i = 0; i <= maxZoom; i++) {
    var scale = Math.pow(2, maxZoom - i);
    var width_ = Math.ceil(width / scale);
    var height_ = Math.ceil(height / scale);
    var tilesX_ = Math.ceil(width_ / tileSize);
    var tilesY_ = Math.ceil(height_ / tileSize);
    tierSizes.push([tilesX_, tilesY_]);
  }

  goog.base(this, {
    tileGrid: new klokantech.IiifGrid(
        /** @type {!olx.tilegrid.TileGridOptions} */({
          resolutions: options.resolutions.reverse(),
          origin: [0, 0],
          projection: options.projection,
          extent: options.projection.getExtent(),
          tileSize: tileSize
        })),
    tileUrlFunction: function(tileCoord, pixelRatio, projection) {
      var z = tileCoord[0];
      if (maxZoom < z) return undefined;

      var sizes = tierSizes[z];
      if (!sizes) return undefined;

      var x = tileCoord[1];
      var y = -tileCoord[2] - 1;
      if (x < 0 || sizes[0] <= x || y < 0 || sizes[1] <= y) {
        return undefined;
      } else {
        var scale = Math.pow(2, maxZoom - z);
        var tileBaseSize = tileSize * scale;
        var minx = x * tileBaseSize;
        var miny = y * tileBaseSize;
        var maxx = Math.min(minx + tileBaseSize, width);
        var maxy = Math.min(miny + tileBaseSize, height);

        var query = '/' + minx + ',' + miny + ',' +
            (maxx - minx) + ',' + (maxy - miny) +
            '/pct:' + (100 / scale) + '/0/' + quality + '.' + extension;

        return baseUrl + query;
      }
    },
    tileClass: ol.has.CANVAS ?
        goog.bind(klokantech.IiifTile, null, tileSize) : undefined
  });
};
goog.inherits(klokantech.IiifSource, ol.source.TileImage);
