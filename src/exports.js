/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifViewerExports');

goog.require('klokantech.IiifSource');
goog.require('klokantech.IiifViewer');


goog.exportSymbol('IiifViewer', klokantech.IiifViewer);
goog.exportSymbol('IiifViewer.prototype.getMap',
                  klokantech.IiifViewer.prototype.getMap);

goog.exportSymbol('IiifSource', klokantech.IiifSource);
