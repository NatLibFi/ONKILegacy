// Functionalities to init ONKI Mash-Up components
// Jouni Tuominen, 23.7.2007
var onki = {};
var onkiSearch = {};

// autocompletion delay timer
var searchTimer;

// autocompletion XHR holder
var autocompleteXHR = null;

// key events
var Events = {
  KEY_TAB: 9, // FIXME?
  KEY_RETURN: 13,
  KEY_ESC: 27,
  KEY_LEFT: 37,
  KEY_UP: 38,
  KEY_RIGHT: 39,
  KEY_DOWN: 40
};

var searchParameters = { allOnkis: null, searchField: null };

var restUrl = '://api.finto.fi/rest/v1/';
if ("https:" == document.location.protocol) {
  restUrl = 'https' + restUrl;
} else {
  restUrl = 'http' + restUrl;
}        

// dwr call for performing autocompletion search
function searchOnki(allOnkis, onkiId, searchField, searchValue, lang, maxHits, typeRestriction, parentRestriction, groupRestriction) {
  searchParameters.allOnkis = allOnkis;
  searchParameters.searchField = searchField;
  var limit = maxHits ? '&maxhits=' + maxHits : undefined; 
  var typeRestr = typeRestriction ? '&type=' + typeRestriction : ''; 
  var parentRestr = parentRestriction ? '&parent=' + parentRestriction : ''; 
  var groupRestr = groupRestriction ? '&group=' + groupRestriction : ''; 
  document.searchLimit = maxHits;
  var scriptElem = document.createElement("script");
  scriptElem.src = restUrl + onkiId + '/search?query=' + searchValue +'*&lang=' +lang + groupRestr + parentRestr + typeRestr + '&callback=onkiSearch["' + searchField + '"].addRESTSearchResult';
  if (lang === null)
    scriptElem.src = restUrl + onkiId + '/search?query=' + searchValue + '*' + groupRestr + typeRestr + parentRestr + '&callback=onkiSearch["' + searchField + '"].addRESTSearchResult';

  scriptElem.type = 'text/Javascript';
  document.getElementsByTagName("head")[0].appendChild(scriptElem);
  /*
     if (onkiId != "koordinaatit")
     dwr.engine._execute(onki[onkiId]._path, 'OnkiAutocompletion', 'search', searchValue, lang, maxHits, typeRestriction, parentRestriction, groupRestriction, {
     callback:function(data) {
     var metadata = data.metadata;
     if (!allOnkis)
     onkiSearch[searchField].addSearchResults(metadata);
     data = data.results;
     for (var i=0; i<data.length; i++) {
     var resobj = data[i];
     onkiSearch[searchField].addSearchResult(resobj.uri, resobj.title, onkiId, resobj.altLabel);
     }
     },
     errorHandler:function(message, exception) {onkiSearch[searchField].generateError(message, exception, "search")}});
     */
}

function searchOnkiGeo(allOnkis, onkiId, searchField, searchValue, lang, maxHits) {
  dwr.engine._execute(onki[onkiId]._path, 'OnkiAutocompletion', 'search', searchValue, lang, maxHits, {
    callback:function(data) {
      if (!allOnkis)
    onkiSearch[searchField].addSearchResults();
  for (var i=0; i<data.length; i++) {
    var resobj = data[i];
    onkiSearch[searchField].addSearchResult(resobj.uri, resobj.title, onkiId, resobj.altLabel);
  }
    },
  errorHandler:function(message, exception) {onkiSearch[searchField].generateError(message, exception, "search")}});
}

