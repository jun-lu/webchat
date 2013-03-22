/**
 * Created with JetBrains WebStorm.
 * User: jun
 * Date: 13-3-21
 * Time: 下午12:24
 * To change this template use File | Settings | File Templates.
 */

var fs = require("fs");
var tools = require("./tools");
var FileRecord = require("./FileRecord");

function arrayTOobject( array, filter  ){
    var objectJSON = [];
    for(var i=0; i<array.length; i++){
        objectJSON[ filter(array[i]) ] = array[i];
    }
    return objectJSON;
}
module.exports = {

    //读取日志
    readLogs:function( filePath ){

        var fileRecordList = [];
        var str = tools.readFile( filePath );

        if( str ){
            fileRecordList = JSON.parse( str );
        }

        return fileRecordList;

    },

    //读取所有待分析的文件
    readdirFile:function( paths ){
        var list = [];
        for(var i=0; i<paths.length; i++){
            list = list.concat(tools.readdir( paths[i] ));
        }
        return list;
    },

    //读取所有待替换的文件
    readViewFiles:function( paths ){
        var list = [];
        for(var i=0; i<paths.length; i++){
            list = list.concat(tools.readdir( paths[i] ));
        }
        return list;
    },

    // 提取修改过的文件
    fileRecordExtract:function( fileRecordList, logList){

        var list = [];
        var item = null;
        var fileRecord = null;
        var mapLog = arrayTOobject( logList, function(item){ return item.fileName } );
        for(var i=0; i< fileRecordList.length; i++){

            item = fileRecordList[i];
            fileRecord = mapLog[ item.fileName ];
            if( fileRecord == undefined || fileRecord.prevTime < item.getCtime() ){
                if( fileRecord ){
                    item.setVersion( fileRecord.version );
                    item.setPrevTime( fileRecord.prevTime );
                }
                list.push( item );
            }

        }

        return list;
    },


    //创建新版本的文件
    createNewVersionFiles:function( fileRecordList ){

        var newList = [];
        for(var i=0; i<fileRecordList.length; i++){

            newList.push( FileRecord.copyNewVersionFile( fileRecordList[i] ) );

        }

        return newList;
    },
    createFiles:function( fileRecordList ){

        FileRecord.createFile( fileRecordList );
    },

    replaceResourcesPath:function( viewFiles, newVersionFiles){
        //var viewFiles = viewFiles;
        var item = null;
        var list = [];//
        for(var i=0; i<viewFiles.length; i++){
            var str = fs.readFileSync(viewFiles[i].getFilePath(), "utf-8");
            var newStr = str;
            list.length = 0;
            for(var j=0; j<newVersionFiles.length; j++){

                item = newVersionFiles[j];
                str = str.replace( new RegExp(item.fileName, "gm"), item.getVersionFileName());
                str = str.replace( new RegExp(item.getPrevVersionFileName().replace("$","\\$"), "gm"), item.getVersionFileName());
                if( viewFiles[i].fileName == newVersionFiles[j].fileName ){
                    //newVersionFiles.setPrevTime( Date().now() );
                    list.push( newVersionFiles[j] );
                }
            }

            if(newStr != str){
                fs.writeFileSync(viewFiles[i].getFilePath(), str);
            }

            for(var k=0;k<list.length; k++){
                console.log("prevTime", list[k].getFilePath() );
                list[k].setPrevTime( Date.now() );
            }

        }
    },
    saveNewLogs:function(filePath, logs, newLogs){

        var map = {};
        var list = [];

        var newMap = arrayTOobject(newLogs, function(item){
            if( map[item.fileName] == undefined ){
                map[item.fileName] = 1;
                list.push( item );
            }
        });

        var logMap = arrayTOobject(logs, function(item){
            if( map[item.fileName] == undefined ){
                map[item.fileName] = 1;
                list.push( item );
            }
        });



        fs.writeFileSync( filePath, JSON.stringify( list ) );
    },
    //删除上一个版本的文件
    deleteVersionFile:function( updateFiles ){
        for(var i=0; i<updateFiles.length; i++){
            if( updateFiles[i].version > 1 ){
                fs.unlinkSync(updateFiles[i].getVersionFilePath());
            }
        }
    }
}
