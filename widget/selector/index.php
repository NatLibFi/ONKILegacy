<?php

error_reporting(E_ALL & ~E_NOTICE & ~E_USER_NOTICE);
date_default_timezone_set("Europe/Helsinki");

if ($_SERVER['SERVER_NAME'] == 'onki.fi' || $_SERVER['SERVER_NAME'] == 'dev.onki.fi') 
    $onkikey = '4443fdf30e787e31352cdbbe73f64c91'; // onki.fi
else
    $onkikey = '2ba36d50f003848034a2f4628d371a62'; // tkk.fi
	
$frontendPublicBaseUrl = "//" . $_SERVER['SERVER_NAME'];
if (strpos($_SERVER['REQUEST_URI'], '/public/') !== false)
	$frontendPublicBaseUrl .= substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '/public/')+7);

$repositoryMetadata = json_decode(file_get_contents("http://onki.fi/api/v2/http/repo/ontologies?format=json-onkiselector"), true);

function getLabel($key, $langopt=null) {
  global $labels;
  if ($langopt==null)
    $langopt = getValue('l');
  if (array_key_exists($key."-".$langopt, $labels))
    return $labels[$key.'-'.$langopt];
  return $key;
}

//TODO: muuta käyttämään css-kieliversiointia
$labels = array("title-fi" => "ONKI-valitsin",
                "title-en" => "ONKI Selector",
"key-fi" => "Avainkoodisi www.yso.fi-palvelun käyttämiseen",
"key-en" => "Your access key to www.yso.fi services",
"generatekey-fi" => "luo avainkoodi",
"generatekey-en" => "generate access key",
"generatecode-fi" => "Generoi ONKI-valitsinkoodi",
"generatecode-en" => "Generate ONKI Selector Code",
"o-fi" => "Ontologia, johon haku kohdistuu",
"o-en" => "The ontology to be searched",
"fieldId-fi" => "Hakutermin syöttämiseen käytettävän input-kentän id",
"fieldId-en" => "The id of the input field used for inputing the search term",
"UILang-fi" => "ONKI-valitsimen käyttöliittymän kieli",
"UILang-en" => "The language of the user interface of the ONKI Selector",
"addConceptFunction-fi" => "Itse määriteltävä Javascript-funktio käsitteiden valintaan hakutuloksista omaan sovellukseen",
"addConceptFunction-en" => "A javacript function defined by you to add concepts from search results to your application",
"autocompletionSearch-fi" => "Näytä autocompletion-hakukenttä",
"autocompletionSearch-en" => "Show the autocompletion search field",
"fieldName-fi" => "Valittujen käsitteiden tallentamiseen käytettyjen piilokenttien nimi",
"fieldName-en" => "The name of the hidden input fields used for storing the selected concepts",
"lang-fi" => "Haun rajaus tämänkielisiin käsitteiden nimiin",
"lang-en" => "Search is limited to the labels of this language",
"languageMenu-fi" => "Näytä valitun ontologian vaihtoehtoiset kielet valikossa",
"languageMenu-en" => "Show the available languages of the selected ontology in a selection menu",
"maxHits-fi" => "Hakutulosten maksimimäärä (\"-1\" = rajoittamaton)",
"maxHits-en" => "Maximum amount of search results (\"-1\" = unlimited)",
"maxSelect-fi" => "Valittavien käsitteiden maksimimäärä (\"-1\" = rajoittamaton)",
"maxSelect-en" => "The maximum amount of concepts that can be selected from search results (\"-1\" = unlimited)",
"onkimenu-fi" => "Näytä kaikki www.yso.fi-ontologiat valikossa",
"onkimenu-en" => "Show all the www.yso.fi ontologies in a selection menu",
"showOnkiName-fi" => "Jos ontologia-valikko on asetettu pois näkyvistä, näytä valitun ontologian nimi ontologia-valikon tilalla",
"showOnkiName-en" => "If the ontology menu is disabled, show the name of the selected ontology instead",
"fieldLabel-fi" => "Otsikko, joka näytetään ONKI-valitsimen vasemmalla puolella",
"fieldLabel-en" => "Label to be shown on the left side of the ONKI Selector",
"openonkibutton-fi" => "Onko ONKI-selaimen avaaminen sallittu (\"Open ONKI Browser\" -painike)",
"openonkibutton-en" => "Is the opening of the ONKI Browser allowed (\"Open ONKI Browser\" button)",
"openonkilabel-fi" => "\"Open ONKI Browser\" -painikkeen nimi",
"openonkilabel-en" => "The label of the \"Open ONKI Browser\" button",
"parentRestriction-fi" => "Haun rajaus tämän käsitteen (URI) alipuuhun",
"parentRestriction-en" => "Search is limited to the sub tree of this concept (URI)",
"prefix-fi" => "Liitä hakutuloksista valittujen käsitteiden nimiin nimiavaruus-etuliite (esim. yso:)",
"prefix-en" => "Is the namespace prefix of the concepts shown as part of the labels of concepts selected from search results",
"typeRestriction-fi" => "Haun rajaus tämäntyyppisiin käsitteisiin (URI)",
"typeRestriction-en" => "Search is limited to the concepts of this type (URI)",
"groupRestriction-fi" => "Haun rajaus tähän ryhmään kuuluviin käsitteisiin (URI)",
"groupRestriction-en" => "Search is limited to the concepts belonging to this group (URI)",
"returnType-fi" => "Noudettavien resurssien tyyppi (käytettävissä vain koordinaattihaussa)",
"returnType-en" => "The type of resources to fetch (usable only in coordinate search)",
"fetchLabels-fi" => "Nouda käsitteiden nimiä (termejä)",
"fetchLabels-en" => "Fetch concept labels (terms)",
"fetchUris-fi" => "Nouda käsitteiden URI-tunnisteita",
"fetchUris-en" => "Fetch concept URIs",
"delimiter-fi" => "Erotinmerkki käsitteen URI-tunnisteelle ja nimelle (oletus \" \")",
"delimiter-en" => "Delimiter for concept URI and label (default \" \")",
"showCaptions-fi" => "Näytä ohjetekstit valitsimen komponenteille",
"showCaptions-en" => "Show captions for selector's components");

