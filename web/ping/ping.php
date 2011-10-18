<?php 
$sha = $_GET['s'];
if($sha == '3b7372d20efe03c2816c9d1749bbb17374acc213' || (isset($_GET['t']) && $sha==$_GET['t'])){
echo 'echo "test: '.$sha.'";';
} else 'echo "Site is online.";';
?>