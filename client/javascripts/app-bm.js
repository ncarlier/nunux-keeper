/**

  NUNUX Keeper

  Copyright (c) 2014 Nicolas CARLIER (https://github.com/ncarlier)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

angular.module('KeeperBookmarklet', ['DocumentService'])
.factory('$messenger', ['$window', function ($window) {
  'use strict';

  var messages = [], onMessageClbk;

  var sendMessage = function(message) {
    messages.push(message);
  };

  var receiveMessage = function(event) {
    if ('ping' === event.data) {
      while (messages.length > 0) {
        var message = messages.shift();
        event.source.postMessage(message, event.origin);
      }
    } else {
      if (onMessageClbk) onMessageClbk(event.data);
    }
  };

  var onMessage = function(callback) {
    onMessageClbk = callback;
  };

  $window.addEventListener('message', receiveMessage, false);

  return {
    send: sendMessage,
    onMessage: onMessage
  };
}])
.controller('BookmarkletCtrl', [
  '$scope', '$messenger', '$window', 'documentService',
  function ($scope, $messenger, $window, documentService) {
    'use strict';
    var data = null, match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
        query  = $window.location.search.substring(1),
        params = {};

    while ((match = search.exec(query)) !== null)
      params[decode(match[1])] = decode(match[2]);

    $scope.url = params.url;
    $scope.btnLabel = 'Keep this page';
    $scope.icon = 'fa-cloud-upload';

    $messenger.onMessage(function(message) {
      $scope.$apply(function() {
        if ('onDragEnter' === message) $scope.over = true;
        else if ('onDragLeave' === message) $scope.over = false;
        else {
          data = message;
          $scope.ready = true;
          $scope.error = false;
          $scope.btnLabel = 'Keep this !';
          $scope.icon = 'fa-cloud-upload';
        }
      });
    });

    $scope.close = function() {
      $messenger.send('close');
    };

    $scope.saveDocument = function() {
      $scope.icon = 'fa-cog';
      var newDoc = null;
      if (data) {
        newDoc = {
          title: params.title,
          content: data,
          contentType: 'text/html',
          link: params.url
        };
      } else {
        newDoc = {
          title: params.title,
          content: params.url,
          contentType: 'text/vnd.curl'
        };
      }
      documentService.create(newDoc)
      .then(function(doc) {
        $scope.icon = 'fa-save';
        $scope.error = false;
        $scope.busy = false;
        $scope.ready = true;
      }, function(err) {
        $scope.icon = 'fa-warning';
        $scope.error = true;
        $scope.busy = false;
      });
    };
  }
]);

