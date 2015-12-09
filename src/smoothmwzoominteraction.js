/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.SmoothMWZoomInteraction');

goog.require('goog.events');
goog.require('goog.events.MouseWheelHandler.EventType');
goog.require('goog.math');

goog.require('ol.animation');
goog.require('ol.easing');
goog.require('ol.interaction.Interaction');



/**
 * Allows the user to zoom the map by scrolling the mouse wheel.
 * Modified to zoom smoothly.
 * @constructor
 * @extends {ol.interaction.Interaction}
 */
klokantech.SmoothMWZoomInteraction = function() {
  goog.base(this, {
    handleEvent: goog.bind(this.handleEvent_, this)
  });

  /**
   * @private
   * @type {number}
   */
  this.delta_ = 0;

  /**
   * @private
   * @type {?ol.Coordinate}
   */
  this.lastAnchor_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.centerChangeMutex_ = false;

  /**
   * @private
   * @type {?number}
   */
  this.intervalId_ = null;

};
goog.inherits(klokantech.SmoothMWZoomInteraction,
              ol.interaction.Interaction);


/**
 * @define {number} Speed factor.
 */
klokantech.SmoothMWZoomInteraction.DELTA_ADJUST = 12;


/**
 * @define {number} Maximal value for the adjusted delta. ([-max, max])
 *                                (speed -- resolution delta per timeout)
 */
klokantech.SmoothMWZoomInteraction.MAX_DELTA = 1.5;


/**
 * @define {number} Timeout duration.
 */
klokantech.SmoothMWZoomInteraction.TIMEOUT_DURATION = 125;


/** @inheritDoc */
klokantech.SmoothMWZoomInteraction.prototype.setMap = function(map) {
  goog.base(this, 'setMap', map);
  if (map) {
    var view = /** @type {ol.View} */(map.getView());
    goog.events.listen(view,
        ol.Object.getChangeEventType(ol.ViewProperty.CENTER), function(e) {
          if (!this.centerChangeMutex_) this.lastAnchor_ = null;
        }, false, this);
  }
};


/**
 * @param {ol.mapBrowserEvent} mapBrowserEvent
 * @return {boolean}
 * @private
 */
klokantech.SmoothMWZoomInteraction.prototype.handleEvent_ =
    function(mapBrowserEvent) {
  var stopEvent = false;
  if (mapBrowserEvent.type ==
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL) {
    var map = mapBrowserEvent.map;
    var mouseWheelEvent = mapBrowserEvent.browserEvent;

    this.lastAnchor_ = mapBrowserEvent.coordinate;
    var adjusted = mouseWheelEvent.deltaY /
                   klokantech.SmoothMWZoomInteraction.DELTA_ADJUST;
    if (this.delta_ > 0 == mouseWheelEvent.deltaY > 0) {
      this.delta_ += adjusted;
    } else {
      this.delta_ = adjusted;
    }
    this.delta_ = goog.math.clamp(this.delta_,
        -klokantech.SmoothMWZoomInteraction.MAX_DELTA,
        klokantech.SmoothMWZoomInteraction.MAX_DELTA);

    if (!goog.isDefAndNotNull(this.intervalId_)) {
      this.intervalId_ = goog.global.setInterval(
          goog.bind(this.doZoom_, this, map),
          klokantech.SmoothMWZoomInteraction.TIMEOUT_DURATION);
    }

    mapBrowserEvent.preventDefault();
    stopEvent = true;
  }
  return !stopEvent;
};


/**
 * @param {ol.Map} map Map.
 * @private
 * @suppress {accessControls}
 */
klokantech.SmoothMWZoomInteraction.prototype.doZoom_ =
    function(map) {
  var view = map.getView();
  var state = view.getState();
  var currentResolution = state.resolution;
  var currentCenter = state.center;
  if (goog.isDef(currentResolution) && goog.isDef(currentCenter)) {
    var acc = ol.easing.linear;
    map.beforeRender(ol.animation.zoom({
      resolution: currentResolution,
      duration: klokantech.SmoothMWZoomInteraction.TIMEOUT_DURATION,
      easing: acc
    }));
    if (this.lastAnchor_) {
      map.beforeRender(ol.animation.pan({
        source: currentCenter,
        duration: klokantech.SmoothMWZoomInteraction.TIMEOUT_DURATION,
        easing: acc
      }));
    }
  }
  var delta = goog.math.clamp(this.delta_, -1, 1);
  var resolution = Math.pow(2, this.delta_) * currentResolution;
  resolution = view.constrainResolution(resolution);

  if (this.lastAnchor_) {
    var center = view.calculateCenterZoom(resolution, this.lastAnchor_);
    this.centerChangeMutex_ = true;
    view.setCenter(center);
    this.centerChangeMutex_ = false;
  }
  view.setResolution(resolution);

  this.delta_ /= 2;
  if (Math.abs(this.delta_) < 0.01) {
    this.delta_ = 0;
    goog.global.clearInterval(this.intervalId_);
    this.intervalId_ = null;
  }
};
