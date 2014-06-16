<!DOCTYPE HTML>
<html>
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="Author" content="Ontology Service ONKI" />
<meta name="Copyright" content="Copyright © Semantic Computing Research Group (SeCo) 2013" />
<meta name="Distribution" content="GLOBAL" />

<title>ONKI-käsitevalitsimen kytkeytymisharjoitus</title>

</head>
<body>

<h1>ONKI-käsitevalitsimen kytkeytymisharjoitus</h1>

<p>
Olet integroimassa ONKI-käsitevalitsinta organisaatiosi tietojärjestelmään (esim. annotaatiojärjestelmä).
Alla oleva tekstikenttä toimii tietojärjestelmän selain-käyttöliittymän HTML-pohjaisena muokkaustyökaluna.
Tietojärjestelmäsi käyttöliittymäsivu, jota olet parhaillaan muokkaamassa, näkyy tekstikentän alapuolella.
</p>

<p>
Organisaatiosi tietojärjelmässä käytetään tällä hetkellä tavallisia tekstikenttiä indeksoinnissa ja/tai tiedonhaussa.
Tekstikenttiä on esimerkiksi esineen nimelle, sitä kuvaaville asiasanoille, valmistusmateriaalille ja käyttöpaikalle.
</p>

<p>
Voit integroida ONKI-käsitevalitsimen haluamallasi tavalla tietokenttiin, luoda uusia kenttiä jne., muokkaamalla alla 
olevaa HTML-koodia. Ohjeita ONKI-käsitevalitsimen integrointiin löydät 
<a href="http://onki.fi/widget/selector/?id=koko&l=fi" target="_blank">ONKI-käsitevalitsimen ohjesivulta</a>.
</p>

<p>
Voit myös siirtyä suoraan vaiheeseen 2, jolloin ONKI-käsitevalitsin on jo integroitu järjestelmääsi.
</p>

<p>
<a href="?phase=1">Vaihe 1 (nykyinen järjestelmä)</a>&nbsp;&nbsp;
<a href="?phase=2">Vaihe 2 (ONKI-integraatio tehty)</a>
</p>
<br/>

<?php
$phase = "";
if (isset($_GET["phase"]))
	$phase = $_GET["phase"];

if (isset($_POST["koodi"]) && $_POST["koodi"])
	$koodi = stripslashes($_POST['koodi']);
else {
	if ($phase == "2") {
		// $_SERVER['HTTPS] does not work on onki.fi, so https mode never actually used
		if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'])
			$protocol = "https://";
		else
			$protocol = "http://";
		// onki.fi
		$onkifikey = "4443fdf30e787e31352cdbbe73f64c91";
		//$koodi = "<script src=\"".$protocol."onki.fi/widget/selector/onki-selector.js?".$onkifikey."\"></script>\n\n";
		$koodi = "<script src=\"./onki-selector.js?".$onkifikey."\"></script>\n\n";
	}
	else
		$koodi = "";

	$koodi .=

"<h2>Annotaatiojärjestelmä XYZ</h2>

<p>Olet kuvaamassa esinettä numero 5156827.</p>

<form method=\"post\">

<table>

<tr>
<td>Nimi:</td>
<td><input id=\"nimi\"/></td>
</tr>

<tr>
<td>Asiasana:</td>";

if ($phase == "2")
	$koodi .= "<td><input id=\"asiasana\" onkeyup=\"onki['koko'].search({'onkimenu' : false, 'showOnkiName' : false})\"/></td>";
else
	$koodi .= "<td><input id=\"asiasana\"/></td>";

$koodi .=
"</tr>

<tr>
<td>Valmistusmateriaali:</td>";

if ($phase == "2")
	$koodi .= "<td><input id=\"valmistusmateriaali\" onkeyup=\"onki['koko'].search({'onkimenu' : false, 'showOnkiName' : false, 'parentRestriction' : 'http://www.yso.fi/onto/koko/p35401'})\"/></td>";
else
	$koodi .= "<td><input id=\"valmistusmateriaali\"/></td>";

$koodi .=
"</tr>

<tr>
<td>Käyttöpaikka:</td>";

if ($phase == "2")
	$koodi .= "<td><input id=\"kayttopaikka\" onkeyup=\"onki['sapo'].search({'onkimenu' : false, 'showOnkiName' : false, 'typeRestriction' : 'http://www.yso.fi/onto/sapo/spaceworm'})\"/></td>";
else
	$koodi .= "<td><input id=\"kayttopaikka\"/></td>";

$koodi .=
"</tr>

</table>

<br/><br/>
<input type=\"button\" value=\"Tallenna esineen tiedot\"/>

</form>";
}
?>

<form method="post">

<textarea name="koodi" cols="100" rows="15" style="width: 50em;">
<?php
echo $koodi;
?>
</textarea>

<br/>

<input type="submit" value="Päivitä sivu"/>
</form>

<br/><hr/><br/>

<div id="sivu" style="border: 2px solid; padding: 10px;">
<?php
echo $koodi;
?>
</div>

</body>
</html>
