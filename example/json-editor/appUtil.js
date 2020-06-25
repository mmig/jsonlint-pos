
/**
 *
 * @depends lodash.isEqual
 *
 * @depends jQuery#Selector
 * @depends jQuery.innerHeight
 * @depends jQuery.scrollTop
 * @depends jQuery.val
 *
 * @depends <div id="outputBox"> exists
 */
define(['lodash', 'jquery'], function(lodash, $){

    /**
     * select the text of a line in a DOM textarea
     *
     * @private
     * @function
     * @memberOf AppUtil.private
     */
    var _selectLine = (function() {//(domTextArea, lineNo)

        /**
         * Get the start/end position of a selection
         * in a text-component:
         * {
         * 	start: START_INDEX,
         * 	end:   END_INDEX,
         * }
         *
         * If no selection is made, the cursor position is returned
         * (i.e. start === end)
         *
         * @private
         * @function
         * @memberOf AppUtil.private
         */
        function getSelection(domTextComponent) {
            var startPos;
            var endPos;
            // IE version
            if (document.selection != undefined) {
                domTextComponent.focus();
                var sel = document.selection.createRange();
                startPos = sel;
                endPos = sel;
            }
            // Mozilla version
            else if (domTextComponent.selectionStart != undefined) {
                startPos = domTextComponent.selectionStart;
                endPos = domTextComponent.selectionEnd;
            } else {
                console.error('unknow selection mechanism...');
            }

            return {
                start : startPos,
                end : endPos
            };
        }

        /**
         * selects a range in a text-component.
         * If start === end, an empty selection is made, i.e. the cursor position is set.
         *
         * @private
         * @function
         * @memberOf AppUtil.private
         */
        function setSelection(domTextComponent, start, end, doRequestFocus) {
            // Mozilla version
            if (domTextComponent.setSelectionRange) {
                if (typeof doRequestFocus === 'undefined'
                        || doRequestFocus !== false) {
                    domTextComponent.focus();
                }
                domTextComponent.setSelectionRange(start, end);
            }
            // IE version
            else if (domTextComponent.createTextRange) {
                var range = domTextComponent.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
            if (typeof doRequestFocus === 'undefined'
                    || doRequestFocus !== false) {
                domTextComponent.focus();
            }
        }

        /**
         * get JSON for start / end position in str for line no. i
         *
         * @private
         * @function
         * @memberOf AppUtil.private
         */
        var getPositionForLine = (function() {//(str, i)

            var detectLinebreak = /(\r?\n|\r)/igm;

            /**
             *
             * Get the index in the String str, where line number lineNo
             * starts.
             *
             * New lines begin after \n, \r\n, or \r.
             *
             * If lineNo is <= 1, the function returns always 0.
             *
             * If the lineNo is greater than the count of lines in str, the string length itself is returned.
             *
             * @function getIndexForLine
             * @param {String} str the string
             * @param {Number} lineNo the line number (first line is 1)
             * @private
             * @memberOf AppUtil.private
             */
            var getStart = function(str, lineNo) {
                if (lineNo <= 1) {
                    return 0;
                }
                var match;
                var count = 1;
                while (match = detectLinebreak.exec(str)) {
                    //ASSERT: lineNo >= 2
                    if (++count == lineNo) {
                        break;
                    }
                }

                //reset regexpr:
                detectLinebreak.lastIndex = 0;

                if (match) {
                    return match.index + match[1].length;
                }

                //request line-no. >= 2 AND loop "detect enough" linebreaks => the request line index starts after strings ends => return string's length
                return str.length;
            };

            /**
             * (this is the function that is returned to getPositionForLine)
             *
             * @private
             * @function
             * @memberOf AppUtil.private
             */
            return function(str, i) {
                var start = getStart(str, i);

                var end = str.length;
                if (start < end) {
                    detectLinebreak.lastIndex = start;
                    var match;
                    if (match = detectLinebreak.exec(str)) {
                        end = match.index;
                    }
                    detectLinebreak.lastIndex = 0;
                }

                return {
                    start : start,
                    end : end
                };
            };
        })();//END: getPositionForLine

        /**
         * (this is the function that is returned to _getSelectLine)
         *
         * @private
         * @function
         * @memberOf AppUtil.private
         */
        return function selectLineImpl(theTextArea, line) {

            if (typeof line !== 'number') {
                var editor = line;
                line = theTextArea;

                var m = editor.getModel();
                var pos = {
                    start : m.getLineStart(line - 1),
                    end : m.getLineEnd(line - 1)
                };

                console.log('selectLine(%s) -> ', line, pos);

                editor.setSelection(pos.start, pos.end, true);
                return; /////////////////////// EARLY EXIT ///////////////
            }

            var $ta = $(theTextArea);
            var ta = $ta[0];

            var str = $ta.val();

            var pos = getPositionForLine(str, line);

            console.log('selectLine(%s) -> ', line, pos);

            setSelection(ta, pos.start, pos.end, true);
        };
    })();
    return {
        /**
         * (Re-) format a JSON object
         * (for display in editor).
         *
         * @param {PlainObject} jsonObj
         * @returns {String} formatted (JSON) String representation
         *
         * @memberOf AppUtil
         */
        formatJson: function(jsonObj){
            return JSON.stringify(jsonObj, null, 2);
        },
        /**
         * Object equality.
         *
         * @returns {Boolean}
         *
         * @memberOf AppUtil
         */
        isEqual: function(a,b){
            return lodash.isEqual(a,b);
        },
        /**
         * Select a line in a textarea.
         *
         * WARNING: there a 2 ways to call this function
         *          (arguments are positional!):
         *
         * EITHER
         * @param {DOMTextArea} textarea
         * @param {Number} lineNumber
         *
         * OR
         * @param {Number} lineNumber
         * @param {JsonEditor} editor (see jsonEditor.js)
         *
         * @function
         * @public
         * @type Function
         * @memberOf AppUtil
         */
        selectLine: _selectLine
    };
});
