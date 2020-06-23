JSON Lint (EXTENDED)
=========

A modified version of the JavaScript [JSON parser](https://github.com/zaach/jsonlint/) by Z. Carter.

Try a **demo** for the modified JSON parser [jsonlint-ext](https://russaa.github.io/jsonlint-ext/):
the demo page uses the _location information_ for marking JSON errors in an editor;
in addition you can (manually) try the extended options of the JSON verifier, e.g. with/without
`strict` mode (see details below).


MODIFICATION (russa)
----

Modified JSON parser with:
 * [additional location information](#mod-location-information) (i.e. position of objects within parsed string)
 * [`strict` parsing mode](#mod-strict-parsing-mode) which
   * will throw an error if JSON object has duplicate keys
   * _TODO: add features for strict parsing mode(?)_

-----

### MOD: Location Information

The parser returns position information for parsed JSON objects, i.e.
the location for JSON properties and values within the input-string that is parsed.


_Location information_ - i.e. the position, where a data-property is located
within the String - may be useful, if you code a JSON editor and want to
annotate data-properties; and then show/indicate which properties have annotations
in your editor.
Another example would be, if you want to define a data format that puts
additional constraints on the JSON data.
Then you could write a verifier which uses the _location information_ in case
one of these additional restrictions was not satisfied in order to show,
where exactly in the data the "misbehavior" occurred.



Enable extraction of position information:
```javascript

var jsonlint = require("jsonlint");

//enable meta-data extraction (i.e. the location information):
jsonlint.setLocEnabled(true);

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
  "_loc": {
    ///// location for whole object itself
    "first_line": 1,
    "last_line": 1,
    "first_column": 1,
    "last_column": 19,
    ///// location for property "creative?" in parent object
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
    "_this": {///// location for object itself
      "first_line": 1,
      "last_line": 1,
      "first_column": 1,
      "last_column": 19
    }
  }
}
```

##### The loc Object

Each position/location information object consists of the following properties:
```javascript
{
  "first_line"   : NUMBER
  "last_line"    : NUMBER
  "first_column" : NUMBER
  "last_column"  : NUMBER
}
```

##### loc for Properties

Generally, the position information is stored in property `"_loc"`.

Positions for **properties** are noted in the object's `"_loc"`-property
within sub-property: `"_" + <property-name>`.

For a property, the location information is an array with 2 location-entries:
the first entry _locates_ the property-name and the second one the property-value

Note: if the value does not have a primitive type, then the value-entry will actually be not
 a `loc` information object, but contain itself the value's location information via sub-properties;
 in this case, the `loc` for the value-object itself will be contained in the special sub-property `"_this"`.
See the additional information below: `loc` for [Arrays and Objects](loc-for-arrays-and-objects) and
`loc` for [Arrays Entries](loc-for-array-entries).


For example, the result for `{"someProperty":...}` would look something like:
```javascript
{
  "someProperty":
  ...
  "_loc": {
    "_someProperty": [
      {"first_line":...},  //location of the property-name for someProperty
      {"first_line":...}   //location of a primitive property-value for someProperty
    ]
    ...
```

##### loc for Arrays and Objects

The object's / array's own position is noted in `"_loc"` in sub-property `"_this"`
e.g.:
```javascript
{
  "_loc": {
    "_this": { "first_line": ...
````

##### loc for Array Entries

Positions for array entries are noted in the array's `"_loc"` in sub-property: `"_" + <entry-index>`
e.g.:
```javascript
{
  "_loc": {
    "_0": { "first_line": ...
    "_1": { "first_line": ...
            ...
```

-----

### MOD: Strict parsing mode

Enable `strict` parsing mode:
```javascript

var jsonlint = require("jsonlint");

//enable meta-data extraction (i.e. the location information):
jsonlint.setStrict(true);

//OK
var data = jsonlint.parse('{"creative?": false}');

//ERROR
jsonlint.parse('{"duplicate": false, "duplicate": true}');

```

If `setLocEnabled` is set to `true`, the error will contain additional location
information (see also [loc properties](#the-loc-properties) above):
 * `_loc`: position of the offending property
 * `_locTo`: position of the first declaration of the property

Example for error with additional location information:
```javascript
...
jsonlint.setLocEnabled(true);
try{
  jsonlint.parse('{\n  "duplicate": false,\n  "duplicate": true\n}');
} catch (e){
  console.log('duplicate property at line '+e._loc.first_line);
  console.log('property was already defined at line '+e._locTo.first_line);
}
```


## JSON Lint

for more details of Command Line Interface (cli) etc. see the
original site of the [JSON Lint parser](https://github.com/zaach/jsonlint/).


## MIT License


Modification by russa


based on JSON Lint by

Copyright (C) 2012 Zachary Carter

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
