#!/usr/bin/env python

import sys
from suds.client import Client
import logging
logging.basicConfig(level=logging.INFO)

if '-d' in sys.argv[1:]: # set debug mode
  logging.getLogger('suds.client').setLevel(logging.DEBUG)

if '-l' in sys.argv[1:]: # use localhost
  HOST = 'localhost'
else:
  HOST = 'onki.fi'

ONKIKEY='58b159a541ffe839d5372cb57e7faa9d' # key for helsinki.fi
#ONKIKEY='ea1c442fa239f4d6545abe0d763099ec' # key for elisa-laajakaista.fi

class SoapTest:
  def __init__(self, vocab):
    url = 'http://%s/api/v1/soap/wsdl/?o=%s&k=%s' % (HOST, vocab, ONKIKEY)
    self.client = Client(url)

  def testGetAvailableLanguages(self):
    print "getAvailableLanguages():"
    print "\n".join(sorted(self.client.service.getAvailableLanguages().string))
    print

  def testGetAvailableTypeUris(self):
    print "getAvailableTypeUris():"
    print "\n".join(sorted(self.client.service.getAvailableTypeUris().string))
    print

  def testGetLabel(self, uri, lang):
    print "getLabel('%s','%s'):" % (uri, lang)
    print self.client.service.getLabel(uri, lang)
    print

  def testSearch(self, term, lang, _type=None, parent=None, group=None, limit=10):
    print "search('%s','%s', %s, %s, %s):" % (term, lang, repr(_type), repr(parent), repr(group))
    if _type is not None:
      _typearr = self.client.factory.create('ArrayOfString')
      for t in _type:
        _typearr.string.append(t)
      _type = _typearr
    print self.client.service.search(term, lang, limit, _type, parent, group)
    print

  def testExpandQuery(self, uris, limit=10, types=[]):
    print "expandQuery(%s, %s):" % (repr(uris), repr(types))
    if not isinstance(uris, list): uris = [uris]
    arr = self.client.factory.create('ArrayOfString')
    for uri in uris:
      arr.string.append(uri)
    typearr = self.client.factory.create('ArrayOfString')
    for t in types:
      typearr.string.append(t)
    print self.client.service.expandQuery(arr, "fi", limit, typearr)
    print

  def testGetProperties(self, uri, lang):
    print "getProperties('%s', '%s'):" % (uri, lang)
    arr = self.client.factory.create('ArrayOfString')
    print self.client.service.getProperties(uri, None, lang)
    print

  def testGetConceptTree(self, uri):
    print "getConceptTree('%s'):" % uri
    print self.client.service.getConceptTree(uri, 'fi')
    print

yso = SoapTest('yso')
yso.testSearch('oh', 'fi', _type=['http://www.w3.org/2004/02/skos/core#Concept'])
yso.testSearch('oh', 'fi', _type=['http://www.yso.fi/onto/yso-meta/2007-03-02/Concept'])

ysa = SoapTest('ysa')
ysa.testSearch('a', 'fi', limit=None)
ysa.testSearch('helsinki', 'fi')
ysa.testSearch('helsinki', 'fi', _type=['http://www.yso.fi/onto/ysa-meta/GeographicalConcept'])
ysa.testSearch('helsinki', 'fi', _type=['http://www.yso.fi/onto/ysa-meta/GeographicalConcept', 'http://www.w3.org/2004/02/skos/core#Concept'])

kauno = SoapTest('kauno')

kauno.testGetAvailableLanguages()
kauno.testGetAvailableTypeUris()
kauno.testGetLabel('http://www.yso.fi/onto/yso/p17', 'fi')

kauno.testSearch('flunss', 'fi')
kauno.testSearch('auto', None)
kauno.testSearch('management', 'en')

kauno.testGetProperties('http://www.yso.fi/onto/yso/p12', 'fi')
kauno.testGetProperties('http://www.yso.fi/onto/yso/p12', 'sv')
kauno.testGetProperties('http://www.yso.fi/onto/yso/p12', 'en')
kauno.testGetProperties('http://www.yso.fi/onto/yso/p12', None)

# missing URI
kauno.testGetConceptTree('http://www.yso.fi/onto/yso/nothere')

# toplevel: yso-kasitteet
kauno.testGetConceptTree('http://www.yso.fi/onto/yso/p4205')

# normal, deep in tree: lastenvaunut
kauno.testGetConceptTree('http://www.yso.fi/onto/yso/p12345')

# multiple inheritance: porkkana
kauno.testGetConceptTree('http://www.yso.fi/onto/yso/p5066')

# multiple inheritance above: maistraatit
kauno.testGetConceptTree('http://www.yso.fi/onto/yso/p13286')

puho = SoapTest('puho')
puho.testGetConceptTree('http://www.yso.fi/onto/yso/p11671')


koko = SoapTest('koko')

koko.testGetAvailableTypeUris()


# simple case: only the concept itself "organisaatiorikokset"
koko.testExpandQuery('http://www.yso.fi/onto/koko/p10278')

# missing URI case
koko.testExpandQuery('http://www.yso.fi/onto/koko/nothere')

# altLabel case: "hiukkasfysiikka"
koko.testExpandQuery('http://www.yso.fi/onto/koko/p18876')

# expansion case: "liharuoat"
koko.testExpandQuery('http://www.yso.fi/onto/koko/p27')

# selective expansion case: "aurat" (YSO only)
koko.testExpandQuery('http://www.yso.fi/onto/koko/p33933', types=[
  'http://www.yso.fi/onto/koko-meta/YSOConcept',
  'http://www.yso.fi/onto/koko-meta/AFOConcept',
  'http://www.yso.fi/onto/yso-meta/2007-03-02/Concept',
  'http://www.yso.fi/onto/afo/AFOConcept',
])

# limit case: yso-kasitteet
koko.testExpandQuery('http://www.yso.fi/onto/koko/p31516', limit=20)

koko.testGetConceptTree('http://www.yso.fi/onto/koko/p37038')

koko.testGetLabel('http://www.yso.fi/onto/koko/p72167', 'fi')

koko.testGetProperties('http://www.yso.fi/onto/koko/p72167', 'fi')

# replaced concept
koko.testGetLabel('http://www.yso.fi/onto/koko/p10093', 'fi')

# nonexistent
koko.testGetLabel('http://www.yso.fi/onto/koko/p-not-here', 'fi')
