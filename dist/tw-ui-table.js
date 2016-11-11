(function () {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        .directive('twUiTable', function () {
            var controller = [
                '$scope', '$filter', '$mdDialog', '$window',
                function ($scope, $filter, $mdDialog, $window) {

                    $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
                    $scope.selectedItems = $scope.selectedItems || [];
                    $scope.selectOnClick = $scope.selectOnClick || false;
                    $scope.containerStyle = $scope.containerStyle || 'height:100%;';
                    $scope.totalCount = $scope.totalCount || 10;

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

                    $scope.onItemClicked = function (item) {
                        if ($scope.selectOnClick) {
                            $scope.selectedItems = [item];
                        }

                        if ($scope.itemClicked) {
                            $scope.itemClicked(item);
                        }
                    };

                    $scope.showTooltip = function (ev, text) {
                        $mdDialog.show(
                            $mdDialog.alert()
                            .targetEvent(ev)
                            .clickOutsideToClose(true)
                            .textContent(text)
                            .ok('close')
                        );
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

                        if (!columnValue) {
                            return '';
                        }

                        if (column.dataType === 'date') {
                            var format = column.dateFormat || $scope.defaultDateFormat;
                            columnValue = $filter('date')(new Date(columnValue), format);
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

                    $scope.sort = function (field) {
                        if ($scope.sortFn) {

                            if ($scope.sortField === field) {
                                $scope.sortDesc = !$scope.sortDesc;
                            } else {
                                $scope.sortField = field;
                            }

                            $scope.sortFn(field, $scope.sortDesc);
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
                    totalCount: '=?'
                },
                controller: controller,
                template: '<md-virtual-repeat-container style=\"{{containerStyle}}\"><md-table-container><table md-table ng-class=\"{\'selectable\':selectable}\"><thead md-head ng-if=\"!hideHeader\"><tr><th ng-if=\"selectable\"><md-checkbox aria-label=\"check all\" ng-checked=\"allAreSelected()\" ng-click=\"toggleAll()\"></th><th ng-if=\"(!compact||!column.optional) &&! column.hide\" ng-class=\"{\'numeric\':column.numeric}\" ng-repeat=\"column in columns\"><span ng-if=\"column.sortable\" ng-click=\"sort(column.path)\" class=\"sort-handler\"><span>{{column.title}}</span><md-icon ng-show=\"sortField===column.path && sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_down</md-icon><md-icon ng-show=\"sortField===column.path && !sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_up</md-icon></span><span ng-if=\"!column.sortable\">{{column.title}}</span></th></tr></thead><tbody md-body><tr md-row md-auto-select md-virtual-repeat=\"item in data\" ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\"><td ng-if=\"selectable\"><md-checkbox aria-label=\"select\" ng-checked=\"isItemSelected(item)\" ng-click=\"toggleItemSelected(item)\"></td><td ng-if=\"(!compact||!column.optional) &&! column.hide\" ng-repeat=\"column in columns\" ng-class=\"{\'numeric\':column.numeric}\" ng-click=\"onItemClicked(item)\"><span ng-if=\"!column.tooltipPath||!item[column.tooltipPath]\">{{getCellText(item, column)}}</span> <span ng-if=\"column.tooltipPath && item[column.tooltipPath]\" ng-click=\"showTooltip($event, item[column.tooltipPath])\" class=\"has-tooltip\">{{getCellText(item, column)}}</span></td></tr></tbody></table><div class=\"md-padding\" layout=\"row\" layout-align=\"center center\"><md-button class=\"md-primary\" ng-click=\"loadMore()\" ng-show=\"data.length<totalCount&&!isLoading\">Load More</md-button><md-progress-circular md-mode=\"indeterminate\" ng-show=\"isLoading\"></md-progress-circular><span class=\"md-caption\" ng-show=\"totalCount==0&&!isLoading\">No item found.</span></div></md-table-container></md-virtual-repeat-container>'
            };
        });
})();