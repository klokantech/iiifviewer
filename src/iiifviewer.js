/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 *
 * @fileoverview
 * @suppress {missingRequire}
 */

goog.provide('klokantech.IiifViewer');

goog.require('goog.dom');
goog.require('goog.net.CorsXmlHttpFactory');
goog.require('goog.net.XhrIo');

goog.require('klokantech.IiifSource');



/**
 * TODO: options object?
 * @param {string|Element} element
 * @param {string|!Object.<string, *>} dataOrUrl
 * @param {function(klokantech.IiifViewer)=} opt_initCallback
 * @param {string=} opt_crossOrigin
 * @param {boolean=} opt_useWebGL
 * @param {ol.interaction.Interaction=} opt_ownMWInteraction
 * @constructor
 */
klokantech.IiifViewer = function(element, dataOrUrl,
        opt_initCallback, opt_crossOrigin, opt_useWebGL,
        opt_ownMWInteraction) {
  var el = goog.dom.getElement(element);
  if (!el)
    throw Error('Invalid element');

  /**
   * @type {!Element}
   * @private
   */
  this.mapElement_ = el;

  /**
   * @type {?ol.Map}
   * @private
   */
  this.map_ = null;

  /**
   * @type {?Object}
   * @private
   */
  this.data_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.crossOrigin_ = opt_crossOrigin;

  /**
   * @type {boolean}
   * @private
   */
  this.useWebGL_ = opt_useWebGL == true;

  /**
   * @type {?ol.interaction.Interaction}
   * @private
   */
  this.ownMWInteraction_ = opt_ownMWInteraction || null;

  /**
   * @type {?function(klokantech.IiifViewer)}
   * @private
   */
  this.initCallback_ = opt_initCallback || null;

  /**
   * @type {?string}
   * @private
   */
  this.guessedUrl_ = goog.isString(dataOrUrl) ?
          dataOrUrl.substring(0, dataOrUrl.lastIndexOf('/')) : null;

  this.init_(dataOrUrl);
};


/**
 * @return {?ol.Map}
 */
klokantech.IiifViewer.prototype.getMap = function() {
  return this.map_;
};


/**
 * @param {!Object.<string, *>} data
 * @private
 */
klokantech.IiifViewer.prototype.initLayer_ = function(data) {
  var width = /** @type {number} */(data['width']),
      height = /** @type {number} */(data['height']);

  var proj = new ol.proj.Projection({
    code: 'IIIF',
    units: 'pixels',
    extent: [0, -height, width, 0]
  });
  var src = klokantech.IiifSource.createFromInfo(data, this.guessedUrl_,
    goog.isString(this.crossOrigin_) ? this.crossOrigin_ :
      (this.useWebGL_ ? '' : undefined));
  var layer = new ol.layer.Tile({
    source: src
  });

  this.map_ = new ol.Map({
    layers: [layer],
    target: this.mapElement_,
    renderer: this.useWebGL_ ?
        /** @type {ol.renderer.Type} */('webgl') : undefined,
    view: new ol.View({
      projection: proj,
      extent: [0, -height, width, 0]
    }),
    interactions: ol.interaction.defaults({
      mouseWheelZoom: !goog.isDefAndNotNull(this.ownMWInteraction_)
    }),
    controls: [],
    logo: false
  });
  if (this.ownMWInteraction_) {
    this.map_.addInteraction(this.ownMWInteraction_);
  }
  //zoom to permalink
  var hash = window.location.hash;
  if (hash.length > 0 && (hash.indexOf('lat=') > 0 || hash.indexOf('x=') > 0)) {
    var args = {};
    var elements = hash.split('&');
    elements[0] = elements[0].substring(1);
    for (var i = 0; i < elements.length; i++) {
      var pair = elements[i].split('=');
      args[pair[0]] = pair[1];
    }
    if (goog.isDef(args['zoom'])) {
      this.map_.getView().setCenter([parseFloat(args['lon']),
            parseFloat(args['lat']) - this.data_.height]);
      this.setPermazoom_(parseFloat(args['zoom']));
    } else {
      this.map_.getView().setCenter([parseFloat(args['y']),
            -parseFloat(args['x'])]);
      this.map_.getView().setResolution(args['res']);
    }
  } else {
    this.map_.getView().fit(proj.getExtent());
  }

  if (this.initCallback_)
    this.initCallback_(this);
};


/**
 * @param {string|!Object.<string,*>} dataOrUrl
 * @private
 */
klokantech.IiifViewer.prototype.init_ = function(dataOrUrl) {
  if (goog.isString(dataOrUrl)) {
    var xhr_ = new goog.net.XhrIo(new goog.net.CorsXmlHttpFactory());
    goog.events.listen(xhr_, goog.net.EventType.COMPLETE, function() {
      if (xhr_.isSuccess()) {
        var data = /** @type {!Object.<string, *>} */(xhr_.getResponseJson());
        this.init_(data);
      }
    }, false, this);
    xhr_.send(dataOrUrl);
  } else {
    this.data_ = dataOrUrl;
    this.initLayer_(dataOrUrl);
  }
};


/**
 * Calculates floating-point zoom level independent on the view smoothness.
 * @return {number|undefined}
 * @private
 */
klokantech.IiifViewer.prototype.getPermazoom_ = function() {
  return this.map_.getView().getZoom();
};


/**
 * Sets floating-point zoom level independent on the view smoothness.
 * @param {number} permazoom
 * @private
 */
klokantech.IiifViewer.prototype.setPermazoom_ = function(permazoom) {
  this.map_.getView().setZoom(permazoom);
};


/**
 * Turn permalinks on
 * @param {boolean|!Object.<string,*>} opt
 */
klokantech.IiifViewer.prototype.addPermalink = function(opt) {
  if (opt !== false) {
    var accuracy = goog.isDefAndNotNull(opt['accuracy']) ? opt['accuracy'] : 2;
    var height = this.data_.height;
    this.map_.on('moveend', function() {
      var view = this.map_.getView();
      var center = view.getCenter();
      var hash = '';
      var x = parseFloat(center[1]);
      if (goog.isDefAndNotNull(opt['geoFormat']) &&
              opt['geoFormat'] === false) {
        hash = 'res=' + view.getResolution() +
               '&x=' + Math.abs(x.toFixed(accuracy)) +
               '&y=' + center[0].toFixed(accuracy);
      } else {
        x += height;
        hash = 'zoom=' + this.getPermazoom_().toFixed(accuracy) +
               '&lat=' + x.toFixed(accuracy) +
               '&lon=' + center[0].toFixed(accuracy);
      }
      if (goog.isDefAndNotNull(opt['addToEnd'])) {
        hash += '&' + opt['addToEnd'];
      }
      window.location.hash = hash;
    }, this);
  }
};
