<?php

// use Composer dependencies
require 'vendor/autoload.php';

// hardwired property names
$RESOURCELABELS = array(
  'http://www.w3.org/2004/02/skos/core#Concept' => array(
    'fi' => 'Käsite',
    'sv' => 'Begrepp',
    'en' => 'Concept',
  ),
  'http://www.w3.org/2004/02/skos/core#Collection' => array(
    'fi' => 'Kokoelma',
    'sv' => 'Kollektion',
    'en' => 'Collection',
  ),
  'http://www.w3.org/2004/02/skos/core#prefLabel' => array(
    'fi' => 'Asiasana',
    'sv' => 'Ämnesord',
    'en' => 'Label',
  ),
  'http://www.w3.org/2004/02/skos/core#altLabel' => array(
    'fi' => 'Korvaa asiasanan',
    'sv' => 'Ersätter ämnesordet',
    'en' => 'Alternative label',
  ),
  'http://www.w3.org/2004/02/skos/core#related' => array(
    'fi' => 'Lähikäsite',
    'sv' => 'Relaterat begrepp',
    'en' => 'Related concept',
  ),
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => array(
    'fi' => 'tyyppi',
    'sv' => 'typ',
    'en' => 'type',
  ),
  'http://www.w3.org/2004/02/skos/core#broader' => array(
    'fi' => 'yläkäsite',
    'sv' => 'överordnat begrepp',
    'en' => 'superordinate concept',
  ),
  'http://www.w3.org/2004/02/skos/core#inScheme' => array(
    'fi' => 'kuuluu käsitteistöön',
    'sv' => 'hör till begreppsschemat',
    'en' => 'is in concept scheme',
  ),
  'http://www.w3.org/2004/02/skos/core#closeMatch' => array(
    'fi' => 'Lähes vastaava käsite',
    'sv' => 'Nästan motsvarande begrepp',
    'en' => 'Closely matching concept',
  ),
  'http://www.w3.org/2004/02/skos/core#exactMatch' => array(
    'fi' => 'Vastaava käsite',
    'sv' => 'Motsvarande begrepp',
    'en' => 'Matching concept',
  ),
);

// type mappings to support legacy types
$TYPEMAP = array(
  'http://www.yso.fi/onto/yso-meta/2007-03-02/Concept' => 'http://www.w3.org/2004/02/skos/core#Concept',
);

class Response {
  public $out;
  
  public function __construct($out) {
    $this->out = $out;
  }
}

class getAvailableLanguagesResponse extends Response { }
class getAvailableTypeUrisResponse extends Response { }
class searchResponse extends Response { }
class getLabelResponse extends Response { }
class expandQueryResponse extends Response { }
class getPropertiesResponse extends Response { }
class getConceptTreeResponse extends Response { }

class OnkiQueryResults {
  public $metadata;
  public $results;
}

class OnkiQueryResultsMetadata {
  public $containingHitsAmount;
  public $moreHits;
  public $moreHitsAmount;
  public $totalHitsAmount;
}

class OnkiQueryResult {
  public $altLabel;
  public $namespacePrefix;
  public $serkki;
  public $title;
  public $uri;
}

class Statement {
  public $label;
  public $lang;
  public $predicateLabel;
  public $predicateUri;
  public $uri;
  public $value;
}

class OnkiHierarchyRelation {
  public $conceptUri;
  public $indent;
  public $label;
  public $parentUri;
}

class OnkiSoapServer {
  private $rest_base;
  private $vocid;
  
  public function __construct() {
    $this->rest_base = $_GET['rest_base'];
    $this->vocid = $_GET['vocid'];
  }

  private function get_http($url) {
    $curl = curl_init();
    curl_setopt_array($curl, array(
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_URL => $url,
      CURLOPT_USERAGENT => "ONKI Legacy SOAP API wrapper",
    ));
//    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Pragma: no-cache'));
    $result = curl_exec($curl);
    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    if ($code !== 200) return null;
    return $result;
  }

