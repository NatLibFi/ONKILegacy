// Onki Finder component for searching concepts from ONKI server
// Jouni Tuominen, 29.5.2007

// define an OnkiFinder class with methods
function OnkiFinder(id,findername,onkisearch,showCaptions) {
	this.id = id;
	this.findername = findername;
	this.onkisearch = onkisearch;
	this.showCaptions = showCaptions;
	
	this.init = init;
	this.refresh = refresh;
	this.resultOnClickFunction = resultOnClickFunction;
	this.addSearchResult = addSearchResult;
	this.addSearchMetadata = addSearchMetadata;
	this.addSearchResults = addSearchResults;
	this.getFinderDivId = getFinderDivId;

	this.selectNextResult = selectNextResult;
	this.selectPreviousResult = selectPreviousResult;
	this.selectResult = selectResult;
	this.removeResultSelection = removeResultSelection;
	this.addCurrentResult = addCurrentResult;
	this.isResultSelected = isResultSelected;

	this.setBlur = setBlur;
	this.setMouseOnFinder = setMouseOnFinder;
	this.mouseOnFinder = false;
	this.resultClicked = false;

	
	function selectNextResult() {
		if (this.onkisearch.roomForMore()) {
			var counter = 0;
			do {
				if (this.selectedResult === undefined)
					this.selectedResult = document.getElementById(this.getFinderDivId()).childNodes[1].firstChild;
				else {
					this.selectedResult.className = "";
					if (this.selectedResult.nextSibling === null) {
						this.selectedResult = document.getElementById(this.getFinderDivId()).childNodes[1].firstChild;
						counter++;
						}
					else
						this.selectedResult = this.selectedResult.nextSibling;
				}
			}
			while (this.onkisearch.isSelected(this.selectedResult.getAttribute("id")) && counter < 2);
			
			if (!this.onkisearch.isSelected(this.selectedResult.getAttribute("id")))
				this.selectedResult.className = "onki-hit-cursor";
		}
		else
			this.selectedResult.className = "";
	}
	
	function selectPreviousResult() {
		if (this.onkisearch.roomForMore()) {
			var counter = 0;
			do {
				if (this.selectedResult === undefined)
					this.selectedResult = document.getElementById(this.getFinderDivId()).childNodes[1].lastChild;
				else {
					this.selectedResult.className = "";
					if (this.selectedResult.previousSibling === null) {
						this.selectedResult = document.getElementById(this.getFinderDivId()).childNodes[1].lastChild;
						counter++;
					}
					else
						this.selectedResult = this.selectedResult.previousSibling;
				}
			}
			while (this.onkisearch.isSelected(this.selectedResult.getAttribute("id")) && counter < 2);
				
			if (!this.onkisearch.isSelected(this.selectedResult.getAttribute("id")))
				this.selectedResult.className = "onki-hit-cursor";
		}
		else
			this.selectedResult.className = "";
	}
	
	function selectResult(id) {
		if (this.onkisearch.roomForMore() && !this.onkisearch.isSelected(id)) {
			if (this.selectedResult !== undefined)
				this.selectedResult.className = "";
			this.selectedResult = document.getElementById(id);
			this.selectedResult.className = "onki-hit-cursor";
		}
	}
	
	function removeResultSelection() {
		if (this.selectedResult !== undefined) {
			this.selectedResult.className = "";
			this.selectedResult = undefined;
		}
	}
	
	function addCurrentResult() {
		if (this.selectedResult !== undefined) {
			if (this.selectedResult.addEventListener) { // for FF
				var evObj = document.createEvent("MouseEvents");
				evObj.initEvent("click", true, true);
				this.selectedResult.dispatchEvent(evObj);
			}
			else if (this.selectedResult.attachEvent) // for IE
				this.selectedResult.fireEvent("onclick");
			return true;
		}
		return false;
	}

	function isResultSelected() {
    return (this.selectedResult !== undefined);
	}
	
	// Default refresh method for search results
	function refresh() {
		if (document.getElementById(this.getFinderDivId()).childNodes[1]) {
			var results = document.getElementById(this.getFinderDivId()).childNodes[1].getElementsByTagName("div");
			for (var i=0; i<results.length; ++i) {
				var resultDiv = results[i];
				if (!this.onkisearch.roomForMore() || this.onkisearch.isSelected(resultDiv.getAttribute("id"))) {
					resultDiv.lastChild.className = "onki-hit-not-selectable"; // for IE
					if (resultDiv.lastChild != resultDiv.firstChild)
						resultDiv.firstChild.className = "onki-hit-not-selectable";
				}
				else {
					resultDiv.lastChild.className = "onki-hit"; // for IE
					if (resultDiv.lastChild != resultDiv.firstChild)
						resultDiv.firstChild.className = "onki-hit-altlabel";
				}
			}
		}
	}

	// Default method for onClick event (search results)
	function resultOnClickFunction(onkiId, uri, title, url, multipleOccurences) {
		if (this.onkisearch.roomForMore() && !this.onkisearch.isSelected(uri)) {
			this.onkisearch.addConcept(onkiId, uri, title, url, multipleOccurences, undefined, true);
			this.refresh();
		}
		this.resultClicked = true;
		document.getElementById(this.id).blur();
		hideOnkiDiv(this.id, "now");
		this.selectNextResult();
	}
	
	function addSearchResults(metadata) {
		while (document.getElementById(this.getFinderDivId()).firstChild)
			document.getElementById(this.getFinderDivId()).removeChild(document.getElementById(this.getFinderDivId()).firstChild);

		var div = document.createElement("div");
		div.className = "onki-hitAmount";
		
		var hits = "";
		if (metadata) {
			if (UILang == 'fi') {
				hits = "Tulokset (";
				if (metadata.groupedHitsAmount) {
					hits += metadata.groupedHitsAmount;
				}
				else
					hits += metadata.totalHitsAmount;
				hits += " kpl";
				//if (metadata.isMoreHits)
				if (metadata.containingHitsAmount > 0)
					hits += ", näytetään 1-"+metadata.containingHitsAmount;
				//if (metadata.groupedHitsAmount && metadata.totalHitsAmount > metadata.groupedHitsAmount)
					//hits += "; yksittäisiä osumia yhteensä: "+metadata.totalHitsAmount;
				hits += ")";
			}
			else {
				hits = "Results (";
				if (metadata.groupedHitsAmount) {
					hits += metadata.groupedHitsAmount;
				}
				else
					hits += metadata.totalHitsAmount;
				hits += " hits";
				//if (metadata.isMoreHits)
				if (metadata.containingHitsAmount > 0)
					hits += ", showing 1-"+metadata.containingHitsAmount;
				//if (metadata.groupedHitsAmount && metadata.totalHitsAmount > metadata.groupedHitsAmount)
					//hits += "; total amount of unique hits: "+metadata.totalHitsAmount;
				hits += ")";	
			}
		}
			
		var textNode = document.createTextNode(hits);
		div.appendChild(textNode);
		document.getElementById(this.getFinderDivId()).appendChild(div);
		
		var hitsDiv = document.createElement("div");
		hitsDiv.className = "onki-hits"; // for IE
		hitsDiv.style.cssText = "display:block;"; // for IE

		document.getElementById(this.getFinderDivId()).appendChild(hitsDiv);
	}
	
	function addSearchResult(uri, title, url, altLabel, onkiId, multipleOccurences) {
		var resultDiv = document.createElement("div");
		resultDiv.setAttribute("id", uri);
		if (multipleOccurences) {
			if (UILang == 'fi')
				resultDiv.setAttribute("title", "Useita esiintymiä");
			else
				resultDiv.setAttribute("title", "Multiple occurences");
		}
		else
			resultDiv.setAttribute("title", uri);
		
		if (altLabel) {
			var altSpan = document.createElement("span"); 
			var labelText = document.createTextNode(altLabel + " \u2192 "); // unicode right-arrow
			altSpan.appendChild(labelText);
			
			if (this.onkisearch.roomForMore() && !this.onkisearch.isSelected(uri)) {
				altSpan.className = "onki-hit-altlabel"; // for IE
			}
			else {
				altSpan.className = "onki-hit-not-selectable"; // for IE
			}
			
			resultDiv.appendChild(altSpan);
		}

		var urlString = null;
		if (url)
			urlString = "'"+url+"'";

		if (resultDiv.addEventListener) { // for FF
			resultDiv.addEventListener("click", new Function(this.findername + ".resultOnClickFunction('" + onkiId + "', '"   + uri + "', '" + escape(title) + "', " + urlString + ", " + multipleOccurences+")"), false);
			resultDiv.addEventListener("mouseover", new Function(this.findername + ".selectResult('" + uri + "')"), false);
			resultDiv.addEventListener("mouseout", new Function(this.findername + ".removeResultSelection()"), false);
		}
		else if (resultDiv.attachEvent) { // for IE
			resultDiv.attachEvent("onclick", new Function(this.findername + ".resultOnClickFunction('" + onkiId + "', '" + uri + "', '" + escape(title) + "', " + urlString + ", "+multipleOccurences+")"));
			resultDiv.attachEvent("onmouseover", new Function(this.findername + ".selectResult('" + uri + "')"));
			resultDiv.attachEvent("onmouseout", new Function(this.findername + ".removeResultSelection()"));
		}
		
		var prefSpan = document.createElement("span");
		var textNode = document.createTextNode(title);
		prefSpan.appendChild(textNode);
		resultDiv.appendChild(prefSpan);

		if (this.onkisearch.roomForMore() && !this.onkisearch.isSelected(uri)) {
			prefSpan.className = "onki-hit"; // for IE
		}
		else {
			prefSpan.className = "onki-hit-not-selectable"; // for IE
		}
		document.getElementById(this.getFinderDivId()).childNodes[1].appendChild(resultDiv);
	}
	
	/* NOT USED */
	function addSearchMetadata(metadata) {
		var moreHits = metadata.totalHitsAmount - metadata.containingHitsAmount;
		if (moreHits > 0) {
			var div = document.createElement("div");
			div.className = "onki-moreHits";
			var textNode = document.createTextNode(moreHits + " more hits.");
			div.appendChild(textNode);
			document.getElementById(this.getFinderDivId()).appendChild(div);
		}
	}
	
	function getFinderDivId() {
		return this.id+"_finder";
	}
	
	function setMouseOnFinder(mouseOn) {
		this.mouseOnFinder = mouseOn;
	}
	
	function setBlur() {
		// IE (and Chrome previously) takes the focus away from the input field when the scrollbar is clicked
		// to avoid hiding the search result list in such case we'll have to check if the mouse is on scrollbar (finder div)
		if (this.resultClicked) {
			this.resultClicked = false;
			this.setMouseOnFinder(false);
		}
		else if (!this.mouseOnFinder)
			hideOnkiDiv(this.id);
		else
			document.getElementById(this.id).focus();
	}
	
  function init() {
    // Div element for search results
    if (document.getElementById(this.getFinderDivId()) == null) {
      var onkiFinderDiv = document.createElement("div");
      onkiFinderDiv.setAttribute("id", this.getFinderDivId());
      if (this.showCaptions)
        onkiFinderDiv.className = "onkiFinder onkiFinder-captions"; // for IE
      else
        onkiFinderDiv.className = "onkiFinder"; // for IE
      onkiFinderDiv.setAttribute("align", "left");
      onkiFinderDiv.style.cssText = "display:none;"; // for IE

      var brElem = document.createElement("br");

      if (document.getElementById(this.id).nextSibling) {
        document.getElementById(this.id).parentNode.insertBefore(brElem, document.getElementById(this.id).nextSibling);
        document.getElementById(this.id).parentNode.insertBefore(onkiFinderDiv, document.getElementById(this.id).nextSibling);
      }
      else {
        document.getElementById(this.id).parentNode.appendChild(brElem);
        document.getElementById(this.id).parentNode.appendChild(onkiFinderDiv);
      }
    }

    /*if (document.getElementById(this.id).parentNode.addEventListener) { // for FF
      document.getElementById(this.id).parentNode.addEventListener("blur", new Function("onkiSearch['"+this.id+"'].setFocus(false);hideOnkiDiv('"+this.id+"')"), false);
      document.getElementById(this.id).parentNode.addEventListener("focus", new Function("showOnkiDiv('"+this.id+"')"), false);
      }
      else if (document.getElementById(this.id).parentNode.attachEvent) { // for IE
      document.getElementById(this.id).parentNodeattachEvent("onblur", new Function("onkiSearch['"+this.id+"'].setFocus(false);hideOnkiDiv('"+this.id+"')"));
      document.getElementById(this.id).parentNodeattachEvent("onfocus", new Function("showOnkiDiv('"+this.id+"')"));
      }*/

    if (document.getElementById(this.id).addEventListener) { // for FF
      document.getElementById(this.id).addEventListener("blur", new Function(this.findername + ".setBlur()"), false);
      document.getElementById(this.id).addEventListener("focus", new Function("showOnkiDiv('"+this.id+"')"), false);
      document.getElementById(this.getFinderDivId()).addEventListener("mouseover", new Function(this.findername + ".setMouseOnFinder(true)"), false); // IE
      document.getElementById(this.getFinderDivId()).addEventListener("mouseout", new Function(this.findername + ".setMouseOnFinder(false)"), false); // IE
    }
    else if (document.getElementById(this.id).attachEvent) { // for IE
      document.getElementById(this.id).attachEvent("onblur", new Function(this.findername + ".setBlur()"));
      document.getElementById(this.id).attachEvent("onfocus", new Function("showOnkiDiv('"+this.id+"')"));
      document.getElementById(this.getFinderDivId()).attachEvent("onmouseover", new Function(this.findername + ".setMouseOnFinder(true)"));
      document.getElementById(this.getFinderDivId()).attachEvent("onmouseout", new Function(this.findername + ".setMouseOnFinder(false)"));
    }
  }

  this.init();
}

// inform that the script is loaded
var addScriptLoaded;
if (addScriptLoaded != undefined)
  addScriptLoaded();
