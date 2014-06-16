<?php

$path = $_SERVER['PATH_INFO']; // esim. "/search"
$parts = explode('/', $path);
header("Access-Control-Allow-Origin: *"); // enable CORS for the whole REST API
header("Content-type: application/json;charset=UTF-8");
$rest = new OnkiRestServer();

function return_error($code, $status, $message="") {
  header("HTTP/1.0 $code $status");
  header("Content-type: text/plain");
  echo "$code $status" . ($message ? ": " . $message : "");
  exit();
}

if (sizeof($parts) < 2) return_error(400, "Bad Request");
$group = $parts[1];
                  
try {
  if ($group == "") {
    return_error("404", "Not Found");
  } elseif ($group == "repo") {
    if (sizeof($parts) < 3) return_error(404, "Not Found");
    $method = $parts[2];
    if (in_array($method, array('search','languages','ontologies'))) {
      error_log("Warning: Request to unimplemented ONKI HTTP method repo/$method", E_USER_WARNING);
      return_error(501, "Not Implemented", "Method not implemented in Finto wrapper");
    }
    return_error(404, "Not Found");
  } elseif ($parts[1] == 'onto' && sizeof($parts) >= 3) {
    $vocab = $parts[2];
    $method = $parts[3];
    if ($method === "search") {
      echo($rest->search($vocab));
    } elseif ($method === "getConceptHierarchy") {
      echo($rest->getConceptHierarchy($vocab));
    } elseif ($method === "getLabels") {
      echo($rest->getLabels($vocab));
    } elseif (in_array($method, array(
      'ping',
      'getMetadata',
      'getAvailableLanguages',
      'getAvailableTypeUris',
      'getHierarchyRoots',
      'getProperties',
      'getAltLabels',
      'getDescriptions',
      'getEquivalentConcepts',
      'getRelatedConcepts',
      'getGroups',
      'getTypes',
      'getFullPresentation',
      'getDirectory'
    ))) {
      error_log("Warning: Request to unimplemented ONKI HTTP method onto/$vocab/$method", E_USER_WARNING);
      return_error(501, "Not Implemented", "Method not implemented in Finto wrapper");
    } else {
      return_error(404, "Not Found");
    }
  }
}
catch (Exception $e){
  return_error(500, "Internal Server Error", $e->getMessage());
}

class OnkiRestServer {
  private $rest_base;
  
  public function __construct() {
    $this->rest_base = $_GET['rest_base'];
  }

  public function rest_call($vocid, $method, $params=null) {
    $qstr = $params ? '?' . http_build_query($params) : '';
    $curl = curl_init();
    $url = $this->rest_base . $vocid . "/" . $method . $qstr;
    curl_setopt_array($curl, array(
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_URL => $url,
      CURLOPT_USERAGENT => "ONKI Legacy HTTP API wrapper",
    ));
    $result = curl_exec($curl);
    $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    if ($code !== 200) return null;
    return json_decode($result, true);
  }
  
  private function compareLabels($a, $b) {
    return strcasecmp($a['label'], $b['label']);
  }

  private function comparePrefLabels($a, $b) {
    return strcasecmp($a['prefLabel'], $b['prefLabel']);
  }

  private function getChildren($vocab, $params, $levels) {
    $ret = array();
    $data = $this->rest_call($vocab, "narrower", $params);
    if ($data !== null) {
      $childResponse = $data['narrower'];
      usort($childResponse, array($this, "comparePrefLabels"));
      foreach ($childResponse as $concept) {
        $row = array(
          'indent' => -1,
          'conceptUri' => $concept['uri'],
          'label' => $concept['prefLabel'],
          'parentUri' => $params['uri'],
        );
        $ret[] = $row;
        if ($levels > 1) {
          // make a recursive call for grandchildren
          $chparams = $params;
          $chparams['uri'] = $concept['uri'];
          $grandchildren = $this->getChildren($vocab, $chparams, $levels - 1);
          $ret = array_merge($ret, $grandchildren);
        }
      }
    }
    return $ret;
  }

