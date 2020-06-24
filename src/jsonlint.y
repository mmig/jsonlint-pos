
%{

// MODIFICATION russa: added position meta-data to parsed objects
var _p = parser;
var _isLoc = false;
_p.getLoc = function(){
  return _isLoc;
};
/**
 * helper function: set location information for the parsed element
 * @param  {any} t the parsed element
 * @param  {position} loc the location information
 * @param  {string} [sub] OPTIONAL name of the sub-field in <code>t</code> to which
 *                        the location information should be stored to
 * @param  {boolean} [subLoc] OPTIONAL if <code>true</code> the location information
 *                            will be taken from the location sub-field of <code>loc</code>
 */
_p._loc = function(t, loc, sub, subLoc){
    var l = _p.getLoc();
    if(l) sub? (t[l][sub] = (subLoc? loc[l] : loc)) : (t[l] = (subLoc? loc[l] : loc));
};
/**
 * @param {boolean|string} isEnabled
 *        enable / disable extraction of position-information:
 *        if <code>true</code> the default name "_loc" will be used, if a string
 *        with length > 1 is given, location information will be stored to that
 *        sub-field.
 *        Will be disabled for FALSY values.
 * DEFAULT: disabled
 */
_p.setLocEnabled = function(isEnabled){
    _isLoc = isEnabled === true? '_loc' : isEnabled;
};

// MODIFICATION russa: add "strict" parsing mode (e.g. reject duplicate key entries)
var _isStrict = false;
_p.isStrict = function(){
    return _isStrict;
};
/**
 * @param {boolean} isEnabled
 *        enable / disable "strict" mode for parsing
 * DEFAULT: disabled
 */
_p.setStrict = function(isEnabled){
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
          $$ = yytext.replace(/\\([\"\\\/bfnrt]|u[0-9a-fA-f]{4})/g, function(match, part) {
                if(part.charAt(0) === 'u') {
                    return String.fromCharCode(parseInt(part.substr(1),16));
                }
                switch(part) {
                  case 'b':return '\b';
                  case 'f':return '\f';
                  case 'n':return '\n';
                  case 'r':return '\r';
                  case 't':return '\t';
                  case '"':case '\\':case '/':return part;
                }
            });
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
            _p._loc($$, @1);//MOD:locInfo empty obj
        }}
    | '{' JSONMemberList '}'
        {$$ = $2;
            _p._loc($$, @2, '_this');//MOD:locInfo obj
        }
    ;

JSONMember
    : JSONString ':' JSONValue
        {$$ = [$1, $3];
            _p._loc($$, [@1, @3]);//MOD:locInfo member&value
        }
    ;

JSONMemberList
    : JSONMember
        {{$$ = {}; $$[$1[0]] = $1[1];
            if(_p.getLoc()){
                _p._loc($$, @1);//MOD:locInfo member
                _p._loc($$, $1, '_' + $1[0], true);//MOD:locInfo member
            }
        }}
    | JSONMemberList ',' JSONMember
        {
            $$ = $1;

            if(_p.isStrict()){//MOD: "strict" mode: reject duplicate key entries
                if(typeof $1[$3[0]] !== 'undefined'){
                    var loc = _p.getLoc();
                    var pos = $3[loc]? $3[loc][0] : @3;

                    var locDupl = $3[0] === loc;
                    var errStr = 'Parse error in "strict" mode on line '+pos.first_line+': Duplicate property "'+$3[0]+'"' +
                                    (!locDupl? '' : ' (possibly colliding with property for location information)');


                    var err = new Error(errStr);
                    if($3[loc]){
                        err._loc = pos;
                    }
                    if($1[loc]){
                        err._locTo = !locDupl? $1[loc]['_'+$3[0]][0] : $1[loc];
                    }
                    throw err;
                }
            }//END MOD: "strict" mode

            $1[$3[0]] = $3[1];

            _p._loc($$, $3, '_' + $3[0], true);//MOD:locInfo member-list
        }
    ;

JSONArray
    : '[' ']'
        {$$ = [];
            _p._loc($$, [@1, @2]);//MOD:locInfo empty array
        }
    | '[' JSONElementList ']'
        {$$ = $2;
            _p._loc($$, [@1, @3], '_this');//MOD:locInfo array
        }
    ;

JSONElementList
    : JSONValue
        {$$ = [$1];
            _p._loc($$, {'_i0': @1});//MOD:locInfo array-entry
        }
    | JSONElementList ',' JSONValue
        {$$ = $1; $1.push($3);
            _p._loc($$, @3, '_i' +  ($$.length - 1));//MOD:locInfo array-list-entry
        }
    ;
