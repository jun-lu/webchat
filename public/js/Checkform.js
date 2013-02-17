;(function(){
			var tool = {
				$ : function(id){
					return typeof id === "string" ? document.getElementById(id) : id;
				},
				isInt:function(str){
					return ! isNaN( parseFloat(str) );
				},
				isString:function(str){
					return /^\w+$/.test(str);
				},
				isFloat:function(str){
					//return str ?  !isNaN(parseFloat(str)) : false;//此方法需要重构
					return str ? /^\d+[.][\d]+$/.test(str) : false;
				},
				isEmail:function(str){
					return /^[\w._\-]+@[\w_\-]+\.\w+$/.test(str);
				},
				minValue:function(str, min){
					return tool.isFloat(str) ? parseFloat(str) >= min : false;
				},
				maxValue:function(str, max){
					return tool.isFloat(str) ? parseFloat(str) <= max : false;
				},
				minLength:function(str, min){
					return str && String(str).length >= min;
				},
				maxLength:function(str, max){
					return str && String(str).length <= max;
				},
				regExp:function(str, reg){
					return reg.test(str);
				}
			};
			
			var Map = {
				"int":{fn:"isInt", msg:function(){return "必须为整数";}},
				"string":{fn:"isString", msg:function(){return "只能包含英文字母";}},
				"float":{fn:"isFloat", msg:function(){return "只能是小数";}},
				"minValue":{fn:"minValue", msg:function(n){return "最小值必须大于" + n;}},
				"maxValue":{fn:"maxValue", msg:function(n){return "最大值必须小于" + n;}},
				"minLength":{fn:"minLength", msg:function(n){return "最小长度为" + n;}},
				"maxLength":{fn:"maxLength", msg:function(n){return "最大长度为" + n;}},
				"email":{fn:"isEmail", msg:function(){ return "填写正确的Email";}},
				"reg":{fn:"regExp", msg:function(){ return "错误的输入格式";}}
			};
			
			var Check = function(rule){
				this.init(rule);
			};
			
			Check.prototype = {
				constructor:Check,
				init:function(rule){
					var newRule = {};
                                        var _this = this;
					this.id = rule.id;
					this.input = tool.$(rule.id);
					
					delete rule.id;
					delete rule.type;
					
					this.Stip = null;
					
					for(i in rule){
						if(Map.hasOwnProperty(i)){
							newRule[i] = {
								func:tool[ Map[i].fn ],
								rule:rule[i].rule,
								msg:rule[i].msg || Map[i].msg(rule[i].rule)
							}
						}
					};
					this.input.onblur = function(){
                                                _this.okay();        
                                        }
					this.rule = newRule;
					
				},
				okay:function(){
					var rule = this.rule;
					var val = this.getValue();
					var isOkay = true;
					var ok = false;
					for(var i in rule){

						ok = rule[i].func(val, rule[i].rule);
						
						if( ok == false){
							isOkay = false;
							if( !this.stip ){
								this.stip = new Stip(this.input);	
							}
							
							this.stip.show({content:rule[i].msg, kind:"error"});
							break;
						};
						
						this.stip && this.stip.hide();
						
					}
					return isOkay;
				},
				
				getValue:function(){
					return this.input.value;
				},
				setValue:function(value){
					return this.input.value = value;
				}
			}

			
			var CheckForm = function(rules){	
				this.checkList = {};
				this.ids = [];
				this.init(rules);
			};
			CheckForm.prototype = {
				init:function(rules){
					for(var i=0,len = rules.length; i<len; i++){
						this.ids.push(rules[i].id);
						this.checkList[rules[i].id] = new Check(rules[i]);
					}
				},
				okay:function(){
					var i, ok=true, len = this.ids.length;
					var ids = this.ids;
					
					for(i=0; i<len; i++){
						if( !this.checkList[ ids[i] ].okay() ){
							ok = false;
						}
					}
					
					return ok;
				},
				getValues:function(){
					var valueMap = {};
					var i = 0;
					var ids = this.ids;
					var len = ids.length;
					for(i; i< len; i++){
						valueMap[ ids[i] ] = this.getValue(ids[i]);
					}
					return valueMap;
				},
				getValue:function(id){
					return this.checkList[id].getValue();
				}
			};
			window.CheckForm = CheckForm;
		})();