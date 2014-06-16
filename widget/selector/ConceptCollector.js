// Concept Collector for collecting and visualizing concepts
// Kim Viljanen, 25.5.2007

// define a ConceptCollector class with methods
function ConceptCollector(id,collectorname,onkisearch,onkiFeatures,fetchUris,fetchLabels,fieldName,generateQueryANDPartitionFunction,generateQueryORPartitionFunction,generateQueryTermFunction,queryExpansionCaption,uriLabelDelimiter,conceptDelimiter,fieldShared) {
	this.id = id;
	this.collectorname = collectorname;
	this.onkisearch = onkisearch;
	// If a ConceptCollector is used in some other context than ONKI, e.g. in IRMA demo,
	// label's link and change button are disabled.
	this.onkiFeatures = onkiFeatures;

	this.fetchUris = fetchUris;
	this.fetchLabels = fetchLabels;
	this.fieldName = fieldName;
	this.uriLabelDelimiter = uriLabelDelimiter;
	this.conceptDelimiter = conceptDelimiter;
	this.fieldShared = fieldShared;
	this.refreshMergedField = refreshMergedField;

	this.generateQueryANDPartitionFunction = generateQueryANDPartitionFunction;
	this.generateQueryORPartitionFunction = generateQueryORPartitionFunction;
	this.generateQueryTermFunction = generateQueryTermFunction;
	this.queryExpansionCaption = queryExpansionCaption;

	this.qe = [];
	this.toggleQueryExpansion = toggleQueryExpansion;
	
	this.addConcept = addConcept;
	this.addExpandedQuery = addExpandedQuery;
	this.removeConcept = removeConcept;
	this.containsConcept = containsConcept;
	this.size = size;
	
	this.getCollectorDivId = getCollectorDivId;
	this.openOnkiReplace = openOnkiReplace;
	this.init = init;

	function toggleQueryExpansion(onkiId, uri, label, url) {
		if (this.qe[uri])
			this.qe[uri] = false;
		else
			this.qe[uri] = true;
		
		this.onkisearch.addConcept(onkiId, uri, label, url, null, !this.qe[uri]);
	}
	
	function refreshMergedField(mergeQuery) {
		var mergedFieldId;
		var sourceFieldName;
		if (mergeQuery) {
			mergedFieldId = this.id+"_mergedQuery";
			sourceFieldName = this.fieldName;
		}
		else if (this.fieldShared) { // TODO: onko tarpeen?
			mergedFieldId = this.id+"_mergedValue";
			sourceFieldName = this.fieldName+"_tmp";
		}

		if (document.getElementById(mergedFieldId))
			document.getElementById(mergedFieldId).parentNode.removeChild(document.getElementById(mergedFieldId));
		if (document.getElementsByName(sourceFieldName)) {
			var mergedValue = "";
			var fields = document.getElementsByName(sourceFieldName);
			for (var i=0; i<fields.length; ++i) {
				// process only hidden fields
				if (fields[i].getAttribute("type") && fields[i].getAttribute("type") == "hidden") {
					if (mergeQuery)
						mergedValue += this.generateQueryANDPartitionFunction(fields[i].value);
					else if (this.fieldShared) { // TODO: onko tarpeen?
						if (mergedValue != "")
							mergedValue += this.conceptDelimiter;
						mergedValue += fields[i].value;
					}
				}
			}

			if (mergedValue != "") {
				var mergedValueElement = document.createElement("input");
				mergedValueElement.setAttribute("type", "hidden");
				mergedValueElement.setAttribute("name", this.fieldName);
				mergedValueElement.setAttribute("id", mergedFieldId);
				mergedValueElement.setAttribute("value", mergedValue);
				document.getElementById(this.id).parentNode.appendChild(mergedValueElement);
			}
		}
	}
	
	function containsConcept(uri) {
		var div = document.getElementById(this.getCollectorDivId());
		var childs = div.childNodes;
		for(i=0; i<childs.length; i++) {
			node=childs.item(i);
			attributes=node.attributes;
			if (attributes.getNamedItem("uri") != null && attributes.getNamedItem("uri").nodeValue == uri) {
				return true;
			}
		}
		return false;
	}
	
	function addConcept(onkiId, uri, label, url, isExpandedQuery) {
		if (this.containsConcept(uri))
			return;
		if (label == undefined)
			label = uri;
		if (url == undefined || url == null)
			url = uri;
		
		label = unescape(label);
		
		var div = document.getElementById(this.getCollectorDivId());
		var valuediv = document.createElement("div");
		valuediv.setAttribute("uri", uri);
		valuediv.className = "fetched-concept-container";
		
		if (!this.fetchUris)
			valuediv.setAttribute("term", label);

		var inputElem;
		var inputFieldName = this.fieldName;
		if (this.fieldShared)
			inputFieldName += "_tmp";
		
		try {
			inputElem = document.createElement("<input name='"+inputFieldName+"'/>"); // IE
		} catch(e) {};
		if (!inputElem || inputElem.name.toLowerCase() != inputFieldName.toLowerCase()) { // FF
			inputElem = document.createElement("input");
			inputElem.setAttribute("name", inputFieldName);
		}
		
		inputElem.setAttribute("type", "hidden");
		inputElem.className = "hidden-concept-value-field";
		
		var value = "";

		if (this.fetchUris) {
			value = uri;
			if (this.fetchLabels)
				value += this.uriLabelDelimiter;
		}
		
		if (this.fetchLabels)
			value += label;
		
		inputElem.setAttribute("value", value);
		
		valuediv.appendChild(inputElem);

		var spanElem = document.createElement("a");
		
		if (this.onkiFeatures && url)
			spanElem.className = "fetched-concept";
		else
			spanElem.className = "fetched-concept-nolink";
		
		if (!this.fetchUris)
			spanElem.setAttribute("title", label);
		else
			spanElem.setAttribute("title", uri);

		var textNode = document.createTextNode(label);

		if (this.onkiFeatures && url) {
			spanElem.setAttribute("href", url);
		}
		spanElem.appendChild(textNode);
		
		if (this.onkiFeatures && url) {		
			if (spanElem.addEventListener) // for FF
				spanElem.addEventListener("click", new Function("event", this.collectorname + ".openOnkiReplace('"+onkiId+"', '"+uri+"', '"+url+"'); event.stopPropagation(); event.preventDefault();"), false);
			else if (spanElem.attachEvent) // for IE
				spanElem.attachEvent("onclick", new Function("event", this.collectorname + ".openOnkiReplace('"+onkiId+"', '"+uri+"', '"+url+"'); event.cancelBubble=true; event.returnValue=false;"));
		}
		valuediv.appendChild(spanElem);
		
		spanElem = document.createElement("span");
		spanElem.className = "remove-fetched-concept";
		
		if (UILang == 'fi')
			spanElem.setAttribute("title", "Poista käsite");
		else
			spanElem.setAttribute("title", "Remove concept");
		
		textNode = document.createTextNode("x");
		spanElem.appendChild(textNode);
		
		if (spanElem.addEventListener) // for FF
			spanElem.addEventListener("click", new Function(this.collectorname+".removeConcept('"+uri+"')"), false);
		else if (spanElem.attachEvent) // for IE
			spanElem.attachEvent("onclick", new Function(this.collectorname+".removeConcept('"+uri+"')"));

		valuediv.appendChild(spanElem);
		
		if (isExpandedQuery) {
			spanElem = document.createElement("span");
			spanElem.className = "toggle-query-expansion";
			
			if (UILang == 'fi')
				spanElem.setAttribute("title", "Laajennetaanko käsite");
			else
				spanElem.setAttribute("title", "Toggle query expansion");
			
			if (UILang == 'fi')
				textNode = document.createTextNode("(laajenna:");
			else
				textNode = document.createTextNode("(expand: ");
			spanElem.appendChild(textNode);
			
			inputElem = document.createElement("input");
			inputElem.setAttribute("type", "checkbox");
			inputElem.className = "onki-qe-checkbox";
			
			if (this.qe[uri] == undefined || this.qe[uri]) {
				inputElem.setAttribute("checked", "checked");
				this.qe[uri] = true;
			}
			
			if (inputElem.addEventListener) // for FF
				inputElem.addEventListener("click", new Function(this.collectorname+".toggleQueryExpansion('"+onkiId+"', '"+uri+"', '"+label+"', '"+url+"')"), false);
			else if (inputElem.attachEvent) // for IE
				inputElem.attachEvent("onclick", new Function(this.collectorname+".toggleQueryExpansion('"+onkiId+"', '"+uri+"', '"+label+"', '"+url+"')"));
			
			spanElem.appendChild(inputElem);
			
			textNode = document.createTextNode(")");
			spanElem.appendChild(textNode);
			
			valuediv.appendChild(spanElem)
		}

		textNode = document.createTextNode(" ");
		valuediv.appendChild(textNode);
		div.appendChild(valuediv);
		
		if (this.fieldShared)
			this.refreshMergedField(false);
	}

	function addExpandedQuery(uri, title, url, data, onkiId) {
		this.addConcept(onkiId, uri, title, url, true);
			
		var values = "";
		var valuesPrettyPrint = "";
		
		if (!this.fetchUris) {
			for(i=0; i<data.length; i++) {
				if (data[i].title.length != 0) {
					if (i != 0) {
						if (typeof this.generateQueryTermFunction == "function")
							values += " " + generateQueryTermFunction(data[i].title);
						else
							values += " " + data[i].title;
						valuesPrettyPrint += ", " + data[i].title;
					}
					else {
						if (typeof this.generateQueryTermFunction == "function")
							values += generateQueryTermFunction(data[i].title);
						else
							values += data[i].title;
					}
				}
			}
		}
		else {
			for(i=0; i<data.length; i++) {
				if (i != 0) {
					values += " " + data[i].uri;
					valuesPrettyPrint += ", " + data[i].uri;
				}
				else
					values += data[i].uri;
			}
		}

		if (this.queryExpansionCaption)
			valuesPrettyPrint = valuesPrettyPrint.replace(", ", this.queryExpansionCaption+": ");
		else
			valuesPrettyPrint = valuesPrettyPrint.replace(", ", "");
		
		if (typeof this.generateQueryORPartitionFunction == "function")
			values = generateQueryORPartitionFunction(values);

		var div = document.getElementById(this.getCollectorDivId());
		
		var childs = div.childNodes;
		for(i=0; i<childs.length; i++) {
			node=childs.item(i);
			attributes=node.attributes;
			if (attributes.getNamedItem("uri") != null && attributes.getNamedItem("uri").nodeValue == uri) {
				var uriChilds = node.childNodes;
				for(j=0; j<uriChilds.length; j++) {
					childNode=uriChilds.item(j);
					if (childNode.nodeName.toLowerCase() == "input")
						if (childNode.attributes.getNamedItem("value"))
							childNode.attributes.getNamedItem("value").nodeValue = values;
						else
							childNode.setAttribute("value", values);
					else if (childNode.className == "fetched-concept" && valuesPrettyPrint != "")
						if (childNode.attributes.getNamedItem("title"))
							childNode.attributes.getNamedItem("title").nodeValue = valuesPrettyPrint;
						else
							childNode.setAttribute("title", valuesPrettyPrint);
				}
				break;
			}
		}
		
		if (typeof this.generateQueryANDPartitionFunction == "function")
			this.refreshMergedField(true);
		
		if (this.onkiFeatures)
			this.onkisearch.refresh();
	}
	
	function removeConcept(uri) {
		if (!this.containsConcept(uri))
			return;
		var div = document.getElementById(this.getCollectorDivId());
		var childs = div.childNodes;
		var removeNodes = new Array();
		for(i=0; i<childs.length; i++) {
			node=childs.item(i);
			attributes=node.attributes;
			if (attributes.getNamedItem("uri") != null && attributes.getNamedItem("uri").nodeValue == uri) {
				removeNodes.push(node);
			}
		}
		while (removeNodes.length>0) {
			div.removeChild(removeNodes.pop());
		}
		
		if (this.fieldShared)
			this.refreshMergedField(false);
		
		if (typeof this.generateQueryANDPartitionFunction == "function")
			this.refreshMergedField(true);
		
		if (this.qe[uri] != undefined)
			this.qe[uri] = undefined;
		
		if (this.onkiFeatures)
			this.onkisearch.refresh();
	}
	
	function size() {
		var div = document.getElementById(this.getCollectorDivId());
		var childs = div.childNodes;
		var count = 0;
		for(i=0; i<childs.length; i++) {
			node=childs.item(i);
			attributes=node.attributes;
			if (attributes.getNamedItem("uri") != null) {
				count++;
			}
		}
		return count;
	}

	function getCollectorDivId() {
		return this.id+"_collector";
	}

	function openOnkiReplace(onkiId, uri, url) {
		this.onkisearch.openOnkiReplace(onkiId, uri, url);
	}

	// generate a new div for collecting the results
	function init() {	
		if (document.getElementById(this.getCollectorDivId()) == null) {
			var collectordiv = document.createElement("div");
			collectordiv.setAttribute("id", this.getCollectorDivId());
			collectordiv.className = "onkiCollector"; // for IE
			var refnode=document.getElementById(this.id);
			
			refnode.parentNode.insertBefore(collectordiv,refnode);
		}		
	}
	
	this.init();
}

// inform that the script is loaded
var addScriptLoaded;
if (addScriptLoaded != undefined)
	addScriptLoaded();