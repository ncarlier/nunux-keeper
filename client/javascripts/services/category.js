'use strict';

angular.module('CategoryService', [])
.factory('categoryService', [
  '$rootScope', '$q', '$http', '$log',
  function ($rootScope, $q, $http, $log) {
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
          cat.isUser = true;
          if (cat.key === 'system-trash') {
            cat.color = '#D2322D';
            cat.icon = 'fa-trash-o';
            cat.isUser = false;
          } else if (cat.key === 'system-public') {
            cat.color = '#1F4164';
            cat.icon = 'fa-globe';
            cat.isUser = false;
          } else {
            cat.icon = 'fa-tag';
          }
          categories.push(cat);
        });
        deferred.resolve(categories);
      })
      .error(deferred.reject);

      return deferred.promise;
    };

    var getCategory = function(key) {
      var index = _getCategoryIndex({key: key});
      return index >= 0 ? categories[index] : null;
    };

    var createCategory = function(category) {
      var deferred = $q.defer();
      $http.post(url, category)
      .success(function(cat) {
        $log.info('Category created:', cat);
        cat.icon = 'fa-tag';
        cat.isUser = true;
        categories.push(cat);
        deferred.resolve(categories);
        $rootScope.$broadcast('categoy-created', { category: cat });
      })
      .error(function(err) {
        $log.error('Unable to create category: ', err);
        deferred.reject(err);
      });
      return deferred.promise;
    };

    var updateCategory = function(category) {
      var deferred = $q.defer();
      $http.put(url + '/' + category.key, category)
      .success(function(cat) {
        $log.info('Category updated:', cat);
        cat.icon = 'fa-tag';
        cat.isUser = true;
        categories[_getCategoryIndex(cat)] = cat;
        deferred.resolve(cat);
        $rootScope.$broadcast('categoy-updated', { category: cat });
      })
      .error(function(err) {
        $log.error('Unable to update category: ', err);
        deferred.reject(err);
      });
      return deferred.promise;
    };

    var deleteCategory = function(category) {
      var deferred = $q.defer();
      $http.delete(url + '/' + category.key, category)
      .success(function() {
        $log.info('Category deleted:', category);
        var index = _getCategoryIndex(category);
        if (index >= 0) categories.splice(index, 1);
        deferred.resolve(category);
      })
      .error(function(err) {
        $log.error('Unable to delete category: ', err);
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
      getAll: getCategories
    };
  }
]);
