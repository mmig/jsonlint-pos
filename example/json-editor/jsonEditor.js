
define(['require', 'orioneditor', 'validationUtil'],function(require, _editor, validationUtil){

    var _export = {
            editor: void(0)
    };

    function init(view, _editorClassName){
        var editor = _editor({className: _editorClassName, lang: "js"})[0];
        editor.val = function(str){

            if(typeof str !== 'undefined'){
                this.setText(str);

            }
            else {
                return this.getText();
            }
        };

        editor.toFullSize = function(){
            //resize editor window to the text's full height
            $(this._domNode).height( this.getTextView().getLineHeight() * this.getModel().getLineCount() + 8);
            //update editor-view
            this.resize();
        };

//		editor.getTextView().getModel().addEventListener("Changed", function(event){
//			if(event.addedLineCount > 0 || event.removedLineCount > 0){
//
//				if(editor.getModel().getLineCount() > 0){
//					editor.toFullSize();
//				}
//
//			}
//		});
                        var _annotations = require('orion/editor/annotations');
        var ERROR_MARKER    = _annotations.AnnotationType.ANNOTATION_ERROR;
        var WARNING_MARKER  = _annotations.AnnotationType.ANNOTATION_WARNING;
        var BOOKMARK_MARKER = _annotations.AnnotationType.ANNOTATION_BOOKMARK;
        var FOLDING_MARKER  = _annotations.AnnotationType.ANNOTATION_FOLDING;
        //create (and set) json-validation function
        editor.validate = validationUtil.initJsonValidator(
                view, editor, ERROR_MARKER, WARNING_MARKER, BOOKMARK_MARKER
        );
        //allow switching "auto-validation" on and off:
        var _isAutoValidationEnabled = false;
        editor.setAutoValidationEnabled = function(isEnable){
            var func = isEnable? 'add' : 'remove';
            _isAutoValidationEnabled = isEnable;
            editor.getTextView().getModel()[func + 'EventListener']("Changed", function(_evt){
                editor.validate(isEnable);
            });
        };
        editor.isAutoValidationEnabled = function(){
            return _isAutoValidationEnabled;
        };
        //by default: enable "auto-validation"
        editor.setAutoValidationEnabled(true);
        function createCustomMarker(type, message, isShowInAnnotationRuler, isShowInOverviewRuler){
//			var suffix = "task";//"orion.annotation.currentLine"
            var index = type.lastIndexOf('.'); //$NON-NLS-0$
            var suffix = type.substring(index + 1);
            var properties = {
                title: message,//messages[suffix],
                style: {styleClass: "annotation grammar " + suffix}, //$NON-NLS-0$
                html: "<div class='annotationHTML grammar " + suffix + "'></div>", //$NON-NLS-1$ //$NON-NLS-0$
                overviewStyle: {styleClass: "annotationOverview grammar " + suffix} //$NON-NLS-0$
            };
//			if (lineStyling) {
                properties.lineStyle = {styleClass: "annotationLine grammar " + suffix}; //$NON-NLS-0$
//			} else {
//				properties.rangeStyle = {styleClass: "annotationRange grammar " + suffix}; //$NON-NLS-0$
//			}
                            var mAnnotations = require('orion/editor/annotations');
            var newType = mAnnotations.AnnotationType.registerType(type, properties);
            editor.getAnnotationStyler().addAnnotationType(newType);
            if(isShowInAnnotationRuler){
                editor.getAnnotationRuler().addAnnotationType(newType);
            }
            if(isShowInOverviewRuler){
                editor.getOverviewRuler().addAnnotationType(newType);
            }
                            return newType;
        }
        //marker in overview rule for "bookmarking" json-structure:
        var STRUCTURE_MARKER = createCustomMarker('jsonlint.json.structure', 'JSON Structure', false, true);
        //init create-folding-factory:
        editor.doCreateFolding = validationUtil.initJsonFolding(editor, FOLDING_MARKER, STRUCTURE_MARKER);
        editor.doClearFolding = function(){
            this.getAnnotationModel().removeAnnotations(FOLDING_MARKER);
            this.getAnnotationModel().removeAnnotations(STRUCTURE_MARKER);
        };
        editor.doGetFoldableElements = function(){
            //FIXME do parse contents for this(?)
            return [ ['stop_word', '.'], ['tokens', '.'], ['utterances', '.']];
        };
        editor.createFolding = function(){
            this.doClearFolding();
            this.doCreateFolding(this.doGetFoldableElements());
        };

        //taken from esprima/customeditor.js:
        editor.addErrorMarker = function (start, end, description) {
            var annotationModel = this.getAnnotationModel();
            var mAnnotations = require('orion/editor/annotations');
            var marker = mAnnotations.AnnotationType.createAnnotation(
                    WARNING_MARKER, start, end, description
            );
            annotationModel.addAnnotation(marker);
        };
        editor.addMarker = function (type, start, end, description) {
            var annotationModel = this.getAnnotationModel();
            var mAnnotations = require('orion/editor/annotations');
            var marker = mAnnotations.AnnotationType.createAnnotation(
                    type, start, end, description
            );
            annotationModel.addAnnotation(marker);
        };
        editor.removeAllErrorMarkers = function () {
            var annotationModel = this.getAnnotationModel();
//			var mAnnotations = require('orion/editor/annotations');
            annotationModel.removeAnnotations(ERROR_MARKER);
            annotationModel.removeAnnotations(WARNING_MARKER);
//			annotationModel.removeAnnotations(BOOKMARK_MARKER);
        };
                                            //		var jsonChangedListener = [];
//		editor.addJsonChangedListener = function(handler){
//			jsonChangedListener.push(handler);
//		};
//		editor.removeJsonChangedListener = function(handler){
//			for(var i=0,size=jsonChangedListener.length; i < size; ++i){
//				if(jsonChangedListener[i] === handler){
//					jsonChangedListener.splice(i,1);
//				}
//			}
//		};
//		editor.fireJsonChanged = function(hasChanged){
//			for(var i=0,size=jsonChangedListener.length; i < size; ++i){
//				jsonChangedListener[i](hasChanged);
//			}
//		};

        _export.editor = editor;
        _export.ERROR_MARKER     = ERROR_MARKER;
        _export.WARNING_MARKER   = WARNING_MARKER;
        _export.BOOKMARK_MARKER  = BOOKMARK_MARKER;
        _export.STRUCTURE_MARKER = STRUCTURE_MARKER;

////		_export.ERROR_MARKER                  = _annotations.AnnotationType.ANNOTATION_ERROR;
////		_export.WARNING_MARKER                = _annotations.AnnotationType.ANNOTATION_WARNING;
//		_export.TASK_MARKER                   = _annotations.AnnotationType.ANNOTATION_TASK;
//		_export.BREAKPOINT_MARKER             = _annotations.AnnotationType.ANNOTATION_BREAKPOINT;
////		_export.BOOKMARK_MARKER               = _annotations.AnnotationType.ANNOTATION_BOOKMARK;
//		_export.FOLDING_MARKER                = _annotations.AnnotationType.ANNOTATION_FOLDING;
//		_export.CURRENT_BRACKET_MARKER        = _annotations.AnnotationType.ANNOTATION_CURRENT_BRACKET;
//		_export.MATCHING_BRACKET_MARKER       = _annotations.AnnotationType.ANNOTATION_MATCHING_BRACKET;
//		_export.CURRENT_LINE_MARKER           = _annotations.AnnotationType.ANNOTATION_CURRENT_LINE;
//		_export.CURRENT_SEARCH_MARKER         = _annotations.AnnotationType.ANNOTATION_CURRENT_SEARCH;
//		_export.MATCHING_SEARCH_MARKER        = _annotations.AnnotationType.ANNOTATION_MATCHING_SEARCH;
//		_export.READ_OCCURRENCE_MARKER        = _annotations.AnnotationType.ANNOTATION_READ_OCCURRENCE;
//		_export.WRITE_OCCURRENCE_MARKER       = _annotations.AnnotationType.ANNOTATION_WRITE_OCCURRENCE;
//		_export.SELECTED_LINKED_GROUP_MARKER  = _annotations.AnnotationType.ANNOTATION_SELECTED_LINKED_GROUP;
//		_export.CURRENT_LINKED_GROUP_MARKER   = _annotations.AnnotationType.ANNOTATION_CURRENT_LINKED_GROUP;
//		_export.LINKED_GROUP_MARKER           = _annotations.AnnotationType.ANNOTATION_LINKED_GROUP;
//		_export.BLAME_MARKER                  = _annotations.AnnotationType.ANNOTATION_BLAME;
//		_export.CURRENT_BLAME_MARKER          = _annotations.AnnotationType.ANNOTATION_CURRENT_BLAME;

        return editor;
    }

    _export.init = init;

    return _export;

});
