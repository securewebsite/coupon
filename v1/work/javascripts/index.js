
var imgCache = {};

/**
 * 使用webuploader控件进行图片上传
 */  
function uploadimg( option , success , error) {
    var $ = jQuery,
        $list = $('.uploader-list'),
        // 优化retina, 在retina下这个值是2
        ratio = window.devicePixelRatio || 1,

        // 缩略图大小
        thumbnailWidth = 100 * ratio,
        thumbnailHeight = 100 * ratio,

        // Web Uploader实例
        uploader;

    // 初始化Web Uploader
    uploader = WebUploader.create({

        // 自动上传。
        auto: true,

        // swf文件路径
        //swf: BASE_URL + '/js/Uploader.swf',

        // 文件接收服务端。
        server: 'diyUpload/fileupload.php',

        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#filePicker',

        // 只允许选择文件，可选。
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        }
    });

    // 当有文件添加进来的时候
    uploader.on( 'fileQueued', function( file ) {
        var $li = $(
                '<div id="' + file.id + '" class="file-item thumbnail">' +
                    '<img>' +
                    '<div class="info">' + file.name + '</div>' +
                '</div>'
                ),
            $img = $li.find('img');

        $list.append( $li );

        // 创建缩略图
        uploader.makeThumb( file, function( error, src ) {
            if ( error ) {
                $img.replaceWith('<span>不能预览</span>');
                return;
            }

            $img.attr( 'src', src );
        }, thumbnailWidth, thumbnailHeight );
    });

    // 文件上传过程中创建进度条实时显示。
    uploader.on( 'uploadProgress', function( file, percentage ) {
        var $li = $( '#'+file.id ),
            $percent = $li.find('.progress span');

        // 避免重复创建
        if ( !$percent.length ) {
            $percent = $('<p class="progress"><span></span></p>')
                    .appendTo( $li )
                    .find('span');
        }

        $percent.css( 'width', percentage * 100 + '%' );
    });

    // 文件上传成功，给item添加成功class, 用样式标记上传成功。
    uploader.on( 'uploadSuccess', success);

    // 文件上传失败，现实上传出错。
    uploader.on( 'uploadError', function( file ) {
        var $li = $( '#'+file.id ),
            $error = $li.find('div.error');

        // 避免重复创建
        if ( !$error.length ) {
            $error = $('<div class="error"></div>').appendTo( $li );
        }

        $error.text('上传失败');
    });

    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.on( 'uploadComplete', function( file ) {
        $( '#'+file.id ).find('.progress').remove();
    });
}

/**
 * 处理注册领取按钮单击事件
 */ 
function clickRegisterButton(){
    $(".right-side .pop-window").removeClass("hidden");
    $(".but1").click(function(){
        $(".pop").addClass("show");
        $(".pop-con").removeClass("show");
        $("." + $(this).val() ).addClass("show");
    });
}   

/**
 * 处理活动规则按钮单击事件
 */ 
function clickRoleTitle(){
    $(".right-side .guize").removeClass("hidden");    
    var rules = $(".rule li");
    var ruleString="";
    $(".rule li").each(function(_, elem){
        ruleString += $(elem).text().replace(/^\s*/ , "")+"\r\n";
    });
    $("#guize-content").val(ruleString);
}
/**
 * 处理图像单击事件
 */ 
function clickImage($this){    

    $(".right-side .uploader").empty().removeClass("hidden").append($("#img-reset-tpl").text());        
    $(".uploaderIconContainer").remove();

    uploadimg('' , function( file ) {
        $( '#'+file.id ).addClass('upload-state-done');
        var oldImgSrc = $this.prop("src");
        var imgPosition = $this.data("pos");
        var newImgSrc = "generate/resources/images/" + $("#fileList .info:last").text();
        $this.prop("src" , newImgSrc);
        $("#fileList").find(".smallimg").remove();
    });

    $(".uploader-list").append("<img class='smallimg' width=200 src='"+ $this.prop("src") +"'>");
}

/**
 * 为图像添加覆盖层
 */
function layerIt(obj){
    if (!obj) return ;

    $(".layer").remove();

    var width = obj.width();
    var height = obj.height();
    var parent = obj.parent();

    var guidnum = guid();

    var lay = parent.find(".layer");

    if(lay.length){
        lay.removeClass("hidden");
    }

    parent.css({
        "position":"relative"
    })
    .append("<div class='layer'></div>")
    .find(".layer").css({        
        "width":width,
        "height":height,
        "top":obj[0].offsetTop +"px",
        "left":obj[0].offsetLeft + "px"
    })
    .data("guid" , guidnum);

    obj.attr("guid" , guidnum);
}

