var fs = require('fs');

//MOD: add comments for documentating additional features
var modPrefix = '/**\n\
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

//export enable/disable interface meta-data extraction
var modPostfix = '\nexports.isLoc = isLoc;\nexports.setLocEnabled = setLocEnabled;\n'
    + '\nexports.isStrict = isStrict;\nexports.setStrict = setStrict;\n';

var source = modPrefix +
    "var jsonlint = (function(){var require=true,module=false;var exports={};" +
    fs.readFileSync(__dirname+'/../lib/jsonlint-ext.js', 'utf8') +
    modPostfix +
    "return exports;})()";

console.log(source);
