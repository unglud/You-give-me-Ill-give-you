<?php
session_start();
if(!isset($_SESSION['test'])) $_SESSION['test'] = 1;
$var = $_SESSION['test'];
$var++;
$_SESSION['test'] = $var;
echo $var;