function isChrome(){
    return navigator.userAgent.toLowerCase().match(/chrome/) != null;
}

function zero_fill_hex(num, digits) {
  var s = num.toString(16);
  while (s.length < digits)
    s = "0" + s;
  return s;
} 

function rgb2hex(rgb) {
  if (rgb.charAt(0) == '#') return rgb;
  var ds = rgb.split(/\D+/);
  var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
  return "#" + zero_fill_hex(decimal, 6);
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

$(function() {
    // 设置根字体大小            
    setRootFontSize = function() {
        var ww = $(".worktai").width();
        var root;

        if (ww < 320) root = 50;
        else if (320 <= ww && ww < 640) root = ww * 100 / 640;
        else if (640 <= ww) root = 100;

        $("html").css("font-size", root + "px");
    }
    
    $(document).resize(setRootFontSize).load(setRootFontSize).resize();

    //监听全局click事件，用于显示右侧默认选项
    $(document).on("click" ,"*",function(e){
        var $this = $(e.target);
        if(!jQuery.contains($(".wrapper")[0] , e.target) && 
            !jQuery.contains($(".right-side")[0] , e.target)&&
            !$this.hasClass("close")&&
            $(".right-side")[0] != e.target){
            $(".right-side .tpl").addClass("hidden");
            $(".defaultSetting").removeClass("hidden");
            $(".mouse-click" , $(".wrapper")).removeClass("mouse-click");
            $(".layer").remove();
            e.stopPropagation();
        }
    });

    //为图像添加覆盖层
    $(".worktai").on("mouseenter", ".wrapper img , .btn-cnt .btn", function (){
        layerIt($(this)); 
    });

    //为活动规则添加修改监听事件
    $(".cnt").on("keyup" , function (e){
        clickRoleTitle();
    });


    //为活动规则添加双击编辑事件
    $(".worktai")
    .on("dblclick", ".rule , .layer", function(e) {
        var $this = $(this);
        if($this.hasClass('layer')){
            var guid = $this.data("guid");            
            $("[guid="+ guid + "]").trigger("dblclick");
            return ;
        } 
        $(".cnt" , $this)
        .attr("contenteditable" , "true")
        .addClass("active");

        $(".layer")
        .addClass("hidden");

    });

    //为图片，活动规则，注册领取按钮，添加鼠标单击事件
    $(".worktai")
    .on("click", ".wrapper img , .rule , .btn-cnt .btn , .layer", function(e) {

        var $this = $(this);
        if($this.hasClass('layer')){
            var guid = $this.data("guid");            
            $("[guid="+ guid + "]").trigger("click");
            return ;
        }

        if($(".cnt" ).hasClass("active") && !$this.hasClass('rule')){
            $(".cnt" )
            .attr("contenteditable" , "false")
            .removeClass("active");
        }

        var $pop = $(".pop");
        if($pop.hasClass("show")){
            $pop.removeClass("show");
        }

        $(".right-side .tpl").addClass("hidden");
        $(".wrapper img , .rule, .btn-cnt .btn")
        .removeClass("mouse-click")
        .filter(this)
        .addClass("mouse-click");        

        if($this.hasClass("rule")){
            clickRoleTitle();
        }else if($this.hasClass("btn")){
            clickRegisterButton();
        }else{
            clickImage($this);
        }
    });

    $(".close").click(function(){                
        $(".pop , .pop-con").removeClass("show");
    });


    //为右侧图片上传云朵添加mouseenter事件
    $(".defaultSetting .abs-img").on("mouseenter" , function(){
        var $this = $(this);
        if($this.parent().find(".uploaderIconContainer").length){
            return ;
        }

        $(".uploaderIconContainer").remove();
        var imgType = $this.parent().find("[data-imgtype]").data("imgtype");
        $(".uploader").empty().addClass("hidden");
        $this.parent().append("<div class='uploaderIconContainer'></div>");
        $this.parent().find(".uploaderIconContainer").append($("#img-reset-tpl").text());
        uploadimg('' , function( file ) {                                        
            var newImgSrc = "generate/resources/images/" + $("#fileList .info:last").text();
            $this.parent().find("img").prop("src" , newImgSrc);               
            imgCache[imgType] = $("#fileList .info:last").text();
            $(".right-side .uploaderIconContainer").remove(); 
        });
    });    

    $(".poptxt").each(function (_, elem){                
        elem.value = $($(elem).data("elemclass")).text();                
    });

    $(".poptxt").keyup(function(){
        var newVal = $(this).val();
        var selector = $(this).data("elemclass");
        $(selector).text(newVal);
    });

    if(!isChrome()){
        $("body").text("该功能仅支持chrome浏览器");
    }

    $("#popup-btn-color").val(rgb2hex($(".rule .title").css("background-color")));
    $("#popup-btn-font-color").val(rgb2hex($(".btn-cnt .btn").css("color")));
    $("#title-color").val(rgb2hex($(".rule .title").css("background-color")));
    $("#act-guize-color").val(rgb2hex($(".rule .title").css("color")));
    $("#act-font-color").val(rgb2hex($(".rule .cnt").css("color")));
    $("#background-color").val(rgb2hex($(".wrapper").css("background-color")));

    /**
     * 传递模板以及变量给PHP处理，生成压缩包
     */    
    $("#create").click(function(){
        $("#result-report").html("");
        $("#create").text("生成中...");
        $("#result").addClass("waiting").removeClass("success");
        $(".layer").remove();

        var htmlContent = $(".worktai").html();
        htmlContent = htmlContent.replace(/generate\/(.*\.(jpg|png))/ig , "$1");
        var backgroundColor = $(".wrapper").css("background-color");
        var appName = $("#appName").val()||'唯品会';
            
        setTimeout(function(){     
            $.ajax({
                url:"../index.php",
                method: "post",
                data:{ 
                    tpl:htmlContent , 
                    bgColor:backgroundColor , 
                    arrow:imgCache["arrow"]||'arrow.png',
                    close:imgCache["close"]||'close.png',
                    coupon_off:imgCache["coupon_off"]||'coupon_off.png',
                    coupon_on:imgCache["coupon_on"]||'coupon_on.png',
                    appName:appName
                },
                dataType:"json",
                success :function(e){
                    $("#result").removeClass("waiting").addClass("success");
                    $("#result-download").attr("href", e.file).html("点击下载压缩包");
                    $("#result-url").prop("href", e.path+"/tefile/coupon.html");
                    $("#result-mark-img").prop("src", e.path+"/qrcode.png");
                    $("#result-report").html("扫码可预览。");
                    $("#create").text("生 成");
                }
            });
        }, 20);
    });

    //新模板上传压缩包
    $('#newFile').fileupload({
        dataType: 'json',
        url:"../new.php",
        done: function (e, data) {
            location.href = location.pathname + "?new";
        }
    });

    //重置为旧的模板
    $('.reset').click(function(){
        $.ajax({
            dataType: 'json',
            url:"../reset.php"
        }).done(function(data){
            location.href = location.pathname;
        });
    });

    var search = location.search;
    if(location.search=="?new"){
        $.ajax({ url: "json.js" ,  dataType: 'json'})
        .done(function(data){
            //console.log(data);
            $(".wrapper").css({"background-color":data["background-color"]});
            $(".btn-cnt .btn").css({"color":data["pop"]["color"]});
            $(".btn-cnt .btn").css({"background-color":data["pop"]["background-color"]});
            $(".cnt li").each(function(i,elem){
                $(elem).text(data["rule"]["rule"][i]);
            });
            $(".cnt").trigger("keyup");
            $(".left-side").trigger("click");

            $(".title").css({"background-color":data["rule"]["background-color"]});
            $(".title").css({"color":data["rule"]["color"]});
            $(".rule .cnt").css({"color":data["pop"]["rulecolor"]});
        });
    }

    $(".wrapper img").each(function(i , elem){
        $(elem).prop("src" , $(elem).prop("src") + "?" + (new Date()).getTime());
    });

});


/**
 * 使用angular绑定拾色器
 */
var myApp = angular.module('myApp', []);
myApp.controller('ctrl1', ['$scope', '$http', function($scope, $http) {     

    $scope.$watch('titleColor', function () {
        $(".rule .title").css("background-color" , $scope.titleColor);
    });

    $scope.$watch('guizeContent', function () {
        if(!$scope.guizeContent){
            return ;
        }
        var rules = ($scope.guizeContent).split("\n");                
        $(".rule .cnt").empty().append("<li>" +  rules.join("</li><li>") + "</li>");
    });

    $scope.$watch('popupBtnColor', function () {
        $(".btn").css({
            "background-color" : $scope.popupBtnColor,
            "box-shadow" : "1px 2px 0 0 " + $scope.popupBtnColor
        });        
    });   

    $scope.$watch('backgroundColor', function () {
        $(".wrapper").css("background-color" , $scope.backgroundColor);                
    });

    $scope.$watch('actGuizeColor', function () {
        $(".rule .title").css("color" , $scope.actGuizeColor);                
    });

    $scope.$watch('actFontColor', function () {
        $(".rule .cnt").css("color" , $scope.actFontColor);
    });

    $scope.$watch('popupBtnFontColor', function () {
        $(".btn-cnt .btn").css("color" , $scope.popupBtnFontColor);                
    });

}]);