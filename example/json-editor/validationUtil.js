
define(['appUtil', 'jsonlint', 'parseOptions'],
    function(
        util, jsonparser, options
){
    jsonparser = jsonparser.parser;
    /**
     * EITHER:
     * @param {Number} line
     *			the line number
     * @param {Number} pos
     *				the column in the line (is ignored)
     *
     * OR:
     *
     * @param {Postion} line
            a position object with properties
            {
                first_line: Number,
                first_column: Number,
                last_line: Number,
                last_column: Number
            }
            NOTE: there must NOT be second argument in this case
     * @private
     * @function
     * @memberOf ValidationUtil.private
     */
    function getOffsetFor(editor, line, pos) {

        if (!pos && pos !== 0) {
            pos = line;
            if (!pos) {
                return void (0);
            }
            return {
                start : getOffsetFor(editor, pos.first_line, pos.first_column),
                end : getOffsetFor(editor, pos.last_line, pos.last_column)
            };
        }

        //get start offset
        if (line === 1) {
            return pos;
        }

        var offset = editor.getLineStart(line - 1);
        return offset + pos;
    }
    /**
     *
     * @param {JSON} posJson
     * 				the parsed JSON object with location meta-data
     * @param {Array<String>} path
     * 				the path segments as array for accessing the property,
     * 				e.g. <code>["tokens", "DEVICE"]</code> for property
     * 				<code>json.tokens.DEVICE</code>.
     *
     * 				SPECIAL path segment <code>.</code> (dot):
     * 				this signifies, that the location-information should be
     * 				created for the whole property (instead of its name-field),
     * 				i.e. location starting from its name-filed until the end
     * 				of its value-field (this is invalid for paths that target primitives).
     *
     * 				E.g. for
     * 				<pre>
     * 			1	{
     * 			2		"tokens": {
     * 			3			...
     * 			4		}
     * 			5	}</pre>
     *
     * 				<code>["tokens"]</code> would return the location information
     * 				for the name-field of the tokens-property (line 2), while <code>["tokens", "."]</code>
     * 				would return the location starting with the name-field (line 2) and ending the
     * 				the closing bracket of its value-field (line 4).
     *
     * @private
     * @function
     * @memberOf ValidationUtil.private
     */
    function getPosInJson(posJson, path, locField) {

        var prev = posJson;
        var curr = posJson;
        for (var i = 0, size = path.length; i < size; ++i) {
            if (typeof curr[path[i]] !== 'undefined') {
                prev = curr;
                curr = curr[path[i]];
            } else {
                //console.warn('getPosInJson(): could not traverse "'+path[i]+'" ('+i+') from path '+JSON.stringify(path));
                break;
            }
        }

        var pos;
        if (curr === prev) {
            if(curr[locField]._this){
                pos = curr[locField]._this;
            } else {
                pos = curr[locField];
            }
        }

        if ($.isArray(prev)) {
            // array-entry, i.e.: [..., VALUE_i, ...]
            pos = prev[locField]['_' + path[(i - 1)]];
        } else if (typeof prev === 'object') {
            //property, i.e.: "name": VALUE
            pos = prev[locField]['_' + path[(i - 1)]];

            if (!pos) {
                if(curr[locField]._this){
                    pos = curr[locField]._this;
                } else {
                    pos = curr[locField];
                }
            } else if (i === size) {
                //target path points to NAME
                pos = pos[0];
            } else {
                //target path points to VALUE
                if(path[i] === '.'){
                    //SPECIAL path segment '.': return the location for "whole" object-property
                    return {
                        'first_line': 	pos[0].first_line,
                        'first_column':	pos[0].first_column,
                        'last_line': 	pos[1].last_line,
                        'last_column': 	pos[1].last_column
                    };
                }
                else {
                    //... else: take the location of the VALUE
                    pos = pos[1];
                }
            }
        } else {
            pos = prev[locField];
        }
        return pos;
    }
    /**
     * @private
     * @function
     * @memberOf ValidationUtil.private
     */
    function _createFoldingProcessor(editor, foldingMarkerId, strucutreMarkerId){
        var FOLDING_MARKER   = foldingMarkerId;
        var STRUCTURE_MARKER = strucutreMarkerId;
        var addFoldingFor = function(editor, json, jsonPath){
            var path = jsonPath;
            if(typeof jsonPath === 'string'){
                jsonPath = jsonPath.split('.');
            }
            var pos = getPosInJson(json, path);
            pos = getOffsetFor(editor, pos);
            editor.addMarker(
                FOLDING_MARKER, pos.start, pos.end,
                 editor.getTextView().getModel()
            );
        };
        //json path should be array with ['<main structure element>', '.']
        var addStructureMarkerFor = function(editor, json, path, locField){
            if(!path || ! path.length === 2 || !path[1] === '.'){
                console.warn('invalid path for json structure element: '+JSON.stringify(path));
                return;//////////////////// EARLY EXIT ////////////////////////////
            }
            var pos = getPosInJson(json, [path[0]], locField);//get position for property-label only
            pos = getOffsetFor(editor, pos);
            editor.addMarker(STRUCTURE_MARKER, pos.start, pos.end, '"' + path[0] + '" definition');
        };
        return function applyFoldingImpl(jsonPathsList, locField){
            try{
                jsonparser.setPosEnabled(locField);
                var json = jsonparser.parse(editor.val());
                jsonparser.setPosEnabled(false);
                for(var i=0, size=jsonPathsList.length; i < size; ++i){
                    addFoldingFor(editor, json, jsonPathsList[i], locField);
                    addStructureMarkerFor(editor, json, jsonPathsList[i], locField);
                }
            } catch(jsonerror){
                console.warn('Cannot create folding for errornous JSON: '+jsonerror);
                console.error(jsonerror);
            }
        };
    };

    /**
     * field for storing the last validated JSON (-> check against this to determine, if re-validation is necessary)
     *
     * @private
     * @type JSONObject
     * @memberOf ValidationUtil.private
     */
    var _thePrevValidatedJSON;
    /**
     * @private
     * @function
     * @memberOf ValidationUtil.private
     */
    function _createValidator(view, editor, errorMarkerId, warningMarkerId, infoMarkerId){
        var ERROR_MARKER = errorMarkerId;
        var WARNING_MARKER = warningMarkerId;
        var BOOKMARK_MARKER = infoMarkerId;
        /**
         * @param {Boolean|String} [locField] optional
         *          the name for the field of the location information
         * @param {Boolean} [isForceValidation] optional
         * 			if <code>true</code> validation is forced
         * 			if any other value, validation is only computed, if
         * 			the JSON representation of the current text-input
         * 			has changed
         */
        return function validateJsonImpl(locField, isForceValidation) {
            if (!editor.val()) {
                _thePrevValidatedJSON = null;
                return;////////////////////////// EARLY EXIT //////////////////////////
            }
                    //convert content of editor-view to JSON object
            // (do not continue, if it is not a JSON ...)
            var jsonText = editor.val();
            _thePrevValidatedJSON = null;
            editor.removeAllErrorMarkers();

            //create marker for errornous JSON:
            //get details for the error using the json-lint parser:
            try {
                jsonparser.setStrict(options.isStrict());//true);
                jsonparser.setPosEnabled(locField && locField !== true? locField+'$' : true);//<- always compile with loc-info (for marking / folding)

                jsonparser.parse(jsonText);

                jsonparser.setStrict(false);
                jsonparser.setPosEnabled(false);
            } catch (err) {

                var msg = err.toString();

                var start, end, loc;
                if (err.hash.pos) {

                    loc = getOffsetFor(editor, err.hash.pos);
                    start = loc.start;
                    end = loc.end;

                } else {

                    //msg text -> e.g.:		Error: Parse error on line 5:...
                    var detectLineNo = /on line (\d+):/igm;
                    var match = detectLineNo.exec(msg);

                    var lineNo;
                    if (match) {
                        lineNo = match[1];
                    }

                    start = editor.getLineStart(lineNo - 1);
                    end = editor.getModel().getLineEnd(lineNo - 1);

                }

                //remove line information from message (since the marker already points to this position)
                msg = msg.replace(/ on line (\d+):/igm, ':');
                editor.addMarker(ERROR_MARKER, start, end, msg);

                //if there is information about the other / related element that caused the error:
                //  set a warning-marker for that element
                if (err.hash.posOther) {
                    loc = getOffsetFor(editor, err.hash.posOther);
                    editor.addMarker(ERROR_MARKER, loc.start, loc.end, msg);
                }
            }
            return;
        };
    }
    /**
     * @private
     * @function
     * @memberOf ValidationUtil.private
     */
    function _validateJson(text, errorHandler){
        //console.info('gammar-text: \n'+text);
        var jsonObj;
        try {
            jsonObj = JSON.parse(text);
        } catch (error) {

            console.error('error: ' + error.stack);

            var msg = error.toString();

            //try to get more details for the error using the json-lint parser:
            try {

                var result = jsonparser.parse(text);

                if (result) {
                    msg += '\n\nsuccess:\n' + JSON.stringify(result, null, 2);
                }

            } catch (err) {
                msg = err.toString();
            }

            //msg text -> e.g.:		Error: Parse error on line 5:
            //							...",    "switch"    "turn",    "turned"
            //						---------------------^
            //						Expecting 'EOF', '}', ':', ',', ']', got 'STRING'
            var detectLineNo = /on line (\d+):/igm;
            var match = detectLineNo.exec(msg);

            var lineNo;
            if (match) {
                lineNo = match[1];
            }
            if(errorHandler){
                errorHandler( {
                    message: msg,
                    line: lineNo
                });
            }
            return false;
        }
        return jsonObj;
    }

    return {
        /** @lends ValidationUtil.prototype */
        /** @memberOf ValidationUtil */
                    /**
         *
         * @memberOf ValidationUtil
         * @param {OrionEditor} jsonEditor
         * 			see jsonEditorModule.js
         */
        initJsonValidator: function(view, jsonEditor, errorMarkerTypeId, warningMarkerTypeId, infoMarkerTypeId){
            this._jsonValidator = _createValidator(view, jsonEditor, errorMarkerTypeId, warningMarkerTypeId, infoMarkerTypeId);
            return this._jsonValidator;
        },
        resetJsonValidation: function(){
            _thePrevValidatedJSON = null;
        },
        validateJson: _validateJson,
        //TODO move this to ... util? (would also need some of the private HELPER functions to util then...)
        initJsonFolding: function(jsonEditor, foldingMarkerTypeId, strucutreMarkerTypeId){
            this._foldingProcessor = _createFoldingProcessor(jsonEditor, foldingMarkerTypeId, strucutreMarkerTypeId);
            return this._foldingProcessor;
        },
        createJsonFolding: function(jsonElementsList, locField){
            this._foldingProcessor(jsonElementsList, locField);
        }
    };
});
