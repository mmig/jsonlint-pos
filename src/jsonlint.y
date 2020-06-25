
%{

// MODIFICATION russa: added position meta-data to parsed objects

parser._isLoc = false;
parser.getPos = function(){
  return this._isLoc;
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
parser._loc = function(t, loc, sub, subLoc){
    var l = this.getPos();
    if(l) {
        var locVal = subLoc? loc[l] : loc;
        this._checkLoc(t, l, sub, locVal);
        sub? (t[l][sub] = locVal) : (t[l] = locVal);
    }
};
/**
 * helper function:
 * do ensure that location information will not overwrite anything in strict mode
 *
 * @throws {Error} if strict mode is enabled and position information
 *                 would overwrite the targeted field
 */
parser._checkLoc = function(t, l, sub, locVal){
    if(this.isStrict()){
        var val = sub? t[l][sub] : t[l];
        if(typeof val !== 'undefined'){
            var pos = locVal && !locVal.first_line? locVal[0] : locVal;
            var errStr = 'Parse error in "strict" mode on line '+pos.first_line+
                            ': Cannot add location information to "'+l+'", because' +
                            ' the property already exists.';
            var err = new Error(errStr);
            err._pos = pos;
            err._posTo = {};
            throw err;
        }
    }
}
/**
 * @param {boolean|string} isEnabled
 *        enable / disable extraction of position-information:
 *        if <code>true</code> the default name "_pos" will be used, if a string
 *        with length > 1 is given, location information will be stored to that
 *        sub-field.
 *        Will be disabled for FALSY values.
 * DEFAULT: disabled
 */
parser.setPosEnabled = function(isEnabled){
    this._isLoc = isEnabled === true? '_pos' : isEnabled;
};

// MODIFICATION russa: add "strict" parsing mode (e.g. reject duplicate key entries)
parser._isStrict = false;
parser.isStrict = function(){
    return this._isStrict;
};
/**
 * @param {boolean} isEnabled
 *        enable / disable "strict" mode for parsing
 * DEFAULT: disabled
 */
parser.setStrict = function(isEnabled){
    this._isStrict = isEnabled;
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
            yy.parser._loc($$, @1);//MOD:locInfo empty obj
        }}
    | '{' JSONMemberList '}'
        {$$ = $2;
            yy.parser._loc($$, @2, '_this');//MOD:locInfo obj
        }
    ;

JSONMember
    : JSONString ':' JSONValue
        {$$ = [$1, $3];
            yy.parser._loc($$, [@1, @3]);//MOD:locInfo member&value
        }
    ;

JSONMemberList
    : JSONMember
        {{$$ = {}; $$[$1[0]] = $1[1];
            if(yy.parser.getPos()){
                yy.parser._loc($$, @1);//MOD:locInfo member
                yy.parser._loc($$, $1, '_' + $1[0], true);//MOD:locInfo member
            }
        }}
    | JSONMemberList ',' JSONMember
        {
            $$ = $1;

            if(yy.parser.isStrict()){//MOD: "strict" mode: reject duplicate key entries
                if(typeof $1[$3[0]] !== 'undefined'){
                    var loc = yy.parser.getPos();
                    var pos = $3[loc]? $3[loc][0] : @3;

                    var locDupl = $3[0] === loc;
                    var errStr = 'Parse error in "strict" mode on line '+pos.first_line+': Duplicate property "'+$3[0]+'"' +
                                    (!locDupl? '' : ' (possibly colliding with property for location information)');


                    var err = new Error(errStr);
                    if($3[loc]){
                        err._pos = pos;
                    }
                    if($1[loc]){
                        err._posTo = !locDupl? $1[loc]['_'+$3[0]][0] : $1[loc];
                    }
                    throw err;
                }
            }//END MOD: "strict" mode

            $1[$3[0]] = $3[1];

            yy.parser._loc($$, $3, '_' + $3[0], true);//MOD:locInfo member-list
        }
    ;

JSONArray
    : '[' ']'
        {$$ = [];
            yy.parser._loc($$, [@1, @2]);//MOD:locInfo empty array
        }
    | '[' JSONElementList ']'
        {$$ = $2;
            yy.parser._loc($$, [@1, @3], '_this');//MOD:locInfo array
        }
    ;

JSONElementList
    : JSONValue
        {$$ = [$1];
            yy.parser._loc($$, {'_0': @1});//MOD:locInfo array-entry
        }
    | JSONElementList ',' JSONValue
        {$$ = $1; $1.push($3);
            yy.parser._loc($$, @3, '_' +  ($$.length - 1));//MOD:locInfo array-list-entry
        }
    ;
