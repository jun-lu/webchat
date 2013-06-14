module.exports = {
	
	/**
		database ip
		10.6.0.27
		128.0.0.1
	*/
	db:"127.0.0.1",
	
	/**
		database port
	*/
	port:27017,
	
	/**
		database name
	*/
	dbname:"webchat",
	
	/**
		http server port
	*/
	serverPort:3000,
	
	/**
		cookie domain
	*/
    domain:".vchat.com",
	/**
		photo upload
	*/
	//uploadDir:"d:/github/upload/",
	uploadDir:"/Users/jun/github/upload/",

	/**
		系统保留的子域
	*/
	sysWord: "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,sys,m,user,tmpl,images,image".split(","),

	/**
		推荐的房间
	*/
	recommendRooms:["1365651264385","1361458149047","1361182575505"]

};