(function () {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        .filter('html', ['$sec', function ($sec) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }])
        .directive('dynamic', function ($compile) {
            return {
                restrict: 'A', replace: true, link: function (scope, ele, attrs) {
                    scope.$watch(attrs.dynamic, function (html) {
                        ele.html(html);
                        $compile(ele.contents())(scope);
                    });
                }
            };
        })
        .directive('twUiTable', function () {
            var controller = [
                '$scope', '$filter', '$mdDialog', '$window',
                function ($scope, $filter, $mdDialog, $window) {

                    $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
                    $scope.selectedItems = $scope.selectedItems || [];
                    $scope.selectOnClick = $scope.selectOnClick || false;
                    $scope.containerStyle = $scope.containerStyle || 'height:100%;';
                    $scope.totalCount = $scope.totalCount || 10;
                    $scope.itemCommands = $scope.itemCommands || {};

                    var onSelectionChanged = function () {
                        if ($scope.selectionChanged) {
                            $scope.selectionChanged();
                        }
                    };

                    $scope.$watchCollection('selectedItems', onSelectionChanged);

                    $scope.isItemSelected = function (item) {
                        return $scope.selectedItems.indexOf(item) > -1;
                    };

                    $scope.calcTableHeight = function () {
                        if ($scope.heightOffsetValue && typeof ($scope.heightOffsetValue) === 'function') {
                            $scope.containerStyle = 'height: calc(100% - ' + $scope.heightOffsetValue() + 'px);';
                            $scope.$applyAsync();
                        }
                    };

                    angular.element($window).bind('resize', function () {
                        $scope.calcTableHeight();
                    });
                    $scope.calcTableHeight();

                    $scope.toggleItemSelected = function (item) {
                        var idx = $scope.selectedItems.indexOf(item);
                        if (idx > -1) {
                            $scope.selectedItems.splice(idx, 1);
                        } else {
                            $scope.selectedItems.push(item);
                        }
                    };

                    $scope.onItemClicked = function (item, ev) {
                        if ($scope.selectOnClick) {
                            $scope.selectedItems = [item];
                        }

                        if ($scope.itemClicked) {
                            $scope.itemClicked(item, ev);
                        }
                    };

                    $scope.toggleAll = function () {
                        if ($scope.allAreSelected()) {
                            $scope.selectedItems = [];
                        } else {
                            angular.forEach($scope.data, function (item) {
                                if ($scope.selectedItems.indexOf(item) < 0) {
                                    $scope.selectedItems.push(item);
                                }
                            });
                        }
                    };

                    $scope.allAreSelected = function () {
                        return $scope.selectedItems.length === $scope.data.length;
                    };

                    $scope.getCellText = function (item, column) {

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

                        if (typeof (columnValue) === 'undefined' || columnValue === null) {
                            return '';
                        }

                        if (column.dataType === 'date') {
                            var format = column.dateFormat || $scope.defaultDateFormat;
                            columnValue = $filter('date')(new Date(columnValue), format);
                        }

                        if (typeof (column.render) === 'function') {
                            var resp = column.render(columnValue, item, column);
                            return typeof (resp) === 'string' ? resp : '' + resp;
                        }

                        return columnValue;
                    };

                    $scope.loadMore = function () {
                        if ($scope.loadMoreFn) {
                            $scope.loadMoreFn();
                        }
                    };

                    $scope.sortField = '';
                    $scope.sortDesc = false;

                    $scope.sort = function (column) {

                        var field = column.path;
                        if (column.sortPath) {
                            field = column.sortPath;
                        }

                        if ($scope.sortFn) {

                            if ($scope.sortField === field) {
                                $scope.sortDesc = !$scope.sortDesc;
                            } else {
                                $scope.sortField = field;
                            }

                            $scope.sortFn(field, $scope.sortDesc);
                        }
                    };

                    $scope.runCommand = function (name, item, $event) {
                        $event.stopPropagation();
                        var command = $scope.itemCommands[name];
                        if (command) {
                            command(item);
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
                    selectionChanged: '=?',
                    itemClicked: '=?',
                    selectOnClick: '=?',
                    defaultDateFormat: '@?',
                    compact: '=?',
                    hideHeader: '=',
                    heightOffsetValue: '=?',
                    loadMoreFn: '=?',
                    sortFn: '=?',
                    isLoading: '=?',
                    totalCount: '=?',
                    itemCommands: '=?'
                },
                controller: controller,
                templateUrl: '../src/tw-ui-table.html'
            };
        });
})();
