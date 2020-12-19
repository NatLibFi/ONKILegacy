function showLanguage(lang) {
  var elems = document.getElementsByTagName('*');
  for (var i=0; i<elems.length; i++) {
    if (elems[i].className.indexOf('lang') == 0) {
      if (elems[i].className.substr(4,1) == '-') {
    	var otherClass = "";
      	if (elems[i].className.indexOf(' ') != -1)
      		otherClass = elems[i].className.substr(elems[i].className.indexOf(' '));
        if (elems[i].className.substr(5,2) == lang) {
          //elems[i].className=elems[i].className.substr(0,7)+'-shown';
          elems[i].className=elems[i].className.substr(0,7)+'-shown'+otherClass;
          //elems[i].style.display = '';
        } else {
            //elems[i].className=elems[i].className.substr(0,7)+'-hidden';
        	elems[i].className=elems[i].className.substr(0,7)+'-hidden'+otherClass;
        	//elems[i].style.display = 'None';
        }
      } else if (elems[i].className.substr(4,5) == 'menu-') {
        if (elems[i].className.substr(9,2) == lang) {
          elems[i].className=elems[i].className.substr(0,11)+'-selected';
        } else {
          elems[i].className=elems[i].className.substr(0,11);
        }
      }
    }
  }
}