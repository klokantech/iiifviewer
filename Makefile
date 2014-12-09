PLOVR = plovr-1.1.0.jar

.PHONY: serve build lint

all: serve
serve:
	java -jar $(PLOVR) serve standalone-debug.json plugin-debug.json
build: build/iiifviewer.js
build/iiifviewer.js:
	java -jar $(PLOVR) build standalone.json > build/iiifviewer.js
	java -jar $(PLOVR) build plugin.json > build/ol-iiifviewer.js
lint:
	fixjsstyle --strict -r ./src
	gjslint --strict -r ./src
