
define(
    ['appUtil', 'jsonEditorModule', 'module', 'waitDialog']
    , function(util,  editorModule, module, waitDialog
){

    var view = {
        printConsole: function(msg){
            console.info(msg);//TODO add real impl.!
        }
    }
    //initialize the orion-editor for the grammar
    var _editorClassName = module.config().jsonEditorClass;//'editor';
    var editor = editorModule.init(view, _editorClassName);
    define('jsonEditor', function(){
        return editor;
    });
    /*annotations
         ERROR_MARKER,
         WARNING_MARKER,
         TASK_MARKER,
         BREAKPOINT_MARKER,
         BOOKMARK_MARKER,
         FOLDING_MARKER,
         CURRENT_BRACKET_MARKER,
         MATCHING_BRACKET_MARKER,
         CURRENT_LINE_MARKER,
         CURRENT_SEARCH_MARKER,
         MATCHING_SEARCH_MARKER,
         READ_OCCURRENCE_MARKER,
         WRITE_OCCURRENCE_MARKER,
         SELECTED_LINKED_GROUP_MARKER,
         CURRENT_LINKED_GROUP_MARKER,
         LINKED_GROUP_MARKER,
         BLAME_MARKER,
         CURRENT_BLAME_MARKER
     */
    ERROR_MARKER    = editorModule.ERROR_MARKER;
    WARNING_MARKER  = editorModule.WARNING_MARKER;
    BOOKMARK_MARKER = editorModule.BOOKMARK_MARKER;
    //load CSS style for the WaitDialog
    waitDialog.styleUrl = module.config().waitDialogCssPath + waitDialog.styleUrl;
    waitDialog._loadStyle();
    //...and show "splash screen"
    waitDialog.show(void(0), 'app', {style: 'b'});
    waitDialog.show('app');
    return editor;
});
