// Google callback function for generating boolean query from terms/uris fetched from ONKI
// Jouni Tuominen 1.4.2009

// exact match "x" OR
function generateBooleanQueryTerm(str) {
	return "\"" + str + "\" OR ";
}
