/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifSource');


goog.require('goog.events');

goog.require('klokantech.IiifGrid');


/**
 * @typedef {{resolutions: !Array.<number>,
 *            baseUrl: string,
 *            crossOrigin: (string|null|undefined),
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

        maxx = scale * Math.floor(maxx / scale);
        maxy = scale * Math.floor(maxy / scale);

        var query = '/' + minx + ',' + miny + ',' +
            (maxx - minx) + ',' + (maxy - miny) +
            '/pct:' + (100 / scale) + '/0/' + quality + '.' + extension;

        return baseUrl + query;
      }
    },
    crossOrigin: options.crossOrigin
  });

  if (ol.has.CANVAS) {
    this.setTileLoadFunction(function(tile, url) {
      var img = tile.getImage();
      goog.events.listenOnce(img, goog.events.EventType.LOAD, function() {
        if (img.naturalWidth > 0 &&
            (img.naturalWidth != tileSize || img.naturalHeight != tileSize)) {
          var canvas = goog.dom.createElement(goog.dom.TagName.CANVAS);
          canvas.width = tileSize;
          canvas.height = tileSize;

          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          var key = goog.object.findKey(tile, function(v) {return v == img;});
          if (key) tile[key] = canvas;
        }
      }, true);
      img.src = url;
    });
  }
};
goog.inherits(klokantech.IiifSource, ol.source.TileImage);
