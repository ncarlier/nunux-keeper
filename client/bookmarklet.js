'use strict';

var kBookmarklet = function() {
  var cid = 'KPR_K__CONTAINER',
      frameId = 'KPR_K__FRAME',
      popup,
      $c = document.getElementById(cid);

  if (!$c) {
    $c = document.createElement('div');
    $c.id = cid;
    $c.style.position = 'fixed';
    $c.style.background = '#fff';
    $c.style.bottom = '20px';
    $c.style.left = '20px';
    $c.style.width = '200px';
    $c.style.height = '200px';
    $c.style.zIndex = 999999999;
    $c.style['box-shadow'] = '#000 4px 4px 20px';
    $c.style['border-radius'] = '4px';
    var $o = document.createElement('div');
    $o.style.height = '120px';
    $o.style.position = 'absolute';
    $o.style.top = '30px';
    $o.style.right = '10px';
    $o.style.width = '180px';
    $o.addEventListener('dragenter', function(e) {
      popup.postMessage('onDragEnter', window.K_REALM);
    }, false);
    $o.addEventListener('dragover', function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      return false;
    }, false);
    $o.addEventListener('dragleave', function(e) {
      popup.postMessage('onDragLeave', window.K_REALM);
    }, false);
    $o.addEventListener('drop', function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      var data = e.dataTransfer.getData("text/html");
      popup.postMessage(data, window.K_REALM);
      return false;
    }, false);
    $c.appendChild($o);
    document.body.appendChild($c);
  }

  var $ifrm = document.createElement('iframe');
  $ifrm.setAttribute('id', frameId);
  $ifrm.setAttribute('name', frameId);
  $ifrm.style.width = '100%';
  $ifrm.style.height = '100%';
  $ifrm.style.border = 'none';

  $c.appendChild($ifrm);

  var url = window.K_REALM+'/bookmarklet?url=' +
    encodeURIComponent(window.location.href) +
    '&title=' + encodeURIComponent(window.document.title);

  popup = window.open(url, frameId);
  if (!popup) alert('Unable to load bookmarklet.');

  var receiveMessage = function(e) {
    if ('close' === e.data && window.K_REALM === e.origin) {
      $c.parentNode.removeChild($c);
    }
  }
  window.addEventListener('message', receiveMessage, false);
  setInterval(function() {
    popup.postMessage('ping', window.K_REALM);
  }, 2000);
}();
