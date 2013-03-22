

//配置文件
var config = require("./config");
//  日志文件分析
var analysis = require("./lib/analysis");


//需要分析的目录
var paths = config.resourcePaths;
//需要替换的路劲
var viewPaths = config.viewPaths;
//日志文件，如果第一次构将作为日志的存放地点
var logFilePath =  config.logsPath;

//日志文件
var logs = analysis.readLogs( logFilePath );
//所有资源文件
var files = analysis.readdirFile( paths );

//根据日志文件筛选出更新过的资源文件
var updateFiles = analysis.fileRecordExtract(files, logs);

for(var i=0; i<updateFiles.length; i++){
    console.log("更新:", updateFiles[i].getFilePath());
}

// 创建新的文件版本
var newVersionFiles = analysis.createNewVersionFiles( updateFiles );

//所有需要替换的文本文件
var viewFiles = analysis.readViewFiles( viewPaths );
//console.log( viewFiles );
//替换所有资源路径
analysis.replaceResourcesPath( viewFiles, newVersionFiles );

//创建副本
analysis.createFiles( newVersionFiles );

newVersionFiles = analysis.createNewVersionFile( updateFiles );


//删除旧版本文件
analysis.deleteVersionFile( updateFiles );

console.log("-------------ok------------");
