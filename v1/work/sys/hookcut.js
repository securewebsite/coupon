
function TabToJson(tableid) {//表格转json
	var insertStr = "{\n";
	$ ('table tr:gt(0)').each (function (i){
		var rStr = "";
		var channelName = $(this).find('td').eq(0).text().replace(/\s+/g,"");
		var download = "download";
		var overtime = "overtime";
		var downloadUrl = $(this).find('td').eq(1).text().replace(/\s+/g,"");
		var overtimeUrl = $(this).find('td').eq(2).text().replace(/\s+/g,"");
		if(channelName==' '||channelName==''||channelName==null) return;
		rStr += "\"" + channelName + "\"\:\n";
		rStr += "{\n";
		rStr += "\"" + download + "\"\:\"" + downloadUrl + "\",\n";
		rStr += "\"" + overtime + "\"\:\"" + overtimeUrl + "\"\n";
		rStr += "},\n";
		insertStr += rStr;
	});
	insertStr = insertStr.substring(0, insertStr.length - 2)+'\n';
	insertStr += "}";
	return insertStr; 
}


var 	link_url=[];//存链接位置数组
//绘图模块
;(function(){
	var outWidth = parseInt($("#mzt-staticcut").css("border-width"));
	var pt = (function(){
		var _e={}, _p={x1:0, y1:0, x2:0, y2:0};
		_e.setP1 = function(x,y){
			_p.x1 = _p.setPX(x - outWidth);
			_p.y1 = _p.setPY(y - outWidth);
		}
		_e.setP2 = function(x,y){
			_p.x2 = _p.setPX(x - outWidth);
			_p.y2 = _p.setPY(y - outWidth);
		}
		_e.getX = function(){ return Math.min(parseInt(_p.x1), parseInt(_p.x2)) }
		_e.getY = function(){ return Math.min(parseInt(_p.y1), parseInt(_p.y2)) }
		_e.getW = function(){ return Math.abs(parseInt(_p.x1) -parseInt(_p.x2)) }
		_e.getH = function(){ return Math.abs(parseInt(_p.y1) -parseInt(_p.y2)) }
		_p.setPX = function(v){ return Math.min(Math.max(0,v),480) }
		_p.setPY = function(v){ return Math.max(0,v) }
		return _e;
	})();


	var isDrawing = false;
	var view = $("#mzt-staticcut-view");
	var cut = $("#mzt-staticcut");

	var splitF = function(e){
		if(e.ctrlKey) view.addClass("split");
		else view.removeClass("split");
	}
	var createA = function(x,y,w,h){
		return $('<a href="javascript:;"></a>').css({width:w+"%", height:h+"%", left:x+"%", top:y+"%"});
	}
	cut.on("mousedown", function(e){
		if(this!=e.target) return;
		isDrawing = true;
		pt.setP1(e.pageX, e.pageY);
	});
	$(document).on("keydown",splitF).on("keyup",splitF).on("mousemove", function(e){
		if(!isDrawing) return;
		pt.setP2(e.pageX, e.pageY);
		view.css({
			 width : pt.getW(),
			height : pt.getH(),
			  left : pt.getX(), 
			   top : pt.getY()
		});
	}).on("mouseup", function(e){
		console.log(e.target);
		if(!isDrawing) return;
		pt.setP2(e.pageX,e.pageY);
		view.removeAttr("style");
		isDrawing=false;
		var ratio = cut.width()/640;
		var w = parseInt(pt.getW()/ 640/ratio*100000)/1000,
			h = parseInt(pt.getH()/1000/ratio*100000)/1000,
			x = parseInt(pt.getX()/ 640/ratio*100000)/1000,
			y = parseInt(pt.getY()/1000/ratio*100000)/1000;
		
		if(pt.getW()>20 && pt.getH()>20){//宽高大于20，画链接区域
			
			var temp = $(".mzt-staticcut-click.on");
			var o = temp.find('a');
			var num = o.index()+1;//找不到a标签的时候index为-1
			
			if (num>2){
				alert('亲，最多允许3个选区哦');
				return false;
			}else{
				temp.append(createA(x,y,w,h));//画链接选区
			}
			
		}
		var getPercent = function (e){//获取小数点后两位
			return Math.floor(e * 100) / 100;
		}
		
		//获取选区位置rem
		var top_link =getPercent(pt.getY()*640/480/100);
		var left_link =getPercent(pt.getX()*640/480/100);
		var width_link =getPercent(pt.getW()*640/480/100);
		var height_link =getPercent(pt.getH()*640/480/100);
		//将选区位置存于数组
		link_url[num] ="top:"+top_link+"rem;left:"+left_link+"rem;width:"+width_link+"rem;height:"+height_link+"rem;"
		
	});
	
	var exchangeA, exchangeB;
	$(".mzt-staticcut-click").delegate("a", "click", function(e){
		
		//点击了区域为30x30的伪元素after图标, 启动自我毁灭程序(删除)
		if(e.offsetY<30 && e.offsetX>e.target.clientWidth-30){
			var num = $(this).index();
			link_url.splice(num,1);//删除数组中对应的当前选区
			//alert(link_url);
			e.target.remove();
		
		}
	});

})();



//标题输入
$("#vico-title").on("input", function(){
	$(this).html($(this).text());
});


//生成
$("#create").click(function(){
	var linknum = link_url.length;
	if(linknum==2){
		var downloadposition1 =link_url[0];
		var homeposition =link_url[1];
	}else if(linknum==3){
		var downloadposition1 =link_url[0];
		var downloadposition2 =link_url[1];
		var homeposition =link_url[2];
	}
	
	$("#result-report").html("");
	$("#create").text("生成中...");
	$("#result").addClass("waiting").removeClass("success");
	
	
	
	setTimeout(function(){
		var para = {
			        vicoName : $("#vico-title").val(),
					 vicoData : {
					 	date : $("#vico-date").val(),
						downloadposition1 : downloadposition1,
					 	downloadposition2 : downloadposition2,
					 	homeposition : homeposition,
					 	description : $("#vico-description").val(),
						bodycolor : $("#vico-body-color").val(),
						rulescolor : $("#vico-rules-color").val()
						
					 },
					 vicoTable:TabToJson()
		}
		
		
		$.post("../index.php", para, function(e){
			$("#result").removeClass("waiting").addClass("success");
			$("#result-download").attr("href", e.file).html(e.name);
			$("#result-url").attr("href", e.path+"/tefile/template_index.html");
			$("#result-mark-img").attr("src", e.path+"/qrcode.png");
			$("#result-report").html("生成完毕，左侧可扫码预览。");
			$("#create").text("生 成");
		}, "json");
	}, 20);
});


//兼容判断
if(navigator.userAgent.indexOf("WebKit")==-1) $("#notWebkitError").css("display","block");