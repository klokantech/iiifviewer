/**
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.standalone.IiifViewer');

goog.require('klokantech.AllOLRequires');
goog.require('klokantech.IiifPrint');
goog.require('klokantech.IiifViewer');
goog.require('klokantech.SmoothMWZoomInteraction');



/**
 * @param {string|Element} element
 * @param {string|!Object.<string, *>} dataOrUrl
 * @param {function(klokantech.IiifViewer)=} opt_initCallback
 * @param {string=} opt_crossOrigin
 * @constructor
 * @extends {klokantech.IiifViewer}
 */
klokantech.standalone.IiifViewer = function(element, dataOrUrl,
                                            opt_initCallback, opt_crossOrigin) {
  goog.base(this, element, dataOrUrl,
            opt_initCallback, opt_crossOrigin, undefined,
            new klokantech.SmoothMWZoomInteraction());
};
goog.inherits(klokantech.standalone.IiifViewer, klokantech.IiifViewer);

goog.exportSymbol('IiifViewer', klokantech.standalone.IiifViewer);
goog.exportSymbol('IiifViewer.prototype.getMap',
                  klokantech.IiifViewer.prototype.getMap);
goog.exportSymbol('IiifViewer.prototype.addPermalink',
                  klokantech.IiifViewer.prototype.addPermalink);
