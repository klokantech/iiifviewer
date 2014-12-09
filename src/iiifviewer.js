/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
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
 * @param {boolean=} opt_useWebGL
 * @param {ol.interaction.Interaction=} opt_ownMWInteraction
 * @constructor
 */
klokantech.IiifViewer = function(element, dataOrUrl,
                                 opt_initCallback, opt_useWebGL,
                                 opt_ownMWInteraction) {
  var el = goog.dom.getElement(element);
  if (!el) throw Error('Invalid element');

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
    url = this.guessedUrl_;
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
    projection: proj,
    crossOrigin: this.useWebGL_ ? '' : undefined
  });
  var layer = new ol.layer.Tile({
    source: /** @type {!ol.source.Source} */((src))
  });

  this.map_ = new ol.Map({
    layers: [layer],
    target: this.mapElement_,
    renderer: this.useWebGL_ ? 'webgl' : undefined,
    view: new ol.View({
      projection: proj,
      extent: [0, -h, w, 0]
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

  this.map_.getView().fitExtent(proj.getExtent(), this.map_.getSize() || null);

  if (this.initCallback_) this.initCallback_(this);
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
        var data = /** @type {Object.<string, *>} */(xhr_.getResponseJson());
        this.init_(data);
      }
    }, false, this);
    xhr_.send(dataOrUrl);
  } else {
    this.initLayer_(dataOrUrl);
  }
};
