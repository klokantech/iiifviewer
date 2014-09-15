/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifViewer');

goog.require('goog.dom');
goog.require('goog.net.Jsonp');

goog.require('klokantech.IiifSource');
goog.require('klokantech.SmoothMWZoomInteraction');

goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.interaction');
goog.require('ol.layer.Tile');
goog.require('ol.proj.Projection');



/**
 * @param {string|Element} element
 * @param {string|!Object.<string, *>} dataOrUrl
 * @constructor
 */
klokantech.IiifViewer = function(element, dataOrUrl) {
  var el = goog.dom.getElement(element);
  if (!el) throw Error('Invalid element');

  /**
   * @type {!Element}
   * @private
   */
  this.mapElement_ = el;

  this.init_(dataOrUrl);
};


/**
 * @param {!Object.<string, *>} data
 * @private
 */
klokantech.IiifViewer.prototype.initLayer_ = function(data) {
  var w = /** @type {number} */(data['width']),
      h = /** @type {number} */(data['height']);
  var url = data['@id'];
  if (!url) {
    var host = data['image_host'], id = data['identifier'];
    if (host && id) {
      url = host + id;
    }
  }
  if (!url) {
    throw Error('Unable to determine base url');
  }
  var tileSize = data['tile_width'] || 256;
  var proj = new ol.proj.Projection({
    code: 'IIIF',
    units: 'pixels',
    extent: [0, -h, w, 0]
  });
  var src = new klokantech.IiifSource({
    baseUrl: /** @type {string} */(url),
    width: w,
    height: h,
    resolutions: /** @type {!Array.<number>} */(data['scale_factors']),
    projection: proj
  });
  var layer = new ol.layer.Tile({
    source: /** @type {!ol.source.Source} */((src))
  });

  this.map_ = new ol.Map({
    layers: [layer],
    target: this.mapElement_,
    view: new ol.View({
      projection: proj,
      extent: [0, -h, w, 0]
    }),
    interactions: ol.interaction.defaults({mouseWheelZoom: false}),
    controls: [],
    logo: false
  });
  this.map_.addInteraction(new klokantech.SmoothMWZoomInteraction());

  this.map_.getView().fitExtent(proj.getExtent(), this.map_.getSize() || null);
};


/**
 * @param {string|!Object.<string,*>} dataOrUrl
 * @private
 */
klokantech.IiifViewer.prototype.init_ = function(dataOrUrl) {
  if (goog.isString(dataOrUrl)) {
    var jsonp = new goog.net.Jsonp(dataOrUrl);
    jsonp.send(null, goog.bind(function(data) {
      this.init_(data);
    }, this));
  } else {
    this.initLayer_(dataOrUrl);
  }
};


goog.exportSymbol('IiifViewer', klokantech.IiifViewer);
