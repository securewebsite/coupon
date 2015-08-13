<?php

header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$pgid = date("Y-m-d H:i:s",time());
$folder = "tempdata/";


$fileName = $_FILES["newFile"]["name"];
$ext = get_extension( $fileName );
$temp_dir = "work/temp";
$temp_file = $temp_dir .'/temp.zip';

deldir($temp_dir);
mkdir($temp_dir);

if($ext != 'zip' && $ext != 'ZIP'){
	die('{"result" : "-1", "msg" : "请将所需文件压缩为zip文件后上传"}');
}
if (!$out = @fopen($temp_file, "wb")) {
    die('{"result" : "-1", "msg" : "上传文件异常"}');
}
if (!$in = @fopen($_FILES["newFile"]["tmp_name"], "rb")) {
    die('{"result" : "-1", "msg" : "上传文件异常"}');
}
while ($buff = fread($in, 4096)) {
    fwrite($out, $buff);
}
@fclose($out);
@fclose($in);

$zip = zip_open($temp_file);//解压zip文件
if ($zip) {
    while ($zip_entry = zip_read($zip)) {
        $f_name = zip_entry_name($zip_entry);
        if (zip_entry_open($zip, $zip_entry, "r")) {            
            $buf = zip_entry_read($zip_entry, zip_entry_filesize($zip_entry));            
 			fwrite(@fopen($temp_dir.'/'.$f_name, "wb"), $buf);
            zip_entry_close($zip_entry);
        }     
    }
    zip_close($zip);
}
 
@unlink ($temp_file); //删除zip文件


//裁剪大图为小图
$big_img =  $temp_dir ."/big_img.jpg";
$json_file =  $temp_dir ."/json.js";

if (!$jsonin = @fopen($json_file, "rb")) {
    die('{"result" : "-1", "msg" : "json文件不存在"}');
}

if (!$imgin = @fopen($big_img, "rb")) {
    die('{"result" : "-1", "msg" : "待裁剪的大图不存在"}');
}

$contentOfJson = file_get_contents($json_file);

$jsonObj = json_decode($contentOfJson);
createImageCells($big_img, $temp_dir, $jsonObj);

@fclose($jsonin);
@fclose($imgin);
@unlink ($big_img);  
@unlink ($json_file);  

copy_dir($temp_dir, "work/resources/images/");

die('{"result" : "0", "msg" : "上传文件成功"}');


function get_extension($file) { 
	return substr(strrchr($file, '.'), 1); 
}

function deldir($dir) {
  //先删除目录下的文件：
  $dh=opendir($dir);
  while ($file=readdir($dh)) {
    if($file!="." && $file!="..") {
      $fullpath=$dir."/".$file;
      if(!is_dir($fullpath)) {
          unlink($fullpath);
      } else {
          deldir($fullpath);
      }
    }
  }
 
  closedir($dh);
  //删除当前文件夹：
  if(rmdir($dir)) {
    return true;
  } else {
    return false;
  }
}

function createImageCells($imgFileName, $folder, $json){
	 
	$image = imagecreatefromjpeg($imgFileName);
	$tempBgWidth = imagesx($image);
	$tempBgHeight = imagesy($image);

	$totHeight = 0;	
	$cnt = 0;
	foreach($json as $value) {
		$imageCell = imagecreatetruecolor($tempBgWidth, $value);		
		imagecopy($imageCell, $image, 0, 0, 0, $totHeight, $tempBgWidth, $value);
		$totHeight = $totHeight + $value;
		$cnt = $cnt + 1;
		imagejpeg($imageCell, $folder.'/img_0'.$cnt.'.jpg', 100);
	}
	imagedestroy($image);
}

function copy_dir($src,$dst) {
 
    $is_empty = is_empty_dir($src);

    if( $is_empty == 0 ){
  	  return;
    }

    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                copy_dir($src . '/' . $file,$dst . '/' . $file);
				continue;
            }
            else {
                copy($src . '/' . $file,$dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}


//判断目录是否为空
function is_empty_dir($fp){
    $H = @opendir($fp); 
    $i=0;    
    while($_file=readdir($H)){    
        $i++;    
    }    
    closedir($H);    
    if($i>2){ 
        return 1; 
    }else{ 
        return 0;  //true
    }
}
?>