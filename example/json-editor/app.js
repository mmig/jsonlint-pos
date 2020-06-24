
define(['require', 'jquery', 'validationUtil', 'jsonlint', 'waitDialog'
        , 'initApp'
    ],
function(require, $, validationUtil, jsonlint, waitDialog
//		, init
){

    /**
     * App initializer (triggered on-doc-ready by jQuery; see below)
     *
     * @private
     * @type Function
     * @memberOf TestGrammarApp
     */
    var _initAppOnDocReady = function() {

//		console.log('dom ready');

        require(['jsonEditor', 'parseOptions'], function(edt, opt){

            edt.setAutoValidationEnabled(true);

            initValidateControls(edt, opt);

            _hideLoader();

            var locField = opt.isLoc() && opt.getLocField();
            edt.validate(locField);
            edt.setAutoValidationEnabled(locField);
        });
    };
    //register with jQuery ondocready:
    $(_initAppOnDocReady);


    function initValidateControls(editor, options){

        $("#reformat,#strict-mode,#extract-loc,#advanced-options,#convert-array,#loc-field").on('change', function(evt){
            updateControls(options);
            var locField = options.getLocField();
            editor.setAutoValidationEnabled(locField);
            editor.validate(options.isLoc() && locField);
        });

        document.getElementById("button").onclick = function () {
            try {

                var isLoc = options.isLoc();
                if (isLoc) {
                    jsonlint.parser.setPosEnabled(options.getLocField() || true);//enable extraction of location meta data
                }
                else {
                    jsonlint.parser.setPosEnabled(false);//enable extraction of location meta data
                }

                if (options.isStrict()) {
                    jsonlint.parser.setStrict(true);//enable extraction of location meta data
                }
                else {
                    jsonlint.parser.setStrict(false);//enable extraction of location meta data
                }

                var result = jsonlint.parse(editor.getText());
                if (result) {
                    var resultEl = $("#result");
                    resultEl.find(".text").text("JSON is valid!");
                    resultEl.attr("class", "pass");
                    if (options.isReformat()) {
                        var convFunc = isLoc && options.isConvertArrays()? convertArrayValues : null;
                        editor.setText( JSON.stringify(result, convFunc, "  ") );
                    }
                }
            } catch(e) {
                var resultEl = $("#result");
                resultEl.find(".text").text(e);
                resultEl.attr("class", "fail");
            }
        };

        updateControls(options);
    }

    function updateControls(options){
        var isLoc = options.isLoc();

        var enableConvertField = options.isReformat() && isLoc;
        $("#convert-array").prop('disabled', !enableConvertField);

        var isAdvanced = options.isAdvanced();
        $('#advanved-options-set')[isAdvanced? 'show' : 'hide']();

        var locInputField = $('#loc-field');
        locInputField.prop('disabled', !isLoc);

        var parserLocField = jsonlint.parser.getPos();
        var optionsLocField = options.getLocField();
        if(parserLocField && !optionsLocField){
            locInputField.val(parserLocField);
        }
    }

    /**
     * helper function for using as JSON.stringify converter:
     * do convert Arrays to Objects in order to make the
     * additional (non-standart Array member) with the location
     * information visible.
     *
     * @private
     * @type Function
     * @memberOf TestGrammarApp
     */
    function convertArrayValues(n,v){
        if(Array.isArray(v)){
            var obj = {_type: 'Array'};
            var loc = jsonlint.parser.getPos();
            obj[loc] = v[loc];
            for(var i=0,s=v.length;i<s;++i) obj[i]=v[i];
            return obj;
        }
        return v;
    }

    var _hideLoaderTimer;
    var _showLoaderTimer;
    /**
     * Shows a wait dialog.
     *
     * @private
     * @type Function
     * @memberOf TestGrammarApp
     */
    function _showLoader(text, delay, func, argsArray) {

        clearTimeout(_hideLoaderTimer);

        if (!delay) {
            _showLoaderTimer = setTimeout(function() {
                waitDialog.show(text, 'app');
                if(func){
                    func.apply(null, argsArray);
                }
            }, 50);

        } else {
            _showLoaderTimer = setTimeout(function() {

                    waitDialog.show(text, 'app');

                    if(func){
                        setTimeout(function() {
                            func.apply(null, argsArray);
                        }, delay);
                    }
//				}
            }, 50);
        }

    }

    /**
     * Hides the wait dialog
     *
     * @private
     * @type Function
     * @memberOf TestGrammarApp
     */
    function _hideLoader() {

        clearTimeout(_showLoaderTimer);

        _hideLoaderTimer = setTimeout(function(){
            waitDialog.hide('app');
        }, 50);

    }

    /**
     * HELPER for converting the current editor input (or the text argument)
     * 		  into a JSON object.
     *
     * If the text is an invalid JSON definition, an error dialog will be shown
     * to the user.
     *
     *  NOTE this helper should only be used in reaction to an explicit user action.
     *
     * @private
     * @type Function
     * @memberOf TestGrammarApp
     */
    function _inputTextToJSON(view, text) {

        if(typeof text === 'undefined'){
            text = view.getJsonGrammarText();
        }

        var jsonObj = validationUtil.validateJson(text, function(err){

//			var doSelectLine = function(){
//				util.selectLine(lineNo, view.getEditor());
//				setTimeout(function() {
//					util.selectLine(lineNo, view.getEditor());
//				}, 500);
//			};

            var msg = err.message;


//			_showErrorDialog('Error: Invalid JSON Fromat',
//					'Error on parsing grammar text into a JSON object.',
//					'<pre>' + msg + '</pre>'
////					, doSelectLine, doSelectLine
//			);

        });

        if(jsonObj){
            return jsonObj;
        }
        return false;
    }

    return {};
});
