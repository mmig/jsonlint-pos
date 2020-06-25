
(function () {

    require.config({
        // debugMode: true,
        config: {
            'initApp': {
                jsonEditorClass: 'editor',
                waitDialogCssPath: 'json-editor/css/'
            }
        },
        paths : {
            'jsonlint': '../web/jsonlint-pos.min'
            // libraries:
            , 'jquery': 'json-editor/libs/jquery.min'
            , 'orioneditor': 'json-editor/libs/built-editor-amd'
            , 'lodash': 'json-editor/libs/lodash.min'
            , 'waitDialog': 'json-editor/libs/stdlne-wait-dlg'
            //app code
            , 'app': 'json-editor/app'
            , 'initApp': 'json-editor/initApp'
            , 'parseOptions': 'json-editor/parseOptions'
            , 'appUtil': 'json-editor/appUtil'
            , 'validationUtil': 'json-editor/validationUtil'
            , 'jsonEditorModule': 'json-editor/jsonEditor'
        }
    });

    //start application:
    require(['app']);

}());
