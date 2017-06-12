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
  this.anchor_ = null;

  /**
   * @type {number}
   * @private
   */
  this.targetResolution_ = 0;

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
klokantech.SmoothMWZoomInteraction.MAX_DELTA = 0.5;


/**
 * @define {number} Timeout duration.
 */
klokantech.SmoothMWZoomInteraction.TIMEOUT_DURATION = 100;


/**
 * @param {ol.MapBrowserEvent} mapBrowserEvent
 * @return {boolean}
 * @private
 */
klokantech.SmoothMWZoomInteraction.prototype.handleEvent_ =
    function(mapBrowserEvent) {
  var stopEvent = false;
  if (mapBrowserEvent.type == ol.events.EventType.WHEEL) {
    var mouseWheelEvent = mapBrowserEvent.originalEvent;

    this.anchor_ = mapBrowserEvent.coordinate;
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
          goog.bind(this.doZoom_, this),
          klokantech.SmoothMWZoomInteraction.TIMEOUT_DURATION);
    }

    mapBrowserEvent.preventDefault();
    stopEvent = true;
  }
  return !stopEvent;
};


/**
 * @private
 */
klokantech.SmoothMWZoomInteraction.prototype.doZoom_ = function() {
  var view = this.getMap().getView();
  if (view.getAnimating()) {
    view.cancelAnimations();
  }
  var resolution = Math.pow(2, this.delta_) *
      (this.targetResolution_ || view.getState().resolution);
  this.targetResolution_ = goog.math.clamp(
      resolution,
      view.getMinResolution() || 0,
      view.getMaxResolution() || Infinity
      );

  view.animate({
    anchor: this.anchor_,
    resolution: this.targetResolution_,
    duration: klokantech.SmoothMWZoomInteraction.TIMEOUT_DURATION,
    easing: ol.easing.linear
  });

  this.delta_ /= 2;
  if (Math.abs(this.delta_) < 0.01) {
    this.delta_ = 0;
    this.anchor_ = null;
    this.targetResolution_ = 0;
    goog.global.clearInterval(this.intervalId_);
    this.intervalId_ = null;
  }
};
