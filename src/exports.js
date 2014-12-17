/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifViewerExports');

goog.require('klokantech.IiifSource');
goog.require('klokantech.IiifViewer');
goog.require('klokantech.IiifPrint');


goog.exportSymbol('IiifViewer', klokantech.IiifViewer);
goog.exportSymbol('IiifViewer.prototype.getMap',
        klokantech.IiifViewer.prototype.getMap);

goog.exportSymbol('IiifSource', klokantech.IiifSource);

goog.exportSymbol('IiifPrint', klokantech.IiifPrint);
goog.exportSymbol('IiifPrint.prototype.addText',
        klokantech.IiifPrint.prototype.addText);
goog.exportSymbol('IiifPrint.prototype.addBase64Image',
        klokantech.IiifPrint.prototype.addBase64Image);
goog.exportSymbol('IiifPrint.prototype.addMap',
        klokantech.IiifPrint.prototype.addMap);
goog.exportSymbol('IiifPrint.prototype.addRectangle',
        klokantech.IiifPrint.prototype.addRectangle);
goog.exportSymbol('IiifPrint.prototype.save',
        klokantech.IiifPrint.prototype.save);