  public function getConceptHierarchy($vocab) {
    $uri = null;
    $parent = null;
    $superConcepts = -1; 
    $children = 1;
    $showSiblings = 1;
    $ret = array();
    
    $params = array('format'=>'application/json','uri'=>'');
    if (isset($_GET['u'])) {
      $uri = $_GET['u'];
      $params['uri'] = $uri;
    }
    if (isset($_GET['s']))
      $showSiblings = $_GET['s'];
    if (isset($_GET['p']))
      $superConcepts = ($_GET['p'] == '*') ? -1 : $_GET['p'];
    if (isset($_GET['l']))
      $params['lang'] = $_GET['l'];
    if (isset($_GET['c']))
      $children = $_GET['c'];

    $data = $this->rest_call($vocab, "hierarchy", $params);
    $response = (array) $data['broaderTransitive'];
    if ($uri && count($response) == 0 && $superConcepts != 0) {
      // non-existing URI - emulate ONKI3 HTTP API behavior
      $ret[] = array('conceptUri' => $uri, 'indent' => 0);
    }

    // start from requested concept
    $curr_uri = $uri;
    $level = 0;
    do {
      if (isset($response[$curr_uri])) {
        $concept = $response[$curr_uri];
      } else {
        break;
      }

      $row = array(
        'indent' => null, // placeholder, to be overwritten below
        'conceptUri' => $concept['uri'],
        'label' => $concept['prefLabel'],
      );
      
      if (isset($concept['broader'])) {
        $row['parentUri'] = $concept['broader'][0];
        $curr_uri = $row['parentUri'];
      } else {
        $curr_uri = null;
      }
      
      $ret[] = $row;
      ++$level;
    } while ($curr_uri != null);
    
    // reverse and number by indent level
    $ret = array_reverse($ret);
    foreach (array_keys($ret) as $idx) {
      $ret[$idx]['indent'] = $idx;
    }

    // cut to size, if superConcepts limit ("p" parameter) was set
    switch ($superConcepts) {
      case -1: // everything
        break;
      case 0: // nothing
        $ret = array();
        break;
      default: // N levels up
        $ret = array_slice($ret, -1-$superConcepts, $superConcepts + 1);
    }
    
    $siblingArray = array();
    
    if ($showSiblings == 1) {
      // dig up siblings, if requested
      if (isset($response[$uri]['broader'])) {
        $parent_uri = $response[$uri]['broader'][0];
        $parent = $response[$parent_uri];
      } else {
        $parent_uri = null;
        $parent = null;
      }

      if ($parent !== null && isset($parent['narrower'])) {
        usort($parent['narrower'], array($this, "compareLabels"));
        foreach ($parent['narrower'] as $concept) {
          if ($concept['uri'] == $uri) continue;
          $row = array(
            'indent' => -1,
            'conceptUri' => $concept['uri'],
            'label' => $concept['label'],
            'parentUri' => $parent['uri']
          );
          array_push($siblingArray, $row);
        }
      }
    }

    if(isset($children) && $children > 0) {
      $childrenArray = $this->getChildren($vocab, $params, $children);
      $siblingArray = array_merge($siblingArray, $childrenArray);
    }

    $ret = array_merge($ret, $siblingArray);
    return json_encode($ret);
  }

  public function search($vocab) {
    $params = array();
    if (isset($_GET['q']))
      $params['query'] = $_GET['q'];
    if (isset($_GET['l']))
      $params['lang'] = $_GET['l'];
    if (isset($_GET['qt']))
      $params['type'] = $_GET['qt'];
    if (isset($_GET['qp']))
      $params['parent'] = $_GET['qp'];
    if (isset($_GET['qg']))
      $params['group'] = $_GET['qg'];

    $search_offset = 0;
    $search_limit = 50; // default limit in ONKI3 HTTP API
    if (isset($_GET['h']))
      $search_limit = intval($_GET['h']);
    if (isset($_GET['s']))
      $search_offset = intval($_GET['s']) - 1;
    if (!isset($_GET['ac']) || $_GET['ac'] == "true")
      $params['query'] .= '*';
    
    $data = $this->rest_call($vocab, "search", $params);
    $results = array();
    foreach ($data['results'] as $concept) {
      $vocab = isset($concept['exvocab']) ? $concept['exvocab'] : $concept['vocab'];
      $result = array(
        'namespacePrefix' => $vocab,
        'label' => $concept['prefLabel'],
        'uri' => $concept['uri'],
        'serkki' => $vocab . ':' . $concept['prefLabel']
      ); 
      if (isset($concept['altLabel']))
        $result['altLabel'] = $concept['altLabel'];
      $results[] = $result;
    }

    // implement maximum results parameter
    // (have to do it after REST call to find out the real number of hits)
    $sliced = array_slice($results, $search_offset, $search_limit);
    $response = array(
      'results' => $sliced,
      'metadata' => array(
        'containingHitsAmount' => sizeof($sliced),
        'moreHitsAmount' => sizeof($results) - sizeof($sliced) - $search_offset,
      ),
    );
    return (json_encode($response));
  }

  public function getLabels($vocab) {
    $concept_lang = null;
    $property_uri = null;
    $property_lang = null;
    $ret = array();
    $params = array('format'=>'application/json','uri'=>'');
    if (isset($_GET['u']))
      $params['uri'] = $_GET['u'];
    if (isset($_GET['l']))
      $concept_lang = $_GET['l'];
    if (isset($_GET['pl']))
      $property_lang = $_GET['pl'];
    elseif ($vocab === 'allars')
      $property_lang = 'sv';
    $data = $this->rest_call($vocab, "data", $params);
    if(isset($data['graph'])) {
      foreach ($data['graph'] as $res) {
        if ($res['uri'] != $params['uri']) continue; // find the right resource
        if (isset($res['prefLabel'])) {
          $label = 'Asiasana';
          if (isset($property_lang) && $property_lang === 'sv')
            $label = 'Ämnesord';
          elseif (isset($property_lang) && $property_lang === 'en')
            $label = 'Label';
          foreach ($res['prefLabel'] as $prefLabel) {
            $row = array (
              // should we use "http://www.yso.fi/onto/yso-meta/2007-03-02/prefLabel" instead?
              'propertyUri' => 'http://www.w3.org/2004/02/skos/core#prefLabel',
              'propertyLabel' => $label,
              'label' => $prefLabel['value'],
              'lang' => $prefLabel['lang']
            ); 
            if (!isset($concept_lang) || $concept_lang === $prefLabel['lang'])
              array_push($ret, $row);
          }
        }
      }
    }
    return json_encode($ret);
  }

  private function changeLabels($results) {
    $ret = array();
    $results = $results->results;
    $metadata = array(
      'containingHitsAmount' => sizeof($ret),
      'moreHitsAmount' => 0 
    );
    $results = array(
      'results' => $ret,
      'metadata' => $metadata 
    );
    return $results;
  }
}

?>
