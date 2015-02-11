PLOVR = plovr-2.0.0.jar

.PHONY: serve build lint

all: serve
ol-init:
	cd ol3js && npm install && node tasks/generate-externs.js ../ol3-externs.js
serve: ol-init
	java -jar $(PLOVR) serve standalone-debug.json plugin-debug.json
build: ol-init build/iiifviewer.js
build/iiifviewer.js:
	java -jar $(PLOVR) build standalone.json > build/iiifviewer.js
	java -jar $(PLOVR) build plugin.json > build/ol-iiifviewer.js
lint:
	fixjsstyle --strict -r ./src
	gjslint --strict -r ./src