?>
<!DOCTYPE HTML>
<html>
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="Author" content="Ontology Service ONKI" />
<meta name="Copyright" content="Copyright © Semantic Computing Research Group (SeCo) 2011" />
<meta name="Distribution" content="GLOBAL" />

<title>ONKI Selector</title>
<link rel="stylesheet" type="text/css" href="../../resource/index/css/reference.css"/>
<link rel="stylesheet" type="text/css" href="../../resource/index/style/localization-support.css"/>
<script type="text/javascript" src="../../resource/index/js/localization-support.js"></script>
<style type="text/css">
td {
        border: none;
}
table {
        border: 2px solid #dddddd;
        background: #ffffff;
}
.widget-code {
 background: #FFFF77 none repeat scroll 0%;
 padding: 10px;
 border: 1px solid black;
 width: 70%;
}
</style>
</head>
<body>

<p align="right"><a class="langmenu-fi" href="#" onClick="showLanguage('fi'); return false;">suomeksi</a> - <a class="langmenu-en-selected" href="#" onClick="showLanguage('en'); return false;">in English</a></p>

<?php

$parameters = array("o" => array("default" => "yso"),
		    		"key" => array("type" => "string", "default" => "INSERT_YOUR_KEY_HERE"),
                    "fieldId" => array("type" => "string"),
		    "UILang" => array("type=" => "string"),
                    "addConceptFunction" => array("type" => "function", "default" => ""),
                    "autocompletionSearch" => array("type" => "boolean", "default" => "true"),
		    "delimiter" => array("type" => "string", "default" => " "),
		    "fetchLabels" => array("type" => "boolean", "default" => "false"),
		    "fetchUris" => array("type" => "boolean", "default" => "true"),
		    "fieldLabel" => array("type" => "string", "default" => ""),
                    "fieldName" => array("type" => "string"),
		    "groupRestriction" => array("type" => "string", "default" => ""),
                    "lang" => array("type" => "string", "default" => "fi"),
                    "languageMenu" => array("type" => "boolean", "default" => "true"),
                    "maxHits" => array("type" => "int", "default" => "50"),
                    "maxSelect" => array("type" => "int", "default" => "-1"),
                    "onkimenu" => array("type" => "boolean", "default" => "true"),
                    "openonkibutton" => array("type" => "boolean", "default" => "true"),
                    "openonkilabel" => array("type" => "string", "default" => "Open ONKI Browser"),
                    "parentRestriction" => array("type" => "string", "default" => ""),
                    "prefix" => array("type" => "boolean", "default" => "true"),
		    "returnType" => array("type" => "enum", "default" => "singlepoint", "values" => array("singlepoint", "polygon", "route")),
		    "showCaptions" => array("type" => "boolean", "default" => "false"),
		    "showOnkiName" => array("type" => "boolean", "default" => "true"),
                    "typeRestriction" => array("type" => "string", "default" => "")
);

