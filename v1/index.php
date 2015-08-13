<?php

// Make sure file is not cached (as it happens for example on iOS devices)
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");



#临时文件目录生成 start
$pgid = date("Y-m-d_H_i_s",time());
$folder = "tempdata/".$pgid;


mkdir("tempdata");
mkdir($folder);
mkdir($folder."/tefile");
mkdir($folder."/tefile/resources");
mkdir($folder."/tefile/resources/images");
mkdir($folder."/tefile/resources/css");
mkdir("zipdata");
copy_dir('work/resources/css', $folder."/tefile/resources/css");
copy_dir('work/resources/images', $folder."/tefile/resources/images");
copy_dir('work/generate/resources/images', $folder."/tefile/resources/images");


#临时文件目录生成 end
$tpl =  $_POST["tpl"];
$bg_color =  $_POST["bgColor"];
$arrow = $_POST["arrow"];
$close = $_POST["close"];
$coupon_off = $_POST["coupon_off"];
$coupon_on = $_POST["coupon_on"];
$app_name = $_POST["appName"];


$file_temp = file_get_contents("work/resources/coupon.html");
$file_temp = preg_replace("/{COUPON_USERSET_CONTENT}/", $tpl , $file_temp);
$file_temp = preg_replace("/{BODY_BACKGROUND_COLOR}/", $bg_color , $file_temp);
$file_temp = preg_replace("/{APP_NAME}/", $app_name , $file_temp);
file_put_contents($folder."/tefile/coupon.html", $file_temp);
$file_temp = file_get_contents($folder."/tefile/coupon.html");

$file_temp = file_get_contents("work/resources/css/style.css");
$file_temp = preg_replace("/{coupon_on}/", $coupon_on , $file_temp);
$file_temp = preg_replace("/{coupon_off}/", $coupon_off , $file_temp);
$file_temp = preg_replace("/{close}/", $close , $file_temp);
$file_temp = preg_replace("/{arrow}/", $arrow , $file_temp);
file_put_contents($folder."/tefile/resources/css/style.css", $file_temp);

$zip = new ZipArchive;
$zipFileName = $pgid."-coupon.zip";
if ($zip->open("zipdata/".$zipFileName, ZIPARCHIVE::CREATE | ZipArchive::OVERWRITE) === TRUE) {
	addFileToZip($folder."/tefile/", $zip);
	$zip->close();
}

#返回结果
$result['name'] = $zipFileName;
$result['file'] = '../zipdata/'.$zipFileName;
$result['path'] = preg_replace("/index.php/", "", "http://".$_SERVER["HTTP_HOST"].$_SERVER["REQUEST_URI"]).$folder;

include 'phpqrcode.php'; 

QRcode::png($result['path'].'/tefile/coupon.html', $folder."/qrcode.png", "L", 3, 2); 



deldir("work/generate/resources/images");

exit(json_encode($result));


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

//判断目录是否为空
function is_empty_dir($fp)    
{
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

#文件打包
function addFileToZip($folder, $zip, $path=null) {
	$handler = opendir($path ? $folder."/".$path : $folder);
	while (($filename = readdir($handler)) !== false) {
		if ($filename == "." || $filename == "..") continue;
		
		$subpath = $path ? $path."/".$filename : $filename;
		if (is_dir($folder."/".$subpath)) {
			addFileToZip($folder, $zip, $subpath);
		} else {
			$zip->addFile($folder."/".$subpath, $subpath);
		}
	}
	closedir($handler);
}

?>