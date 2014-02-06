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

  var fetchCategories = function() {
    var deferred = $q.defer();
    $http.get(url)
    .success(function (data) {
      _.each(data, function(cat) {
        if (cat.key === 'system-trash') cat.color = '#D2322D';
        else if (cat.key === 'system-public') cat.color = '#1F4164';
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
      deferred.resolve(cat);
    })
    .error(function(err) {
      alert('Unable to delete category!');
      deferred.reject(err);
    });
    return deferred.promise;;
  };

  var isUserCategory = function(category) {
    return /^user-/.test(category.key);
  };

  return {
    fetch: fetchCategories,
    get: getCategory,
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory,
    isUserCategory: isUserCategory,
    getCategories: function() { return categories; }
  };
}]);