// Create ONKI search instances and define their DWR methods
//function createOnki(id, url, name, uriAsUrl, showInOntologyMenu) {
function createOnki(id, browserUrl, dwrUrl, name, uriAsUrl, showInOntologyMenu) {
  if (onki[id] == null) onki[id] = {};
  //onki[id].url = url;
  onki[id].browserUrl = browserUrl;
  //onki[id]._path = url + 'dwr';
  onki[id]._path = dwrUrl;
  onki[id].name = name;
  onki[id].uriAsUrl = uriAsUrl;
  onki[id].showInOntologyMenu = showInOntologyMenu;

  // DWR autocomplete search method
  onki[id].search = function(paramArray, event) {

    var searchField = "";
    var searchValue = "";
    var lang = "fi";
    var resultLang;
    var maxHits = 50; // default 50, -1 means unlimited
    var parentRestriction; //TODO add to UI? release n+1
    var typeRestriction; //TODO add to UI? release n+1
    var groupRestriction; //TODO add to UI? release n+1
    var returnType;// = "uri";
    var openonkibutton = true;
    var autocompletionSearch = true;
    var languageMenu = true;
    var onkimenu = true;
    var showOnkiName = true;
    var fieldLabel;
    var maxSelect = -1; // -1 means unlimited
    var prefix = true;
    var openonkilabel = "Open ONKI Browser";
    var termsNotUris = false; // deprecated
    var fetchUris = true;
    var fetchLabels = false;
    var initializeWithConcepts;
    var delimiter = " ";
    var initializeWithFieldValue = false;
    var getUrisForPlainTerms = true;
    var queryExpansion = false;
    var fieldName = "";
    showCaptions = false;

    // merging works only in global search (through onki-frontend)
    useOnkiFrontend = true;
    var mergeSearchResults = false;

    var onkiFinder;
    var conceptCollector;

    var addConceptFunction;
    var removeConceptFunction;

    var generateQueryTermFunction;
    var generateQueryANDPartitionFunction;
    var generateQueryORPartitionFunction;
    var getTermsFromQueryFunction;
    var queryExpansionCaption;
    var maxQueryExpandResults = 2000; // default 2000, -1 means unlimited

    var ontologies;

    var fieldShared = false;
    var uriLabelDelimiter;
    var conceptDelimiter;

    for (key in paramArray) {
      if (key == "conceptCollector")
        conceptCollector = paramArray[key];
      else if (key == "onkiFinder")
        onkiFinder = paramArray[key];
      else if (key == "addConceptFunction")
        addConceptFunction = paramArray[key];
      else if (key == "removeConceptFunction")
        removeConceptFunction = paramArray[key];
      else if (key == "generateQueryTermFunction")
        generateQueryTermFunction = paramArray[key];
      else if (key == "generateQueryANDPartitionFunction")
        generateQueryANDPartitionFunction = paramArray[key];
      else if (key == "generateQueryORPartitionFunction")
        generateQueryORPartitionFunction = paramArray[key];
      else if (key == "getTermsFromQueryFunction")
        getTermsFromQueryFunction = paramArray[key];
      else if (key == "queryExpansionCaption")
        queryExpansionCaption = paramArray[key];
      else if (key == "maxQueryExpandResults")
        maxQueryExpandResults = paramArray[key];
      else if (key == "lang")
        lang = paramArray[key];
      else if (key == "resultLang")
        resultLang = paramArray[key];
      else if (key == "maxHits")
        maxHits = paramArray[key];
      else if (key == "maxSelect")
        maxSelect = paramArray[key];
      else if (key == "parentRestriction")
        parentRestriction = paramArray[key];
      else if (key == "typeRestriction")
        typeRestriction = paramArray[key];
      else if (key == "groupRestriction")
        groupRestriction = paramArray[key];
      else if (key == "returnType")
        returnType = paramArray[key];
      else if (key == "openonkibutton")
        openonkibutton = paramArray[key];
      else if (key == "autocompletionSearch")
        autocompletionSearch = paramArray[key];
      else if (key == "languageMenu")
        languageMenu = paramArray[key];	
      else if (key == "onkimenu")
        onkimenu = paramArray[key];
      else if (key == "showOnkiName")
        showOnkiName = paramArray[key];
      else if (key == "fieldLabel")
        fieldLabel = paramArray[key];
      else if (key == "prefix")
        prefix = paramArray[key];
      else if (key == "openonkilabel")
        openonkilabel = paramArray[key];
      else if (key == "termsNotUris")
        termsNotUris = paramArray[key];
      else if (key == "fetchUris")
        fetchUris = paramArray[key];
      else if (key == "fetchLabels")
        fetchLabels = paramArray[key];
      else if (key == "initializeWithConcepts")
        initializeWithConcepts = paramArray[key];
      else if (key == "delimiter")
        delimiter = paramArray[key];
      else if (key == "initializeWithFieldValue")
        initializeWithFieldValue = paramArray[key];
      else if (key == "getUrisForPlainTerms")
        getUrisForPlainTerms = paramArray[key];
      else if (key == "queryExpansion")
        queryExpansion = paramArray[key];
      else if (key == "fieldName")
        fieldName = paramArray[key];
      else if (key == "showCaptions")
        showCaptions = paramArray[key];
      else if (key == "useOnkiFrontend")
        useOnkiFrontend = paramArray[key];
      else if (key == "mergeSearchResults")
        mergeSearchResults = paramArray[key];
      else if (key == "ontologies") {
        ontologies = paramArray[key];
        //ontologies = paramArray[key].split(" ");
        //for (var i=0; i<ontologies.length; i++)
        //ontologies[i] = "http://www.yso.fi/onto/"+ontologies[i];
      }
      else if (key == "fieldShared")
        fieldShared = paramArray[key];   	
      else if (key == "uriLabelDelimiter")
        uriLabelDelimiter = paramArray[key];
      else if (key == "conceptDelimiter")
        conceptDelimiter = paramArray[key];
      else if (key == "searchElement") {
        searchField = paramArray[key].id;
        searchValue = paramArray[key].value;
      }
    }

    if (termsNotUris) {
      fetchUris = false;
      fetchLabels = true;
    }

    // default values for returnType
    if (returnType == undefined)
      if (id == "koordinaatit")
        returnType = "singlepoint";
      else
        returnType = "uri";

    if (typeof typeRestriction == 'string')
      typeRestriction = [typeRestriction];

    if (typeof parentRestriction == 'string')
      parentRestriction = [parentRestriction];

    if (typeof groupRestriction == 'string')
      groupRestriction = [groupRestriction];

    if (uriLabelDelimiter == undefined)
      uriLabelDelimiter = delimiter;
    if (conceptDelimiter == undefined)
      conceptDelimiter = delimiter;

    if (!onkiFinder)
      onkiFinder = createOnkiFinder;

    if (!conceptCollector && !addConceptFunction)
      conceptCollector = createConceptCollector;

    // Support for namespace prefix in search
    if (searchValue.match(/.+\:/)) {
      var onkiIdValid = false;
      for (i in onki) {
        if (i == searchValue.replace(/\:.*/, "")) {
          id = searchValue.replace(/\:.*/, "");
          searchValue = searchValue.replace(/.+\:/, "");
          onkiIdValid = true;
        }
      }
      if (!onkiIdValid)
        id = onkiSearch[searchField].getDefaultOnkiId();
    }
    else if (onkiSearch[searchField] != null)
      // TODO: the following line breaks saha?, Jouni 19.3.2009
      id = onkiSearch[searchField].getDefaultOnkiId();

    // GLUE GLUE GLUE disable autocompletionSearch, languageMenu and onkimenu if "koordinaatit" or onki-paikka's polygon returnType is used
    if (id == "koordinaatit" || (id == "suo" && returnType == "polygon")) {
      autocompletionSearch = false;
      languageMenu = false;
      onkimenu = false;
    }

    // Default name for concept collector's hidden input field to store URIs/terms
    if (fieldName == "")
      if (fetchUris) //if (termsNotUris == false)
        fieldName = "uri";
      else
        fieldName = "term";

    // let's not show the search results if there is a query term the page is loaded,
    // i.e. there is a pre-inputted query term
    var pageLoad = false;
    if (!onkiSearch[searchField] || (languageMenu && !onkiSearch[searchField].isLangsInitialized()))
      pageLoad = true;

    // Construct OnkiSearch (includes OnkiFinder and ConceptCollector)
    createOnkiSearch(searchField, onkiFinder, conceptCollector, maxSelect, lang, resultLang, openonkibutton, id, onkimenu, showOnkiName, fieldLabel, prefix, openonkilabel, addConceptFunction, removeConceptFunction, typeRestriction, parentRestriction, groupRestriction, autocompletionSearch,languageMenu,returnType,fetchUris,fetchLabels,queryExpansion,fieldName,generateQueryANDPartitionFunction,generateQueryORPartitionFunction,generateQueryTermFunction,getTermsFromQueryFunction,queryExpansionCaption,maxQueryExpandResults,showCaptions,initializeWithConcepts,uriLabelDelimiter,conceptDelimiter,fieldShared,initializeWithFieldValue,getUrisForPlainTerms,ontologies);

    lang = onkiSearch[searchField].getLang();

    if (event && event.keyCode == Events.KEY_DOWN) {
      if (isOnkiDivShown(searchField))
        onkiSearch[searchField].selectNextResult();
      else
        showOnkiDiv(searchField);
    }
    else if (event && event.keyCode == Events.KEY_UP) {
      if (isOnkiDivShown(searchField))
        onkiSearch[searchField].selectPreviousResult();
      else
        showOnkiDiv(searchField);
    }
    else if (event && (event.keyCode == Events.KEY_RETURN || event.keyCode == Events.KEY_TAB)) {
      if (isOnkiDivShown(searchField))
        onkiSearch[searchField].addCurrentResult();
      else
        showOnkiDiv(searchField);
    }
    else if (event && (event.keyCode == Events.KEY_LEFT || event.keyCode == Events.KEY_RIGHT))
      showOnkiDiv(searchField);
    else if (event && event.keyCode == Events.KEY_ESC)
      hideOnkiDiv(searchField, "now");

    else if (searchValue != "" && searchValue != "Hae käsitettä..."
        && searchValue != "Sök begrepp..." && searchValue != "Search for concept...") {
          //if (onkiSearch[searchField].getFocus())
          if (!pageLoad)
            showOnkiDiv(searchField);
          var acSearch;

          if (id != null) {
            //TODO GLUE GLUE: add type and parent queries to onki-paikka
            if (id != "suo") {
              acSearch = function() {
                searchOnki(false, id, searchField, searchValue, lang, maxHits, typeRestriction, parentRestriction, groupRestriction);
              }
            }
            else {
              acSearch = function() {
                searchOnkiGeo(false, id, searchField, searchValue, lang, maxHits);
              }
            }
          }
          // Search all onki instances
          else {
            acSearch = function() {						
              // global search through onki-frontend
              if (useOnkiFrontend) {
                var scriptElem = document.createElement("script");
                var l = "";
                var qt = "";
                var qp = "";
                var qg = "";
                var merge = "";
                var os = "";
                if (lang != null)
                  l = "&l="+lang;
                if (typeRestriction)
                  qt = "&qt="+encodeURIComponent(typeRestriction);
                if (parentRestriction)
                  qp = "&qp="+encodeURIComponent(parentRestriction);
                if (groupRestriction)
                  qg = "&qg="+encodeURIComponent(groupRestriction);
                if (mergeSearchResults)
                  merge = "&merge=true";
                if (ontologies)
                  os = "&os="+encodeURIComponent(ontologies);

                searchValue = encodeURIComponent(searchValue);

                var scriptElemURL = onkiFrontendUrl+"search?q="+searchValue+l+"&h="+maxHits+qt+qp+qg+merge+os+"&callback=onkiSearch['"+searchField+"'].addSearchResult&callback_metadata=onkiSearch['"+searchField+"'].addSearchResults";

                //if (typeof jQuery != 'undefined') {
                if (document.location.href.indexOf("onki.fi/") != -1 && document.location.href.indexOf("/browser") != -1) {
                  //scriptElemURL = encodeURI(scriptElemURL);
                  $.ajax({
                    beforeSend: function(xhr) {
                      xhr.setRequestHeader("X-Requested-With", "");
                      if (autocompleteXHR != null) {
                        autocompleteXHR.abort();
                      }
                      autocompleteXHR = xhr;
                    },
                    type: 'GET',
                    url: scriptElemURL,
                    dataType: 'script',
                    cache: true,
                    success: function(response, status, xhr) {
                      autocompleteXHR = null;
                      scriptElem.type = "text/javascript";
                      scriptElem.text = decodeURIComponent(unescape(response));
                      scriptElem.text = scriptElem.text.replace("%27", "'")
                    document.getElementsByTagName("head")[0].appendChild(scriptElem);
                    }
                  });
                } else {
                  scriptElem.type = "text/javascript";
                  scriptElem.src = scriptElemURL;
                  document.getElementsByTagName("head")[0].appendChild(scriptElem);
                  //TODO: garbage collecting
                }

              }
              }
            }
            if (searchTimer)
              window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(acSearch, 300);
          }
          else {
            onkiSearch[searchField].addSearchResults();
            hideOnkiDiv(searchField, "now");
          }
        }

    // DWR method for query expansion, does not work for multiple ontologies
    onki[id].expandQuery = function(uri, title, url, lang, maxQueryExpandResults, typeRestriction, searchField, onkiId) {
      dwr.engine._execute(onki[id]._path, 'OnkiAutocompletion','expandQuery', [uri], lang, maxQueryExpandResults, typeRestriction, {
        callback:function(data) {
          data = data.results;
          if (data.length>0) {
            onkiSearch[searchField].addExpandedQuery(uri, title, url, data, onkiId);
          }
        },
      errorHandler:function(message, exception) {onkiSearch[searchField].generateError(message, exception, "expandQuery")}});	
    }

    // DWR method for getting available languages for concept/instance labels
    onki[id].getLangs = function(searchField, newOnkiId, ontologies) {
      if (newOnkiId !== undefined) {id = newOnkiId;}
      if (id != null) {
        var scriptElem = document.createElement("script");
        scriptElem.src = restUrl + id + '/?callback=onkiSearch["'+searchField+'"].setRestLangs';
        scriptElem.type = 'text/Javascript';
        document.getElementsByTagName("head")[0].appendChild(scriptElem);
      }
      else if (useOnkiFrontend) {
        var os = "";
        if (ontologies !== undefined && ontologies.length > 0)
          //os = "&os=" + encodeURIComponent(ontologies);
          os = "os=" + encodeURIComponent(ontologies) + "&";

        var scriptElem = document.createElement("script");

        scriptElem.src = onkiFrontendUrl+"languages?"+os+"callback=onkiSearch['"+searchField+"'].setLangs";
        scriptElem.type = "text/Javascript";
        document.getElementsByTagName("head")[0].appendChild(scriptElem);
        //TODO: garbage collecting
      }
      else {
        var value = document.getElementById(searchField).getAttributeNode("onkeyup").nodeValue;
        value = value.replace(/this/, "document.getElementById('"+ searchField +"')");
        value = value.replace(", event", "");
        eval(value);
      }
    }

    // DWR method for getting label for a concept
    onki[id].getLabel = function(uri, lang, searchField, onkiId) {
      if (!onkiId)
        onkiId = id;
      // don't perform the uri->label resolve in case "koordinaatit", Jouni 10.9.2008
      if (onkiSearch[searchField].returnType != 'singlepoint' && onkiSearch[searchField].returnType != 'polygon' && onkiSearch[searchField].returnType != 'route') {
        // OLD: use onki-backends to get label for uri
        if (onkiId == "suo" || !useOnkiFrontend)
          dwr.engine._execute(onki[onkiId]._path, 'OnkiAutocompletion','getLabel', uri, lang, {
            callback:function(data) {onkiSearch[searchField].addConceptFromBrowser(data.uri, data.title, onki[onkiId].uriAsUrl);},
            errorHandler:function(message, exception) {onkiSearch[searchField].generateError(message, exception, "getLabel")}});
        // use onki-frontend to get label for uri
        else {
          var scriptElem = document.createElement("script");
          scriptElem.src = restUrl + onkiId + "/label?uri="+encodeURIComponent(uri)+"&lang="+lang+"&callback=onkiSearch['"+searchField+"'].addConceptFromBrowser";
          scriptElem.type = "text/Javascript";
          document.getElementsByTagName("head")[0].appendChild(scriptElem);
          /*
          var scriptElem = document.createElement("script");
          scriptElem.src = onkiFrontendUrl+"label?c="+encodeURIComponent(uri)+"&l="+lang+"&callback=onkiSearch['"+searchField+"'].addConceptFromBrowser";
          scriptElem.type = "text/Javascript";
          document.getElementsByTagName("head")[0].appendChild(scriptElem);
          */
        }
      }
      else {
        // get local name of the coordinate URI
        var coords = uri.substring(uri.lastIndexOf('/')+1);
        onkiSearch[searchField].addConceptFromBrowser(uri, coords, onki[onkiId].uriAsUrl);
      }
    }

    // helper method for getting an URI for a term, uses DWR method for search
    onki[id].getUri = function(title, lang, searchField, onkiId) {
      if (!onkiId)
        onkiId = id;
      // get the URI for label if a single ontology is selected
      // could be easily implemented also for global search
      if (onkiId != null) {
        if (onkiSearch[searchField].returnType != 'singlepoint' && onkiSearch[searchField].returnType != 'polygon' && onkiSearch[searchField].returnType != 'route')
          dwr.engine._execute(onki[onkiId]._path, 'OnkiAutocompletion', 'search', title, lang, 1, onkiSearch[searchField].typeRestriction, onkiSearch[searchField].parentRestriction, onkiSearch[searchField].groupRestriction, {
            callback:function(data) {
              if (data.results)
            data = data.results;
          if (data.length > 0 && title == data[0].title) {
            onkiSearch[searchField].addConceptFromPrefetchedTerm(onkiId, data[0].uri, data[0].title);
            onkiSearch[searchField].refresh();
          }
          else
            onkiSearch[searchField].addConceptFromPrefetchedTerm(onkiId, null, title);
          hideOnkiDiv(searchField, "now");
            },
            errorHandler:function(message, exception) {onkiSearch[searchField].generateError(message, exception, "search")}});
      }
      else {
        onkiSearch[searchField].addConceptFromPrefetchedTerm(onkiId, null, title);
        hideOnkiDiv(searchField, "now");
      } 
    }
  }

  // OnkiSearch constructor
  function createOnkiSearch(searchField, onkiFinder, conceptCollector, maxSelect, lang, resultLang, openonkibutton, onkiId, onkimenu, showOnkiName, fieldLabel, prefix, openonkilabel, addConceptFunction, removeConceptFunction, typeRestriction, parentRestriction, groupRestriction, autocompletionSearch, languageMenu, returnType, fetchUris, fetchLabels, queryExpansion, fieldName, generateQueryANDPartitionFunction, generateQueryORPartitionFunction, generateQueryTermFunction, getTermsFromQueryFunction, queryExpansionCaption, maxQueryExpandResults, showCaptions, initializeWithConcepts, uriLabelDelimiter, conceptDelimiter, fieldShared, initializeWithFieldValue, getUrisForPlainTerms, ontologies) {
    if (onkiSearch[searchField] == null) {
      onkiSearch[searchField] = new OnkiSearch(searchField, "onkiSearch['"+searchField+"']", onkiFinder, conceptCollector, maxSelect, lang, resultLang, openonkibutton, onkiId, onkimenu, showOnkiName, fieldLabel, prefix, openonkilabel, addConceptFunction, removeConceptFunction, typeRestriction, parentRestriction, groupRestriction, autocompletionSearch, languageMenu, returnType, fetchUris, fetchLabels, queryExpansion, fieldName, generateQueryANDPartitionFunction, generateQueryORPartitionFunction, generateQueryTermFunction, getTermsFromQueryFunction, queryExpansionCaption, maxQueryExpandResults, showCaptions, initializeWithConcepts, uriLabelDelimiter, conceptDelimiter, fieldShared, initializeWithFieldValue, getUrisForPlainTerms, ontologies);
      onkiSearch[searchField].init();
      onkiSearch[searchField].logAction("load");
    }
    else {
      onkiSearch[searchField].init();
      if (onkimenu)
        onkiSearch[searchField].setDefaultOnkiId(onkiId); // change the ontology and update the namespace prefix menu
      else
        onkiSearch[searchField].setOnkiId(onkiId); // change the ontology
    }
  }

  // Default OnkiFinder constructor
  function createOnkiFinder(searchField,onkisearch,showCaptions) {
    return new OnkiFinder(searchField, onkisearch.searchname+".finder", onkisearch, showCaptions);
  }

  // Default ConceptCollector constructor
  function createConceptCollector(searchField,onkisearch,fetchUris,fetchLabels,fieldName,generateQueryANDPartitionFunction,generateQueryORPartitionFunction,generateQueryTermFunction,queryExpansionCaption,uriLabelDelimiter,conceptDelimiter,fieldShared) {
    return new ConceptCollector(searchField, onkisearch.searchname+".collector", onkisearch, true, fetchUris, fetchLabels, fieldName, generateQueryANDPartitionFunction, generateQueryORPartitionFunction, generateQueryTermFunction, queryExpansionCaption, uriLabelDelimiter, conceptDelimiter, fieldShared);
  }

  // Function for hiding OnkiFinder (search results)
  function hideOnkiDiv(id,now) {
    if (now == undefined)
      self.setTimeout("hideOnkiDiv('"+id+"', true)", 500);
    else {		
      if (showCaptions) {
        if (document.getElementById(id).parentNode.nextSibling && document.getElementById(id).parentNode.nextSibling.nextSibling && document.getElementById(id).parentNode.nextSibling.nextSibling.nextSibling)
          document.getElementById(id).parentNode.nextSibling.nextSibling.nextSibling.style.cssText = "display:none;"; // for IE;
      }
      else if (document.getElementById(id).nextSibling && document.getElementById(id).nextSibling.nextSibling && document.getElementById(id).nextSibling.nextSibling.nextSibling)
        document.getElementById(id).nextSibling.nextSibling.nextSibling.style.cssText = "display:none;"; // for IE;
      onkiSearch[id].removeResultSelection();
    }
  }

  // Function for showing OnkiFinder (search results)
  function showOnkiDiv(id) {
    //onkiSearch[id].setFocus(true);

    if (showCaptions && document.getElementById(id).value && document.getElementById(id).parentNode.nextSibling && document.getElementById(id).parentNode.nextSibling.nextSibling && document.getElementById(id).parentNode.nextSibling.nextSibling.nextSibling)
      document.getElementById(id).parentNode.nextSibling.nextSibling.nextSibling.style.cssText = "display:block;"; // for IE
    else if (document.getElementById(id).value && document.getElementById(id).nextSibling && document.getElementById(id).nextSibling.nextSibling && document.getElementById(id).nextSibling.nextSibling.nextSibling)
      document.getElementById(id).nextSibling.nextSibling.nextSibling.style.cssText = "display:block;"; // for IE
  }

  // Function for checking whether OnkiFinder is shown or hidden (search results)
  function isOnkiDivShown(id) {
    if (showCaptions)
      return (document.getElementById(id).parentNode.nextSibling && document.getElementById(id).parentNode.nextSibling.nextSibling && document.getElementById(id).parentNode.nextSibling.nextSibling.nextSibling &&
          document.getElementById(id).parentNode.nextSibling.nextSibling.nextSibling.style.cssText.indexOf("block") != -1);
    else
      return (document.getElementById(id).nextSibling && document.getElementById(id).nextSibling.nextSibling && document.getElementById(id).nextSibling.nextSibling.nextSibling &&
          document.getElementById(id).nextSibling.nextSibling.nextSibling.style.cssText.indexOf("block") != -1);
  }

  function cancelEventBubbling(event) {
    if (event && event.keyCode == Events.KEY_RETURN) {
      event.cancelBubble = true; // for IE
      if (event.stopPropagation)
        event.stopPropagation();
    }
    return false;
  }

  // Generate the search components
  function initOnki() {

    for (i in onkiSearch)
      delete onkiSearch[i];

    var inputList = document.getElementsByTagName("input");

    for (var i=0; i<inputList.length; ++i) {

      if (inputList[i].getAttributeNode("onkeyup"))
        var value = inputList[i].getAttributeNode("onkeyup").nodeValue;
      else
        var value = null;

      if (value && value.match(/onki\[.*\].search/) &&
          inputList[i].parentNode.className != "onkiAutocomplete") {
            var onkiDiv = document.createElement("div");
            onkiDiv.className = "onkiAutocomplete"; // for IE

            inputList[i].parentNode.insertBefore(onkiDiv, inputList[i]);
            onkiDiv.appendChild(inputList[i]);

            if (value.match(/search\(\)/)) {
              value = value.replace(/search\(\)/, "search({searchElement : this}, event)");
              inputList[i].setAttribute("onkeyup", value);				
            }
            else if (value.match(/search\(\{\}\)/)) {
              value = value.replace(/search\(\{\}\)/, "search({searchElement : this}, event)");
              inputList[i].setAttribute("onkeyup", value);
            }
            else if (value.match(/search\(\{.*\}\)/) && !value.match(/this/)) {
              value = value.replace(/\}\)$/, ", searchElement : this}, event)");
              inputList[i].setAttribute("onkeyup", value);
            }
            var id = inputList[i].getAttribute("id");
            value = value.replace(/this/, "document.getElementById('"+ id +"')");
            if (inputList[i].attachEvent) // for IE
              inputList[i].attachEvent("onkeyup", new Function(value));

            // let's disable event "bubbling" for keypress, so that when the user presses enter the possible html form does not get sent
            // (if there is text in the input field - to support free keywords; previously: if a concept is selected from the search result list)
            //inputList[i].setAttribute("onkeypress", "return event.keyCode!=Events.KEY_RETURN ||!onkiSearch['"+id+"'].isResultSelected()"); //for FF
            inputList[i].setAttribute("onkeypress", "return event.keyCode!=Events.KEY_RETURN || document.getElementById('"+id+"').value == ''"); //for FF
            if (inputList[i].attachEvent) { // for IE
              //inputList[i].attachEvent("onkeypress", new Function("return event.keyCode!=Events.KEY_RETURN ||!onkiSearch['"+id+"'].isResultSelected()"));
              inputList[i].attachEvent("onkeypress", new Function("return event.keyCode!=Events.KEY_RETURN || document.getElementById('"+id+"').value == ''"));
            }

            value = value.replace(", event", "");
            eval(value);
          }
    }
  }

  // inform that the script is loaded
  var addScriptLoaded;
  if (addScriptLoaded != undefined)
    addScriptLoaded();
