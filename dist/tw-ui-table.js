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
                lineNumber: '=?'
            },
            controller: controller,
            template: '<div class=\"tw-table-columns--freezed\"><section layout=\"row\" style=\"{{freezedHeaderStyle}}\" id=\"table-header-freezed-{{tableId}}\" class=\"tw-table-header\" ng-if=\"!hideHeader\"><div layout=\"row\" flex><div class=\"tw-table-cell tw-table-line-number-cell\" ng-if=\"lineNumber\"></div><div class=\"tw-table-cell tw-table-check-cell\" ng-if=\"selectable\"><md-checkbox aria-label=\"check all\" ng-checked=\"allAreSelected()\" ng-click=\"toggleAll()\"></div><div class=\"tw-table-cell x{{column.size}}\" ng-show=\"(!compact||!column.optional) &&! column.hide\" ng-class=\"{\'numeric\':column.numeric,\'tw-table-button-cell\':column.type===\'button\',\'tw-table-text-cell\':column.type!==\'button\'}\" ng-repeat=\"column in freezedColumns\"><div ng-if=\"column.sortable\" ng-click=\"sort(column)\" class=\"sort-handler\"><span>{{column.title}}</span><md-icon ng-show=\"sortField===column.path && sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_down</md-icon><md-icon ng-show=\"sortField===column.path && !sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_up</md-icon></div><span ng-if=\"!column.sortable\">{{column.title}}</span></div></div></section><md-virtual-repeat-container style=\"{{freezedContainerStyle}}\" id=\"table-container-freezed-{{tableId}}\"><div class=\"tw-table-row\" layout=\"row\" md-virtual-repeat=\"item in data\" ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\" ng-click=\"onItemClicked(item, $event)\"><div class=\"tw-table-cell tw-table-line-number-cell\" ng-if=\"lineNumber\">{{$index+1}}</div><div ng-if=\"selectable\" class=\"tw-table-cell tw-table-check-cell\"><md-checkbox aria-label=\"select\" ng-checked=\"isItemSelected(item)\" ng-click=\"toggleItemSelected(item, $event)\"></div><div ng-repeat=\"column in freezedColumns\" ng-show=\"(!compact||!column.optional) && !column.hide\" class=\"tw-table-cell x{{column.size}}\" ng-class=\"{\'tw-table-button-cell\':column.type===\'button\', \'numeric\':column.numeric,\'tw-table-text-cell\':column.type!==\'button\'}\"><md-tooltip ng-if=\"column.tooltip && !column.tooltipFn\">{{column.tooltip}}</md-tooltip><md-tooltip ng-if=\"column.tooltipFn\">{{column.tooltipFn(item)}}</md-tooltip><md-button ng-if=\"column.type===\'button\'\" class=\"md-icon-button md-primary\" ng-click=\"onCellClicked($event, item, column)\"><md-icon md-font-set=\"material-icons\">{{column.icon}}</md-icon></md-button><span ng-click=\"onCellClicked($event, item, column)\" ng-if=\"column.type!==\'button\'\" ng-class=\"{\'clickable\':column.onClicked}\" ng-bind-html=\"getCellText(item, column)\" class=\"cell-text\"></span></div></div><div class=\"table-container-freezed-placeholder\"></div></md-virtual-repeat-container></div><div class=\"tw-table-columns\" flex><section layout=\"row\" style=\"{{unFreezedHeaderStyle}}\" id=\"table-header-{{tableId}}\" class=\"tw-table-header\" ng-if=\"!hideHeader\"><div layout=\"row\" flex><div class=\"tw-table-cell x{{column.size}}\" ng-show=\"(!compact||!column.optional) &&! column.hide\" ng-class=\"{\'numeric\':column.numeric,\'tw-table-button-cell\':column.type===\'button\',\'tw-table-text-cell\':column.type!==\'button\'}\" ng-repeat=\"column in unFreezedColumns\"><div ng-if=\"column.sortable\" ng-click=\"sort(column)\" class=\"sort-handler\"><span>{{column.title}}</span><md-icon ng-show=\"sortField===column.path && sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_down</md-icon><md-icon ng-show=\"sortField===column.path && !sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_up</md-icon></div><span ng-if=\"!column.sortable\">{{column.title}}</span></div></div></section><md-virtual-repeat-container style=\"{{unFreezedContainerStyle}}\" id=\"table-container-{{tableId}}\"><div class=\"tw-table-row\" layout=\"row\" md-virtual-repeat=\"item in data\" ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\" ng-click=\"onItemClicked(item, $event)\"><div ng-repeat=\"column in unFreezedColumns\" ng-show=\"(!compact||!column.optional) && !column.hide\" class=\"tw-table-cell x{{column.size}}\" ng-class=\"{\'tw-table-button-cell\':column.type===\'button\', \'numeric\':column.numeric,\'tw-table-text-cell\':column.type!==\'button\'}\"><md-tooltip ng-if=\"column.tooltip && !column.tooltipFn\">{{column.tooltip}}</md-tooltip><md-tooltip ng-if=\"column.tooltipFn\">{{column.tooltipFn(item)}}</md-tooltip><md-button ng-if=\"column.type===\'button\'\" class=\"md-icon-button md-primary\" ng-click=\"onCellClicked($event, item, column)\"><md-icon md-font-set=\"material-icons\">{{column.icon}}</md-icon></md-button><span ng-click=\"onCellClicked($event, item, column)\" ng-if=\"column.type!==\'button\'\" ng-class=\"{\'clickable\':column.onClicked}\" ng-bind-html=\"getCellText(item, column)\" class=\"cell-text\"></span></div></div><div class=\"md-padding\" layout=\"row\" layout-align=\"center center\"><md-button class=\"md-primary\" ng-click=\"loadMore()\" ng-show=\"data.length<totalCount&&!isLoading\">Load More</md-button><md-progress-circular md-mode=\"indeterminate\" ng-show=\"isLoading\"></md-progress-circular><span class=\"md-caption\" ng-show=\"totalCount==0&&!isLoading\">No item found.</span></div></md-virtual-repeat-container></div>',
            link: link
        };

        controller.$inject = ['$scope', '$filter', '$mdDialog', '$window', '$timeout', '$sce'];

        function controller($scope, $filter, $mdDialog, $window, $timeout, $sce) {
            $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
            $scope.selectedItems = $scope.selectedItems || [];
            $scope.selectOnClick = $scope.selectOnClick || false;
           // $scope.containerStyle = $scope.containerStyle || 'wdith:100%;';
            $scope.totalCount = $scope.totalCount || 10;
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

            init();

            $timeout(function () {
                var headerContainer = angular.element(document.querySelector('#table-header-' + $scope.tableId));
                var freezedContainer = angular.element(document.querySelector('#table-container-freezed-' + $scope.tableId+' .md-virtual-repeat-scroller'));

                var scroller = angular.element(document.querySelector('#table-container-' +
                    $scope.tableId + ' .md-virtual-repeat-scroller'));
                
                scroller.on('scroll', function (e) {
                    headerContainer[0].scrollLeft = e.target.scrollLeft;
                    freezedContainer[0].scrollTop = e.target.scrollTop;
                });

            });

            function init() {
                $scope.$watchCollection('selectedItems', onSelectionChanged);
                $scope.$watch('compact', calculateTableWidth);
                $scope.$watch('columns', initColumns);
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
                var freezedWidth = -32;
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

                $scope.freezedContainerStyle = 'min-width:' + freezedWidth + 'px';
                var freezedHeaderWidth = freezedWidth;
                $scope.freezedHeaderStyle = 'min-width:' + freezedHeaderWidth + 'px';

                $scope.unFreezedContainerStyle = 'min-width:' + unFreezedWidth + 'px';
                var unFreezedHeaderWidth = unFreezedWidth + 100;
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
        }

        function link(scope, element, attrs) {

        }

        return directive;
    }

    function twUiTableColumnsPicker() {
        var directive = {
            restrict: 'E',
            controller: controller,
            template: '<md-button class=\"md-primary md-icon-button\" ng-click=\"showPicker($event)\"><md-tooltip>columns</md-tooltip><md-icon md-font-set=\"material-icons\">view_column</md-icon></md-button>',
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
                    template: '<md-dialog><md-toolbar><div class=\"md-toolbar-tools\"><h2>Choose Columns</h2><span flex></span><md-button class=\"md-icon-button\" ng-click=\"cancel()\"><md-icon md-font-set=\"material-icons\">close</md-icon></md-button></div></md-toolbar><md-dialog-content><div class=\"md-dialog-content\"><div ng-repeat=\"column in columns\" ng-if=\"column.title\"><md-checkbox ng-disabled=\"!column.optional\" ng-checked=\"!column.hide\" ng-click=\"toggle(column)\">{{column.title}}</md-checkbox></div></div></md-dialog-content><md-dialog-actions><md-button ng-click=\"hide()\" class=\"md-primary\">close</md-button></md-dialog-actions></md-dialog>',
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