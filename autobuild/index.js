

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

//把更新过的文件创建副本
var newVersionFiles = analysis.createNewVersionFile( updateFiles );
//console.log( newVersionFiles );

//所有需要替换的文本文件
var viewFiles = analysis.readViewFiles( viewPaths );
//console.log( viewFiles );
//替换所有资源路径
analysis.replaceResourcesPath( viewFiles, newVersionFiles );

analysis.saveNewLogs( logFilePath, logs, newVersionFiles );

//删除旧版本文件
analysis.deleteVersionFile( updateFiles );
