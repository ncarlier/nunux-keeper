'use strict';

var B_CONTAINER = 'RDR_B__CONTAINER',
    B_FRAME = 'RDR_B__FRAME';
var c = document.getElementById(B_CONTAINER);
if (!c) {
  c = document.createElement('div');
  c.id = B_CONTAINER;
  c.style.position = 'fixed';
  c.style.background = '#fff';
  c.style.top = '0px';
  c.style.right = '0px';
  c.style.width = '100%';
  c.style.height = '55px';
  c.style.zIndex = 999999999;
  c.style['box-shadow'] = '0px 0px 20px rgba(0,0,0,0.4)';
  c.style['border-bottom'] = '1px solid white';
  document.body.appendChild(c);
}

var ifrm = document.createElement('iframe');
ifrm.setAttribute('id', B_FRAME);
ifrm.setAttribute('name', B_FRAME);

ifrm.style.width = '100%';
ifrm.style.height = '100%';
c.appendChild(ifrm);

var u = window.RDR_REALM+'/archive?url='+encodeURIComponent(window.location.href);

var popup = window.open(u, B_FRAME);
if (!popup)
    alert("Unable to load bookmarklet.");

function receiveMessage(event) {
  if ('pong' === event.data && window.RDR_REALM === event.origin) {
    c.parentNode.removeChild(c);
  }
}
window.addEventListener("message", receiveMessage, false);
setInterval(function() {
  popup.postMessage("ping", window.RDR_REALM);
}, 5000);
