'use strict';

angular.module('ui.helpers', ['angular-md5'])
.directive('appSrc', ['md5', function(md5) {

  var link = function($scope, $element, $attributes) {
    if (!$scope.doc || !$scope.doc._id) return;
    var resourcePath = '/api/document/' + $scope.doc._id + '/resource/';
    var size = $attributes.size
    $attributes.$observe(
      'appSrc',
      function(newSource) {
        // Clean query
        var cleanName = newSource.replace(/\?.*$/, '');
        // Extract extension
        var ext = cleanName.split('.').pop();
        if (ext) ext = ext.match(/^[a-zA-Z0-9]+/)[0];
        $element[0].src = resourcePath +
          md5.createHash(cleanName) + (ext ? '.' + ext : '') +
          ($attributes.size ? '?size=' + $attributes.size : '');
      }
    );
  };

  return {
    restrict: 'A',
    link: link
  };
}])
.directive('draggable', function() {
  return {
    scope: {
      dragdata: '&'
    },
    link: function(scope, element) {
      // this gives us the native JS object
      var el = element[0];

      el.draggable = true;

      el.addEventListener('dragstart', function(e) {
        var data = null;
        scope.$apply(function(scope) {
          data = scope.dragdata();
        });

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', data);
        this.classList.add('drag');
        return false;
      }, false);

      el.addEventListener('dragend', function(e) {
        this.classList.remove('drag');
        return false;
      }, false);
    }
  }
})
.directive('droppable', function() {
  return {
    scope: {
      drop: '&',
      bin: '='
    },
    link: function(scope, element) {
      // again we need the native object
      var el = element[0];

      el.addEventListener('dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'move';
          // allows us to drop
          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
          return false;
        },
        false
      );

      el.addEventListener('dragenter',
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );

      el.addEventListener('dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );

      el.addEventListener('drop',
        function(e) {
          // Stops some browsers from redirecting.
          if (e.stopPropagation) e.stopPropagation();

          this.classList.remove('over');

          var binId = this.id;
          var data = e.dataTransfer.getData('Text');
          // call the passed drop function
          scope.$apply(function(scope) {
            var fn = scope.drop();
            if ('undefined' !== typeof fn) {
              fn(binId, data);
            }
          });

          return false;
        },
        false
      );
    }
  }
});

