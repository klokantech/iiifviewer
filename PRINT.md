IiifPrint
===========
Simple component for printing of documents from IiifViewer to PDF on client side. This component requires [jsPDF library](https://github.com/MrRio/jsPDF).
Basic usage:
```
var doc = new IiifPrint();
doc.addDocument('viewer');
doc.save();
```
Constructor ```IiifPrint()``` accepts two parameters:

*page size* - paper format (a0-a6), array with values in mm [295, 210] or 'auto' which will detect size of page automatically<br>
*orientation* - values l (landscape), p (portrait) or 'auto'

Methods
--------
Default position of elements starts from left-top corner. IiifPrint allows to set position from another corner of document using negative values.<br>
For example to add rectangle to bottom. The position will be set on 0, -10 with rectangle height 10.

**IiifPrint.addText(text, size, color, posX, posY)**<br>
Adds text to folowing position.<br>
Params:<br>
*text*<br>
*size* - size of text in mm<br>
*color* - color in rgb form as array e.g. [50, 0, 0]<br>
*posX, posY* - position in mm.<br>

**IiifPrint.addBase64Image(imgData, posX, posY, sizeX, sizeY)**<br>
To document is added image, but the image has to be encoded with base64.

**IiifPrint.addDocument(document, posX, posY)**<br>
This method will find canvas in element which is passed as first parameter (also div id as string is supported) and it adds image from canvas to document as JPEG with white background. PNG files are not supported by jsPDF.

**IiifPrint.addRectangle(posX, posY, width, height, color)**<br>
To document adds custom rectangle without borders.

**IiifPrint.save(name)**<br>
It returns pdf document.

Example
-------
See live [example in IiifViewer examples](http://klokantech.github.io/iiifviewer/examples/print.html).
```
<!doctype html>
<html>
  <head>
    <script src="http://parall.ax/parallax/js/jspdf.js"></script>
    <script src="iiifviewer-pdf.js"></script>
    <title>IIIF Viewer</title>
    <style>
      html, body, #viewer{width:100%;height:100%;margin:0;padding:0;}
      #btn-print{position: absolute; top: 20px; right: 20px;}
    </style>
  </head>
  <body>
    <div id="viewer"></div>
    <button id="btn-print" onclick="print();">Print</button>

    <script type="text/javascript">
      //init IiifViewer
      var url = location.hash.toString().substr(1);
      if (url.length < 2) url = 'http://iiif.klokantech.com/demo.jp2/info.json';
      new IiifViewer('viewer', url, undefined, '');

      function print() {
        var logo = 'data:image/jpeg;base64,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';

        var doc = new IiifPrint('a4', 'auto');
        //adds document
        doc.addDocument('viewer');

        //Adds image to document
        doc.addBase64Image(logo, 10, 10, 59, 17);
        //Adds text to document
        doc.addText('IiifViewer', 25, [0, 0, 0], 28, 21.5);

        //Draw text to bottom of document
        var rHeight = 8;
        doc.addRectangle(0, -(rHeight), 297, rHeight, [255, 255, 255]);
        //it's possible to draw from another corner using negative values of position
        doc.addText(location.host, 12, [0, 0, 0], 10, -10);

        //Get pdf
        doc.save('mydocument');
      }
    </script>
  </body>
</html>

```

CORS
----
If you want to create PDF documents from data on different domains,
the tiles needs to have CORS headers set on the remote server (see http://www.enable-cors.org/ for more details).
You also need to instruct the IiifViewer how to set the CORS attributes -- the most common way is to pass empty string (`''`) as fourth parameter to the constructor (see above).
