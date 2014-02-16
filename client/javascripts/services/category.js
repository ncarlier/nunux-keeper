'use strict';

angular.module('CategoryService', [])
.factory('$categoryService', ['$q', '$http', function ($q, $http) {
  var url = '/api/category',
    categories = [];

  var _getCategoryIndex = function(category) {
    for (var i = 0 ; i < categories.length ; i++ ) {
      if (categories[i].key === category.key){
        return i;
      }
    }
    return -1;
  };

  var fetch = function() {
    var deferred = $q.defer();
    $http.get(url)
    .success(function (data) {
      categories = [];
      _.each(data, function(cat) {
        cat.is_user = true;
        if (cat.key === 'system-trash') {
          cat.color = '#D2322D';
          cat.icon = 'glyphicon-trash';
          cat.is_user = false;
        } else if (cat.key === 'system-public') {
          cat.color = '#1F4164';
          cat.icon = 'glyphicon-globe';
          cat.is_user = false;
        } else {
          cat.icon = 'glyphicon-tag';
        }
        categories.push(cat);
      });
      deferred.resolve(categories);
    })
    .error(deferred.reject);

    return deferred.promise;;
  };

  var getCategory = function(key) {
    var index = _getCategoryIndex({key: key});
    return index >= 0 ? categories[index] : null;
  }

  var createCategory = function(category) {
    var deferred = $q.defer();
    $http.post(url, category)
    .success(function(cat) {
      cat.icon = 'glyphicon-tag';
      cat.is_user = true;
      categories.push(cat);
      deferred.resolve(categories);
    })
    .error(function(err) {
      alert('Unable to create category!');
      deferred.reject(err);
    });
    return deferred.promise;;
  };

  var updateCategory = function(category) {
    var deferred = $q.defer();
    $http.put(url + '/' + category.key, category)
    .success(function(cat) {
      cat.icon = 'glyphicon-tag';
      cat.is_user = true;
      categories[_getCategoryIndex(cat)] = cat;
      deferred.resolve(cat);
    })
    .error(function(err) {
      alert('Unable to update category!');
      deferred.reject(err);
    });
    return deferred.promise;;
  };

  var deleteCategory = function(category) {
    var deferred = $q.defer();
    $http.delete(url + '/' + category.key, category)
    .success(function() {
      var index = _getCategoryIndex(category);
      if (index >= 0) categories.splice(index, 1);
      deferred.resolve(category);
    })
    .error(function(err) {
      alert('Unable to delete category!');
      deferred.reject(err);
    });
    return deferred.promise;
  };

  var addDocument = function(key, docId) {
    var deferred = $q.defer();
    $http.put(url + '/' + category.key + '/document/' + docId)
    .success(deferred.resolve)
    .error(function(err) {
      alert('Unable to add document ' + docId + ' to category ' + key);
      deferred.reject(err);
    });
    return deferred.promise;
  };

  var getCategories = function() {
    if (categories.length) {
      var deferred = $q.defer();
      deferred.resolve(categories);
      return deferred.promise;
    }
    return fetch();
  };

  return {
    get: getCategory,
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory,
    addDocument: addDocument,
    getAll: getCategories
  };
}]);
