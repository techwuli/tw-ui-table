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
            template: '<md-virtual-repeat-container style=\"{{containerStyle}}\"><table md-table ng-class=\"{\'selectable\':selectable}\"><thead md-head ng-if=\"!hideHeader\"><tr><th ng-if=\"selectable\"><md-checkbox aria-label=\"check all\" ng-checked=\"allAreSelected()\" ng-click=\"toggleAll()\"></th><th ng-show=\"(!compact||!column.optional) &&! column.hide\" ng-class=\"{\'numeric\':column.numeric}\" ng-repeat=\"column in columns\"><span ng-if=\"column.sortable\" ng-click=\"sort(column)\" class=\"sort-handler\"><span>{{column.title}}</span><md-icon ng-show=\"sortField===column.path && sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_down</md-icon><md-icon ng-show=\"sortField===column.path && !sortDesc\" md-font-set=\"material-icons\">keyboard_arrow_up</md-icon></span><span ng-if=\"!column.sortable\">{{column.title}}</span></th></tr></thead><tbody md-body><tr md-row md-auto-select md-virtual-repeat=\"item in data\" ng-class=\"{\'selected\':isItemSelected(item), \'clickable\':itemClicked}\"><td ng-if=\"selectable\"><md-checkbox aria-label=\"select\" ng-checked=\"isItemSelected(item)\" ng-click=\"toggleItemSelected(item)\"></td><td ng-show=\"(!compact||!column.optional) &&! column.hide\" ng-repeat=\"column in columns\" ng-class=\"{\'numeric\':column.numeric}\" ng-click=\"onItemClicked(item, $event)\"><md-button ng-if=\"column.commands\" class=\"md-icon-button md-primary\" ng-click=\"runCommand(command.commandName, item,$event)\" ng-repeat=\"command in column.commands\"><md-tooltip ng-if=\"command.tooltip\">{{command.tooltip}}</md-tooltip><md-icon md-font-set=\"material-icons\">{{command.icon}}</md-icon></md-button><md-tooltip ng-if=\"column.tooltipFn&&!column.commands\">{{column.tooltipFn(item)}}</md-tooltip><span ng-if=\"!column.commands\">{{getCellText(item, column)}}</span></td></tr></tbody></table><div class=\"md-padding\" layout=\"row\" layout-align=\"center center\"><md-button class=\"md-primary\" ng-click=\"loadMore()\" ng-show=\"data.length<totalCount&&!isLoading\">Load More</md-button><md-progress-circular md-mode=\"indeterminate\" ng-show=\"isLoading\"></md-progress-circular><span class=\"md-caption\" ng-show=\"totalCount==0&&!isLoading\">No item found.</span></div></md-virtual-repeat-container>'
        };

        controller.$inject = ['$scope', '$filter', '$mdDialog', '$window'];

        function controller($scope, $filter, $mdDialog, $window) {
            $scope.defaultDateFormat = $scope.defaultDateFormat || 'MM/dd/yyyy';
            $scope.selectedItems = $scope.selectedItems || [];
            $scope.selectOnClick = $scope.selectOnClick || false;
            $scope.containerStyle = $scope.containerStyle || 'height:100%;';
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

                angular.element($window).bind('resize', function() {
                    calcTableHeight();
                });

                calcTableHeight();
            }

            function onSelectionChanged() {
                if ($scope.selectionChanged) {
                    $scope.selectionChanged();
                }
            }

            function isItemSelected(item) {
                return $scope.selectedItems.indexOf(item) > -1;
            }

            function calcTableHeight() {
                if ($scope.heightOffsetValue && typeof($scope.heightOffsetValue) === 'function') {
                    $scope.containerStyle = 'height: calc(100% - ' + $scope.heightOffsetValue() + 'px);';
                    $scope.$applyAsync();
                }
            }

            function toggleItemSelected(item) {
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

        return directive;
    }
})();
