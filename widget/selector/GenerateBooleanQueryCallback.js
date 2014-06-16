// Kantapuu.fi callback function for generating boolean query from terms fetched from ONKI
// Jouni Tuominen 26.11.2008

// (...) AND (...) AND (...) ...
function generateQueryANDPartition(str) {
	return str + " ";
}

// (X OR Y OR Z ...)
function generateQueryORPartition(str) {
	return "+(" + str + ") ";
}

// exact match "X"
function generateQueryTerm(str) {
	return "\"" + str + "\"";
}

// parse terms from query, for selecting/showing previously selected query terms
function getTermsFromQuery(str) {
	var terms = str.split("+(\"");

	for (var i=0; i<terms.length; i++)
		terms[i] = terms[i].substring(0, terms[i].indexOf("\""));

	var temp = new Array();
	for (var i=0; i<terms.length; i++)
		if(terms[i])
			temp.push(terms[i]);
	
	terms = temp;
	return terms;
}