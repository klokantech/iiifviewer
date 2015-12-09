/**
 *
 * @author dalibor.janak@klokantech.com (Dalibor Janak)
 *
 * Copyright 2014 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('klokantech.IiifPrint');

goog.require('goog.dom');



/**
 * @constructor
 * @param {string} layoutFormat
 * @param {string} layoutOrientation
 */
klokantech.IiifPrint = function(layoutFormat, layoutOrientation) {

  /**
   * @type {array}
   */
  this.layoutFormat = layoutFormat;

  /**
   * @type {string}
   */
  this.layoutOrientation = layoutOrientation;

  /**
   * Default text size
   * @type {number}
   */
  this.textSize = 20;

  /**
   * @type {?object}
   */
  this.doc = null;
};


/**
 * @private
 */
klokantech.IiifPrint.prototype.init_ = function() {
  if (this.doc === null) {
    this.layoutOrientation = this.parseOrientation_(this.layoutOrientation);
    this.layoutFormat = this.parseFormat_(this.layoutFormat);
    this.doc = new jsPDF(this.layoutOrientation, 'mm', this.layoutFormat);
  }
};


/**
 * Adds text to document
 * @param {string} text
 * @param {number} size
 * @param {?Array} color
 * @param {number} posX accepts negative values
 * @param {number} posY accepts negative values
 * @return {undefined}
 */
klokantech.IiifPrint.prototype.addText = function(
        text, size, color, posX, posY) {
  this.init_();
  if (color !== null) {
    this.doc.setTextColor(color[0], color[1], color[2]);
  }
  if (size === null) {
    size = this.textSize;
  }
  this.doc.setFontSize(size);

  var pos = this.parsePosition_(posX, posY);
  this.doc.text(text, pos[0], pos[1]);

  this.doc.setTextColor(0, 0, 0);
};


/**
 * Place image to document (only jpeg support)
 * @param {string} imgData
 * @param {number} posX
 * @param {number} posY
 * @param {number} sizeX
 * @param {number} sizeY
 */
klokantech.IiifPrint.prototype.addBase64Image = function(
        imgData, posX, posY, sizeX, sizeY) {
  this.init_();
  var pos = this.parsePosition_(posX, posY);

  this.doc.addImage(imgData, 'JPEG', pos[0], pos[1], sizeX, sizeY);
};


/**
 * Adds document from canvas
 * @param {string} elem
 * @param {?number} posX
 * @param {?number} posY
 */
klokantech.IiifPrint.prototype.addDocument = function(elem, posX, posY) {
  //get canvas with document
  var docElement = goog.dom.getElement(elem);
  var canvases = goog.dom.getElementsByTagNameAndClass(
      'canvas', null, docElement);
  var canvas = canvases[0];
  //print white background to canvas
  var context = canvas.getContext('2d');
  context.globalCompositeOperation = 'destination-over';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  var imgData = canvas.toDataURL('image/jpeg');
  var imgWidth, imgHeight;

  //add size to page size
  if (this.layoutFormat === 'auto') {
    this.layoutFormat = [canvas.width / 4, canvas.height / 4];
    imgWidth = canvas.width / 4;
    imgHeight = canvas.height / 4;

    this.init_();
  } else {
    this.init_();
    //calculate size of image (all image in page)
    var pxPerMm;
    if (canvas.width > canvas.height) {
      imgWidth = this.layoutOrientation.indexOf(['l', 'landscape']) > 0 ?
              this.layoutFormat[1] : this.layoutFormat[0];
      pxPerMm = canvas.width / imgWidth;
      imgHeight = canvas.height / pxPerMm;
    } else {
      imgHeight = this.layoutOrientation.indexOf(['p', 'portrait']) > 0 ?
              this.layoutFormat[1] : this.layoutFormat[0];
      pxPerMm = canvas.height / imgHeight;
      imgWidth = canvas.width / pxPerMm;
    }
  }

  //position
  var pos = this.parsePosition_(posX || 0, posY || 0);

  this.doc.addImage(imgData, 'JPEG', pos[0], pos[1], imgWidth, imgHeight);
};


