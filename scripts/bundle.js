var fs = require('fs');

//MOD: add comments for documentating additional features
var preamble = '/**\n\
 * Modified JSON Lint parser (by russa)\n\
 * \n\
 * Parser has a "strict" mode which will throw an Error in case duplicate properties are encountered, e.g.\n\
 *  e.g.: {\n\
 *          "duplicate": false\n\
 *          "duplicate": true\n\
 *        }\n\
 * will cause an Error in "strict" mode.\n\
 * \n\
 * \n\
 * Parser returns position information for parsed JSON objects, i.e.\n\
 * the location within the input-string that is parsed.\n\
 * \n\
 * Position information is stored in property "_loc".\n\
 * Positions for properties are noted in the object\'s "_loc" in sub-property: "_"+ property-name\n\
 *  e.g.: {\n\
 *          "_loc": {\n\
 *             "_someProperty": {\n\
 *             ...\n\
 *              \n\
 * Positions for array entries are noted in the array\'s "_loc" in sub-property: "_"+ entry-index\n\
 *  e.g.: {\n\
 *          "_loc": {\n\
 *             "_0": {\n\
 *             ...\n\
 * The object\'s / array\'s own position is noted in "_loc" in sub-property: "_this"\n\
 *  e.g.: {\n\
 *          "_loc": {\n\
 *             "_this": { ...\n\
 * \n\
 * Each position information object has properties:\n\
 * { \n\
 *   "first_line"	: NUMBER\n\
 *   "last_line"	: NUMBER\n\
 *   "first_column"	: NUMBER\n\
 *   "last_column"	: NUMBER\n\
 * }\n\
 * \n\
 * \n\
 * \n\
 * NOTE: for modifications, see code comments with "\\\\MOD russa ..."\n\
 * \n\
 * based on:\n\
 * \n\
 * JSON Lint Parser gratefully provided by Zach Carter\n\
 * https://github.com/zaach/jsonlint\n\
 * MIT License\n\
**/\n';

var umdHeader = ";(function (root, factory) {\n\
  if (typeof define === 'function' && define.amd) {\n\
    define(['require','module','exports'], function(require,module,exports){return factory(require,module,exports);});\n\
  } else if (typeof module === 'object' && module.exports) {\n\
    module.exports = factory(require,module,exports);\n\
  } else {\n\
    root.jsonlint = factory(true,false,{});\n\
  }\n\
}(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this, function (require, module, exports) {\n";
var umdFooter = "\nreturn exports;\n}));";

var source = preamble + umdHeader +
    fs.readFileSync(__dirname+'/../lib/jsonlint-ext.js', 'utf8') + umdFooter;

console.log(source);
