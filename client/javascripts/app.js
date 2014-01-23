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
  'CategoryModule',
  'SidebarModule',
  'NavbarModule',
  'DocumentsModule',
  'ProfileModule',
  'ui.dialog'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/documents', {
    templateUrl: 'views/documents.html',
    controller: 'DocumentsCtrl'
  })
  .when('/profile', {
    templateUrl: 'views/profile.html',
    controller: 'ProfileCtrl'
  })
  .otherwise({
    redirectTo: '/documents'
  });
}])
.filter('fromNow', function() {
  return function(dateString) {
    return moment(new Date(dateString)).fromNow(true);
  };
})
.filter('date', function() {
  return function(dateString) {
    return moment(new Date(dateString)).format();
  };
})
.filter('escape', function() {
  return window.encodeURIComponent;
})
.filter('prefix', function() {
  return function(input, prefix) {
    return input ? prefix + ' ' + input : '';
  };
});
