// Onki Search component for controlling Onki Finder and Concept Collector components
// Jouni Tuominen, 30.5.2007

// define an OnkiSearch class with methods
function OnkiSearch(id,searchname,onkiFinder,conceptCollector,maxSelect,lang,resultLang,openonkibutton,onkiId,onkimenu,showOnkiName,fieldLabel,prefix,openonkilabel,addConceptFunction,removeConceptFunction,typeRestriction,parentRestriction,groupRestriction,autocompletionSearch,languageMenu,returnType,fetchUris,fetchLabels,queryExpansion,fieldName,generateQueryANDPartitionFunction,generateQueryORPartitionFunction,generateQueryTermFunction,getTermsFromQueryFunction,queryExpansionCaption,maxQueryExpandResults,showCaptions,initializeWithConcepts,uriLabelDelimiter,conceptDelimiter,fieldShared,initializeWithFieldValue,getUrisForPlainTerms,ontologies) {
	this.id = id;
	this.searchname = searchname;
	
	if (typeof onkiFinder == "function")
		this.finder = onkiFinder(id,this,showCaptions);
	
	if (typeof conceptCollector == "function")
		this.collector = conceptCollector(id,this,fetchUris,fetchLabels,fieldName,generateQueryANDPartitionFunction,generateQueryORPartitionFunction,generateQueryTermFunction,queryExpansionCaption,uriLabelDelimiter,conceptDelimiter,fieldShared);

	this.autocompletionSearch = autocompletionSearch;
	this.languageMenu = languageMenu;

	this.maxSelect = maxSelect;
	this.lang = lang;
	this.resultLang = resultLang;
	this.openonkibutton = openonkibutton;
	this.defaultOnkiId = onkiId;
	this.onkiId = onkiId;
	this.onkimenu = onkimenu;
	this.showOnkiName = showOnkiName;
	this.fieldLabel = fieldLabel;
	this.prefix = prefix;
	this.openonkilabel = openonkilabel;
	this.typeRestriction = typeRestriction;
	this.parentRestriction = parentRestriction;
	this.groupRestriction = groupRestriction;
	this.returnType = returnType;
	this.fetchUris = fetchUris;
	this.fetchLabels = fetchLabels;
	this.queryExpansion = queryExpansion;
	this.maxQueryExpandResults = maxQueryExpandResults;
	this.getTermsFromQueryFunction = getTermsFromQueryFunction;
	this.hiddenFieldName = fieldName; // initialize with prefetched concepts
	this.initializeWithFieldValue = initializeWithFieldValue; 
	this.tempOnkiId;
	this.addConceptFunction = addConceptFunction;
	this.removeConceptFunction = removeConceptFunction;
	this.showCaptions = showCaptions;
	this.initializeWithConcepts = initializeWithConcepts;
	this.uriLabelDelimiter = uriLabelDelimiter;
	this.conceptDelimiter = conceptDelimiter;
	this.fieldShared = fieldShared;

	this.getUrisForPlainTerms = getUrisForPlainTerms;
	this.ontologies = ontologies;
	
	this.defaultLang = "fi";

	this.addSearchResults = addSearchResults;
	this.addSearchResult = addSearchResult;
	this.addRESTSearchResult = addRESTSearchResult;
	this.addSearchMetadata = addSearchMetadata;
	this.addConcept = addConcept;
	this.addConceptFromBrowser = addConceptFromBrowser;
	this.addConceptFromPrefetchedTerm = addConceptFromPrefetchedTerm;
	this.addExpandedQuery = addExpandedQuery;
	this.refresh = refresh;
	this.roomForMore = roomForMore;
	this.isSelected = isSelected;
	this.getLang = getLang;
	this.setLang = setLang;
	this.getResultLang = getResultLang;
	this.setLangs = setLangs;
  this.setRestLangs = setRestLangs;
	this.openOnki = openOnki;
	this.openOnkiReplace = openOnkiReplace;
	this.getOnkiId = getOnkiId;
	this.setOnkiId = setOnkiId;
	this.getDefaultOnkiId = getDefaultOnkiId;
	this.setDefaultOnkiId = setDefaultOnkiId;
	this.isHtmlCreated = isHtmlCreated;
	this.generateOntoUri = generateOntoUri;
	this.generateOntoUrl = generateOntoUrl;

	this.generateError = generateError;
	this.generateKeyMessage = generateKeyMessage;
	this.removeKeyMessage = removeKeyMessage;
	this.keyCheck = keyCheck;
	this.logAction = logAction;
	this.setUriFromBrowser = setUriFromBrowser;
	this.getTempOnkiId = getTempOnkiId;
	
	this.selectNextResult = selectNextResult;
	this.selectPreviousResult = selectPreviousResult;
	this.addCurrentResult = addCurrentResult;
	this.removeResultSelection = removeResultSelection;
	this.isResultSelected = isResultSelected;
	
	this.showOpenOnkiButton = showOpenOnkiButton;
	this.hideOpenOnkiButton = hideOpenOnkiButton;
	
	this.uriFromBrowser = ""; // needed for: case "wrong access key"
	
	this.langsInitialized = false;
	
	this.isLangsInitialized = isLangsInitialized;
	this.setLangsInitialized = setLangsInitialized;
	
	/*this.focus;
	this.getFocus = getFocus;
	this.setFocus = setFocus;*/
	
	if (this.returnType == 'singlepoint' || this.returnType == 'polygon' || this.returnType == 'route')
		this.prefix = false;
	
	//if (this.onkiId != "suo" && this.onkiId != "koordinaatit" && this.onkiId != "local") {
	if (!onki[this.onkiId].browserUrl) {
		if (host.indexOf("https") == 0)
			this.ysoBrowserUrl = "https://www.yso.fi/onto/";
		else
			this.ysoBrowserUrl = "http://www.yso.fi/onto/";
			//this.ysoBrowserUrl = "http://dev.onki.fi/u/jwtuomin/svn/secoweb/onki-frontend/public/en/browser/search/"; // debug
			//this.ysoBrowserUrl = "http://dev.onki.fi/u/jwtuomin/svn/secoweb/onki-frontend/public/en/browser/overview/"; // debug
		//this.ysoBrowserUrl = "http://www.seco.tkk.fi/u/kimvilja/svn/secoweb/www.yso.fi/onki2/search/";
		//this.ysoBrowserUrl = "http://www.seco.tkk.fi/u/jwtuomin/svn/secoweb/www.yso.fi/onki2/overview/";
	}
	this.init = init;
	
	function getTempOnkiId() {
		return this.tempOnkiId;
	}

	function selectNextResult() {
		if (this.finder)
			this.finder.selectNextResult();
	}
	
	function selectPreviousResult() {
		if (this.finder)
			this.finder.selectPreviousResult();
	}
	
	function addCurrentResult() {
		if (this.finder) {
			var resultAdded = this.finder.addCurrentResult();
			if (!resultAdded && this.roomForMore() && document.getElementById(this.id).value != "") {
				this.addConceptFromBrowser(undefined, document.getElementById(this.id).value, onki[this.onkiId].uriAsUrl, true, false);
			}
		}
	}

	function removeResultSelection() {
		if (this.finder)
			this.finder.removeResultSelection();
	}
		
	function isResultSelected() {
		if (this.finder)
			return this.finder.isResultSelected();
		return false;
	}
	
	function generateError(message, exception, functionName) {

		if (exception.javaClassName && exception.javaClassName == "fi.tkk.seco.KeyException") {
			this.generateKeyMessage(message);

			// although the key was wrong, widget functions properly
			
			// this breaks the "autocompletion delay" thingy, Jouni 28.2.2008
			//var oldPath = onki[this.onkiId]._path;
			if (onki[this.onkiId])
				onki[this.onkiId]._path = onki[this.onkiId]._path.replace(/key-\w*\//, "");
			else
				for (onkiId in onki)
					onki[onkiId]._path = onki[onkiId]._path.replace(/key-\w*\//, "");
					
			if (functionName == "search" && onki[this.onkiId]) {
				var value = document.getElementById(this.id).getAttributeNode("onkeyup").nodeValue;
				value = value.replace(/this/, "document.getElementById('"+ this.id +"')");
				value = value.replace(", event", "");
				eval(value);		
			}
			else if (functionName == "getLangs") {
				onki[this.onkiId].getLangs(this.id, undefined, this.ontologies);
			}
			else if (functionName == "getLabel") {
				onki[this.onkiId].getLabel(this.uriFromBrowser, this.lang, this.id);
				this.uriFromBrowser = "";
			}
			else if (functionName == "expandQuery") {
				// TODO
				;//onki[this.onkiId].expandQuery(uri, title, url, this.lang, this.typeRestriction, this.id);
			}
			
			// this breaks the "autocompletion delay" thingy, Jouni 28.2.2008
			//onki[this.onkiId]._path = oldPath;
		}
		else
			alert(exception.javaClassName + ": " + message);
	}

	function generateKeyMessage(msg) {
		if (!document.getElementById(this.id+"_message")) {
			var errorDiv = document.createElement("span");
			errorDiv.setAttribute("id", this.id+"_message");
			errorDiv.style.cssText = "background: #FFFF77";
			var text = document.createTextNode(msg+" Please ");
			errorDiv.appendChild(text);
			var link = document.createElement("a");
			link.setAttribute("href", "http://www.yso.fi/signup/");
		 	text = document.createTextNode("sign up");
		 	link.appendChild(text);
		 	errorDiv.appendChild(link);
			text = document.createTextNode(" for an access key!");
			errorDiv.appendChild(text);
			
			if (this.showCaptions)
				document.getElementById(this.id).parentNode.parentNode.appendChild(errorDiv);
			else
				document.getElementById(this.id).parentNode.appendChild(errorDiv);
		}
		else {
			document.getElementById(this.id+"_message").style.display = "";
		}
	}

	function removeKeyMessage() {
		if (document.getElementById(this.id+"_message"))
			document.getElementById(this.id+"_message").style.display = "none";
	}

	function keyCheck() {
		//if (accesskey == "" && (this.onkiId == null || onki[this.onkiId].url.indexOf("www.yso.fi") != -1))
		if (accesskey == "" && (this.onkiId == null || (onki[this.onkiId]._path && onki[this.onkiId]._path.indexOf("onki.fi") != -1)))
			this.generateKeyMessage("No access key provided.");
		// removed to work properly with "autocompletion delay" thingy, Jouni 28.2.2008
		//else
			//this.removeKeyMessage();
	}
	
	function logAction(mode, uri) {
		if (onkilogger != undefined && onkilogger != null) {
			// FIXME: if global search of ONKI 2 is used, or if concepts are prefetched,
			//		  ontoUri may not be correct or may be omitted
			// same problem affects e.g. query expansion functionality
			var ontoString = "";
			if (this.onkiId != null) {
				ontoString = "\"ontology\" : \""+ this.generateOntoUri()+"\", ";
				/*var ontoUri = onki[this.onkiId].url.replace(/key-\w*\//, "");
				ontoUri = ontoUri.replace("onki", "onto");
				if (ontoUri.charAt(ontoUri.length-1) == "/")
					ontoUri = ontoUri.substring(0, ontoUri.length-1);
				ontoString = "\"ontology\" : \""+ ontoUri+"\", ";*/
			}
			
			var conceptString = "";
			if (uri != undefined)
				conceptString = "\"concept\" : \""+uri+"\", ";
			
			var jsonString = "{"+ontoString+
							 conceptString+
						     "\"referer\" : \""+window.location+"\", "+
						     "\"onki-key\" : \""+accesskey.substring(5)+"\", "+
						     "\"action\" : \""+mode+"\", "+
						     "\"widget-id\" : \""+this.id+"\"}";
			
			var onkiloggerUrl = onkilogger;
			if (host.indexOf("https") == 0)
				onkiloggerUrl = onkiloggerUrl.replace("http", "https");
			onkiloggerUrl += encodeURIComponent(jsonString);
			
			var scriptElem = document.createElement("script");
			scriptElem.src = onkiloggerUrl;
			document.getElementsByTagName("head")[0].appendChild(scriptElem);
			//TODO: garbage collecting
		}
	}
	
	function setUriFromBrowser(uri) {
		this.uriFromBrowser = uri;
	}
	
	/*function getFocus() {
		return this.focus;
	}
	
	function setFocus(focus) {
		this.focus = focus;
	}*/

	function addSearchResults(metadata) {
		if (this.finder)
			this.finder.addSearchResults(metadata);
		this.removeResultSelection();
	}
	
  function addRESTSearchResult(response) {
    if (!document.getElementById(this.finder.getFinderDivId()))
      document.getElementById(this.finder.getFinderDivId()).childNodes[1].innerHTML = '';
    data = response.results;
    hits = (document.searchLimit) ? document.searchLimit : data.length;
    var metadata = { 
      'containingHitsAmount' : (hits < data.length) ? hits : data.length,
      'moreHits' : hits < data.length, 
      'moreHitsAmount' : data.length - document.searchLimit,
      'totalHitsAmount' : data.length
    };
    this.finder.addSearchResults(metadata);
    for (var i=0; i<hits; i++) {
      var resobj = data[i];
      if (resobj)
        this.addSearchResult(resobj.uri, resobj.prefLabel, resobj.vocab, resobj.altLabel);
    }
  }

	function addSearchResult(uri, title, onkiId, altLabel, multipleOccurences) {
		if (this.finder) {
			//if (onki[onkiId].uriAsUrl)
			if (!onki[onkiId] || onki[onkiId].uriAsUrl)
				this.finder.addSearchResult(uri, title, null, altLabel, onkiId, multipleOccurences);
			else {
				var encodedUri = encodeURIComponent(uri);
				var uriParams = "";
				if (this.returnType) {
					var c = "?c=";
					var c2 = "&c["+this.returnType+"]="; // for ONKI-Paikka
					uriParams = c + encodedUri + c2 + encodedUri;
				}
				else {
					var c = "?c=";
					uriParams = c + encodedUri;
				}
				
				// remove the access key from concept url
				//var url = onki[onkiId].url.replace(/key-\w*\//, "");
				var url = this.generateOntoUrl(onkiId, "collector");
				this.finder.addSearchResult(uri, title, url + uriParams, altLabel, onkiId, multipleOccurences);
			}
		}
	}

	function addSearchMetadata(metadata) {
		if (this.finder)
			this.finder.addSearchMetadata(metadata);
	}

	function addConcept(onkiId, uri, title, url, multipleOccurences, disableQueryExpansion, logAction, prefetched) {
		if (uri) {

			if (logAction) {
				var mode = "autocompletion";
				if (prefetched)
					mode = "prefetched";
				this.logAction(mode, uri);
			}
			
			if (this.queryExpansion) {
				if (!disableQueryExpansion) {
					if (this.prefix && title != undefined)
						title = onkiId+":"+title;
					if (this.ysoBrowserUrl == undefined)
						onki[onkiSearch[id].getOnkiId()].expandQuery(uri, title, url, onkiSearch[id].getResultLang(), this.maxQueryExpandResults, this.typeRestriction, this.id, onkiId);
					else
						onki[onkiSearch[id].getOnkiId()].expandQuery(uri, title, this.ysoBrowserUrl+"?c="+encodeURIComponent(uri)+"&ctx=collector", onkiSearch[id].getResultLang(), this.maxQueryExpandResults, this.typeRestriction, this.id, onkiId);
				}
				else {
					var data = [];
					data[0] = {};
					data[0].uri = uri;
					data[0].title = title;
					if (this.ysoBrowserUrl == undefined)
						this.addExpandedQuery(uri, title, url, data, onkiId);
					else
						this.addExpandedQuery(uri, title, this.ysoBrowserUrl+"?c="+encodeURIComponent(uri)+"&ctx=collector", data, onkiId);
				}
			}
			else {
				if (this.collector) {
					if (this.prefix && title != undefined)
						title = onkiId+":"+title;
					if (this.ysoBrowserUrl == undefined)
						this.collector.addConcept(onkiId, uri, title, url);
					else
						this.collector.addConcept(onkiId, uri, title, uri);
				}
				// onki-frontend needs onki[onkiId].url
				// ontoUri (onki[onkiId].url) should not be passed to 3rd party addConceptFunction? - well, it does not break anything
				else if (typeof this.addConceptFunction == "function") {
					var ontoUri = this.generateOntoUri(onkiId);
					if (this.prefix && title != undefined)
						title = onkiId+":"+title;
					if (this.ysoBrowserUrl == undefined)
						this.addConceptFunction(uri, title, url, ontoUri, multipleOccurences);
					else
						this.addConceptFunction(uri, title, this.ysoBrowserUrl+"?c="+encodeURIComponent(uri), ontoUri, multipleOccurences);
				}
			}
		}
		else if (title) {
			if (this.collector) 
				this.collector.addConcept(null, title, title, "");
			else if (typeof this.addConceptFunction == "function") {
				var ontoUri = this.generateOntoUri(onkiId);
				if (this.prefix && title != undefined)
					title = onkiId+":"+title;
				this.addConceptFunction(null, title, "", ontoUri, multipleOccurences);
			}
		}
	}

	function addConceptFromBrowser(uri, title, uriAsUrl, logAction, prefetched) {
    if (uri.prefLabel) { // if the response is from the REST api
      title = uri.prefLabel;
      uri = uri.uri;
      uriAsUrl = false;
      logAction = true;
      prefetched = true;
			this.addConcept(this.getOnkiId(), uri, title);
      return;
    }
		if (!title) {
			// TODO: should the getTermsFromQueryFunction used here? (see else statement)
			if (logAction) {
				var mode = "browser-fetch";
				if (prefetched)
					mode = "prefetched";
				onkiSearch[id].logAction(mode, uri);
			}
			
			onkiSearch[id].setUriFromBrowser(uri);

			if (onkiSearch[id].getTempOnkiId())
				onki[onkiSearch[id].getTempOnkiId()].getLabel(uri, onkiSearch[id].getLang(), id, onkiSearch[id].getTempOnkiId());
			else
				onki[onkiSearch[id].getOnkiId()].getLabel(uri, onkiSearch[id].getLang(), id);
		}
		else {
			// prefetched concept terms (no URIs) and enter presses without selecting a concept from the search results (e.g. a free keyword)
			if (!uri) {
				if (this.getUrisForPlainTerms) {
					var titles = new Array(title);
					if (typeof this.getTermsFromQueryFunction == "function")
						titles = this.getTermsFromQueryFunction(title);
	
					for (var i=0; i<titles.length; i++) {
						if (onkiSearch[id].getTempOnkiId())
							onki[onkiSearch[id].getTempOnkiId()].getUri(titles[i], onkiSearch[id].getLang(), id, onkiSearch[id].getTempOnkiId());
						else
							onki[onkiSearch[id].getOnkiId()].getUri(titles[i], onkiSearch[id].getLang(), id);
					}
				}
				else {
					var onkiId;
					if (onkiSearch[id].getTempOnkiId())
						onkiId = onkiSearch[id].getTempOnkiId();
					else
						onkiId = onkiSearch[id].getOnkiId();
					
					this.addConceptFromPrefetchedTerm(onkiId, null, title);
					hideOnkiDiv(id, "now");
				}
				return;
			}

			if (logAction) {
				var mode = "browser-fetch";
				if (prefetched)
					mode = "prefetched";
				this.logAction(mode, uri);
			}

			// if we're in a replace mode, replace previous uri
			if (this.uriToReplace) {
				if (this.collector)
					this.collector.removeConcept(this.uriToReplace);
				else if (typeof this.removeConceptFunction == "function")
					this.removeConceptFunction(this.uriToReplace);
			}

			if (uriAsUrl) {
				if (this.queryExpansion) {
					if (this.ysoBrowserUrl == undefined)
						onki[onkiSearch[id].getOnkiId()].expandQuery(uri, title, uri, onkiSearch[id].getResultLang(), this.maxQueryExpandResults, this.typeRestriction, this.id, onkiId); // this.getOnkiId() ?
					else
						onki[onkiSearch[id].getOnkiId()].expandQuery(uri, title, this.ysoBrowserUrl+"?c="+encodeURIComponent(uri)+"&ctx=collector", onkiSearch[id].getResultLang(), this.maxQueryExpandResults, this.typeRestriction, this.id, onkiId);
				}
				else
					if (this.tempOnkiId)
						this.addConcept(this.tempOnkiId, uri, title);
					else
						this.addConcept(this.getOnkiId(), uri, title);
			}
			else {
				var encodedUri = encodeURIComponent(uri);
				var uriParams = "";
				
				if (this.returnType) {
					var c = "?c="
					var c2 = "&c["+this.returnType+"]="; // for ONKI-Paikka
					uriParams = c + encodedUri + c2 + encodedUri;
				}
				else {
					var c = "?c=";
					uriParams = c + encodedUri;	
				}

				var url;

				if (this.tempOnkiId) {
					/*if (onki[this.tempOnkiId].url)
						url = onki[this.tempOnkiId].url.replace(/key-\w*\//, "");*/
					url = this.generateOntoUrl(this.tempOnkiId);
				}
				else if (this.onkiId != null)
					//url = onki[this.onkiId].url.replace(/key-\w*\//, "");
					url = this.generateOntoUrl();

				if (this.queryExpansion) {
					if (this.ysoBrowserUrl == undefined)
						onki[onkiSearch[id].getOnkiId()].expandQuery(uri, title, url + uriParams, onkiSearch[id].getResultLang(), this.maxQueryExpandResults, this.typeRestriction, this.id, onkiId); // this.getOnkiId() ?
					else
						onki[onkiSearch[id].getOnkiId()].expandQuery(uri, title, this.ysoBrowserUrl+"?c="+encodeURIComponent(uri)+"&ctx=collector", onkiSearch[id].getResultLang(), this.maxQueryExpandResults, this.typeRestriction, this.id, onkiId);
				}
				else
					if (this.tempOnkiId)
						this.addConcept(this.tempOnkiId, uri, title, url + uriParams);
					else
						this.addConcept(this.getOnkiId(), uri, title, url + uriParams);
			}
		}
	}

	function addConceptFromPrefetchedTerm(onkiId, uri, title) {
		if (onki[onkiId].uriAsUrl || uri == null)
			this.addConcept(onkiId, uri, title, undefined, undefined, undefined, true, true);
		else {
			var encodedUri = encodeURIComponent(uri);
			var uriParams = "";
			if (this.returnType) {
				//var c = "?c=";
				var c = "c=";
				var c2 = "&c["+this.returnType+"]="; // for ONKI-Paikka
				uriParams = c + encodedUri + c2 + encodedUri;
			}
			else {
				//var c = "?c=";
				var c = "c=";
				uriParams = c + encodedUri;
			}
			
			// remove the access key from concept url
			//var url = onki[onkiId].url.replace(/key-\w*\//, "");
			var url = this.generateOntoUrl(onkiId, "collector");
			if (url.indexOf("?") == -1)
				uriParams = "?" + uriParams;
			else
				uriParams = "&" + uriParams;
			this.addConcept(onkiId, uri, title, url + uriParams, undefined, undefined, true, true);
		}
	}
	
	function addExpandedQuery(uri, title, url, data, onkiId) {
		if (this.collector)
			this.collector.addExpandedQuery(uri, title, url, data, onkiId);
	}
	
	function refresh() {
		if (this.finder)
			this.finder.refresh();
	}
	
	function roomForMore() {
		if (this.collector && this.maxSelect > -1 && this.collector.size() >= this.maxSelect)
			return false;
		else
			return true;
	}

	function isSelected(uri) {
		if (this.collector)
			return this.collector.containsConcept(uri);
		else
			return false;
	}
	
	function getLang() {
		return this.lang;
	}

	function setLang(lang) {
		//this.setFocus(true);
		this.lang = lang;
		if (this.lang == "null")
			this.lang = null;
		// perform new search when language is changed
		if (document.getElementById(this.id).value != "") {
			var value = document.getElementById(this.id).getAttribute("onkeyup");
			value = value.replace(/this/, "document.getElementById('"+ this.id +"')");
			value = value.replace(", event", "");
			eval(value);
		}
	}

	function getResultLang() {
		if (resultLang != undefined)
			return this.resultLang;
		else
			return this.getLang();
	}

  function setRestLangs(response) {
    var data = [];
    for (var lang in response.languages) {
      data.push(response.languages[lang]);
    }
    this.setLangs(data);
  }
	
	function setLangs(langs) {
		var selectElem = document.createElement("select");
		selectElem.className = "onkiLangs"; // for IE
		selectElem.setAttribute("id", this.id+"_langs"); // IE needs this
		selectElem.setAttribute("name", this.id+"_langs");
		
		if (selectElem.addEventListener) { // for FF
			selectElem.addEventListener("change", new Function(this.searchname + ".setLang(this.options[this.selectedIndex].value)"), false);
			//selectElem.addEventListener("focus", new Function("showOnkiDiv('"+this.id+"')"), false);
			//selectElem.addEventListener("blur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"), false);
		}
		else if (selectElem.attachEvent) { // for IE
			selectElem.attachEvent("onchange", new Function(this.searchname + ".setLang(document.getElementById('" + this.id + "_langs').value)"));
			//selectElem.addEventListener("onfocus", new Function("showOnkiDiv('"+this.id+"')"));
			//selectElem.attachEvent("onblur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"));
		}
		
		var optionElem;
		var textNode;
		var langSelected = false;
		var langsContainsDefault = false;
		
		for (var i=0; i<langs.length; ++i) {
			optionElem = document.createElement("option");
			optionElem.setAttribute("value", langs[i]);
			
			if (this.lang == langs[i]) {
				optionElem.selected = true; // doesn't work in opera
				optionElem.setAttribute("selected", "selected");
				langSelected = true;
			}

			if (langs[i] == this.defaultLang)
				langsContainsDefault = true;
			if (langs[i] == "") {
				optionElem.setAttribute("id", this.id+"-lang-empty");
				textNode = document.createTextNode("(empty)");
			}
			else {
				optionElem.setAttribute("id", this.id+"-lang-"+langs[i]);
				textNode = document.createTextNode(langs[i]);
			}
			
			optionElem.appendChild(textNode);
			selectElem.appendChild(optionElem);
		}
	
		// if there's more than one language, add "all" option
		if (selectElem.childNodes[1]) {
			optionElem = document.createElement("option");
			optionElem.setAttribute("value", "null");
			optionElem.setAttribute("id", this.id+"-lang-all");
			textNode = document.createTextNode("(all)");
			optionElem.appendChild(textNode);
			selectElem.appendChild(optionElem);
		}
		
		// caption text, Jouni, 30.9.2008
		if (this.showCaptions) {
			var outerCaptionSpanElem = document.createElement("span");
			outerCaptionSpanElem.className = "onkiLangs outerContainer";
			var spanCaptionElem = document.createElement("span");
			spanCaptionElem.className = "caption";
			textNode = document.createTextNode("Language");
			spanCaptionElem.appendChild(textNode);
			outerCaptionSpanElem.appendChild(spanCaptionElem);
			
			var brElem = document.createElement("br");
			outerCaptionSpanElem.appendChild(brElem);
			
			outerCaptionSpanElem.appendChild(selectElem);
			
			if (document.getElementById(this.id).parentNode.nextSibling.firstChild)
				if (document.getElementById(this.id).parentNode.nextSibling.firstChild.className.indexOf("onkiLangs") != -1)
					document.getElementById(this.id).parentNode.nextSibling.replaceChild(outerCaptionSpanElem, document.getElementById(this.id).parentNode.nextSibling.firstChild);
				else
					document.getElementById(this.id).parentNode.nextSibling.insertBefore(outerCaptionSpanElem, document.getElementById(this.id).parentNode.nextSibling.firstChild);
			else
				document.getElementById(this.id).parentNode.nextSibling.appendChild(outerCaptionSpanElem);
		}
		else
			if (document.getElementById(this.id).nextSibling.firstChild)
				if (document.getElementById(this.id).nextSibling.firstChild.className == "onkiLangs")
					document.getElementById(this.id).nextSibling.replaceChild(selectElem, document.getElementById(this.id).nextSibling.firstChild);
				else
					document.getElementById(this.id).nextSibling.insertBefore(selectElem, document.getElementById(this.id).nextSibling.firstChild);
			else
				document.getElementById(this.id).nextSibling.appendChild(selectElem);	

		// if language wasn't set, use default (if found in the ontology)
		if (!langSelected) {
			if (langsContainsDefault) {
				this.lang = this.defaultLang;
				//if (langs.length > 1) {
				document.getElementById(this.id+"-lang-"+this.defaultLang).selected = true; // doesn't work in opera
				document.getElementById(this.id+"-lang-"+this.defaultLang).setAttribute("selected", "selected");
				//}
				langSelected = true;
			}
			else
				this.lang = langs[0];
		}		
		//if the language menu should be hidden if there's only 1 language, use the following code
		/*else if (document.getElementById(this.id).nextSibling.firstChild && document.getElementById(this.id).nextSibling.firstChild.getAttribute("class") == "onkiLangs")
			document.getElementById(this.id).nextSibling.removeChild(document.getElementById(this.id).nextSibling.firstChild);*/
		
		//initialize with prefetched concepts
		var concepts = new Array();
		
		if (!this.isLangsInitialized()) {	// is this the first time langs menu is generated (the widget generation time)
			
			// method 1: concepts in integration code
			if (this.initializeWithConcepts != undefined)
				concepts = this.initializeWithConcepts;

			// method 2: concepts in hidden input fields
			var inputList = document.getElementsByName(this.hiddenFieldName);
			if (inputList.length > 0)
				concepts = new Array();

			if (this.fieldShared) {
				for (var i=inputList.length-1; i>=0; i--) {
					if (inputList[i].getAttribute("type") && inputList[i].getAttribute("type") == "hidden") {
						var conceptValues = inputList[i].value.split(this.conceptDelimiter);
						inputList[i].parentNode.removeChild(inputList[i]);
						inputList = conceptValues;
						break;
					}
				}
			}

			for (var i=inputList.length-1; i>=0; i--) {
				if (typeof inputList[i] == "object" && !this.initializeWithFieldValue && (!inputList[i].getAttribute("type") || inputList[i].getAttribute("type") != "hidden"))
					continue;
				var conceptValue = inputList[i];
				if (typeof inputList[i] == "object")
					conceptValue = inputList[i].value;
				var concept = new Object();
				if (!this.fetchUris) //if (this.termsNotUris)
					concept.label = conceptValue;
				else {
					if (conceptValue.indexOf(this.uriLabelDelimiter) != -1) {
						concept.uri = conceptValue.substring(0, conceptValue.indexOf(this.uriLabelDelimiter));
						concept.label = conceptValue.substring(conceptValue.indexOf(this.uriLabelDelimiter) + this.uriLabelDelimiter.length);
					}
					else
						concept.uri = conceptValue;
				}
				concepts[i] = concept;
				
				if (typeof inputList[i] == "object") {				
					if (inputList[i].getAttribute("type") && inputList[i].getAttribute("type") == "hidden")
						inputList[i].parentNode.removeChild(inputList[i]);
					else
						inputList[i].value = "";
				}
			}

			for (var i=0; i<concepts.length; i++) {
				if (concepts[i] == undefined)
					continue;
				this.addConceptFromBrowser(concepts[i].uri, concepts[i].label, onki[this.onkiId].uriAsUrl, true, true); // TODO: this.onkiId is the preconfigured onki instance, not safe solution
			}
		}
		
		// perform new search when langs are set (current ontology is changed)
		var value = document.getElementById(this.id).getAttributeNode("onkeyup").nodeValue;
		value = value.replace(/this/, "document.getElementById('"+ this.id +"')");
		value = value.replace(", event", "");
		eval(value);

		this.setLangsInitialized();		
	}
		
	function isLangsInitialized() {
		return this.langsInitialized;
	}
	
	function setLangsInitialized() {
		this.langsInitialized = true;
	}
		
	function openOnki() {
		var url = "";
		this.uriToReplace = null;
		this.tempOnkiId = null;
		//if (onki[this.onkiId] && onki[this.onkiId].url) {
		if (this.onkiId && onki[this.onkiId]) {
			//url = onki[this.onkiId].url.replace(/key-\w*\//, "");
			url = this.generateOntoUrl(this.onkiId, "openbrowser");
		}
		else if (this.ysoBrowserUrl != undefined)
			url = this.ysoBrowserUrl+"?ctx=openbrowser";
		if (url != "")
			openOnkiBrowser(this.addConceptFromBrowser, url, this.lang, this.uriToReplace, this.typeRestriction, this.parentRestriction, this.groupRestriction, this.returnType);
	}
	
	function openOnkiReplace(onkiId, uri, url) {
		// save the uri to be replaced
		this.uriToReplace = uri;
		this.tempOnkiId = onkiId;
		openOnkiBrowser(this.addConceptFromBrowser, url, this.lang, this.uriToReplace, this.typeRestriction, this.parentRestriction, this.groupRestriction, this.returnType);
	}
	
	function getOnkiId() {
		return this.onkiId;
	}
	
	function setOnkiId(newOnkiId) {
		// onki instance selection was changed
		if (newOnkiId != this.onkiId) {
			this.onkiId = newOnkiId;
			this.keyCheck();
			// clear the search field
			document.getElementById(this.id).value = "";
			// DWR call to get available languages of onki instance(s)
			if (onki[this.onkiId] && (this.onkiId == null || this.onkiId != "koordinaatit")) // FF && IE
				onki[this.onkiId].getLangs(this.id, this.onkiId, this.ontologies);
		}
	}
	
	function getDefaultOnkiId() {
		return this.defaultOnkiId;
	}
	
	function setDefaultOnkiId(newOnkiId) {
		if (newOnkiId == "null") {
			newOnkiId = null;
		}
		
		// onki instance selection was changed (onki instance menu in use)
		//this.setFocus(true);
		if (this.defaultOnkiId != newOnkiId) {
			this.defaultOnkiId = newOnkiId;
			
			if (this.showCaptions)
				var options = document.getElementById(this.id).parentNode.previousSibling.lastChild.getElementsByTagName("option");
			else
				var options = document.getElementById(this.id).previousSibling.firstChild.getElementsByTagName("option");
			
			for (var i=0; i<options.length; ++i) {
				if (options[i].value == this.defaultOnkiId) {
					options[i].selected = true; // doesn't work in opera
					options[i].setAttribute("selected", "selected");
				}
			}
			this.setOnkiId(newOnkiId);
			// remove a possible prefix from the search field
			var value = document.getElementById(this.id).value;
			if (value.match(/.+\:/)) {
				for (i in onki) {
					if (i == value.replace(/\:.*/, "")) {
						value = value.replace(/.+\:/, "")
						document.getElementById(this.id).value = value;
					}
				}
			}
			
			//if (this.onkiId != "suo" && this.onkiId != "koordinaatit" && this.onkiId != "local") {
			if (!onki[this.onkiId].browserUrl) {
				if (host.indexOf("https") == 0)
					this.ysoBrowserUrl = "https://www.yso.fi/onto/";
				else
					this.ysoBrowserUrl = "http://www.yso.fi/onto/";
					//this.ysoBrowserUrl = "http://dev.onki.fi/u/jwtuomin/svn/secoweb/onki-frontend/public/en/browser/search/"; // debug
					//this.ysoBrowserUrl = "http://dev.onki.fi/u/jwtuomin/svn/secoweb/onki-frontend/public/en/browser/overview/"; // debug
			}
			else
				this.ysoBrowserUrl = undefined;
		}
	}

	function isHtmlCreated() {
		return document.getElementById(this.id+"_langs_browser");
	}
	
	// temporary saha fix
	function showOpenOnkiButton() {
		document.getElementById(this.id+"_open-onki-button").style.cssText = "display:inline;";
	}
	
	// temporary saha fix
	function hideOpenOnkiButton(now) {
		if (now == undefined)
			self.setTimeout("onkiSearch['"+this.id+"'].hideOpenOnkiButton(true)", 2000);
		else
			document.getElementById(this.id+"_open-onki-button").style.cssText = "display:none;";
	}
	
	function generateOntoUri(onkiId) {
		if (onkiId == undefined && this.onkiId)
			onkiId = this.onkiId;
		if (onkiId)
			return "http://www.yso.fi/onto/" + onkiId;
		return null;
		/*var ontoUri = onki[this.onkiId].url.replace(/key-\w*\//, "");
		ontoUri = ontoUri.replace("/onki/", "/onto/").replace("https", "http");
		if (ontoUri.charAt(ontoUri.length-1) == "/")
			ontoUri = ontoUri.substring(0, ontoUri.length-1);*/
	}

	function generateOntoUrl(onkiId, context) {
		if (onkiId == undefined && this.onkiId)
			onkiId = this.onkiId;
		if (onkiId) {
			if (onki[onkiId].browserUrl)
				return onki[onkiId].browserUrl;
			else if (this.ysoBrowserUrl) {
				 var url = this.ysoBrowserUrl + "?o=" + encodeURIComponent(this.generateOntoUri(onkiId));
				 if (context != undefined)
					 url += "&ctx=" + context;
				 return url;
			}
			else
				return this.generateOntoUri(onkiId);
		}
		return null;
	}
	
	function init() {
		// generate HTML elements only if they aren't already generated
		if (!this.isHtmlCreated()) {
		
			if (this.finder)
				this.finder.init();
			if (this.collector)
				this.collector.init();
			
			var searchElement = document.getElementById(this.id);
			searchElement.setAttribute("autocomplete", "off");
			if (!searchElement.getAttribute("type"))
				searchElement.setAttribute("type", "text");
			if (!searchElement.className) {
				
				// caption text, Jouni, 30.9.2008
				if (this.showCaptions) { 
					searchElement.className = "onkiSearchField"; // for IE
					var outerSpanCaptionElem = document.createElement("span");
					outerSpanCaptionElem.className = "outerContainer";
					var spanCaptionElem = document.createElement("span");
					spanCaptionElem.className = "caption";
					var textNode = document.createTextNode("Search field");
					spanCaptionElem.appendChild(textNode);
					outerSpanCaptionElem.appendChild(spanCaptionElem);
					var brElem = document.createElement("br");
					outerSpanCaptionElem.appendChild(brElem);
					searchElement.parentNode.insertBefore(outerSpanCaptionElem, searchElement);
					outerSpanCaptionElem.appendChild(searchElement);
				}
				
				else
					searchElement.className = "onkiSearchField"; // for IE
			}
			
			// temporary saha fix
			if (this.openonkibutton && document.location.toString().indexOf("://demo.seco.tkk.fi/saha") != -1) {
				if (searchElement.addEventListener) { // for FF
					//searchElement.addEventListener("focus", new Function(this.searchname + ".showOpenOnkiButton()"), false);
					searchElement.addEventListener("click", new Function(this.searchname + ".showOpenOnkiButton()"), false);
					searchElement.addEventListener("blur", new Function(this.searchname + ".hideOpenOnkiButton()"), false);
				}
				else if (searchElement.attachEvent) { // for IE
					//searchElement.attachEvent("onfocus", new Function(this.searchname + ".showOpenOnkiButton()"));
					searchElement.attachEvent("onclick", new Function(this.searchname + ".showOpenOnkiButton()"));
					searchElement.attachEvent("onblur", new Function(this.searchname + ".hideOpenOnkiButton()"));
				}
			}
			
			if (!this.autocompletionSearch)
				searchElement.style.cssText = "display:none;";
			
			else if (this.fieldLabel) {
				var spanElem = document.createElement("span");
				spanElem.className = "fieldLabel";
				var textNode = document.createTextNode(this.fieldLabel+" ");
				spanElem.appendChild(textNode);
				
				if (this.showCaptions)
					document.getElementById(this.id).parentNode.parentNode.insertBefore(spanElem, document.getElementById(this.id).parentNode);
				else
					document.getElementById(this.id).parentNode.insertBefore(spanElem, document.getElementById(this.id));
			}
			
			if (this.onkimenu) {

				var oldStyle = true; // temporary
				
				if (oldStyle) {
					var spanElem = document.createElement("span");
					var selectElem = document.createElement("select");
					selectElem.className = "onkiInstances"; // for IE
					selectElem.setAttribute("id", this.id+"_onki-instances"); // IE needs this
					
					if (selectElem.addEventListener) { // for FF
						selectElem.addEventListener("change", new Function(this.searchname + ".setDefaultOnkiId(this.options[this.selectedIndex].value)"), false);
						//selectElem.addEventListener("focus", new Function("showOnkiDiv('"+this.id+"')"), false);
						//selectElem.addEventListener("blur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"), false);
					}
					else if (selectElem.attachEvent) { // for IE
						selectElem.attachEvent("onchange", new Function(this.searchname + ".setDefaultOnkiId(document.getElementById('" + this.id + "_onki-instances').value)"));
						//selectElem.attachEvent("onfocus", new Function("showOnkiDiv('"+this.id+"')"));
						//selectElem.attachEvent("onblur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"));
					}
	
					var optionElem;
					var textNode;
				
					// Menu for selecting onki instance dynamically
					for (value in onki) {	
						if (onki[value].showInOntologyMenu) {
							optionElem = document.createElement("option");
							optionElem.setAttribute("value", value);
							
							if (this.defaultOnkiId == value || (this.defaultOnkiId == null && value == "null")) {
								optionElem.selected = true; // doesn't work in opera
								optionElem.setAttribute("selected", "selected");
							}
		
							//if (value.indexOf("smartmuseum") != -1)
								//textNode = document.createTextNode(value.replace("smartmuseum", "sm"));
							//else
							if (value != "null") { 							
								//textNode = document.createTextNode(value);
								//var name = onki[value].name;
								var name = value;
								if (name.length > 19)
									name = name.substr(0, 18)+"...";
								textNode = document.createTextNode(name);
							}
							else
								if (UILang == 'fi')
									textNode = document.createTextNode("(kaikki)");
								else
									textNode = document.createTextNode("(all)");

							optionElem.appendChild(textNode);
							selectElem.appendChild(optionElem);
						}
					}
					
					// caption text, Jouni, 30.9.2008
					if (this.showCaptions) {
						spanElem.className = "outerContainer";
						var spanCaptionElem = document.createElement("span");
						spanCaptionElem.className = "caption";
						textNode = document.createTextNode("Ontology");
						spanCaptionElem.appendChild(textNode);
						spanElem.appendChild(spanCaptionElem);
						
						var brElem = document.createElement("br");
						spanElem.appendChild(brElem);
					}
					
					spanElem.appendChild(selectElem);
					if (this.showCaptions)
						document.getElementById(this.id).parentNode.parentNode.insertBefore(spanElem, document.getElementById(this.id).parentNode);
					else
						document.getElementById(this.id).parentNode.insertBefore(spanElem, document.getElementById(this.id));
				}
				
				// TODO: tämä on keskeneräinen, Jouni 28.11.2008
				else {
					//this.onkiId;
					//onki[this.onkiId];
					
					var spanElem = document.createElement("span");
					//spanElem.className = "onkiName";
					
					var textNode = document.createTextNode(this.getDefaultOnkiId()+" ");
					//else
						//var textNode = document.createTextNode(this.fieldLabel+" ");
					spanElem.appendChild(textNode);
					
					if (this.showCaptions)
						// experimental after this line:
						document.getElementById(this.id).parentNode.parentNode.insertBefore(spanElem, document.getElementById(this.id).parentNode);
					else
						document.getElementById(this.id).parentNode.insertBefore(spanElem, document.getElementById(this.id));
					
					var divElem = document.createElement("div");
					//var selectElem = document.createElement("select");
					//selectElem.className = "onkiInstances"; // for IE
					//selectElem.setAttribute("id", this.id+"_onki-instances"); // IE needs this
					
					/*if (selectElem.addEventListener) { // for FF
						selectElem.addEventListener("change", new Function(this.searchname + ".setDefaultOnkiId(this.options[this.selectedIndex].value)"), false);
						//selectElem.addEventListener("focus", new Function("showOnkiDiv('"+this.id+"')"), false);
						//selectElem.addEventListener("blur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"), false);
					}
					else if (selectElem.attachEvent) { // for IE
						selectElem.attachEvent("onchange", new Function(this.searchname + ".setDefaultOnkiId(document.getElementById('" + this.id + "_onki-instances').value)"));
						//selectElem.attachEvent("onfocus", new Function("showOnkiDiv('"+this.id+"')"));
						//selectElem.attachEvent("onblur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"));
					}*/
	
					var inputElem;				
					var textNode;
				
					// Menu for selecting onki instance dynamically
					for (value in onki) {
						if (onki[value].showInOntologyMenu) {
							inputElem = document.createElement("input");
							inputElem.setAttribute("type", "radio");
							inputElem.setAttribute("name", this.id+"_onki-instances");
							inputElem.setAttribute("id", this.id+"_onki-instances_" + value);
							inputElem.setAttribute("value", value);
							
							//if (this.defaultOnkiId == value) {
							if (this.defaultOnkiId == value || (this.defaultOnkiId == null && value == "null")) {
								inputElem.checked = true; // doesn't work in opera?
								inputElem.setAttribute("checked", "checked");
							}
		
							if (inputElem.addEventListener) { // for FF
								inputElem.addEventListener("click", new Function(this.searchname + ".setDefaultOnkiId(this.value)"), false);
								//selectElem.addEventListener("focus", new Function("showOnkiDiv('"+this.id+"')"), false);
								//selectElem.addEventListener("blur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"), false);
							}
							else if (inputElem.attachEvent) { // for IE
								inputElem.attachEvent("onclick", new Function(this.searchname + ".setDefaultOnkiId(document.getElementById('" + this.id + "_onki-instances_" + value +"').value)"));
								//selectElem.attachEvent("onfocus", new Function("showOnkiDiv('"+this.id+"')"));
								//selectElem.attachEvent("onblur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"));
							}
							
							//if (value.indexOf("smartmuseum") != -1)
								//textNode = document.createTextNode(value.replace("smartmuseum", "sm"));
							//else
							if (value != "null")
								textNode = document.createTextNode(value);
							else
								textNode = document.createTextNode("(all)");
							
							divElem.appendChild(inputElem);
							divElem.appendChild(textNode);
						}
						
					}
					// search all onki instances
					/*
					inputElem = document.createElement("input");
					inputElem.setAttribute("type", "radio");
					inputElem.setAttribute("name", this.id+"_onki-instances");
					inputElem.setAttribute("id", this.id+"_onki-instances" + "_null");
					inputElem.setAttribute("value", "null");
					
					if (inputElem.addEventListener) { // for FF
						inputElem.addEventListener("click", new Function(this.searchname + ".setDefaultOnkiId(this.value)"), false);
						//selectElem.addEventListener("focus", new Function("showOnkiDiv('"+this.id+"')"), false);
						//selectElem.addEventListener("blur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"), false);
					}
					else if (inputElem.attachEvent) { // for IE
						inputElem.attachEvent("onclick", new Function(this.searchname + ".setDefaultOnkiId(document.getElementById('" + this.id + "_onki-instances_" + "null" +"').value)"));
						//selectElem.attachEvent("onfocus", new Function("showOnkiDiv('"+this.id+"')"));
						//selectElem.attachEvent("onblur", new Function(this.searchname + ".setFocus(false);hideOnkiDiv('"+this.id+"')"));
					}
									
					textNode = document.createTextNode("(all)");
					divElem.appendChild(inputElem);
					divElem.appendChild(textNode);
					 */
					
					// caption text, Jouni, 30.9.2008
					if (this.showCaptions) {
						var outerSpanElem = document.createElement("span");
						outerSpanElem.className = "outerContainer";
						var spanCaptionElem = document.createElement("span");
						spanCaptionElem.className = "caption";
						textNode = document.createTextNode("Ontology"); // TODO: add white space
						spanCaptionElem.appendChild(textNode);
						outerSpanElem.appendChild(spanCaptionElem);
						
						var brElem = document.createElement("br");
						outerSpanElem.appendChild(brElem);
					}
					
					outerSpanElem.appendChild(spanElem);
					//outerSpanElem.appendChild(divElem);
					
					if (this.showCaptions)
						// experimental after this line:
						document.getElementById(this.id).parentNode.parentNode.insertBefore(outerSpanElem, document.getElementById(this.id).parentNode);
					else
						document.getElementById(this.id).parentNode.insertBefore(outerSpanElem, document.getElementById(this.id));
					
					// TODO: add div to DOM tree
				}
			}
			
			// if onkimenu isn't used, show the name of ontology instead or specified field label
			else if (this.showOnkiName) {
				var spanElem = document.createElement("span");
				spanElem.className = "onkiName";
				var textNode = document.createTextNode(this.getDefaultOnkiId()+" ");
				spanElem.appendChild(textNode);
				
				if (this.showCaptions)
					document.getElementById(this.id).parentNode.parentNode.insertBefore(spanElem, document.getElementById(this.id).parentNode);
				else
					document.getElementById(this.id).parentNode.insertBefore(spanElem, document.getElementById(this.id));
			}
			
			// Span element for language menu and open onki browser button	
			var spanElem = document.createElement("span");
			spanElem.setAttribute("id", this.id+"_langs_browser");
			
			if (this.showCaptions)
				if (document.getElementById(this.id).parentNode.nextSibling)
					document.getElementById(this.id).parentNode.parentNode.insertBefore(spanElem, document.getElementById(this.id).parentNode.nextSibling);
				else
					document.getElementById(this.id).parentNode.parentNode.appendChild(spanElem);
			else
				
			if (document.getElementById(this.id).nextSibling)
				document.getElementById(this.id).parentNode.insertBefore(spanElem, document.getElementById(this.id).nextSibling);
			else
				document.getElementById(this.id).parentNode.appendChild(spanElem);
	
			this.keyCheck();

			// DWR call to get available languages
			if (this.languageMenu && (this.onkiId == null || this.onkiId != "koordinaatit"))
				onki[this.onkiId].getLangs(this.id, undefined, this.ontologies);
			
			// Open Onki Browser button
			if (this.openonkibutton) {
				var buttonElem = document.createElement("input");
				buttonElem.setAttribute("id", this.id+"_open-onki-button");
				buttonElem.setAttribute("type", "button");
				buttonElem.setAttribute("value", this.openonkilabel);
				
				if (buttonElem.addEventListener) // for FF
					buttonElem.addEventListener("click", new Function(this.searchname + ".openOnki()"), false);
				else if (buttonElem.attachEvent) // for IE
					buttonElem.attachEvent("onclick", new Function(this.searchname + ".openOnki()"));
				
				buttonElem.className = "openOnkiButton"; // for IE
				
				// caption text, Jouni, 30.9.2008
				if (this.showCaptions) {
					var outerCaptionSpanElem = document.createElement("span");
					outerCaptionSpanElem.className = "outerContainer";
					var spanCaptionElem = document.createElement("span");
					spanCaptionElem.className = "caption";
					textNode = document.createTextNode("ONKI Browser");
					spanCaptionElem.appendChild(textNode);
					outerCaptionSpanElem.appendChild(spanCaptionElem);
					
					var brElem = document.createElement("br");
					outerCaptionSpanElem.appendChild(brElem);
					
					outerCaptionSpanElem.appendChild(buttonElem);

					document.getElementById(this.id).parentNode.nextSibling.appendChild(outerCaptionSpanElem);
				}
				else
					document.getElementById(this.id).nextSibling.appendChild(buttonElem);
				
				// temporary saha fix
				if (document.location.toString().indexOf("://demo.seco.tkk.fi/saha") != -1)
					this.hideOpenOnkiButton(true);
			}
			
			// add SeCo logo
			/*
			var secoElem = document.createElement("a");
			secoElem.setAttribute("href", "http://www.seco.tkk.fi");
			var imgElem = document.createElement("img");
			imgElem.setAttribute("src", "http://www.seco.tkk.fi/style/secologo.png");
			imgElem.setAttribute("border", "0");
			imgElem.setAttribute("height", "30px");
			imgElem.setAttribute("width", "29px");
			imgElem.setAttribute("alt", "SeCo");
			secoElem.appendChild(imgElem);
			document.getElementById(this.id).nextSibling.appendChild(secoElem);
			*/
		}
	}
}

// inform that the script is loaded
var addScriptLoaded;
if (addScriptLoaded != undefined)
	addScriptLoaded();
