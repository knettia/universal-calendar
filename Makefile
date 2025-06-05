PANDOC=pandoc
TSC=tsc
TSC_TARGET=es2017
TSC_LIBS=es2017,dom

all: INFO.html index.js

INFO.html: INFO.md
	$(PANDOC) -o $@ $<

index.js: index.ts
	$(TSC) $< --target $(TSC_TARGET) --lib $(TSC_LIBS)

clean:
	rm -f INFO.html index.js
