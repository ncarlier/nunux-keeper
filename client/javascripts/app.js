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

'use strict';

angular.module('KeeperApp', [
  'ngRoute',
  'CategoryService',
  'DocumentService',
  'UserService',
  'SidebarModule',
  'NavbarModule',
  'DocumentsModule',
  'DocumentModule',
  'ProfileModule',
  'ui.helpers',
  'ui.bootstrap',
  'angular-md5'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/document', {
    templateUrl: 'templates/views/documents.html',
  })
  .when('/profile', {
    templateUrl: 'templates/views/profile.html',
  })
  .otherwise({
    redirectTo: '/document'
  });
}])
.filter('fromNow', function() {
  return function(dateString) {
    return moment(new Date(dateString)).fromNow(true);
  };
})
.filter('date', function() {
  return function(dateString) {
    return moment(new Date(dateString)).format('MMMM Do YYYY, h:mm:ss a');
  };
})
.filter('domain', function() {
  return function(url) {
    var m = url.match(/^(?:http[s]?:\/\/)?[\/]?([^\/]*)/i);
    return m ? m[1] : url;
  };
})
.filter('escape', function() {
  return window.encodeURIComponent;
})
.filter('toArray', function() {
  return function(val) {
    return Object.prototype.toString.call(val) === '[object Array]' ? val : [val];
  };
})
.filter('unsafe', ['$sce', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  };
}])
.filter('gravatar', ['md5', function(md5) {
  return function(val) {
    var hash = val ? md5.createHash(val.toLowerCase()) : '';
    return 'http://www.gravatar.com/avatar/' + hash;
  };
}])
.filter('prefix', function() {
  return function(input, prefix) {
    return input ? prefix + ' ' + input : '';
  };
})
.filter('lighten', function() {
  return function(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }
    var num = parseInt(col,16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  };
});

