'use strict';

var K_CONTAINER = 'KPR_K__CONTAINER',
    K_FRAME = 'KPR_K__FRAME',
    K_POPUP;
var c = document.getElementById(K_CONTAINER);
if (!c) {
  c = document.createElement('div');
  c.id = K_CONTAINER;
  c.style.position = 'fixed';
  c.style.background = '#fff';
  c.style.bottom = '20px';
  c.style.left = '20px';
  c.style.width = '200px';
  c.style.height = '200px';
  c.style.zIndex = 999999999;
  c.style['box-shadow'] = '#000 4px 4px 20px';
  c.style['border-radius'] = '4px';
  var o = document.createElement('div');
  o.style.height = '120px';
  o.style.position = 'absolute';
  o.style.top = '30px';
  o.style.right = '10px';
  o.style.width = '180px';
  o.addEventListener('dragenter', function(e) {
    K_POPUP.postMessage('onDragEnter', window.K_REALM);
  }, false);
  o.addEventListener('dragover', function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  }, false);
  o.addEventListener('dragleave', function(e) {
    K_POPUP.postMessage('onDragLeave', window.K_REALM);
  }, false);
  o.addEventListener('drop', function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    var data = e.dataTransfer.getData("text/html");
    K_POPUP.postMessage(data, window.K_REALM);
    return false;
  }, false);
  c.appendChild(o);
  document.body.appendChild(c);
}

var ifrm = document.createElement('iframe');
ifrm.setAttribute('id', K_FRAME);
ifrm.setAttribute('name', K_FRAME);
ifrm.style.width = '100%';
ifrm.style.height = '100%';
ifrm.style.border = 'none';

c.appendChild(ifrm);

var u = window.K_REALM+'/bookmarklet?url=' + encodeURIComponent(window.location.href);

K_POPUP = window.open(u, K_FRAME);
if (!K_POPUP) alert('Unable to load bookmarklet.');

function receiveMessage(event) {
  if ('close' === event.data && window.K_REALM === event.origin) {
    c.parentNode.removeChild(c);
  }
}
window.addEventListener('message', receiveMessage, false);
setInterval(function() {
  K_POPUP.postMessage('ping', window.K_REALM);
}, 2000);
