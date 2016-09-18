(function() {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        .directive('twUiTable', function() {
            var controller = [
                '$scope', '$filter',
                function($scope, $filter) {
                    $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
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

                    $scope.getCellText = function(item, column) {

                        if (!column) {
                            throw 'column definition is not defined.';
                        }

                        if (!column.path) {
                            throw 'path must be set, in: ' + column;
                        }

                        var paths = column.path.split('.');
                        var pathIndex = 0;
                        var columnValue = item;
                        while (pathIndex < paths.length && columnValue) {
                            columnValue = columnValue[paths[pathIndex]];
                            pathIndex++;
                        }

                        if (!columnValue) {
                            return '';
                        }

                        if (column.dataType === 'date') {
                            var format = column.dateFormat || $scope.defaultDateFormat;
                            columnValue = $filter('date')(new Date(columnValue), format);
                        }

                        return columnValue;
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
                    selectOnClick: '=?',
                    defaultDateFormat: '@?'
                },
                controller: controller,
                template: '<table ng-class=\"{\'selectable\':selectable}\"><thead><tr><th ng-if=\"selectable\"></th><th ng-class=\"{\'numeric\':column.numeric}\" ng-repeat=\"column in columns\">{{column.title}}</th></tr></thead><tbody><tr ng-click=\"onItemClicked(item)\" ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\" ng-repeat=\"item in data\"><td ng-if=\"selectable\"><md-checkbox ng-checked=\"isItemSelected(item)\" ng-click=\"toggleItemSelected(item)\"></td><td ng-repeat=\"column in columns\" ng-class=\"{\'numeric\':column.numeric}\">{{getCellText(item, column)}}</td></tr></tbody></table>'
            };
        });
})();
