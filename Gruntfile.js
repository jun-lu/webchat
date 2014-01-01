
module.exports = function(grunt){

    // 项目配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //合并任务
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            "we_min": {
                src: ['public/js/src/we.min/we.js','public/js/src/we.min/*.js','public/js/src/we.ui/we.dialog.js','public/js/src/we.api/*.js'],
                dest: 'public/js/lib/we.min.js'
            },
            "we_chat_min": {
                src: ['public/js/src/we.chat/we.page.chat.js'],
                dest: 'public/js/chat.min.js'
            },
            "we_create_min": {
                src: ['public/js/src/we.create/we.create.js'],
                dest: 'public/js/we.create.min.js'
            },
            "we_top_min": {
                src: ['public/js/src/we.top/we.top.js'],
                dest: 'public/js/we.top.min.js'
            },
            "we_user_min": {
                src: ['public/js/src/we.user/we.page.user.js'],
                dest: 'public/js/we.user.min.js'
            },
            "chat":{
	    		src:['public/js/chat.js'],
            	dest: 'public/js/chat.min.js'
            }
            
        },

        //压缩任务
        uglify:{
        	options:{
    			banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> */\n'
    		},
        	"we_min":{
        		files:{"<%= concat.we_min.dest  %>":['<%= concat.we_min.src  %>']}
        	},
        	"we_chat_min": {
        		files:{"<%= concat.we_chat_min.dest  %>":['<%= concat.we_chat_min.src  %>']}
            },
            "we_create_min": {
        		files:{"<%= concat.we_create_min.dest  %>":['<%= concat.we_create_min.src  %>']}
            },
            "we_top_min": {
        		files:{"<%= concat.we_top_min.dest  %>":['<%= concat.we_top_min.src  %>']}
            },
            "we_user_min": {
        		files:{"<%= concat.we_user_min.dest  %>":['<%= concat.we_user_min.src  %>']}
            },
            "chat": {
        		files:{"<%= concat.chat.dest  %>":['<%= concat.chat.src  %>']}
            }

        },
        watch: {
        	"we_min":{
        		files: ["<%= concat.we_min.src  %>"],
           		tasks: ['concat:we_min']
        	},
        	"we_chat_min":{
        		files: ["<%= concat.we_chat_min.src  %>"],
           		tasks: ['concat:we_chat_min']
        	},
        	"we_create_min":{
        		files: ["<%= concat.we_create_min.src  %>"],
           		tasks: ['concat:we_create_min']
        	},
        	"we_top_min":{
        		files: ["<%= concat.we_top_min.src  %>"],
           		tasks: ['concat:we_top_min']
        	},
        	"we_user_min":{
        		files: ["<%= concat.we_user_min.src  %>"],
           		tasks: ['concat:we_user_min']
        	},
        	"chat": {
        		files: ["<%= concat.chat.src  %>"],
           		tasks: ['concat:chat']
            }
            
        }



    });

    // 加载提供"uglify"任务的插件
    grunt.loadNpmTasks('grunt-contrib-concat');
    //合并插件
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //合并插件
    grunt.loadNpmTasks('grunt-contrib-watch');

    //上线 grunt 
    grunt.registerTask('default', ['uglify']);

    //开发 grunt dev
    grunt.registerTask('dev', ['concat','watch']);
}





