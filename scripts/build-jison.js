
var fs = require('fs-extra');
var path = require('path');
var cli = require('jison/lib/cli');

function processGrammar(raw, lex, opts) {
    var grammar,
    parser;
    grammar = cli.processGrammars(raw, lex, opts.json);
    parser = cli.generateParserString(opts, grammar);
    return parser;
}

function buildGrammer (rawFile, lexFile, options){
    return Promise.all([
        fs.readFile(rawFile, 'utf-8'),
        fs.readFile(lexFile, 'utf-8')
    ]).then(function(files){
        var opts = Object.assign({
            moduleName: 'jsonlint',
            'module-type': 'js'
        }, options || {});
        return processGrammar(files[0], files[1], opts);
    })
}

module.exports = {
    build: buildGrammer
}

if (require.main === module) {
    var rawFile = path.resolve(__dirname, '..', process.argv[2]);
    var lexFile = path.resolve(__dirname, '..', process.argv[3]);

    buildGrammer(rawFile, lexFile).then(function(parser){
        var outFile = path.resolve(__dirname, '..', 'jsonlint.js')
        return fs.writeFile(outFile, parser, 'utf-8');
    });
}
