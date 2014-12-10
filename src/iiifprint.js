/**
 *
 * @author dalibor.janak@klokantech.com
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
   * @type string
   */
  this.layoutOrientation = this.parseOrientation_(layoutOrientation);

  /**
   * @type Array
   */
  this.layoutFormats = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 210],
    a5: [210, 148]
  };

  /**
   * @type array
   */
  this.layoutFormat = this.layoutFormats[layoutFormat.toLowerCase()];

  /**
   * Default text size
   * @type {number}
   */
  this.textSize = 20;

  /**
   * @type {object}
   */
  this.doc = new jsPDF(this.layoutOrientation, 'mm', this.layoutFormat);
};

/**
 * Adds text to document
 * @param {string} text
 * @param {number} size
 * @param {array} color Color in RGB format eg. [255, 0, 0]
 * @param {number} xPos
 * @param {number} yPos
 * @returns {undefined}
 */
klokantech.IiifPrint.prototype.addText = function(
        text, size, color, xPos, yPos) {
  if (color !== null) {
    this.doc.setTextColor(color[0], color[1], color[2]);
  }
  if (size === null) {
    size = this.textSize;
  }
  this.doc.setFontSize(size);

  this.doc.text(text, xPos, yPos);
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
  this.doc.addImage(imgData, 'JPEG', posX, posY, sizeX, sizeY);
};

/**
 * Adds map to document
 * @param {string|object} map id of element with map
 * @param {number?} posX
 * @param {number?} posY
 */
klokantech.IiifPrint.prototype.addMap = function(map, posX, posY) {
  //get canvas with map
  var mapElement = goog.dom.isElement(map) ? map : goog.dom.getElement(map);
  var canvas = goog.dom.getElementsByTagNameAndClass(
          'canvas', null, mapElement)[0];

  //print white background to canvas
  var context = canvas.getContext("2d");
  var data = context.getImageData(0, 0, canvas.width, canvas.height);
  var compositeOperation = context.globalCompositeOperation;
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  var imgData = canvas.toDataURL('image/jpeg');

  //calculate size of image (all image in page)
  var imgWidth, imgHeight, pxPerMm;
  if (canvas.width > canvas.height) {
    imgWidth = this.layoutOrientation.indexOf(['l', 'landscape']) ?
            this.layoutFormat[0] : this.layoutFormat[1];
    pxPerMm = canvas.width / imgWidth;
    imgHeight = canvas.height / pxPerMm;
  } else {
    imgHeight = this.layoutOrientation.indexOf(['l', 'landscape']) ?
            this.layoutFormat[0] : this.layoutFormat[1];
    pxPerMm = canvas.height / imgHeight;
    imgWidth = canvas.width / pxPerMm;
  }

  //position
  var posX = goog.isDefAndNotNull(posX) ? posX : 0;
  var posY = goog.isDefAndNotNull(posY) ? posX : 0;

  this.doc.addImage(imgData, 'JPEG', posX, posY, imgWidth, imgHeight);
};

/**
 * Save pdf file
 * @param {string} filename
 */
klokantech.IiifPrint.prototype.save = function(filename) {
  filename = filename.slice(-4) === '.pdf' ? filename : filename + '.pdf';
  this.doc.save(filename);
};

/**
 * Draw rectangle
 * @param {number} posX
 * @param {number} posY
 * @param {number} width
 * @param {number} height
 * @param {array} color Rgb eg. [255,0,0]
 */
klokantech.IiifPrint.prototype.addRectangle = function(
        posX, posY, width, height, color) {
  var style = 'F';
  this.doc.setFillColor(color[0], color[1], color[2]);
  this.doc.rect(posX, posY, width, height, style);
  this.doc.setFillColor(0, 0, 0);
};

/**
 * Validates orientation of page or calculating auto values
 * @param {string} orientation Auto, landscape (l), portrait (p)
 * @returns {string}
 * @private
 */
klokantech.IiifPrint.prototype.parseOrientation_ = function(orientation) {
  if (orientation === 'auto') {
    var viewPortSize = new goog.dom.ViewportSizeMonitor().getSize();
    orientation = viewPortSize.width > viewPortSize.height ? 'l' : 'p';

  } else if (!orientation.indexOf(['l', 'p', 'landscape', 'portrait'])) {
    orientation = 'l';
  }
  return orientation;
};