/**
 * Save pdf file
 * @param {string} filename
 */
klokantech.IiifPrint.prototype.save = function(filename) {
  if (goog.isDefAndNotNull(filename)) {
    filename = filename.slice(-4) === '.pdf' ? filename : filename + '.pdf';
  } else {
    filename = 'doc';
  }
  this.doc.save(filename);
};


/**
 * Draw rectangle
 * @param {number} posX
 * @param {number} posY
 * @param {number} width
 * @param {number} height
 * @param {Array} color Rgb eg. [255,0,0]
 */
klokantech.IiifPrint.prototype.addRectangle = function(
        posX, posY, width, height, color) {
  this.init_();
  this.doc.setFillColor(color[0], color[1], color[2]);

  var pos = this.parsePosition_(posX, posY);
  this.doc.rect(pos[0], pos[1], width, height, 'F');
  this.doc.setFillColor(0, 0, 0);
};


/**
 * Validates orientation of page or calculating auto values
 * @param {string} orientation Auto, landscape (l), portrait (p)
 * @return {string}
 * @private
 */
klokantech.IiifPrint.prototype.parseOrientation_ = function(orientation) {
  if (orientation === 'auto' || !goog.isDefAndNotNull(orientation)) {
    orientation = window.innerWidth > window.innerHeight ? 'l' : 'p';
  } else if (!orientation.indexOf(['l', 'p', 'landscape', 'portrait'])) {
    orientation = 'l';
  }
  return orientation.substring(0, 1);
};


/**
 * Validates or calculates size of page
 * @param {string|Array} size Auto, page or array in mm
 * @return {array}
 * @private
 */
klokantech.IiifPrint.prototype.parseFormat_ = function(size) {
  var layoutFormats = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 210],
    a5: [210, 148]
  };
  var pageSize;

  if (size === 'auto' || !goog.isDefAndNotNull(size)) {
    //calculates page size
    var viewPortWidth = window.innerWidth;
    var viewPortHeight = window.innerHeight;
    pageSize = viewPortWidth > viewPortHeight ?
               [viewPortWidth / 4, viewPortHeight / 4] :
               [viewPortHeight / 4, viewPortWidth / 4];
  } else if (!goog.isArray(size) &&
             goog.isDefAndNotNull(layoutFormats[size.toLowerCase()])) {
    //chose from layoutformats
    pageSize = layoutFormats[size.toLowerCase()];
  } else if (goog.isArray(size) && goog.isDefAndNotNull(size[0]) &&
             goog.isDefAndNotNull(size[1])) {
    //is array with size passed
    pageSize = size;
  } else {
    //give A4 by default
    pageSize = [297, 210];
  }
  return pageSize;
};


/**
 * Calculates position from another corner
 * @param {number} xPos
 * @param {number} yPos
 * @return {Array}
 * @private
 */
klokantech.IiifPrint.prototype.parsePosition_ = function(xPos, yPos) {
  if (xPos < 0) {
    if (this.layoutOrientation === 'l') {
      xPos = xPos + this.layoutFormat[0];
    } else {
      xPos = xPos + this.layoutFormat[1];
    }
  }
  if (yPos < 0) {
    if (this.layoutOrientation === 'l') {
      yPos = yPos + this.layoutFormat[1];
    } else {
      yPos = yPos + this.layoutFormat[0];
    }
  }
  return [xPos, yPos];
};

goog.exportSymbol('IiifPrint', klokantech.IiifPrint);
goog.exportSymbol('IiifPrint.prototype.addText',
                  klokantech.IiifPrint.prototype.addText);
goog.exportSymbol('IiifPrint.prototype.addBase64Image',
                  klokantech.IiifPrint.prototype.addBase64Image);
goog.exportSymbol('IiifPrint.prototype.addDocument',
                  klokantech.IiifPrint.prototype.addDocument);
goog.exportSymbol('IiifPrint.prototype.addRectangle',
                  klokantech.IiifPrint.prototype.addRectangle);
goog.exportSymbol('IiifPrint.prototype.save',
                  klokantech.IiifPrint.prototype.save);
