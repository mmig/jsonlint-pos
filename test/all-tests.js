var fs = require("fs"),
    assert = require("assert"),
    parser = require("../lib/jsonlint-pos").parser,
    utils = require('./utils');

exports["test object"] = function () {
    var json = '{"foo": "bar"}';
    assert.deepEqual(parser.parse(json), {"foo": "bar"});
};

exports["test escaped backslash"] = function () {
    var json = '{"foo": "\\\\"}';
    assert.deepEqual(parser.parse(json), {"foo": "\\"});
};

exports["test escaped chars"] = function () {
    var json = '{"foo": "\\\\\\\""}';
    assert.deepEqual(parser.parse(json), {"foo": '\\\"'});
};

exports["test all escaped characters"] = function () {
    var json = '["\\u20AC","\\/","\\\\","\\b","\\f","\\n","\\r","\\t","\\\""]';
    assert.deepEqual(parser.parse(json), ['\u20AC','\/','\\','\b','\f','\n','\r','\t','\"']);
};

exports["test escaped \\n"] = function () {
    var json = '{"foo": "\\\\\\n"}';
    assert.deepEqual(parser.parse(json), {"foo": '\\\n'});
};

exports["test escaped backslash does not get used to escape"] = function () {
    var json = '{"foo": "\\\\n"}';
    assert.deepEqual(parser.parse(json), {"foo": '\\n'});
};

exports["test string with escaped line break"] = function () {
    var json = '{"foo": "bar\\nbar"}';
    assert.deepEqual(parser.parse(json), {"foo": "bar\nbar"});
    assert.equal(JSON.stringify(parser.parse(json)).length, 18);
};

exports["test escaped value and key chars"] = function () {
    var json = fs.readFileSync(__dirname + "/passes/4.json").toString();
    assert.deepEqual(parser.parse(json), {
      hex: '\u0123\u4567\u89AB\uCDEF\uabcd\uef4A',
      "\/\\\"\uCAFE\uBABE\uAB98\uFCDE\ubcda\uef4A\b\f\n\r\t`1~!@#$%^&*()_+-=[]{}|;:',./<>?": 'special char key'
    });
};

exports["test string with line break"] = function () {
    var json = '{"foo": "bar\nbar"}';
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test string literal"] = function () {
    var json = '"foo"';
    assert.equal(parser.parse(json), "foo");
};

exports["test number literal"] = function () {
    var json = '1234';
    assert.equal(parser.parse(json), 1234);
};

exports["test null literal"] = function () {
    var json = '1234';
    assert.equal(parser.parse(json), 1234);
};

exports["test boolean literal"] = function () {
    var json = 'true';
    assert.equal(parser.parse(json), true);
};

exports["test unclosed array"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/2.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test unquotedkey keys must be quoted"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/3.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test extra comma"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/4.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test double extra comma"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/5.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test missing value"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/6.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test comma after the close"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/7.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test extra close"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/8.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test extra comma after value"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/9.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test extra value after close with misplaced quotes"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/10.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test illegal expression addition"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/11.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test illegal invocation of alert"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/12.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test numbers cannot have leading zeroes"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/13.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test numbers cannot be hex"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/14.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test illegal backslash escape \\0"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/15.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test unquoted text"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/16.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test illegal backslash escape \\x"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/17.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test missing colon"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/19.json")
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test double colon"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/20.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test comma instead of colon"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/21.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test colon instead of comma"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/22.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test bad raw value"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/23.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test single quotes"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/24.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test tab character in string"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/25.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test tab character in string 2"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/26.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test line break in string"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/27.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test line break in string in array"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/28.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test 0e"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/29.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test 0e+"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/30.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test 0e+ 1"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/31.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test comma instead of closing brace"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/32.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
};

exports["test bracket mismatch"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/33.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
}

exports["test extra brace"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/34.json").toString();
    assert["throws"](function () {parser.parse(json)}, "should throw error");
}

exports["test duplicate keys (strictly)"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/35.json").toString();
    parser.setStrict(true);
    assert["throws"](function () {parser.parse(json)}, "should throw error");
    parser.setStrict(false);
}

exports["test duplicate keys due to collision with position field (strictly)"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/36.json").toString();
    parser.setStrict(true);
    parser.setPosEnabled(true);
    assert["throws"](function () {parser.parse(json)}, "should throw error");
    parser.setPosEnabled(false);
    parser.setStrict(false);
}

exports["test duplicate keys due to collision with custom position field (strictly)"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/37.json").toString();
    parser.setStrict(true);
    parser.setPosEnabled('$__MY_LOC$');
    assert["throws"](function () {parser.parse(json)}, "should throw error");
    parser.setPosEnabled(false);
    parser.setStrict(false);
}

exports["test pass-1"] = function () {
    var json = fs.readFileSync(__dirname + "/passes/1.json").toString();
    assert.doesNotThrow(function () {parser.parse(json)}, "should pass");
}

exports["test pass-2"] = function () {
    var json = fs.readFileSync(__dirname + "/passes/2.json").toString();
    assert.doesNotThrow(function () {parser.parse(json)}, "should pass");
}

exports["test pass-3"] = function () {
    var json = fs.readFileSync(__dirname + "/passes/3.json").toString();
    assert.doesNotThrow(function () {parser.parse(json)}, "should pass");
}

exports["test pass-4"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/35.json").toString();
    assert.doesNotThrow(function () {parser.parse(json)}, "should pass");
}

exports["test pass-4"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/36.json").toString();
    assert.doesNotThrow(function () {parser.parse(json)}, "should pass");
}

exports["test pass-4"] = function () {
    var json = fs.readFileSync(__dirname + "/fails/37.json").toString();
    assert.doesNotThrow(function () {parser.parse(json)}, "should pass");
}

exports["test position information is correct"] = function () {
    var json = fs.readFileSync(__dirname + "/passes/1.json").toString();
    parser.setPosEnabled(true);
    var parsedJson;
    assert.doesNotThrow(function () {parsedJson = parser.parse(json)}, "should pass");

    var pos1 = utils.extractPositions(parsedJson, parser.getPos());
    var pos2 = require('./1-positions');
    assert.doesNotThrow(function () {utils.comparePositions(pos1, pos2)}, "should pass");

    parser.setPosEnabled(false);
}

exports["test position information with custom position field is correct"] = function () {
    var json = fs.readFileSync(__dirname + "/passes/1.json").toString();
    parser.setPosEnabled('__MY_CUSTOM__FIELD__');
    var parsedJson;
    assert.doesNotThrow(function () {parsedJson = parser.parse(json)}, "should pass");

    var pos1 = utils.extractPositions(parsedJson, parser.getPos());
    var pos2 = require('./1-positions');
    assert.doesNotThrow(function () {utils.comparePositions(pos1, pos2)}, "should pass");

    parser.setPosEnabled(false);
}

if (require.main === module)
    require("test").run(exports);
