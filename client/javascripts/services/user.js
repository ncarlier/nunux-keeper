/* global alert, angular */

'use strict';

angular.module('UserService', [])
.factory('userService', [
  '$q', '$http', '$log',
  function ($q, $http, $log) {
    var url = '/api/user',
        user = null;

    var fetchUser = function() {
      var deferred = $q.defer();
      $http.get(url + '/current')
      .success(deferred.resolve)
      .error(deferred.reject);
      return deferred.promise;
    };

    var getUser = function() {
      var deferred = $q.defer();
      if (user) deferred.resolve(user);
      else {
        fetchUser()
        .then(function(_user) {
          $log.debug('User fetched: ' + _user.uid);
          user = _user;
          user.registrationDate = new Date(parseInt(_user.registrationDate));
          deferred.resolve(user);
        }, deferred.reject);
      }
      return deferred.promise;
    };

    var getLinkedApp = function(user) {
      var deferred = $q.defer();
      $http.get(url + '/' + user.uid + '/client')
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(err) {
        alert('Unable to get linked apps!');
        deferred.reject(err);
      });
      return deferred.promise;
    };

    var revokeLinkedApp = function(user, app) {
      var deferred = $q.defer();
      $http.delete(url + '/' + user.uid + '/client/' + app._id)
      .success(deferred.resolve)
      .error(deferred.reject);
      return deferred.promise;
    };

    return {
      get: getUser,
      getLinkedApp: getLinkedApp,
      revokeLinkedApp: revokeLinkedApp
    };
  }
]);
