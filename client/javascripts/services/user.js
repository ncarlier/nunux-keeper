'use strict';

angular.module('UserService', [])
.factory('$userService', [
  '$q', '$http', '$log',
  function ($q, $http, $log) {
    var url = '/api/user';

    var updateUser = function(user) {
      var deferred = $q.defer();
      $http.put(url + '/' + user.uid, user)
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(err) {
        alert('Unable to update user!');
        deferred.reject(err);
      });
      return deferred.promise;;
    };

    var generateToken = function(user) {
      var deferred = $q.defer();
      $http.put(url + '/' + user.uid + '/token')
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(err) {
        alert('Unable to regenerate token!');
        deferred.reject(err);
      });
      return deferred.promise;;
    };

    return {
      update: updateUser,
      generateToken: generateToken
    };
  }
]);
