<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$base = "work/resources/images/";
deldir($base);
mkdir($base);
copy_dir("work/resources/images_bak/", $base);

//echo 'ok';
die('{"result":"ok"}');

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