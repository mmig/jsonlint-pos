
%{

// MODIFICATION russa: added position meta-data to parsed objects
var _isLoc = false;
this.isLoc = function(){
  return _isLoc;
};
/**
 * @param {boolean} isEnabled
 *        enable / disable extraction of position-information
 * DEFAULT: disabled
 */
this.setLocEnabled = function(isEnabled){
    _isLoc = isEnabled;
};

// MODIFICATION russa: add "strict" parsing mode (e.g. reject duplicate key entries)
var _isStrict = false;
this.isStrict = function(){
    return _isStrict;
};
/**
 * @param {boolean} isEnabled
 *        enable / disable "strict" mode for parsing
 * DEFAULT: disabled
 */
this.setStrict = function(isEnabled){
    _isStrict = isEnabled;
};

%}

%start JSONText

/*
  ECMA-262 5th Edition, 15.12.1 The JSON Grammar.

*/


%%

JSONString
    : STRING
        { // replace escaped characters with actual character
          $$ = yytext.replace(/\\(\\|")/g, "$"+"1")
                     .replace(/\\n/g,'\n')
                     .replace(/\\r/g,'\r')
                     .replace(/\\t/g,'\t')
                     .replace(/\\v/g,'\v')
                     .replace(/\\f/g,'\f')
                     .replace(/\\b/g,'\b');
        }
    ;

JSONNumber
    : NUMBER
        {$$ = Number(yytext);}
    ;

JSONNullLiteral
    : NULL
        {$$ = null;}
    ;

JSONBooleanLiteral
    : TRUE
        {$$ = true;}
    | FALSE
        {$$ = false;}
    ;

JSONText
    : JSONValue EOF
        {return $$ = $1;}
    ;

JSONValue
    : JSONNullLiteral
    | JSONBooleanLiteral
    | JSONString
    | JSONNumber
    | JSONObject
    | JSONArray
    ;

JSONObject
    : '{' '}'
        {{$$ = {};
            if(isLoc()) $$._loc = @1;//MOD:locInfo empty obj
        }}
    | '{' JSONMemberList '}'
        {$$ = $2;
            if(isLoc()) $$._loc['_this'] = @2;//MOD:locInfo obj
        }
    ;

JSONMember
    : JSONString ':' JSONValue
        {$$ = [$1, $3];
            if(isLoc()) $$._loc = [@1, @3];//MOD:locInfo member&value
        }
    ;

JSONMemberList
    : JSONMember
        {{$$ = {}; $$[$1[0]] = $1[1];
            if(isLoc()){
                $$._loc = @1;//MOD:locInfo member
                $$._loc[ '_' + $1[0] ] = $1._loc;//MOD:locInfo member
                }
        }}
    | JSONMemberList ',' JSONMember
        {
            $$ = $1;

            if(isStrict()){//MOD: "strict" mode: reject duplicate key entries
                if(typeof $1[$3[0]] !== 'undefined'){
                    var pos = $3._loc? $3._loc[0] : @3;

                    var errStr = 'Parse error in "strict" mode on line '+pos.first_line+': Duplicate property "'+$3[0]+'"';

                    var err = new Error(errStr);
                    if($3._loc){
                        err._loc = pos;
                    }
                    if($1._loc){
                        err._locTo = $1._loc['_'+$3[0]][0];
                    }
                    throw err;
                }
            }//END MOD: "strict" mode

            $1[$3[0]] = $3[1];

            if(isLoc()) $$._loc[ '_' + $3[0] ] = $3._loc;//MOD:locInfo member-list
        }
    ;

JSONArray
    : '[' ']'
        {$$ = [];
            if(isLoc()) $$._loc = [@1, @2];//MOD:locInfo empty array
        }
    | '[' JSONElementList ']'
        {$$ = $2;
            if(isLoc()) $$._loc['_this'] = [@1, @3];//MOD:locInfo array
        }
    ;

JSONElementList
    : JSONValue
        {$$ = [$1];
            if(isLoc()) $$._loc = {'_i0': @1};//MOD:locInfo array-entry
        }
    | JSONElementList ',' JSONValue
        {$$ = $1; $1.push($3);
            if(isLoc())  $$._loc[ '_i' +  ($$.length - 1) ] = @3;//MOD:locInfo array-list-entry
        }
    ;
