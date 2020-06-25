JSON Lint Position
=========
[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/mmig/jsonlint-pos/master)](https://github.com/mmig/jsonlint-pos)
[![npm](https://img.shields.io/npm/v/jsonlint-pos)](https://www.npmjs.com/package/jsonlint-pos)
![Node.js CI](https://github.com/mmig/jsonlint-pos/workflows/Node.js%20CI/badge.svg)

A modified version of the JavaScript [JSON parser][1] by Z. Carter.

This JSON parser allows to extract the _position_ information and offers a _strict_
mode (disallowing duplicate property names). For more details, see below.

EXTENSION
----

Modified JSON parser with:
 * [additional position information](#feature-position-information) (i.e. position of objects within parsed string)
 * [`strict` parsing mode](#feature-strict-parsing-mode) which
   * will throw an error if JSON object has duplicate keys
   * _TODO: add features for strict parsing mode(?)_


## Demo
Try the **[JSON Editor Demo][2]** that uses the modified JSON parser:\
the demo page uses the _position information_ for marking JSON errors in an editor.
In addition, you can try out the extended options of the JSON verifier, e.g. with/without
`strict` mode (see details below).

Or the small, very _[Simple Demo][3]_ which also allows to try out the _strict_
and extracting then position information.

TOC
-----
<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:0 orderedList:0 -->

- [Demo](#demo)
- [Command line interface](#command-line-interface)
	- [Options](#options)
- [Usage](#usage)
	- [Include in Webpage](#include-in-webpage)
	- [As Pure JS](#as-pure-js)
	- [As AMD Module](#as-amd-module)
	- [As CommonJS Module](#as-commonjs-module)
	- [Import Module (e.g. TypeScript)](#import-module-eg-typescript)
	- [FEATURE: Position Information](#feature-position-information)
		- [The `pos` Object](#the-pos-object)
		- [`pos` for Properties](#pos-for-properties)
		- [pos for Arrays and Objects](#pos-for-arrays-and-objects)
		- [`pos` for `Array` Entries](#pos-for-array-entries)
		- [Set custom field name for the `pos` Object](#set-custom-field-name-for-the-pos-object)
	- [FEATURE: Strict parsing mode](#feature-strict-parsing-mode)
- [MIT License](#mit-license)

<!-- /TOC -->


## Command line interface
Install jsonlint with npm to use the command line interface:

    npm install -g jsonlint-pos

Validate a file like so:

    jsonlint myfile.json

or pipe input into stdin:

    cat myfile.json | jsonlint

jsonlint will either report a syntax error with details or pretty print the source if it is valid.

### Options

    $ jsonlint -h

    Usage: jsonlint [file] [options]

    file     file to parse; otherwise uses stdin

    Options:
       -v, --version            print version and exit
       -s, --sort-keys          sort object keys
       -i, --in-place           overwrite the file
       -t CHAR, --indent CHAR   character(s) to use for indentation  [  ]
       -c, --compact            compact error display
       -V, --validate           a JSON schema to use for validation
       -e, --environment        which specification of JSON Schema the validation file uses  [json-schema-draft-03]
       -q, --quiet              do not print the parsed json to STDOUT  [false]
       -p, --pretty-print       force pretty printing even if invalid
       -P, --position           include position information in the result [false]
       -S, --strict             parse in strict mode, e.g. disallow duplicate keys [false]

------

## Usage

### Include in Webpage

include `web/jsonlint-pos.js` or `web/jsonlint-pos.min.js` (the later optionally with `*.min.js.map` file)
in your web page:
```html
<!-- EITHER uncompressed library (with comments etc): -->
<script src="<path to your file>/jsonlint-pos.js"></script>
<!-- OR compressed library (OPTIONALLY include *.min.js.map for source mapping): -->
<script src="<path to your file>/jsonlint-pos.min.js"></script>
```


### As Pure JS

When no modlue loader is present (i.e. no `require(..)` function is available),
then the module is exported as global variable `jsonlint`:

```javascript
// use jsonlint, e.g.
jsonlint.parser.setStrict(true);
var json = jsonlint.parser.parse(...
```

### As AMD Module

```javascript
require('jsonlint-pos', function(jsonlint){
    // use jsonlint, e.g.
    jsonlint.parser.setStrict(true);
    var json = jsonlint.parser.parse(...
})
```

### As CommonJS Module

```javascript
var jsonlint = require('jsonlint-pos');

// use jsonlint, e.g.
jsonlint.parser.setStrict(true);
var json = jsonlint.parser.parse(...
```

### Import Module (e.g. TypeScript)

```
import * as jsonlint from 'jsonlint-pos';

// use jsonlint, e.g.
jsonlint.parser.setStrict(true);
var json = jsonlint.parser.parse(...
```

### FEATURE: Position Information

The parser returns position information for parsed JSON objects, i.e.
the position for JSON properties and values within the input-string that is parsed.


_Location information_ - i.e. the position or offset, where a data-property is located
within the String - may be useful, if you code a JSON editor and want to
annotate data-properties; and then show/indicate which properties have annotations
in your editor.
Another example would be, if you want to define a data format that puts
additional constraints on the JSON data.
Then you could write a verifier which uses the _position information_ in case
one of these additional restrictions was not satisfied in order to show,
where exactly in the data the "misbehavior" occurred.



Enable extraction of position information:
```javascript

var jsonlint = require("jsonlint");

//enable meta-data extraction (i.e. the position information):
jsonlint.parser.setPosEnabled(true);

var data = jsonlint.parse('{"creative?": false}');

```

the result for example above would be:
```javascript

// Index (in 3 lines)
//
//  2 4 6 8 10 13 16 19
// 1|3|5|7|9|11|14|17|20
// |||||||||||12|15|18|
// {"creative?": false}
//
// extracted meta data:
{
  "creative?": false,
  "_pos": {
    ///// position for whole object itself
    "first_line": 1,
    "last_line": 1,
    "first_column": 1,
    "last_column": 19,
    ///// position for property "creative?" in parent object
    "_creative?": [
      {//// position of property/name
        "first_line": 1,
        "last_line": 1,
        "first_column": 1,
        "last_column": 12
      },
      {//// position of property/value
        "first_line": 1,
        "last_line": 1,
        "first_column": 14,
        "last_column": 19
      }
    ],
    "_this": {///// position for object itself
      "first_line": 1,
      "last_line": 1,
      "first_column": 1,
      "last_column": 19
    }
  }
}
```

#### The `pos` Object

Each position/location information object consists of the following properties:
```javascript
{
  "first_line"   : NUMBER
  "last_line"    : NUMBER
  "first_column" : NUMBER
  "last_column"  : NUMBER
}
```

#### `pos` for Properties

Generally, the position information is stored in property `"_pos"`.

Positions for **properties** are noted in the object's `"_pos"`-property
within sub-property: `"_" + <property-name>`.

For a property, the position information is an array with 2 position-entries:
the first entry _locates_ the property-name and the second one the property-value

Note: if the value does not have a primitive type, then the value-entry will actually be not
 a `pos` information object, but contain itself the value's position information via sub-properties;
 in this case, the `pos` for the value-object itself will be contained in the special sub-property `"_this"`.
See the additional information below: `pos` for [Arrays and Objects](#pos-for-arrays-and-objects) and
`pos` for [Arrays Entries](#pos-for-array-entries).


For example, the result for `{"someProperty":...}` would look something like:
```javascript
{
  "someProperty":
  ...
  "_pos": {
    "_someProperty": [
      {"first_line":...},  //position of the property-name for someProperty
      {"first_line":...}   //position of a primitive property-value for someProperty
    ]
    ...
```

#### pos for Arrays and Objects

The object's / array's own position is noted in `"_pos"` in sub-property `"_this"`
e.g.:
```javascript
{
  "_pos": {
    "_this": { "first_line": ...
````

#### `pos` for `Array` Entries

Positions for array entries are noted in the array's `"_pos"` in sub-property: `"_" + <entry-index>`
e.g.:
```javascript
{
  "_pos": {
    "_0": { "first_line": ...
    "_1": { "first_line": ...
            ...
```

#### Set custom field name for the `pos` Object

The field name for the `pos` object can be set to something different than
`_pos`, e.g. `__mycustom_name`:
```javascript
jsonlint.parser.setPosEnabled('__mycustom_name');
```

The currently set field name for `pos` can be retrieved using:
```javascript
var posFieldName = jsonlint.parser.getPos();
```

NOTE for `FALSY` values, the position information will be disabled in parsing results


--------------

### FEATURE: Strict parsing mode

Enable `strict` parsing mode:
```javascript

var jsonlint = require("jsonlint");

//enable meta-data extraction (i.e. the position information):
jsonlint.parser.setStrict(true);

//OK
var data = jsonlint.parse('{"creative?": false}');

//ERROR
jsonlint.parse('{"duplicate": false, "duplicate": true}');

```

If `setPosEnabled` is set to `true`, the error will contain additional position
information (see also [pos properties](#the-pos-object) above):
 * `Error.hash.pos`: position of the offending property
 * `Error.hash.posOther`: position of the first declaration of the property
   _NOTE_ in same cases `posOther` may not contain positional information

Example for error with additional position information:
```javascript
...
jsonlint.parser.setPosEnabled(true);
try{
  jsonlint.parse('{\n  "duplicate": false,\n  "duplicate": true\n}');
} catch (e){
  console.log('duplicate property at line '+e.hash.pos.first_line);
  console.log('property was already defined at line '+e.hash.posOther.first_line);
}
```

## MIT License


Modification by russa  
Copyright (C) 2014-2020 DFKI GmbH, Deutsches Forschungszentrum fuer Kuenstliche Intelligenz (German Research Center for Artificial Intelligence), https://www.dfki.de



based on [JSON Lint][1] by

Copyright (C) 2012 Zachary Carter

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

----

[1]: https://github.com/zaach/jsonlint/
[2]: https://mmig.github.io/jsonlint-pos/example/
[3]: https://mmig.github.io/jsonlint-pos/example/jsonlint.html
