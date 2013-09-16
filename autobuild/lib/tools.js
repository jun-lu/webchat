/**
 * Created with JetBrains WebStorm.
 * User: jun
 * Date: 13-3-21
 * Time: 上午10:17
 * To change this template use File | Settings | File Templates.
 */


/**
 *    获取目录下所有文件
 *    return [
 *      {
 *          path: // 基路劲
 *          fileNamePath:"aa/cc/aa.js",
 *          fileName:aa.js,
 *
 *      }
 *    ]
 * */

var fs = require("fs");
var FileRecord = require("./FileRecord");

module.exports = {

    // 提取一个目录下的所有文件
    readdir:function( path ){

        var fileRecordList = [];
        var i = 0;
        var item = null;
        var fileNames = fs.readdirSync( path );

        for(; i<fileNames.length; i++){

            var stat = fs.statSync( path + fileNames[i] );
            if( stat.isDirectory() ){
                fileRecordList = fileRecordList.concat( this.readdir( path + fileNames[i] + "/" ) );
            }else if( FileRecord.isResourceFile( fileNames[i] ) ){
                item = new FileRecord(path, fileNames[i]);
                item.setStat( stat );
                fileRecordList.push( item );
            }

        }

        return fileRecordList;

    },
    //读取文件
    readFile:function( filePath ){
        try{
            return fs.readFileSync( filePath, "utf-8" );
        }catch(e){
            return null;
        }
    }

};
