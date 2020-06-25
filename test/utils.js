
const _ = require('lodash');

/**
 * compare position information
 *
 * @param  {Position} pos the extracted position information from jsonlint-pos parsing result, see #extractPositions()
 * @param  {Pos} pos2 the position information extracted by package json-source-map
 * @throws {Error} if there is a position from <code>pos2</code> that cannot be matched in <code>pos</code>
 */
function comparePositions(pos, pos2){
    Object.keys(pos2).forEach(function(field){
        if(!field){
            if(process.env.verbose) console.log('  comparing <root>...');
            var p2 = convertPos(pos2[field]);
            var p = convertReduce(pos._pos, Array.isArray(p2));
            compare(p, p2, field);
            if(process.env.verbose) console.log('    positions match!');
            return;
        }

        if(process.env.verbose) console.log('  comparing ',field, '...');

        var seg = toSegments(field), target = pos[seg[0]], parent = pos;
        var size=seg.length;
        // if(process.env.verbose) console.log('  traversing segements "'+field+'" -> ',seg)
        for(var i=1; i < size; ++i){
            if(!target[seg[i]] && process.env.verbose) {
                console.log('  traversing "'+seg[i]+'" in ', target)
            }
            parent = target;
            target = target[seg[i]];
        }

        var p2 = convertPos(pos2[field]);
        var p = convertReduce(target._pos||target, Array.isArray(p2));
        var isSame = true;
        if(!compare(p, p2, field, 'silent') && parent && parent._pos_items){
            var isArray = parent._type === 'Array';
            var itemFieldName = '_' + seg[size-1];
            p = convertReduce(parent._pos_items[itemFieldName], Array.isArray(p2));
            isSame = compare(p, p2, field + '  (from parent)', 'silent');
        }
        if(!isSame){
            p = convertReduce(target._pos||target, Array.isArray(p2))

            if(process.env.verbose && parent && parent._pos_items){
                try {
                    compare(p, p2, field);
                } catch(err){
                    console.log('   parent position:\n', convertReduce(parent._pos_items[itemFieldName], Array.isArray(p2)));
                    throw err;
                }
            } else {
                compare(p, p2, field);
            }
        }
        if(process.env.verbose) console.log('    positions match!');
    })
    if(process.env.verbose) console.log('completed comparison!');
}

/**
 * Extract position information from parsed JSON that includes
 * the information in field <code>locName</code>.
 *
 * Returns normalized position information object:
 * access path to the position correspondes to the original field.
 *
 * Either the value itself is a position object, or it has a property "_pos"
 * with the position field.
 *
 * In addition, arrays and objects have a field "_pos_items" attached:
 * these contain additional position for some of their members/entries, in case
 * the inner position differes from the out position information:
 * <pre>
 *  _pos_items: {
 *    _3: { first_line: ...
 *    ...
 *  }
 * </pre>
 *
 * @param  {Object} obj the parsed JSON object with position information
 * @param  {string} locName the name of the position field (use parser.getPos())
 * @return {Position} the extracted position information
 */
function extractPositions(obj, locName){

    if(typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || (typeof obj === 'object' && !obj)){
        return void(0);
    }

    //ASSERT is non-null object or array

    var p = _.cloneDeep(obj[locName]), pos, tmp;
    if(Array.isArray(obj)){
        //ASSERT is array
        var size = obj.length;
        if(size === 0 && !p._this){
            return void(0);
        }
        pos = new Array(size);
        pos['_type'] = 'Array';
        pos['_pos'] = p._this;
        for(var i=0; i < size; ++i){
            tmp = extractPositions(obj[i], locName);
            if(!tmp){
                tmp = p['_'+i];
                delete p['_'+i];
            }
            pos[i] = tmp;
        }
        delete p._this;
        pos['_pos_items'] = p;
    } else {
        //ASSERT is non-null object
        var size = 0;
        pos = {
            _type: 'Object',
            _pos: p._this,
        };
        for(var n in obj){
            if(n === locName){
                continue;
            }
            ++size;
            tmp = extractPositions(obj[n], locName);
            if(!tmp){
                tmp = p['_'+n];
                delete p['_'+n];
            }
            pos[n] = tmp;
        }
        if(size === 0 && !p._this){
            return void(0);
        }
        delete p._this;
        pos['_pos_items'] = p;
    }
    return pos;
}

function compare(p, p2, field, silent){
    if(!_.isEqual(p, p2)){
        if(silent){
            return false;
        }
        var msg = 'Mismatching positions for "'+field+'": should be \n'+JSON.stringify(p2)+',  but is \n'+JSON.stringify(p);
        // console.log(msg)
        // return false;
        throw new Error(msg);
    }
    return true;
}

function toSegments(field){
    return field.substring(1).split('/').map(function(s){
        return unescapeSegment(s);
    })
}

/**
 * path-segements are escaped:
 *
 * e.g. for original string:
 * "int/eger//and~1and~01"
 * -> the escaped path segment would be:
 * "int~1eger~1~1and~01and~001"
 *
 * @param  {string} s the path segment
 * @return {string} the unescaped path segment
 */
function unescapeSegment(s){
    return s.replace(/(~0)/g, '~').replace(/(~1)/g, '/').replace(/(~0(0*1))/g, '~$2')
}



function convertPos(p){
    if(p.key){
        return [
            toLoc(p, 'key'),
            toLoc(p, 'value')
        ];
    }
    return toLoc(p, 'value');
}


/**
 * convert the position information
 {
 value: { line: 55, column: 0, pos: 1407 },
 valueEnd: { line: 55, column: 4, pos: 1411 }
 }
 -->
 {
   "first_line": 38,
   "last_line": 38,
   "first_column": 8,
   "last_column": 23
 }
 * @param  {Pos} p the position information
 * @param  {"value" | "key"} field the base-field name in the position information to convert
 * @return {Position} position information
 */
function toLoc(p, field){
    return {
        "first_line": p[field].line + 1,
        "last_line": p[field + 'End'].line + 1,
        "first_column": p[field].column,
        "last_column": p[field + 'End'].column
    };
}

function convertReduce(ps, omitReduce){
    if(!Array.isArray(ps) || omitReduce){
        return ps;
    }
    return {
        "first_line": ps[0].first_line,
        "last_line": ps[1].last_line,
        "first_column": ps[0].first_column,
        "last_column": ps[1].last_column
    };
}

module.exports = {
    extractPositions: extractPositions,
    comparePositions: comparePositions
}
