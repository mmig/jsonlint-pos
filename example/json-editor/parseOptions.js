
define(['jquery'], function($){

    return {

        isReformat: function(){
            var el = $("#reformat");
            return el.length? el[0].checked : false;
        },

        isStrict: function(){
            var el = $("#strict-mode");
            return el.length? el[0].checked : false;
        },

        isLoc: function(){
            var el = $("#extract-loc");
            return el.length? el[0].checked : false;
        },

        isAdvanced: function(){
            var el = $("#advanced-options");
            return el.length? el[0].checked : false;
        },

        isConvertArrays: function(){
            var el = $("#convert-array");
            return el.length? el[0].checked : false;
        },

        getLocField: function(){
            var el = $("#loc-field");
            return el.val();
        }
    }

});
