'use strict';

angular.module('SidebarModule', ['angular-md5'])
.directive('appSidebar', function($location) {
  return {
    restrict: 'E',
    templateUrl: 'templates/components/sidebar.html',
    controller: 'SidebarCtrl',
    link: function postLink(scope, element, attrs, controller) {
      // Watch for the $location
      scope.$watch(function() {
        return $location.url();
      }, function(newValue, oldValue) {
        var target = newValue.replace(/^\//g, '#');
        $('a.list-group-item', element).each(function(k, a) {
          var $a = angular.element(a),
            href = $a.attr('href'),
            pattern, regexp;

          if (href) {
            pattern = href.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
            regexp = new RegExp('^' + pattern + '$', ['i']);

            if(regexp.test(target)) {
              $a.addClass('active');
            } else {
              $a.removeClass('active');
            }
          }
        });
      });
    }
  };
})
.controller('SidebarCtrl', function ($window, $scope, $categoryService, $documentService, $modal, $log, $location, $timeout, md5) {
  $scope.user = $window.user;
  $scope.gravatarUrl = 'http://www.gravatar.com/avatar/' + md5.createHash($scope.user.uid.toLowerCase());
  var refresh = function() {
    $categoryService.fetch().then(function(categories) {
      $scope.categories = [];
      _.each(categories, function(cat) {
        if (cat.key === 'system-trash') cat.icon = 'glyphicon-trash';
        else if (cat.key === 'system-public') cat.icon = 'glyphicon-globe';
        else cat.icon = 'glyphicon-tag';
        $scope.categories.push(cat);
      });
    });
  };

  $scope.$on('app.event.hits', function(event, data) {
    if (!data.query) {
      $scope.total = data.total;
    } else if (data.query === '_missing_:category') {
      $scope.uncatTotal = data.total;
    } else {
      var m = data.query.match(/category:([a-z0-9_-]+)/);
      if (m) {
        var cat = $categoryService.get(m[1]);
        if (cat) {
          cat.total = data.total;
        }
      }
    }
  });

  // Key bindings...
  Mousetrap.bind(['g h'], function() {
    $scope.$apply(function() {
      $location.url('/');
    });
  });
  Mousetrap.bind(['g p'], function() {
    $scope.$apply(function() {
      $location.url('/profile');
    });
  });
  Mousetrap.bind(['g a'], function() {
    $scope.$apply(function() {
      $location.url('/documents');
    });
  });
  Mousetrap.bind(['g u'], function() {
    $scope.$apply(function() {
      $location.url('/documents?category=none');
    });
  });
  Mousetrap.bind(['?'], function() {
    $scope.$apply(function() {
      $dialog('templates/dialog/keybindings.html', {
        id: 'keyBindingsDialog',
        title: 'Keyboard shortcuts',
        backdrop: true,
        footerTemplate: '<button class="btn btn-primary" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</button>',
        success: {label: 'ok', fn: function() {}}
      });
    });
  });

  $scope.createCategoryDialog = function() {
    $scope.category = {};
    var modalInstance = $modal.open({
      templateUrl: 'templates/dialog/category/edit.html',
      controller: 'CategoryEditionModalCtrl'
    });

    modalInstance.result.then(refresh, function(reason) {
      $log.info('Category creation modal dismissed: ' + reason);
    });
  };

  $scope.editCategoryDialog = function(category) {
    var backup = angular.copy(category);
    $scope.category = category;
    var modalInstance = $modal.open({
      templateUrl: 'templates/dialog/category/edit.html',
      controller: 'CategoryEditionModalCtrl'
    });

    modalInstance.result.then(refresh, function(reason) {
      category.label = backup.label;
      category.color = backup.color;
      $log.info('Category edition modal dismissed: ' + reason);
    });
  };

  $scope.handleDropOnCategory = function(id, data) {
    var doc = JSON.parse(data),
        key = id.split('$').pop();
    if (!doc.categories) {
      doc.categories = [];
    }
    if (!_.contains(doc.categories, key)) {
      doc.categories.push(key);
      $documentService.update(doc)
      .then(function(doc) {
        $log.info('Category "'+ key +'" added to document: ' + doc._id);
      }, function(err) {
        alert('Error: ' + err);
      });
    } else {
      $log.debug('Category "'+ key +'" already in document. Ignore.');
    }
  };

  $scope.isUserCategory = $categoryService.isUserCategory;
  refresh();
})
.controller('CategoryEditionModalCtrl', function ($scope, $modalInstance, $categoryService) {
  var errHandler = function(err) {
    alert('Error: ' + err);
    $modalInstance.dismiss('Error: ' + err);
  };

  $scope.ok = function () {
    if ($scope.category.key) {
      $categoryService.update($scope.category)
      .then($modalInstance.close, errHandler);
    } else {
      $categoryService.create($scope.category)
      .then($modalInstance.close, errHandler);
    }
  };

  $scope.delete = function () {
    $categoryService.delete($scope.category)
    .then($modalInstance.close, errHandler);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
