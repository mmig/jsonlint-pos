
all: build test site

build:
	node ./node_modules/jison/lib/cli.js src/jsonlint.y src/jsonlint.l
	mv jsonlint.js lib/jsonlint-ext.js
	node scripts/bundle.js > web/jsonlint-ext.js
	node scripts/bundle.js | node ./node_modules/uglify-js/bin/uglifyjs > web/jsonlint-ext.min.js

site:
	cp web/jsonlint-ext.min.js ../jsonlint-pages/jsonlint-ext.js

deploy: site
	cd ../jsonlint-pages && git commit -a -m 'deploy site updates' && git push origin gh-pages

test: lib/jsonlint-ext.js test/all-tests.js
	node test/all-tests.js
