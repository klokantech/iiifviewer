PLOVR_VERSION=7.1.0
PLOVR=plovr-$(PLOVR_VERSION).jar

.PHONY: serve build lint

all: serve
.PHONY: plovr
plovr: $(PLOVR)
$(PLOVR):
	wget --no-check-certificate -O $(PLOVR) https://github.com/bolinfest/plovr/releases/download/v$(PLOVR_VERSION)/plovr.jar
ol-init:
	cd ol && npm install && node tasks/generate-externs.js ../ol-externs.js
serve:
	java -jar $(PLOVR) serve standalone-debug.json plugin-debug.json
build: build/iiifviewer.js
build/iiifviewer.js:
	mkdir -p build
	java -jar $(PLOVR) build standalone.json > build/iiifviewer.js
	java -jar $(PLOVR) build plugin.json > build/ol-iiifviewer.js
lint:
	fixjsstyle --strict -r ./src
	gjslint --strict -r ./src
