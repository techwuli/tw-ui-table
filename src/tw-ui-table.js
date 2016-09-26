(function() {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        .directive('twUiTable', function() {
            var controller = [
                '$scope', '$filter', '$mdDialog',
                function($scope, $filter, $mdDialog) {
                    $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
                    $scope.selectedItems = $scope.selectedItems || [];
                    $scope.selectOnClick = $scope.selectOnClick || false;

                    var onSelectionChanged = function() {
                        if ($scope.selectionChanged) {
                            $scope.selectionChanged();
                        }
                    };

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
                        onSelectionChanged();
                    };

                    $scope.onItemClicked = function(item) {
                        if ($scope.selectOnClick) {
                            $scope.selectedItems = [item];
                            onSelectionChanged();
                        }

                        if ($scope.itemClicked) {
                            $scope.itemClicked(item);
                        }
                    };

                    $scope.showTooltip = function(ev, text) {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .targetEvent(ev)
                            .clickOutsideToClose(true)
                            .textContent(text)
                            .ok('close')
                        );
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
                    selectionChanged: '=?',
                    itemClicked: '=?',
                    selectOnClick: '=?',
                    defaultDateFormat: '@?',
                    compact: '=?',
                    hideHeader: '='
                },
                controller: controller,
                templateUrl: '../src/tw-ui-table.html'
            };
        });
})();
