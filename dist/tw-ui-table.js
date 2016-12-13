(function() {
    'use strict';
    angular.module('tw.ui.table', ['ngMaterial'])
        // .filter('html', ['$sec', function($sec) {
        //     return function(text) {
        //         return $sce.trustAsHtml(text);
        //     };
        // }])
        // .directive('dynamic', function ($compile) {
        //     return {
        //         restrict: 'A', replace: true, link: function (scope, ele, attrs) {
        //             scope.$watch(attrs.dynamic, function (html) {
        //                 ele.html(html);
        //                 $compile(ele.contents())(scope);
        //             });
        //         }
        //     };
        // })
        .directive('twUiTable', twUiTable);

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
                itemCommands: '=?'
            },
            controller: controller,
            link: link,
            template: '<section layout=\"row\" class=\"tw-table-header\" ng-if=\"!hideHeader\" style=\"{{containerStyle}}\"><div class=\"tw-table-cell tw-table-cell-check\" ng-if=\"selectable\"><md-checkbox aria-label=\"check all\" ng-checked=\"allAreSelected()\" ng-click=\"toggleAll()\"></div><div class=\"tw-table-cell x{{column.size}}\" ng-show=\"(!compact||!column.optional) &&! column.hide\" ng-class=\"{\'numeric\':column.numeric,\'tw-table-cell-command\':column.type===\'command\',\'tw-table-cell-text\':column.type!==\'command\'}\" ng-repeat=\"column in columns\"><div ng-if=\"column.sortable\" ng-click=\"sort(column)\" class=\"sort-handler\"><span>{{column.title}}</span><md-icon ng-show=\"sortField===column.path && sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_down</md-icon><md-icon ng-show=\"sortField===column.path && !sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_up</md-icon></div><span ng-if=\"!column.sortable\">{{column.title}}</span></div></section><md-virtual-repeat-container style=\"{{containerStyle}}\"><div class=\"tw-table-row\" layout=\"row\" md-virtual-repeat=\"item in data\" ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\" ng-click=\"onItemClicked(item, $event)\"><div ng-if=\"selectable\" class=\"tw-table-cell tw-table-cell-check\"><md-checkbox aria-label=\"select\" ng-checked=\"isItemSelected(item)\" ng-click=\"toggleItemSelected(item, $event)\"></div><div ng-repeat=\"column in columns\" ng-show=\"(!compact||!column.optional) && !column.hide\" class=\"tw-table-cell x{{column.size}}\" ng-class=\"{\'tw-table-cell-command\':column.type===\'command\',\'numeric\':column.numeric,\'tw-table-cell-text\':column.type!==\'command\'}\"><md-button ng-if=\"column.type===\'command\'\" class=\"md-icon-button md-primary\" ng-click=\"runCommand(column.commandName, item,$event)\"><md-tooltip ng-if=\"column.tooltip\">{{column.tooltip}}</md-tooltip><md-icon md-font-set=\"material-icons\">{{column.icon}}</md-icon></md-button><md-tooltip ng-if=\"column.tooltipFn&&column.type!==\'command\'\">{{column.tooltipFn(item)}}</md-tooltip><span ng-if=\"column.type!==\'command\'\">{{getCellText(item, column)}}</span></div></div><md-progress-linear md-mode=\"indeterminate\" class=\"md-warn\" ng-show=\"isLoading\"></md-progress-linear><div class=\"md-padding\" layout=\"row\" ng-show=\"totalCount==0&&!isLoading\" layout-align=\"center center\"><span class=\"md-caption\">No item found.</span></div></md-virtual-repeat-container>'
        };

        controller.$inject = ['$scope', '$filter', '$mdDialog', '$window'];

        function controller($scope, $filter, $mdDialog, $window) {
            $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
            $scope.selectedItems = $scope.selectedItems || [];
            $scope.selectOnClick = $scope.selectOnClick || false;
            $scope.containerStyle = $scope.containerStyle || 'wdith:100%;';
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

            init();

            function init() {
                $scope.$watchCollection('selectedItems', onSelectionChanged);
                $scope.$watch('compact', calculateTableWidth);
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
                angular.forEach($scope.columns, function(column) {
                    if (column.type === 'command') {
                        width += 52;
                    } else {
                        if (!$scope.compact || !column.optional) {
                            column.size = column.size || 1;
                            width += 75 * column.size + 56;
                        }
                    }
                });
                $scope.containerStyle = 'min-width:' + width + 'px';
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
                    angular.forEach($scope.data, function(item) {
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

                if (typeof(columnValue) === 'undefined' || columnValue === null) {
                    return '';
                }

                if (column.dataType === 'date') {
                    var format = column.dateFormat || $scope.defaultDateFormat;
                    columnValue = $filter('date')(new Date(columnValue), format);
                }

                if (typeof(column.render) === 'function') {
                    var resp = column.render(columnValue, item, column);
                    return typeof(resp) === 'string' ? resp : '' + resp;
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
        }

        function link(scope, element, attrs) {
            var scrollerElements = element[0].getElementsByClassName('md-virtual-repeat-scroller');
            var scroller = angular.element(scrollerElements);
            scroller.on('scroll', function(e) {
                checkScroll(scope, element, e);
            });
        }

        function checkScroll(scope, element, e) {
            var scrollDiff = e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.clientHeight;
            if (scrollDiff < 300 && scope.totalCount > scope.data.length && !scope.isLoading) {
                scope.isLoading = true;
                scope.loadMore();
            }
        }

        return directive;
    }
})();
