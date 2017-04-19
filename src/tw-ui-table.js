(function () {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial', 'ngSanitize'])
        .directive('twUiTable', twUiTable)
        .directive('twUiTableColumnsPicker', twUiTableColumnsPicker);

    function twUiTable() {

        var directive = {
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
                itemCommands: '=?',
                lineNumber: '=?',
                paging: '=?',
                pageIndex: '=?',
                pageSize: '=?',
                onPagingChanged: '=?'
            },
            controller: controller,
            templateUrl: '../src/tw-ui-table.html',
            link: link
        };

        controller.$inject = ['$scope', '$filter', '$mdDialog', '$window', '$timeout', '$sce'];

        function controller($scope, $filter, $mdDialog, $window, $timeout, $sce) {

            /* jshint -W071 */
            /* jshint -W074 */

            $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
            $scope.selectedItems = $scope.selectedItems || [];
            $scope.selectOnClick = $scope.selectOnClick || false;
            $scope.totalCount = $scope.totalCount || 0;
            $scope.itemCommands = $scope.itemCommands || {};
            $scope.sortField = '';
            $scope.sortDesc = false;
            $scope.isItemSelected = isItemSelected;
            $scope.toggleItemSelected = toggleItemSelected;
            $scope.onItemClicked = onItemClicked;
            $scope.toggleAll = toggleAll;
            $scope.allAreSelected = allAreSelected;
            $scope.getCellText = getCellText;
            $scope.loadMore = loadMore;
            $scope.sort = sort;
            $scope.runCommand = runCommand;
            $scope.onCellClicked = onCellClicked;
            $scope.tableId = new Date().getTime();
            $scope.freezedColumns = [];
            $scope.unFreezedColumns = [];
            $scope.onPagingChanged = $scope.onPagingChanged || function () {};
            $scope.getPages = getPages;
            $scope.showPaginateNumber = showPaginateNumber;
            $scope.showPaginateSymbol = showPaginateSymbol;
            $scope.changePageIndex = changePageIndex;
            $scope.previousPage = previousPage;
            $scope.nextPage = nextPage;
            $scope.pageSizeOptions = [20, 50, 'All'];
            $scope.onPageSizeChanged = onPageSizeChanged;
            $scope.buttonDisabled = buttonDisabled;
            $scope.Math = window.Math;

            init();

            $timeout(function () {
                var headerContainer = angular.element(document.querySelector('#table-header-' + $scope.tableId));
                var freezedContainer = angular.element(document.querySelector('#table-container-freezed-' +
                    $scope.tableId + ' .md-virtual-repeat-scroller'));

                var scroller = angular.element(document.querySelector('#table-container-' +
                    $scope.tableId + ' .md-virtual-repeat-scroller'));

                var freezed = angular.element(document.getElementById('tw-table-freezed-' + $scope.tableId));

                scroller.on('scroll', function (e) {
                    if (headerContainer[0]) {
                        headerContainer[0].scrollLeft = e.target.scrollLeft;
                        if (freezed[0]) {
                            if (e.target.scrollLeft === 0) {
                                freezed[0].classList.remove('right-shadow');
                            } else {
                                freezed[0].classList.add('right-shadow');
                            }
                        }
                    }
                    if (freezedContainer[0]) {
                        freezedContainer[0].scrollTop = e.target.scrollTop;

                    }
                });

            });

            function showPaginateSymbol(page) {
                if (showPaginateNumber(page)) {
                    return false;
                }
                if (Math.abs(page - $scope.pageIndex) === 3) {
                    return true;
                }
            }

            function showPaginateNumber(page) {
                if (page === 0 || page === Math.ceil($scope.totalCount / $scope.pageSize) - 1) {
                    return true;
                }

                if (Math.abs(page - $scope.pageIndex) < 3) {
                    return true;
                }
            }

            function changePageIndex(page) {
                if (page === $scope.pageIndex) {
                    return;
                }
                changePaging(page, $scope.pageSize);
            }

            function init() {
                $scope.$watchCollection('selectedItems', onSelectionChanged);
                $scope.$watch('compact', calculateTableWidth);
                $scope.$watch('columns', initColumns);
            }

            function onPageSizeChanged($event) {
                changePaging(0, $scope.pageSize);
            }

            function getPages() {
                $scope.pageIndex = $scope.pageIndex || 0;
                var pages = [0];
                var pageCount = Math.ceil($scope.totalCount / $scope.pageSize);
                for (var i = $scope.pageIndex - 3; i <= $scope.pageIndex + 3; i++) {
                    if (i <= 0 || i >= pageCount - 1) {
                        continue;
                    }
                    pages.push(i);
                }

                if (pageCount > 1) {
                    pages.push(pageCount - 1);
                }
                return pages;


            }



            function initColumns() {
                $scope.freezedColumns = [];
                $scope.unFreezedColumns = [];

                angular.forEach($scope.columns, function (column) {
                    if (column.freezed) {
                        $scope.freezedColumns.push(column);
                    } else {
                        $scope.unFreezedColumns.push(column);
                    }
                });
                calculateTableWidth();
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
                var freezedWidth = 0;
                var unFreezedWidth = -32;

                if ($scope.selectable) {
                    freezedWidth += 54;
                }

                angular.forEach($scope.columns, function (column) {
                    if (column.type === 'button') {
                        if (column.freezed) {
                            freezedWidth += 52;
                        } else {
                            unFreezedWidth += 52;
                        }
                    } else {
                        if ((!$scope.compact || !column.optional) && !column.hide) {
                            if (column.freezed) {
                                column.size = column.size || 1;
                                freezedWidth += 75 * column.size + 56;
                            } else {
                                column.size = column.size || 1;
                                unFreezedWidth += 75 * column.size + 56;
                            }
                        }
                    }
                });

                if ($scope.lineNumber) {
                    freezedWidth += 50;
                }

                unFreezedWidth += 48;

                $scope.freezedContainerStyle = 'min-width:' + freezedWidth + 'px';
                var freezedHeaderWidth = freezedWidth;
                $scope.freezedHeaderStyle = 'min-width:' + freezedHeaderWidth + 'px';

                $scope.unFreezedContainerStyle = 'min-width:' + unFreezedWidth + 'px';
                var unFreezedHeaderWidth = unFreezedWidth;
                $scope.unFreezedHeaderStyle = 'min-width:' + unFreezedHeaderWidth + 'px';

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
                    var result = $sce.trustAsHtml(typeof (resp) === 'string' ? resp : '' + resp);
                    return result;
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

            function previousPage() {
                changePaging($scope.pageIndex - 1, $scope.pageSize);
            }

            function nextPage() {
                changePaging($scope.pageIndex + 1, $scope.pageSize);
            }

            function changePaging(pageIndex, pageSize) {
                $scope.pageIndex = pageIndex;
                $scope.pageSize = pageSize;
                $scope.onPagingChanged(pageIndex, pageSize);
            }

            function buttonDisabled(item, column) {
                if (column.isDisabled) {
                    return column.isDisabled(item);
                }
            }
        }

        function link(scope, element, attrs) {

        }

        return directive;
    }

    function twUiTableColumnsPicker() {
        var directive = {
            restrict: 'E',
            controller: controller,
            templateUrl: '../src/tw-ui-table-columns-picker.html',
            scope: {
                columns: '='
            }
        };

        controller.$inject = ['$scope', '$mdDialog'];

        function controller($scope, $mdDialog) {
            $scope.showPicker = showPicker;
            DialogController.$inject = ['$scope', '$mdDialog', 'columns'];

            function showPicker($event) {
                $mdDialog.show({
                    controller: DialogController,
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    clickOutsideToClose: false,
                    templateUrl: '../src/tw-ui-table-columns-picker-dialog.html',
                    locals: {
                        columns: $scope.columns
                    }
                });
            }

            function DialogController($scope, $mdDialog, columns) {
                $scope.hide = hide;
                $scope.cancel = cancel;
                $scope.toggle = toggle;
                $scope.columns = columns;

                function hide() {
                    $mdDialog.hide();
                }

                function cancel() {
                    $mdDialog.cancel();
                }

                function toggle(column) {
                    column.hide = !column.hide;
                }
            }
        }

        return directive;
    }

})();