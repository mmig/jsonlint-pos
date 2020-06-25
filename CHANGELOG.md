ChangeLog for `jsonlint-pos`
----------------------------

Repository  
https://github.com/mmig/jsonlint-pos

Package  
https://www.npmjs.com/package/jsonlint-pos


-------------
Version 2.0.0
-------------

**Changes**

 * removed file `bower.json`

**Breaking Changes**

 * simplified accessing position information for array entries:  
   `_i<number>` &rarr; `_<number>`  
   do not use `_i<number>` but `_<number>`, to make it more consistent with
   accessing position information in general objects (`_<member name>`)  
   **NOTE** this was documented incorrectly before: now the implementation
            actually matches the documentation!


-------------
Version 1.7.1
-------------

**Changes**

 * BUGFIX for `cli` caused by change of dependency from `underscore` to `lodash`  
   _(`cli` now works again)_

-------------
Version 1.7.0
-------------

first version of `jsonlint-pos` based on `jsonlint-ext`
https://github.com/russaa/jsonlint-ext

`jsonlint-pos` is available on `npm`  
https://www.npmjs.com/package/jsonlint-pos

**Changes**

 * use UMD wrapper for detecting if instance should be exported AMD or CommonJS module or Global variable
 * include `min` mapping file for `web/jasonlint-pos.min.js`
 * renabled command line and added 2 options:
   ```
   -P, --position           include position information in the result [false]
   -S, --strict             parse in strict mode, e.g. disallow duplicate keys [false]
   ```
 * added JSON Editor demo to master branch directory `example/**`
 * BUGFIX applied PR zaach/jsonlint#54 fixing issue zaach/jsonlint#34:  
   correctly read escaped characters (e.g. escaped unicode chars)
 * migrated build from `Makefile` to pure node scripts in `scripts/**`
 * added test cases for `strict` mode and position extraction features


**Breaking Changes**

 * renamed `loc`/location to `pos`/position and moved parser functions to parser instance
   * renamed library file `jsonlint-ext.*` &rarr; `jsonlint-pos.*`
   * `_loc` (results position field) &rarr; `_pos`  
       _(customizable now, see `setPosEnabled(..)`)_
   * `jsonlint.setLocEnabled(value: boolean)` &rarr; `jsonlint.parser.setPosEnabled(value: boolean | string)`  
       in addition to enabling, this allows now to set a custom position-field name (in results),
       if given a `string` instead of `true` (if `true`, default name `_pos` is used)
   * `jsonlint.isLoc() : boolean` &rarr; `jsonlint.parser.getPos() : boolean | string`
 * moved parser functions for `strict` mode to parser instance
   * `jsonlint.isStrict() : boolean` &rarr; `jsonlint.parser.isStrict() : boolean`
   * `jsonlint.setStrict(value : boolean)` &rarr; `jsonlint.parser.setStrict(value : boolean)`
 * moved web page _(example)_ from `web/**` to `example/**`
