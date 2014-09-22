/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.standalone.IiifViewer');

goog.require('klokantech.IiifViewer');
goog.require('klokantech.SmoothMWZoomInteraction');
goog.require('klokantech.olrequires');



/**
 * @param {string|Element} element
 * @param {string|!Object.<string, *>} dataOrUrl
 * @constructor
 */
klokantech.standalone.IiifViewer = function(element, dataOrUrl) {
  goog.base(this, element, dataOrUrl, new klokantech.SmoothMWZoomInteraction());
};
goog.inherits(klokantech.standalone.IiifViewer, klokantech.IiifViewer);

goog.exportSymbol('IiifViewer', klokantech.standalone.IiifViewer);
