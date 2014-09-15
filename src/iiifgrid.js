/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifGrid');

goog.require('ol.tilegrid.XYZ');



/**
 * @constructor
 * @extends {ol.tilegrid.XYZ}
 * @param {olx.tilegrid.TileGridOptions} options
 */
klokantech.IiifGrid = function(options) {
  ol.tilegrid.TileGrid.call(this, options);
};
goog.inherits(klokantech.IiifGrid, ol.tilegrid.XYZ);
