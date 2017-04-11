(function () {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        .directive('twUiTable', twUiTable);

    function twUiTable() {

        var directive = {
            restrict: 'E',
            scope: {
                columns: '=',
                compact: '=?',
                data: '=',
                defaultDateFormat: '@?',
                heightOffsetValue: '=?',
                hideHeader: '=',
                itemClicked: '=?',
                itemCommands: '=?',
                lineNumber: '=?',
                loadMoreFn: '=?',
                selectOnClick: '=?',
                selectable: '=',
                selectedItems: '=?',
                selectionChanged: '=?',
                sortFn: '=?',
                totalCount: '=?',
            },
            controller: controller,
            templateUrl: '../src/tw-ui-table.html',
            link: link
        };

        controller.$inject = ['$scope', '$filter', '$mdDialog', '$window', '$timeout'];

        function controller($scope, $filter, $mdDialog, $window, $timeout) {

            $scope.allAreSelected = allAreSelected;
            $scope.containerStyle = $scope.containerStyle || 'wdith:100%;';
            $scope.data = $scope.data || [];
            $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
            $scope.getCellText = getCellText;
            $scope.isItemSelected = isItemSelected;
            $scope.itemCommands = $scope.itemCommands || {};
            $scope.loadMore = loadMore;
            $scope.onCellClicked = onCellClicked;
            $scope.onItemClicked = onItemClicked;
            $scope.runCommand = runCommand;
            $scope.selectOnClick = $scope.selectOnClick || false;
            $scope.selectedItems = $scope.selectedItems || [];
            $scope.sort = sort;
            $scope.sortDesc = false;
            $scope.sortField = '';
            $scope.tableId = new Date().getTime();
            $scope.toggleAll = toggleAll;
            $scope.toggleItemSelected = toggleItemSelected;
            $scope.totalCount = $scope.totalCount || 10;

            var loadLock = false;
            var previousLength = 0;
            init();

            $timeout(function () {
                var headerContainer = angular.element(document.querySelector('#table-header-' + $scope.tableId));
                var scroller = angular.element(document.querySelector('#table-container-' +
                    $scope.tableId + ' .md-virtual-repeat-scroller'));

                scroller.on('scroll', function (e) {
                    headerContainer[0].scrollLeft = e.target.scrollLeft;
                });

            });

            function init() {
                $scope.$watchCollection('selectedItems', onSelectionChanged);
                $scope.$watch('compact', calculateTableWidth);
                $scope.$watch('columns', calculateTableWidth, true);
                $scope.dataSet = {
                    getItemAtIndex: function (index) {
                        if ($scope.data.length < $scope.totalCount &&
                            $scope.data.length - index < 50 &&
                            !loadLock &&
                            $scope.loadMoreFn) {
                            console.log('loading more: ' + index);
                            loadLock = true;
                            $scope.loadMoreFn();

                        }
                        return $scope.data[index];
                    },
                    getLength: function () {

                        if (previousLength !== $scope.data.length) {
                            loadLock = false;
                            previousLength = $scope.data.length;
                        }
                        return $scope.data.length;
                    }
                };
            }

            function onSelectionChanged() {
                if ($scope.selectionChanged) {
                    $scope.selectionChanged();
                }
            }

            function isItemSelected(item) {
                return $scope.selectedItems.indexOf(item) > -1;
            }

            function calculateTableWidth() {
                var width = 0;

                if ($scope.selectable) {
                    width += 54;
                }

                angular.forEach($scope.columns, function (column) {
                    if (column.type === 'button') {
                        width += 52;
                    } else {
                        if ((!$scope.compact || !column.optional) && !column.hide) {
                            column.size = column.size || 1;
                            width += 75 * column.size + 56;
                        }
                    }
                });

                width -= 32;
                if ($scope.lineNumber) {
                    width += 30;
                }

                $scope.containerStyle = 'min-width:' + width + 'px';
                var headerWidth = width + 100;
                $scope.headerStyle = 'min-width:' + headerWidth + 'px';
                $scope.$applyAsync();
            }

            function toggleItemSelected(item, ev) {
                ev.stopPropagation();
                var idx = $scope.selectedItems.indexOf(item);
                if (idx > -1) {
                    $scope.selectedItems.splice(idx, 1);
                } else {
                    $scope.selectedItems.push(item);
                }
            }

            function onItemClicked(item, ev) {
                if ($scope.selectOnClick) {
                    $scope.selectedItems = [item];
                }
                if ($scope.itemClicked) {
                    $scope.itemClicked(item, ev);
                }
            }

            function toggleAll() {
                if ($scope.allAreSelected()) {
                    $scope.selectedItems = [];
                } else {
                    angular.forEach($scope.data, function (item) {
                        if ($scope.selectedItems.indexOf(item) < 0) {
                            $scope.selectedItems.push(item);
                        }
                    });
                }
            }

            function allAreSelected() {
                return $scope.selectedItems.length === $scope.data.length;
            }

            function getCellText(item, column) {
                /* jshint maxcomplexity:13 */
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

                if (column.filter) {

                    if (!Array.isArray(column.filter)) {
                        columnValue = $filter(column.filter)(columnValue);
                    } else {
                        if (column.filter.length === 1) {
                            columnValue = $filter(column.filter[0])(columnValue);
                        } else {
                            columnValue = $filter(column.filter[0])(columnValue, column.filter[1]);
                        }
                    }
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
            }

            function loadMore() {
                if ($scope.loadMoreFn) {
                    $scope.loadMoreFn();
                }
            }

            function sort(column) {

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
            }

            function runCommand(name, item, $event) {
                $event.stopPropagation();
                var command = $scope.itemCommands[name];
                if (command) {
                    command(item, $event);
                }
            }

            function onCellClicked($event, item, column) {
                if (column.onClicked) {
                    $event.stopPropagation();
                    column.onClicked(item, $event);
                }
            }
        }

        function link(scope, element, attrs) {

        }

        return directive;
    }
})();