  private function rest_call($method, $params=null) {
    $qstr = $params ? '?' . http_build_query($params) : '';
    $url = $this->rest_base . $this->vocid . "/" . $method . $qstr;
    $result = $this->get_http($url);
    if ($result === null) return null;
    return json_decode($result, true);
  }
  
  private function load_rdf($uri) {
    $qstr = "?" . http_build_query(array('uri'=>$uri,'format'=>'text/turtle'));
    $url = $this->rest_base . $this->vocid . "/" . "data" . $qstr;
    $result = $this->get_http($url);
    if ($result === null) return null;
    $graph = new EasyRdf_Graph();
    $graph->parse($result, 'turtle');
    return $graph;
  }

  private function compareLangsAndPredicateLabels($a, $b) {
    if ($a->lang == $b->lang)
      return strcasecmp($a->predicateLabel, $b->predicateLabel);
    return strcasecmp($a->lang, $b->lang);
  }

  function getAvailableLanguages() {
    $data = $this->rest_call("");
    return new getAvailableLanguagesResponse($data['languages']);
  }

  function getAvailableTypeUris() {
    $data = $this->rest_call("types");
    $typeuris = array();
    foreach ($data['types'] as $type) {
      $typeuris[] = $type['uri'];
    }
    return new getAvailableLanguagesResponse($typeuris);
  }
  
  function search($params) {
    global $TYPEMAP;
  
    $q = $params->in0;
    $lang = $params->in1;
    $max = intval($params->in2);
    $max = $max > 0 ? $max : 50; // default limit in ONKI3 SOAP API
    
    if ($params->in3 !== null) {
      $type = $params->in3->string;
      if (is_array($type)) {
        if (count($type) > 1) {
          error_log("Warning: Request to ONKI SOAP search method with " . count($type) . " type restrictions");
        }
        $type = $type[0]; // FIXME discarded others
      }
      if (array_key_exists($type, $TYPEMAP))
        $type = $TYPEMAP[$type];
    } else {
      $type = null;
    }

    if ($params->in4 !== null) {
      $parent = $params->in4->string;
      if (is_array($parent)) {
        if (count($parent) > 1) {
          error_log("Warning: Request to ONKI SOAP search method with " . count($parent) . " parent restrictions");
        }
        $parent = $parent[0]; // FIXME discarded others
      }
    } else {
      $parent = null;
    }

    if ($params->in5 !== null) {
      $group = $params->in5->string;
      if (is_array($group)) {
        if (count($group) > 1) {
          error_log("Warning: Request to ONKI SOAP search method with " . count($group) . " group restrictions");
        }
        $group = $group[0]; // FIXME discarded others
      }
    } else {
      $group = null;
    }
    
    $params = array(
      'query' => $q . "*", // always do prefix search
    );
    if ($lang) $params['lang'] = $lang;
    if ($type) $params['type'] = $type;
    if ($parent) $params['parent'] = $parent;
    if ($group) $params['group'] = $group;

    $data = $this->rest_call('search', $params);

    $results = array();
    $seen_uris = array();
    foreach($data['results'] as $res) {
      $result = new OnkiQueryResult();
      if (isset($res['altLabel'])) $result->altLabel = $res['altLabel'];
      $result->namespacePrefix = isset($res['exvocab']) ? $res['exvocab'] : $res['vocab'];
      $result->serkki = $res['prefLabel'];
      $result->title = $res['prefLabel'];
      $result->uri = $res['uri'];
      if (!in_array($res['uri'], $seen_uris)) {
        $results[] = $result;
        $seen_uris[] = $res['uri'];
      }
    }
    
    // implement maximum results parameter
    // (have to do it after REST call to find out the real number of hits)
    if ($max)
      $sliced = array_slice($results, 0, $max);
    else
      $sliced = $results;

    $metadata = new OnkiQueryResultsMetadata();
    $metadata->containingHitsAmount = sizeof($sliced);
    $metadata->moreHits = (sizeof($results) > sizeof($sliced));
    $metadata->moreHitsAmount = sizeof($results) - sizeof($sliced);
    $metadata->totalHitsAmount = sizeof($results);

    $ret = new OnkiQueryResults();
    $ret->metadata = $metadata;
    $ret->results = $sliced;
    
    return new searchResponse($ret);
  }
  
