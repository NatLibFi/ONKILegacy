// OnkiBrowser functionality for adding "ONKI Button" to an indexing application.
// Kim Viljanen, 31.5.2007
// added IE support, Jouni Tuominen, 30.8.2007

var mywin;
var onkifc_conceptfetchcallback = {};

if (self.location.hash != "" && self.opener && self.opener.onkifc_conceptfetchcallback) {
	var value=self.location.hash;
	value = value.substring(1,value.length);
	value = unescape(value); // value = decodeURI(value); would be better
	self.opener.onkifc_conceptfetchcallback(value, undefined, undefined, true, false);
	self.window.close();
}

// for Opera and IE
function checkHash() {
	if (mywin && mywin.location.hash != "") {
		var value=mywin.location.hash;
		value = value.substring(1,value.length);
		value = unescape(value); // value = decodeURI(value); would be better
		mywin.opener.onkifc_conceptfetchcallback(value, undefined, undefined, true, false);
		mywin.close();
	}
}

function openOnkiBrowser(conceptFetchCallback,onkiurl,lang,selectedConcept,typeRestriction,parentRestriction,groupRestriction,returnType) {
	onkifc_conceptfetchcallback = conceptFetchCallback;
	
	mywin = window.open("", "onkiurl", "toolbar=no, resizable=yes"); // IE doesn't like special characters in window name

	// old style with no DOM
	if (mywin.attachEvent) { // for IE and Opera, glue glue glue
		mywin.document.write("<html><head>");
		mywin.document.write("\<script type=\"text/javascript\">\n");
		mywin.document.write("if (location.hash != '') { window.close(); }");
		mywin.document.write("<"+"/script>");
		mywin.document.write("</head><body style=\"margin:0;padding:0;\">");
		
		// add "listener" to poll if something is put to hash 
		mywin.setInterval(checkHash, 200);
	}
	// DOM
	else { // for FF
		var scriptElem = mywin.document.createElement("script");
		scriptElem.setAttribute("type", "text/Javascript");
		var textNode = mywin.document.createTextNode("if (location.hash != '') { window.close(); }");
		scriptElem.appendChild(textNode); // doesn't work in IE
		
		var headElem = mywin.document.getElementsByTagName("head")[0];
		headElem.appendChild(scriptElem);
		
		var bodyElem = mywin.document.getElementsByTagName("body")[0];
		bodyElem.style.cssText = "margin:0;padding:0;";
	}

	if (typeRestriction) {
		var temp = "";
		//for (i in typeRestriction)
		for (var i=0; i < typeRestriction.length; i++)
			temp = temp + "&qt=" + encodeURIComponent(typeRestriction[i]);
		typeRestriction = temp;
	}
	else
		typeRestriction = "";
	
	if (parentRestriction) {
		var temp = "";
		//for (i in parentRestriction)
		for (var i=0; i < parentRestriction.length; i++)
			temp = temp + "&qp=" + encodeURIComponent(parentRestriction[i]);
		parentRestriction = temp;
	}
	else
		parentRestriction = "";

	if (groupRestriction) {
		var temp = "";
		//for (i in groupRestriction)
		for (var i=0; i < groupRestriction.length; i++)
			temp = temp + "&qg=" + encodeURIComponent(groupRestriction[i]);
		groupRestriction = temp;
	}
	else
		groupRestriction = "";

	if (returnType)
		returnType = "="+returnType;
	else
		returnType = "";

	if (onkiurl.indexOf("?") == -1)
		lang = "?l=" + lang;
	else
		lang = "&l=" + lang;

	// old style with no DOM
	if (mywin.attachEvent) { // for IE and Opera, glue glue glue
		mywin.document.write("<iframe id=\"onkiframe\" src=\""+onkiurl+lang+typeRestriction+parentRestriction+groupRestriction+"&fc"+returnType+"&r="+encodeURIComponent(document.location)+"\" style=\"margin:0;padding:0;border:none\" height=\"100%\" width=\"100%\"></iframe>");		
		mywin.document.write("</body></html>");
	}		
	// DOM
	else { // for FF
		var iframeElem = mywin.document.createElement("iframe");
		iframeElem.setAttribute("id", "onkiframe");
		
		// keep in mind that the "r" parameter should be always given as last parameter? (ONKI-Paikka)
		iframeElem.setAttribute("src", onkiurl+lang+typeRestriction+parentRestriction+groupRestriction+"&fc"+returnType+"&r="+encodeURIComponent(document.location));
		iframeElem.style.cssText = "margin:0;padding:0;border:none";
		iframeElem.setAttribute("height", "100%");
		iframeElem.setAttribute("width", "100%");
		
		var bodyElem = mywin.document.getElementsByTagName("body")[0];
		bodyElem.appendChild(iframeElem);
	}
}

// Default implementation of the onkiConceptCallback function:

function onkiConceptCallback(uri) {
	if (onkifc_resultnodeid != '') {
	 	document.getElementById(onkifc_resultnodeid).appendChild(document.createTextNode(uri+"\n"));
		document.getElementById(onkifc_resultnodeid).appendChild(document.createElement("br"));
	}
}

// inform that the script is loaded
var addScriptLoaded;
if (addScriptLoaded != undefined)
	addScriptLoaded();