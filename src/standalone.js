/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.standalone.IiifViewer');

goog.require('klokantech.AllOLRequires');
goog.require('klokantech.IiifViewer');
goog.require('klokantech.IiifPrint');
goog.require('klokantech.SmoothMWZoomInteraction');



/**
 * @param {string|Element} element
 * @param {string|!Object.<string, *>} dataOrUrl
 * @param {Function=} opt_initCallback
 * @constructor
 */
klokantech.standalone.IiifViewer = function(element, dataOrUrl,
        opt_initCallback) {
  goog.base(this, element, dataOrUrl,
          opt_initCallback, undefined,
          new klokantech.SmoothMWZoomInteraction());
};
goog.inherits(klokantech.standalone.IiifViewer, klokantech.IiifViewer);

goog.exportSymbol('IiifViewer', klokantech.standalone.IiifViewer);

/**
 * @param {string} layoutFormat
 * @param {string} layoutOrientation
 * @constructor
 */
klokantech.standalone.IiifPrint = function(layoutFormat, layoutOrientation) {
  goog.base(this, layoutFormat, layoutOrientation);
};
goog.inherits(klokantech.standalone.IiifPrint, klokantech.IiifPrint);

goog.exportSymbol('IiifPrint', klokantech.standalone.IiifPrint);
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