  function getLabel($params) {
    $uri = $params->in0;
    $lang = $params->in1;
    $data = $this->rest_call("label", array('uri'=>$uri,'lang'=>$lang));
    $result = new OnkiQueryResult();
    $result->altLabel = null;
    $result->namespacePrefix = null;
    $result->serkki = null;
    if (isset($data['prefLabel'])) {
      $result->title = $data['prefLabel'];
      $result->uri = $uri;
    } else { // maybe a replaced concept?
      $graph = $this->load_rdf($uri);
      if ($graph !== null) {
        $res = $graph->resource($uri);
        $replacement = $res->getResource('dc:isReplacedBy');
        if ($replacement !== null) {
          $result->title = $replacement->label($lang);
          $result->uri = $replacement->getUri();
        }
      }
    }
    return new getLabelResponse($result);
  }
  
  function expandQuery($params) {
    $uris = $params->in0->string;
    if (!is_array($uris)) $uris = array($uris);
    $lang = $params->in1;
    $max = intval($params->in2);
    $max = $max > 0 ? $max : 50; // default limit in ONKI3 SOAP API
    $types = ($params->in3 !== null && isset($params->in3->string)) ? $params->in3->string : array();
    
    $hits = array();
    foreach ($uris as $uri) {
      $data = $this->rest_call('narrowerTransitive', array('uri'=>$uri,'lang'=>$lang));
      if ($data === null) continue; // probably invalid URI
      foreach ($data['narrowerTransitive'] as $curi => $cdata) {
        $graph = $this->load_rdf($curi);
        $res = $graph->resource($curi);
        
        if (count($types) > 0) { // check that the concept type is a requested one
          $ctypes = $res->allResources('rdf:type');
          if (count(array_intersect($types, $ctypes)) == 0) continue; // is not!
        }

        $result = new OnkiQueryResult();
        $result->altLabel = null;
        $result->namespacePrefix = null;
        $result->serkki = $cdata['prefLabel'];
        $result->title = $cdata['prefLabel'];
        $result->uri = $curi;
        $hits[] = $result;
        
        foreach ($res->allLiterals('skos:altLabel', $lang) as $literal) {
          $altres = clone $result;
          $altres->altLabel = $literal->getValue();
          $hits[] = $altres;
        }
      }
    }
    
    // limit maximum hits
    $sliced = array_slice($hits, 0, $max);
    
    $metadata = new OnkiQueryResultsMetadata();
    $metadata->containingHitsAmount = sizeof($sliced);
    $metadata->moreHits = sizeof($hits) > sizeof($sliced);
    $metadata->moreHitsAmount = sizeof($hits) - sizeof($sliced);
    $metadata->totalHitsAmount = sizeof($hits);
    
    $results = new OnkiQueryResults();
    $results->metadata = $metadata;
    $results->results = $hits;
    
    return new expandQueryResponse($results);
  }

  private function getResourceLabel($propuri, $lang, $graph) {
    global $RESOURCELABELS;
  
    $proplabel = null;
    if (isset($RESOURCELABELS[$propuri])) {
      $plang = isset($RESOURCELABELS[$propuri][$lang]) ? $lang : 'fi';
      $proplabel = $RESOURCELABELS[$propuri][$plang];
    }
    if ($proplabel == null) // not found here, search in graph as well
      $proplabel = $graph->resource($propuri)->label($lang);
    return $proplabel;
  }
  
