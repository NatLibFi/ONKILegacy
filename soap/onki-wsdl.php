<?php

// parameters from the WSDL URL
$key = isset($_GET['k']) ? $_GET['k'] : 'nokey';
$vocid = isset($_GET['o']) ? $_GET['o'] : 'none';
$host = isset($_GET['h']) ? $_GET['h'] : 'onki.fi';

// read the WSDL file template
$wsdl = file_get_contents('onki.wsdl');
// replace placeholders with real values
$wsdl = str_replace('ONKIKEY', $key, $wsdl);
$wsdl = str_replace('VOCID', $vocid, $wsdl);
$wsdl = str_replace('ONKIHOST', $host, $wsdl);

// return the generated WSDL
header('Content-type: text/xml'); // this is what the real ONKI3 returns
echo $wsdl;
