
export as namespace jsonlint;

export const parser: JsonParser;
declare const Parser: typeof JsonParser;

declare class JsonParser {
    constructor();

    getPos(): boolean | string;
    setPosEnabled(enable: boolean | string): void;

    parse(input: string): any;
    parse(input: string): any & PositionField;

    yy: {[field: string]: any};
    //TODO?
    trace: (message: string) => void;
    // symbols_: {"error":2,"JSONString":3,"STRING":4,"JSONNumber":5,"NUMBER":6,"JSONNullLiteral":7,"NULL":8,"JSONBooleanLiteral":9,"TRUE":10,"FALSE":11,"JSONText":12,"JSONValue":13,"EOF":14,"JSONObject":15,"JSONArray":16,"{":17,"}":18,"JSONMemberList":19,"JSONMember":20,":":21,",":22,"[":23,"]":24,"JSONElementList":25,"$accept":0,"$end":1},
    // {associative list: name (Symbol) ==> number}
    symbols_: NamedAssociativeList<number>;
    // terminals_: {2:"error",4:"STRING",6:"NUMBER",8:"NULL",10:"TRUE",11:"FALSE",14:"EOF",17:"{",18:"}",21:":",22:",",23:"[",24:"]"},
    // {associative list: number ==> name}
    terminals_: NumberedAssociativeList<Terminal>;
    productions_: Array<number | number[]>;
    performAction(yytext: string, yyleng: number, yylineno: number, yy: {[field: string]: any}, yystate: State, $$: any[], _$: Position[]): void;
    table: NumberedAssociativeList<number|number[]>[];
    defaultActions: NumberedAssociativeList<number[]>;

    parseError: (message: string, hash: ErrorHash) => void;

    lexer: Lexer;
}

export interface State {
    parser: JsonParser;
    lexer: Lexer;
    [field: string]: any;
}

export type DefaultPositionFieldName = '_pos';

export interface Position {
    first_line   : number
    last_line    : number
    first_column : number
    last_column  : number
}

export type MemberPositionField = Position[];
export type ObjectPositionField = {[memberName: string]: Position | MemberPositionField} & {_this: Position | MemberPositionField};
export type PositionField = Position | MemberPositionField | ObjectPositionField;

export type ErrorHash = LexerErrorHash | ParserErrorHash | PositionErrorHash;

export interface ParseError extends Error {
    hash?: LexerErrorHash | ParserErrorHash | PositionErrorHash;
}

export interface ParsingError extends Error {
    hash?: ParserErrorHash;
}

export interface LexingError extends Error {
    hash?: LexerErrorHash;
}

export interface LocationError extends Error {
    hash?: PositionErrorHash;
}

export interface LexerErrorHash {
    /** matched text */
    text: string;
    /** the produced terminal token, if any */
    token: string;
    /** yylineno */
    line: number;
}

export interface ParserErrorHash extends LexerErrorHash {
    /** yylloc */
    loc: number;
    /** string describing the set of expected tokens */
    expected: string;
    /** boolean: TRUE when the parser has a error recovery rule available for this particular error */
    recoverable: boolean;
}

export interface PositionErrorHash {
    pos: Position;
    posOther: Position;
}

export interface NumberedAssociativeList<T> {
    [field: number]: T;
}

export interface NamedAssociativeList<T> {
    [field: string]: T;
}

export interface Lexer {
    EOF: 1,
    parseError(message: string, hash: ErrorHash): void;
    setInput(input: string): void;
    input(): void;
    unput(str: string): void;
    more(): void;
    less(n: number): void;
    pastInput(): void;
    upcomingInput(): void;
    showPosition(): void;
    test_match(regex_match_array: RegExp[], rule_index: number): boolean;
    next(): void;
    lex(): void;
    begin(condition: Condition): void;
    popState(): void;
    _currentRules(): void;
    topState(): void;
    pushState(condition: Condition): void;

    options: LexerOptions;

    performAction(yy: State, yy_: Lexer, $avoiding_name_collisions: number, YY_START: Condition): number;
    rules: [];
    //conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13],"inclusive":true}}
    //{associative list: name (Condition) ==> set};
    conditions: NamedAssociativeList<Rule>;
}


export type Rule = any;//TODO

export type Condition = string;
export type Symbol = string;
export type Terminal = string;

export interface LexerOptions {
    /** (optional: true ==> token location info will include a .range[] member) */
    ranges?: boolean;
    /** (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match) */
    flex?: boolean;
    /** (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code) */
    backtrack_lexer?: boolean;
}
