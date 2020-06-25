
var fs = require('fs-extra');
var path = require('path');
var uglify = require('uglify-js');

var template = require('./template');

function bundle(srcPath){

    var promise = fs.existsSync(srcPath)? fs.readFile(srcPath, 'utf8') : Promise.resolve(srcPath);

    return promise.then(function(srcFile){
        var source = template.preamble + template.umdHeader +
            srcFile +
            template.moduleExports + template.umdFooter;

        return source;
    });
}

function bundleTo(srcPath, targets){
    return bundle(srcPath).then(function(source){
        var t, files = [];
        if(!Array.isArray(targets)){
            targets = [targets];
        }
        for(var i=0,size=targets.length; i < size; ++i){
            t = targets[i];
            files.push(fs.writeFile(path.resolve(__dirname, '..', t), source));
        }
        return Promise.all(files).then(function(){
            return source;
        });
    });
}

function minifySync(code, unMinifiedFileName){
    var minFileName = unMinifiedFileName.replace(/\.js$/, '.min.js');
    var contents = {};
    contents[unMinifiedFileName] = code;
    return uglify.minify(contents, {
        sourceMap: {
            filename: minFileName,
            url: minFileName + '.map'
        }
    });
}

function copyLibFiles(pkg, filePaths, targetFiles, isMinify){

    targetFiles = Array.isArray(targetFiles)? targetFiles : [targetFiles];
    filePaths = Array.isArray(filePaths)? filePaths : [filePaths];

    if(targetFiles.length !== filePaths.length){
        throw new Error('Cannot copy files: target file')
    }

    var mainFile = require.resolve(pkg);
    var root = findPackageRootFor(mainFile);

    var src, tasks = [];
    filePaths.forEach(function(f, i){
        f = path.resolve(root, f);
        if(!fs.existsSync(f)){
            throw new Error('Could not source file for copying: ', f);
        }
        var t = targetFiles[i];
        if(isMinify){
            var pkgFile = path.resolve(root, 'package.json');
            tasks.push(Promise.all([
                fs.readFile(pkgFile, 'utf-8'),
                fs.readFile(f, 'utf-8')
            ]).then(function(contents){

                var pkgJson = JSON.parse(contents[0]);
                var footer = '\n/** minified '+pkg+' v'+pkgJson.version+' */\n';
                var name = path.basename(t, '.min.js');
                var minified = minifySync(contents[1], name + '.js');

                if(process.env.verbose) console.log('  minify['+i+'] (v'+pkgJson.version+') ',f,' -> ', path.resolve(t), 'and', name+'.min.js.map');

                return Promise.all([
                    fs.writeFile(t, minified.code + footer, 'utf-8'),
                    fs.writeFile(t+'.map', minified.map, 'utf-8'),
                ]);
            }));
        } else {
            if(process.env.verbose) console.log('  copy['+i+'] ',f,' -> ', path.resolve(t));

            tasks.push(fs.copy(f, t));
        }
    });

    return tasks;
}

function findPackageRootFor(mainFile){
    var dir = path.dirname(mainFile);
    if(fs.existsSync(path.resolve(dir, 'package.json'))){
        return dir;
    }
    var subDir = path.dirname(dir);
    while(subDir && subDir !== dir){
        if(fs.existsSync(path.resolve(subDir, 'package.json'))){
            return subDir;
        }
        dir = subDir;
        subDir = path.dirname(subDir);
    }
    return '';
}

function exitOnError(){
    function fail(err, origin){
        console.error('ERROR at', origin, '\ncaused by', err);
        process.exit(1);
    }
    process.on('uncaughtException', fail);
    process.on('unhandledRejection', fail);
}

module.exports = {
    bundle: bundle,
    bundleTo: bundleTo,
    minifySync: minifySync,
    exitOnError: exitOnError,
    copyLibFiles: copyLibFiles,
    findPackageRootFor: findPackageRootFor
}

if (require.main === module) {

    exitOnError();

    if(process.argv.length === 2){

        var srcPath = path.resolve(__dirname, '..', 'jsonlint.js');
        bundle(srcPath).then(function(src){
            console.log(src);
        });

    } else {

        var srcPath = path.resolve(__dirname, '..', process.argv[2]);
        var targets = process.argv.slice(3);
        bundleTo(srcPath, targets);
    }
}