  function getProperties($params) {
    $uri = $params->in0;
    $props = $params->in1 !== null ? $params->in1->string : array();
    if (!is_array($props)) $props = array($props);
    $lang = $params->in2;
    if ($lang === '') $lang = null;

    $literalResults = array();
    $resourceResults = array();

    $graph = $this->load_rdf($uri);
    $res = $graph->resource($uri);
    foreach ($res->propertyUris() as $propuri) {
      if (count($props) > 0 && !in_array($propuri, $props)) continue; // skip unwanted props
      $prop = "<$propuri>";
      
      // statements with literal value
      foreach ($res->allLiterals($prop) as $literal) {
        $result = new Statement();
        $result->label = null;
        $result->lang = $literal->getLang();
        $result->predicateLabel = $this->getResourceLabel($propuri, $lang, $graph);
        $result->predicateUri = $propuri;
        $result->uri = null;
        $result->value = $literal->getValue();
        $literalResults[] = $result;
      }
      
      // statements with resource value
      foreach ($res->allResources($prop) as $resource) {
        $result = new Statement();
        $result->label = $this->getResourceLabel($resource->getUri(), $lang, $graph);
        $result->lang = null;
        $result->predicateLabel = $this->getResourceLabel($propuri, $lang, $graph);
        $result->predicateUri = $propuri;
        $result->uri = $resource->getUri();
        $result->value = null;
        $resourceResults[] = $result;
      }
    }

    usort($literalResults, array($this, "compareLangsAndPredicateLabels"));
    usort($resourceResults, array($this, "compareLangsAndPredicateLabels"));
    $results = array_merge($literalResults, $resourceResults);

    return new getPropertiesResponse($results);
  }
  
  private function descend($uri, &$closure, &$narrowers, &$results, $parent=null, $indent=0) {
    $conc = $closure[$uri];

    $result = new OnkiHierarchyRelation();
    $result->conceptUri = $uri;
    $result->indent = $indent;
    $result->label = $conc['prefLabel'];
    $result->parentUri = $parent;
    $results[] = $result;

    if (isset($narrowers[$uri])) {
      sort($narrowers[$uri]);
      foreach ($narrowers[$uri] as $nuri) {
        $this->descend($nuri, $closure, $narrowers, $results, $uri, $indent+1);
      }
    }
  }

  function getConceptTree($params) {
    $uri = $params->in0;
    $lang = $params->in1;
    
    $results = array();
    $data = $this->rest_call('broaderTransitive', array('uri'=>$uri, 'lang'=>$lang));
    if ($data === null) { // failed, probably a missing concapt
      $result = new OnkiHierarchyRelation();
      $result->conceptUri = $uri;
      $result->indent = 0;
      return new getConceptTreeResponse(array($result));
    }

    $closure = $data['broaderTransitive'];
    
    // determine the narrower concepts and roots
    $narrowers = array();
    $roots = array();
    foreach ($closure as $uri => $cdata) {
      if (isset($cdata['broader'])) {
        foreach ($cdata['broader'] as $buri) {
          $narrowers[$buri][] = $uri;
        }
      } else {
        $roots[] = $uri;
      }
    }

    foreach($roots as $root) {
      $this->descend($root, $closure, $narrowers, $results);
    }
    
    return new getConceptTreeResponse($results);
  }

}

$classmap = array(
  'getAvailableLanguagesResponse'=>'getAvailableLanguagesResponse',
  'getAvailableTypeUrisRespone'=>'getAvailableTypeUrisResponse',
  'searchResponse'=>'searchResponse',
  'expandQueryResponse'=>'expandQueryResponse',
  'getLabelResponse'=>'getLabelResponse',
  'getPropertiesResponse'=>'getPropertiesResponse',
  'getConceptTreeResponse'=>'getConceptTreeResponse',
  'OnkiQueryResults'=>'OnkiQueryResults',
  'OnkiQueryResultsMetadata'=>'OnkiQueryResultsMetadata',
  'OnkiQueryResult'=>'OnkiQueryResult',
  'Statement'=>'Statement',
  'OnkiHierarchyRelation'=>'OnkiHierarchyRelation',
);

$server = new SoapServer('onki.wsdl',array('classmap'=>$classmap));
$server->setClass("OnkiSoapServer");
$server->handle();
