(function () {
    'use strict';
    angular.module('tw.ui.table.example', ['tw.ui.table'])
        .filter('age', function () {
            return function (input) {
                if (input) {
                    return 'age:' + input;
                }
                return input;
            };
        })
        .controller('MainController', [
            '$scope', '$window', '$timeout', '$q',
            function ($scope, $window, $timeout, $q) {

                $scope.data = [];
                $scope.compact = false;
                $scope.pageIndex = 0;
                $scope.pageSize = 50;
                $scope.totalCount = 0;
                $scope.switch = switchFn;
                $scope.onItemClicked = onItemClicked;
                $scope.toggleHeader = toggleHeader;
                $scope.showItemInConsole = showItemInConsole;
                $scope.checkSelections = checkSelections;
                $scope.sort = sort;
                $scope.onPagingChanged = onPagingChanged;

                $scope.columns = [{
                    type: 'button',
                    icon: 'open_in_new',
                    tooltip: 'show name',
                    onClicked: fn1,
                    freezed: true,
                    isDisabled: function (item) {
                        return item.age % 2 !== 0;
                    }
                }, {
                    title: 'Name',
                    path: 'name',
                    sortable: true,
                    onClicked: fn2,
                    size: 3,
                    freezed: true,
                    tooltipFn: function (item) {
                        return 'hello, ' + item.name;
                    },
                    sortPath: 'phone'
                }, {
                    title: 'Gender',
                    path: 'gender'
                }, {
                    title: 'Phone',
                    path: 'phone',
                    numeric: true,
                    optional: true,
                    sortable: true
                }, {
                    title: 'Age',
                    path: 'age',
                    numeric: true,
                    optional: true,
                    filter: 'age'
                }, {
                    title: 'Date Created or Updated',
                    path: 'date',
                    numeric: true,
                    dataType: 'date',
                    dateFormat: 'MM/dd/yyyy HH:mm:ss',
                    optional: true
                }, {
                    title: 'Work',
                    path: 'work.title',
                    optional: true
                }, {
                    title: 'Render',
                    path: 'name',
                    size: 3,
                    render: function (val, item, column) {
                        return item.name + ' - ' + item.age;
                    }
                }, {
                    type: 'button',
                    icon: 'open_in_new',
                    tooltip: 'show name',
                    onClicked: fn1,
                    isDisabled: function (item) {
                        return item.age % 2 === 0;
                    }
                }];

                function switchFn() {
                    $scope.compact = !$scope.compact;
                }

                init();

                function init() {
                    loadData($scope.pageIndex, $scope.pageSize);
                }

                function loadData(pageIndex, pageSize) {
                    $scope.loading = true;
                    fetchData(pageIndex, pageSize).then(function (data) {
                        $scope.loading = false;
                        $scope.data = data.items;
                        $scope.pageIndex = data.pageIndex;
                        $scope.pageSize = data.pageSize;
                        $scope.totalCount = data.totalCount;
                    });
                }

                function fetchData(pageIndex, pageSize) {
                    var deferred = $q.defer();
                    $timeout(function () {
                        var data = [];
                        for (var i = pageIndex * pageSize; i < (pageIndex + 1) * pageSize; i++) {
                            data.push({
                                name: 'Demo name ' + i,
                                gender: i % 2 === 0 ? 'Male' : 'Female',
                                age: i % 70,
                                phone: '83874982375',
                                data: new Date()
                            });
                        }
                        deferred.resolve({
                            pageIndex: pageIndex,
                            pageSize: pageSize,
                            items: data,
                            totalCount: 10000000
                        });
                    }, 1000);

                    return deferred.promise;
                }

                function onItemClicked(item) {
                    console.log(item);
                }

                function toggleHeader() {
                    $scope.hideHeader = !$scope.hideHeader;
                }

                function showItemInConsole(item) {
                    console.log(item);
                }

                function checkSelections() {
                    console.log('checking selections');
                }

                function sort(sortField, desc) {
                    console.log(sortField, desc);
                }

                function onPagingChanged(pageIndex, pageSize) {
                    $scope.data = [];
                    loadData(pageIndex, pageSize);
                }

                function fn1(item) {
                    console.log(item.name);
                }

                function fn2(item) {
                    console.log(item.age);
                }
            }
        ]);
})();