/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.standalone.IiifViewer');

goog.require('klokantech.IiifViewer');
goog.require('klokantech.SmoothMWZoomInteraction');

goog.require('ol.ImageTile');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.has');
goog.require('ol.interaction');
goog.require('ol.layer.Tile');
goog.require('ol.proj.Projection');
goog.require('ol.source.TileImage');
goog.require('ol.tilegrid.XYZ');



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
