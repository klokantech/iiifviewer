/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 *
 * @fileoverview
 * @suppress {missingRequire}
 */

goog.provide('klokantech.IiifSource');


goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math');


/**
 * @typedef {{resolutions: !Array.<number>,
 *            baseUrl: (string|!Array.<string>),
 *            crossOrigin: (string|null|undefined),
 *            width: number,
 *            height: number,
 *            projection: ol.ProjectionLike,
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
      quality = options.quality || 'default',
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

  var tilePixelRatio = Math.min((window.devicePixelRatio || 1), 4);

  var logicalTileSize = tileSize / tilePixelRatio;
  var logicalResolutions = tilePixelRatio == 1 ? options.resolutions :
      goog.array.map(options.resolutions, function(el, i, arr) {
        return el * tilePixelRatio;
      });

  goog.base(this, {
    tilePixelRatio: tilePixelRatio,
    tileGrid: new ol.tilegrid.TileGrid({
      resolutions: logicalResolutions.reverse(),
      origin: [0, 0],
      tileSize: logicalTileSize
    }),
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

        var url;
        if (goog.isArray(baseUrl)) {
          var hash = (x << z) + y;
          url = baseUrl[goog.math.modulo(hash, baseUrl.length)];
        } else {
          url = baseUrl;
        }

        return url + query;
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



/**
 * @param {Object.<string, *>} data
 * @param {string=} opt_guessedUrl
 * @param {string=} opt_crossOrigin
 * @return {klokantech.IiifSource}
 */
klokantech.IiifSource.createFromInfo =
    function(data, opt_guessedUrl, opt_crossOrigin) {
  var url = /** @type {string|undefined} */(data['@id']);
  if (!url) {
    var host = data['image_host'], id = data['identifier'];
    if (host && id) {
      url = /** @type {string} */(host + id);
    }
  }
  if (!url) {
    url = opt_guessedUrl;
  }
  if (!url) {
    throw Error('Unable to determine base url');
  }
  var domains = /** @type {Array} */(data['domains']);
  if (domains && domains.length > 0) {
    var uri = new goog.Uri(url);
    url = [];
    goog.array.forEach(domains, function(domain) {
      uri.setDomain(domain);
      url.push(uri.toString());
    });
  }

  var tiles = (data['tiles'] || [{}])[0];
  var width = /** @type {number} */(data['width']),
      height = /** @type {number} */(data['height']);
  var tileSize = /** @type {number} */
      (tiles['width'] || data['tile_width'] || 256);
  var resolutions = /** @type {!Array.<number>} */
      (tiles['scaleFactors'] || data['scale_factors'] || []);
  if (resolutions.length == 0) {
    var r_ = 1;
    while (Math.max(width, height) / r_ > tileSize) {
      resolutions.push(r_);
      r_ *= 2;
    }
  }
  var quality =
      (!data['@context'] || data['@context'].match(/\/1\.1\/context\.json$/i)) ?
      'native' : 'default';

  var proj = new ol.proj.Projection({
    code: 'IIIF',
    units: 'pixels',
    extent: [0, -height, width, 0]
  });
  return new klokantech.IiifSource({
    baseUrl: url,
    width: width,
    height: height,
    resolutions: resolutions.concat(),
    extension: 'jpg',
    tileSize: tileSize,
    projection: proj,
    quality: quality,
    crossOrigin: opt_crossOrigin
  });
};
