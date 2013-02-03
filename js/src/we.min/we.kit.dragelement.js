/*
    依赖jquery库
    
    option
    {
        dragElement: //拖动的元素
        moveElement: //移动的元素
        isRange = true;是否限定范围 可选
        range=[x,y,width, height] 范围 可选
        isResize:true,是否可缩放大小
    }
    
    api
        setRange(x, y, width, height);//限定范围
        setRangeWindow();//限定区域使用window的大小
        init();//开始
        
        
    event:
    
        onfocus();//鼠标按下准备拖动
        onblur();//鼠标抬起释放拖动
        onmove();//移动中
        onexit();//解除可移动状态
        onready();// init 准备完成
*/
        
WE.extend(WE.kit, (function(){

	
	//var Resize = WE.ui.Resize;
	
    function DragElement(option){
        var _this = this;
        var defalutOption = {
            dragElement:null,
            moveElement:null,
            isRange:true,//限定范围
            isResize:true,//可以改变大小
			patchWidth:0,//补丁宽度 会添加到 moveElement的宽度上
			patchHeight:0,
			patchTop:0,
			patchLeft:0//,
			//patchTop:0
        };
        
        
        this.width = 0;
        this.height = 0;
        this.top = 0;
        this.left = 0;
		//this.offsetTop = 35;//mx-dialog特有+35;
        $.extend(defalutOption, option);
 
        this.option = defalutOption;
        this.events = {};
        
        //setTimeout(function(){//延迟初始化保证事件已经绑定了。
        //    _this.init()
        //}, 50);
    };

    DragElement.prototype = {
        init:function(){
            var dragElement = this.option.dragElement;
            var _this = this;

            this.option.iscap = dragElement[0].setCapture ? true : false;
            
            $.extend(this.events,  {
                down:function(e){
                    //e.preventDefault();
                    _this.down(e);
                    return false;
                },
                up:function(e){
                    //e.preventDefault();
                    _this.up(e);
                    return false;
                },
                move:function(e){
                    //e.preventDefault();
                    _this.move(e);
                    return false;
                }
            });
            
            this.zIndex();//获取z-index
            this.createMask();//创建遮罩
            
            if(this.option.isRange && !this.option.range){//限定范围
                this.setRangeWindow();
            }
        
            this.start();//开始事件绑定
            this.setResize();//对象可缩放
            this.onready();//准备完成事件触发
        },
        
        zIndex:function(){
            var dragElement = this.option.dragElement;
            this.minzIndex = dragElement.css('z-index') || 10;
        },
        createMask:function(){
            this.mask = $('<div style="position:fixed;display:none;top:0;left:0;opacity:0;background:#000;filter:alpha(opacity=0)"></div>');
            this.setMask(0, 0, $(window).width(), $(window).height(), this.minzIndex+1);
            $('#mxDialogWarp').append(this.mask);
        },
        showMask:function(){
            this.mask.show();
        },
        hideMask:function(){
            this.mask.hide();
        },
        removeMask:function(){
            this.mask.remove();
        },
        setMask:function(top, left, width, height, index){
            this.mask.css({
                top:top,
                left:left,
                width:width,
                height:height,
                "z-index":index
            });
        },
        setMaskIndex:function(index){
            this.mask.css("z-index", index || WE.ui.Dialog.index);//WE.mxDialog.index  dialog的全局属性
        },
        start:function(){
            var dragElement = this.option.dragElement;
            dragElement.bind('mousedown', this.events.down);
        },
        down:function(e){
            var dragElement = this.option.dragElement, moveElement = this.option.moveElement;
            var _this = this, doc = $(document);
            
            var eleOffset = moveElement.offset();
            this.width = moveElement.width();// + this.option.patchWidth;
            this.height = moveElement.height();// + this.option.patchHeight;//+ 35;//mx-dialog特有+35;
            
            this.setRangeWindow();
            
            if(this.option.iscap){// ie  forefox
                dragElement[0].setCapture();
            }    
            
            this.offset = {
                x:e.screenX - eleOffset.left,
                y:e.screenY - eleOffset.top
            };
            
            this.showMask();//遮罩
            
            doc.bind('mousemove', this.events.move);
            doc.bind('mouseup', this.events.up);
            //触发事件
            this.onfocus(e.screenX, e.screenY);
            
        },
        move:function(e){
            var moveElement = this.option.moveElement;
            var offset = this.offset;
            
			//console.log(this.offsetLeft, this.offsetRight);
            var x = e.screenX - offset.x - $(window).scrollLeft();
            var y = e.screenY - offset.y - $(window).scrollTop();
            var newPos;
            //console.log(y);

            if(this.option.isRange){//限定范围
                newPos = this.checkBoundary(x, y);
                x = newPos.x;
                y = newPos.y;
            }
            //console.log(y);
            this.left = x;
            this.top = y;
            moveElement[0].style.left = x + "px";
            moveElement[0].style.top = y + "px";
            
            //触发事件
            this.onmove(x, y);
        },
        up:function(){
            var doc = $(document);
            var dragElement = this.option.dragElement;
            
            if(this.option.iscap){// ie  forefox
                dragElement[0].releaseCapture();
            }
            
            this.hideMask();//遮罩
            
            doc.unbind('mousemove', this.events.move);
            doc.unbind('mouseup', this.events.up);
            
            this.onblur();
            
        },
        stop:function(){
            this.removeMask();
            //this.onexit();
        },
        checkBoundary:function(x, y){
            var  range = this.option.range;
			
			$('#movebox').text(range[3] +"-"+ this.height);
			
            x = x>(range[2]-this.width) ? range[2]-this.width : x;
            y = y>(range[3]-this.height) ? range[3]-this.height : y;
            
            x = x<range[0] ? range[0] : x;
            y = y<range[1] ? range[1] : y;
            
            
            
            return {x:x, y:y};
        },
        /*api*/
        setResize:function(){
            var _this = this;
            
            if(!this.option.isResize){
                this.option.moveElement.find('.mx-dialog-change').hide();
                return false;
            }
            
            this.resize = new WE.kit.Resize({ //对象可缩放
                dragElements:this.option.moveElement.find('.mx-dialog-change'),
                sizeElement:this.option.moveElement
            });
            this.resize.onfocus = function(){
                _this.showMask();
                _this.setMaskIndex();
            };
            this.resize.onblur = function(w,h,l,t){
                //_this.onblur(w,h,t,l);
                _this.width = w;
                _this.height = h;
                _this.top = t;
                _this.left = l;
                _this.onResize();
                _this.hideMask();
            };
            this.resize.init();
        },
        setRange:function(x, y, width, height){
            //this.option.isRange = true;
            this.option.range = [x, y, width, height];
        },
        setRangeWindow:function(){
            var st = this.option.patchTop;//this.offsetLeft;//$(window).scrollTop();
            var sl = this.option.patchLeft;//this.offsetTop;//$(window).scrollLeft();
            var w = $(window).width() - this.option.patchWidth;
            var h = $(window).height() - this.option.patchHeight;
           //$('#movebox').text(h +"-"+ $(window).height() +"-"+ this.option.patchHeight);
            //this.option.isRange = true;
            this.option.range = [sl, st, w, h];
            this.setMask(0, 0, w, h, this.minzIndex);
        },
        /*事件*/
        onfocus:function(){},
        onblur:function(){},
        onmove:function(x, y){},
        onexit:function(){},
        onready:function(){},
        onResize:function(){}    
    };
	
	return {DragElement:DragElement};
})());