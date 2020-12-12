#!/usr/bin/env python3

import sys
import json
import urllib.request, urllib.parse, urllib.error
import urllib.request, urllib.error, urllib.parse

if '-l' in sys.argv[1:]: # local
  HOST = 'localhost'
else:
  HOST = 'onki.fi'

ONKIKEY='58b159a541ffe839d5372cb57e7faa9d' # key for helsinki.fi
BASEURL='http://%s/key-%s/api/v2/http/' % (HOST, ONKIKEY)

encoder = json.JSONEncoder(sort_keys=True, indent=2)

def call(group, method, params=None, decode_json=True):
  print("--------")
  if decode_json:
    jsoninfo = "JSON"
  else:
    jsoninfo = "Not JSON"
  print("call: %s/%s(%s)" % (group, method, params))
  url = "%s/%s" % (group, method)
  if params:
    url += "?" + urllib.parse.urlencode(params)
  print("URL:", url)
  print("--")
  req = urllib.request.urlopen(BASEURL + url)
  print(req.headers)
  print("Content-type:", req.headers['Content-type'])
  print()
  if decode_json:
    print(encoder.encode(json.load(req)))
  else:
    print(req.read())
  print()

call('onto/kauno', 'search', {'q': 'fluns', 'l': 'fi'})
call('onto/kauno', 'search', {'q': 'kissa', 'l': 'fi', 'ac': 'false'})
call('onto/kauno', 'search', {'q': 'autom', 'l': 'fi', 'ac': 'true'})
call('onto/kauno', 'search', {'q': 'management', 'l': 'en'})

# URI with altLabels
call('onto/kauno', 'getLabels', {'u': 'http://www.yso.fi/onto/yso/p17'})
call('onto/kauno', 'getLabels', {'u': 'http://www.yso.fi/onto/yso/p17', 'l': 'fi'})
call('onto/kauno', 'getLabels', {'u': 'http://www.yso.fi/onto/yso/p17', 'pl': 'fi'})
call('onto/kauno', 'getLabels', {'u': 'http://www.yso.fi/onto/yso/p17', 'l': 'sv', 'pl': 'sv'})
call('onto/kauno', 'getLabels', {'u': 'http://www.yso.fi/onto/yso/p17', 'l': 'en', 'pl': 'en'})
call('onto/kauno', 'getLabels', {'u': 'http://www.yso.fi/onto/yso/p17', 'l': 'fi', 'pl': 'fi'})

# missing URI case
call('onto/yso', 'getLabels', {'u': 'http://www.yso.fi/onto/yso/p1'})

# missing parameter case
call('onto/yso', 'getLabels', {})

# missing parameter case
call('onto/yso', 'getConceptHierarchy', {})

# missing URI case
call('onto/yso', 'getConceptHierarchy', {'u': 'http://www.yso.fi/onto/yso/p1'})


AFO = "http://www.yso.fi/onto/yso/"

for uri in (AFO + "p1", AFO + "p4205", AFO + "p1669", AFO + "p12345"):
  for p in (None, -1, 0, 1, '*'):
    for c in (None, 0, 1, 2):
      for s in (None, 0, 1):
        params = {'u': uri}
        if p is not None: params['p'] = p
        if c is not None: params['c'] = c
        if s is not None: params['s'] = s
        print(params)
        call('onto/afo', 'getConceptHierarchy', params)
        

