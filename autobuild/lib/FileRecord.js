/**
 * Created with JetBrains WebStorm.
 * User: jun
 * Date: 13-3-21
 * Time: 下午12:17
 * To change this template use File | Settings | File Templates.
 */

/*
*   作为 file 的日志文件保存到日志文件
* */
var fs = require("fs");

function FileRecord( path, fileName ){

    this.path = path;
    this.fileName = fileName;

    this.version = 0;
    this.prevTime = 0;

}

module.exports = FileRecord;

FileRecord.isResourceFile = function( fileName ){
    return !/\$\d+\./.test( fileName );
};

FileRecord.getVersionName = function( fileName, version ){
    return fileName.replace(/(\.\w+)$/, ".$$"+ version +"$1" );
};

FileRecord.createNewVersionFiles = function( fileRecord ){

    var newfileRecord = new FileRecord( fileRecord.path, fileRecord.fileName );
    newfileRecord.setVersion( fileRecord.version + 1 );
    newfileRecord.setPrevTime( fileRecord.getCtime() );

    fs.writeFileSync(newfileRecord.getVersionFilePath(), fs.readFileSync(newfileRecord.getFilePath(), ''));

    return newfileRecord;
}


FileRecord.createFiles = function( fileRecords ){

    for(var i=0; i<fileRecords.length; i++){
        fs.writeFileSync(fileRecords[i].getVersionFilePath(), fs.readFileSync(fileRecords[i].getFilePath(), ''));
    }

}

FileRecord.prototype = {
    ///
    setStat:function( stat ){
        this.stat = stat;
    },
    getCtime:function(){
        return new Date(this.stat.ctime).getTime();
    },
    setVersion : function( version ){
        this.version = version;
    },
    setPrevTime:function( time ){
        this.prevTime = time;
    },
    toJSON:function(){

        return {

            path:this.path,
            fileName:this.fileName,
            version:this.version,
            prevTime:this.prevTime

        };
    },
    getFilePath:function(){
        return this.path + this.fileName;
    },
    getVersionFilePath:function(){
        return this.path + this.getVersionFileName();
    },
    getVersionFileName:function(){
        return FileRecord.getVersionName( this.fileName, this.version );
    },
    getPrevVersionFileName:function(){
        if( this.version == 1 ){
            return this.fileName;
        }
        return FileRecord.getVersionName(this.fileName, this.version - 1);
    }
}
