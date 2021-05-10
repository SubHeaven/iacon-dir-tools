const fs = require('fs');
const log = require('debug')('iacon:dir-tools');
const { promisify } = require('util');
require('subheaven-tools');

exports.processPath = async(pathname, isdir = false, isfile = false, level = 0) => {
    console.log("");
    let name = pathname.split('\\').pop();
    log(`${'    '.repeat(level)}${name}`);
    let result = {
        "filename": name,
        "name": name,
        "ext": "",
        "isfile": false,
        "containsfile": false,
        "_modified": "",
        "modified": "",
        "_size": 0,
        "size": "",
        "selected": false,
        "childs": {}
    }

    if (isdir) {
        let content = await promisify(fs.readdir)(pathname, { withFileTypes: true });
        await content.forEachAsync(async file => {
            if (file.isFile()) {
                result.containsfile = true;
                let file_stat = fs.statSync(`${pathname}\\${file.name}`);
                result._size = result._size + file_stat.size;
                result.size = await result._size.toByteString();
                result.childs[file.name] = await this.processPath(`${pathname}\\${file.name}`, false, true, level + 1);
            } else if (file.isDirectory()) {
                let subresult = await this.processPath(`${pathname}\\${file.name}`, true, false, level + 1);
                if (subresult.containsfile) {
                    result.containsfile = true;
                    result._size = result._size + subresult._size;
                    result.size = await result._size.toByteString();
                }
                result.childs[file.name] = subresult;
            }
        });
    } else if (isfile) {
        result.isfile = true;
        let name_parts = result.filename.split('.');
        result.ext = name_parts.pop();
        result.name = name_parts.join('.');
        let file_stat = fs.statSync(pathname);
        result._size = result._size + file_stat.size;
        result.size = await result._size.toByteString();
        result._modified = file_stat.mtimeMs;
        result.modified = file_stat.mtime;
    }
    return result;
}

exports.listDir = async(pathname) => {
    let result = [];
    let processed = await this.processPath(pathname, isdir = true);
    await Object.values(processed.childs).forEachAsync(async item => {
        delete item.childs;
        result.push(item);
    });
    return result;
}