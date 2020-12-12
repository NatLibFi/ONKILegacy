ONKILegacy
==========

ONKI Legacy API support using Skosmos REST API

## Installing
```
apt install php7.2-soap
cd soap
php composer.phar self-update
php composer.phar install
```
Running tests:
```
pip3 install suds-py3
```

Additionally the following (partial) virtual host configuration may be of use:
```
# map /rest to REST API calls
RewriteEngine On
RewriteRule ^/rest/v1/(.*) /var/www/$SKOSMOS_PATH/rest.php/$1

# Rule for HTTP method calls
RewriteRule ^/key-.*/api/v2/http/(.*) /http/http.php/$1?rest_base=$SKOSMOS_API_URL/rest/v1/ [QSA]

# Rule for SOAP method calls
RewriteRule ^/key-.*/api/v1/soap/(.*) /soap/soap.php?vocid=$1&rest_base=$SKOSMOS_API_URL/rest/v1/

# Rule for WSDL file requests (note: query string parameters are preserved)
RewriteRule ^/api/v1/soap/wsdl/$ /soap/onki-wsdl.php?h=$LEGACY_URL [QSA]

# allow caching of static resources for one day
<FilesMatch "(Onki|Create|Concept|Generate|engine).*\.js">
    ExpiresActive On
    ExpiresDefault "access plus 1 day"
</FilesMatch>
```
