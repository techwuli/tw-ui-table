(function() {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        .directive('twUiTable', function() {
            var controller = [
                '$scope',
                function($scope) {

                    $scope.selectedItems = $scope.selectedItems || [];
                    $scope.selectOnClick = $scope.selectOnClick || false;

                    $scope.isItemSelected = function(item) {
                        return $scope.selectedItems.indexOf(item) > -1;
                    };

                    $scope.toggleItemSelected = function(item) {
                        var idx = $scope.selectedItems.indexOf(item);
                        if (idx > -1) {
                            $scope.selectedItems.splice(idx, 1);
                        } else {
                            $scope.selectedItems.push(item);
                        }
                    };

                    $scope.onItemClicked = function(item) {
                        if ($scope.selectOnClick) {
                            $scope.selectedItems = [item];
                        }

                        if ($scope.itemClicked) {
                            $scope.itemClicked(item);
                        }
                    };
                }
            ];

            return {
                restrict: 'E',
                scope: {
                    data: '=',
                    columns: '=',
                    selectable: '=',
                    selectedItems: '=?',
                    itemClicked: '=?',
                    selectOnClick: '=?'                    
                },
                controller: controller,
                template: '<table ng-class=\"{\'selectable\':selectable}\"><thead><tr><th ng-if=\"selectable\"></th><th ng-class=\"{\'numeric\':column.numeric}\" ng-repeat=\"column in columns\">{{column.display}}</th></tr></thead><tbody><tr ng-click=\"onItemClicked(item)\" ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\" ng-repeat=\"item in data\"><td ng-if=\"selectable\"><md-checkbox ng-checked=\"isItemSelected(item)\" ng-click=\"toggleItemSelected(item)\"></td><td ng-repeat=\"column in columns\" ng-class=\"{\'numeric\':column.numeric}\">{{item[column.name]}}</td></tr></tbody></table>'
            };
        });
})();
