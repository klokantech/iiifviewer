PLOVR = plovr-81ed862.jar

.PHONY: serve build lint

all: serve
serve:
	java -jar $(PLOVR) serve iiifviewer-debug.json
build: build/iiifviewer.js
build/iiifviewer.js:
	java -jar $(PLOVR) build iiifviewer.json > build/iiifviewer.js
lint:
	fixjsstyle --strict -r ./src
	gjslint --strict -r ./src