function getDefault($par) {
	global $parameters;
	if (isset($parameters[$par]) &&
	    isset($parameters[$par]["default"]) &&
	    $parameters[$par]["default"])
		return $parameters[$par]["default"];
	else if ($par == "fieldId")
		return getValue("o")."Search";
	else if ($par == "fieldName") {
		if (getValue("fetchUris"))
			return "uri";
		else
			return "term";
	}
	else if ($par == "UILang")
		return getValue("l");
	else if ($par == "l")
		return "en";
}

function getValue($par) {
	global $parameters;
	if ($_GET[$par])
		return $_GET[$par];
	else if ($_POST[$par])
		return $_POST[$par];
	else if ($par == "showCaptions")
		return "true";
	return getDefault($par);
}

$ontoid = getValue("o");

$validOntoId = false;
if ($ontoid == "null") {
	$validOntoId = true;
	$ontotitle = "all ontologies";
}
else {
	foreach ($repositoryMetadata as $ontologyMetadata) {
		if ($ontologyMetadata['http://www.yso.fi/onki-ns/onki/abbreviation'] === $ontoid) {
			$validOntoId = true;
			$ontotitle = $ontologyMetadata['http://www.w3.org/2000/01/rdf-schema#label'];
		}
	}
}

if ($validOntoId) {
	
echo "<h1 class='lang-fi'>ONKI-valitsin: <i>".$ontotitle."</i></h1>\n";	
echo "<h1 class='lang-en'>ONKI Selector for <i>".$ontotitle."</i></h1>\n";

?>

<script type="text/Javascript" src="<?php echo $frontendPublicBaseUrl; ?>/widget/selector/onki-selector.js?<?php echo $onkikey; ?>&amp;l=<?php echo getValue('UILang'); ?>"></script>

<p class="lang-fi">Integroi käyttöliittymäkomponentti järjestelmääsi lisäämällä seuraava koodirivi HTML-sivun HEAD-osioon:</p>
<p class="lang-en">Integrate the user interface component into your system by adding the following code line into the HEAD section of the HTML page:</p>

<div class="widget-code">
&lt;script type="text/Javascript" src="http://onki.fi/widget/selector/onki-selector.js?<?php echo getValue('key'); ?>&amp;l=<?php echo getValue('UILang'); ?>"&gt;&lt;/script&gt;
</div>

<p class="lang-fi">ja seuraava koodirivi HTML-sivun BODY-osion kohtaan, johon haluat sijoittaa komponentin:</p>
<p class="lang-en">and the following code line into the BODY section of the HTML page, into the location where the component is desired:</p>

<div class="widget-code">

<?php
$inputtag = "input onkeyup=\"onki[";
if ($ontoid != "null")
	$inputtag .= "'";
$inputtag .= $ontoid;
if ($ontoid != "null")
	$inputtag .= "'";
$inputtag .= "].search(";

$counter = 0;

foreach ($parameters as $par => $values) {
	$type = $values["type"];
	if ($par != "o" && $par != "fieldId" && $par != "key" && $par != "UILang" && getValue($par) && (getValue($par) != getDefault($par) || $par == "returnType") && ($par != "returnType" || getValue("o") == "koordinaatit")) {
		if ($counter == 0)
			$inputtag .= "{";
		else
			$inputtag .= ", ";
		$inputtag .= "'$par' : ";
		if ($type == "string" || $type == "enum") {
			$inputtag .= "'".getValue($par)."'";
		}
		else {
			$inputtag .= getValue($par);
		}
		$counter++;
	}
}
if ($counter > 0)
	$inputtag .= "}";

$inputtag .= ")\" id=\"".getValue("fieldId")."\"/";
echo "&lt;$inputtag&gt;";

?>

</div>

<p class="lang-fi">Lisäämällä yllä olevat koodirivit alla oleva komponentti integroituu 
järjestelmääsi:</p>
<p class="lang-en">By adding the codelines above, a widget as seen below is integrated into your system:</p>

<?php
echo "<".$inputtag.">";
?>

<?php //TODO: demosivujen url-politiikka? ?>
<p class="lang-fi" style="margin-top:30px;">Voit kokeilla ONKI-valitsimen integroimista <a href="integration-demo.php?l=<?php echo getValue('l'); ?>">testisivulla</a>.
<!-- ONKI-valitsinta voi kokeilla myös <a href="/annotation/">annotaatio-demosivulla</a>. -->
</p>
<?php //TODO: linkitetty sivu pitää kääntää englanniksi ?>
<!-- <p style="margin-top:30px;">You can try the ONKI Selector integration on a <a href="integration-demo.php?l=<?php echo getValue('l'); ?>">test page</a>.</p> -->
<!-- <p class="lang-en" style="margin-top:30px;">You can try the ONKI Selector also on <a href="/annotation/">an annotation demo page</a>.</p> -->

<p class="lang-fi" style="margin-top:30px;">Luotavan ONKI-valitsimen toimintoja voidaan muokata alla olevalla lomakkeella.</p>
<p class="lang-en" style="margin-top:60px;">The functionalities of the generated ONKI Selector can be modified by using the form below.</p>

<form action="index.php" method="post">

<input type="hidden" name="l" value="<?php echo getValue("l");  ?>"/>

<table style="padding:20px; font-size:12px;">

<?php

foreach ($parameters as $par => $values) {
$type = $values["type"];
$options = $values["values"];

// show returnType only with "koordinaatit"
if ($par != "returnType" || getValue("o") == "koordinaatit") {

echo "<tr>";
if ($par == "o")
	echo "<td><b>ontology</b></td>";
else if ($par == "key" || $par == "fieldId")
	echo "<td><b>$par</b></td>";
else
	echo "<td>$par</td>";

echo "<td>";

if ($par == "o") {
	
	echo "<select name=\"".$par."\">";

	$ontoids = array();
	
	foreach ($repositoryMetadata as $ontologyMetadata) {
		//if ($ontologyMetadata['http://www.yso.fi/onki-ns/onki/visible'] !== 'http://www.yso.fi/onki-ns/onki/true')
		if ($ontologyMetadata['http://www.yso.fi/onki-ns/onki/browser'] !== 'http://www.yso.fi/onki-ns/onki/true')
	                continue;

		$ontoid = $ontologyMetadata['http://www.yso.fi/onki-ns/onki/abbreviation'];
		$ontoids[] = $ontoid;
	}

	if (getValue($par) != null && !in_array(getValue($par), $ontoids))
		$ontoids[] = getValue($par);
	
	sort($ontoids);

	foreach ($ontoids as $ontoid) {
		echo "<option value=\"$ontoid\"";
		if ($ontoid == getValue($par))
			echo " selected=\"selected\"";
		echo">$ontoid</option>\n";	
	}
	
	// all ontologies (global search)
	echo "<option value=\"null\"";
	if (null == getValue($par))
		echo " selected=\"selected\"";
	echo">(all)</option>\n";			
	
echo "</select>";
}

else {

if ($type == "boolean") {
	echo"<input name=\"$par\" ";
	echo "type=\"radio\" value=\"true\"";
	if (getValue($par) == "true")
		echo " checked=\"checked\"";
	echo "/>true";
	echo "<input name=\"$par\" type=\"radio\" value=\"false\"";
	if (getValue($par) == "false")
		echo " checked=\"checked\"";
	echo "/>false";
}

else if ($type == "enum") {
	echo "<select name=\"$par\">";
	foreach($options as $option) {
		echo "<option value=\"$option\"";
		if (getValue($par) == $option)
			echo " selected=\"selected\"";
		echo ">$option</option>";
	}
	echo "</input>";
}

else {
	echo"<input name=\"$par\" ";
	echo "type=\"text\" ";
	echo "value=\"".getValue($par)."\"";
	echo "/>";
}
}
?>
</td>
<td>
<?php echo getLabel($par); ?>
<?php
if ($par == "key") {
?>
: <a href="../../<?php echo getValue('l'); ?>/signup/"><?php echo getLabel("generatekey"); ?></a>
<?php
}
?>

</td>
</tr>
<?php
}
}
?>

</table>

<input type="submit" value="<?php echo getLabel("generatecode"); ?>"/>

</form>

<?php
}
else {
	echo "<h1 class='lang-fi'>Ei valittua ontologiaa: \"$ontoid\"</h1>";
	echo "<h1 class='lang-en'>No such ontology \"$ontoid\"</h1>";
}

if (getValue('l') != getDefault('l'))
{
	$lang = getValue('l');
?>

<script type="text/javascript">
<!--
showLanguage('<?php echo $lang; ?>');
//-->
</script>

<?php
}
?>

</body>
</html>
