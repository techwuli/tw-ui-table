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
            '$scope', '$window', '$q', '$timeout',
            function ($scope, $window, $q, $timeout) {

                $scope.compact = false;
                $scope.pageIndex = 0;
                $scope.pageSize = 50;
                $scope.totalCount = 0;



                $scope.data = [];

                $scope.columns = [
                    {
                        type: 'button',
                        icon: 'open_in_new',
                        tooltip: 'show name',
                        onClicked: fn1
                    }, {
                        title: 'Name',
                        path: 'name',
                        sortable: true,
                        onClicked: fn2,
                        size: 2,
                        tooltipFn: function (item) {
                            if (item) {
                                return 'hello, ' + item.name;
                            }
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
                        render: function (val, item, column) {
                            return item.name + ' - ' + item.age;
                        }
                    }];



                $scope.heightOffsetValue = function () {
                    var barH = angular.element(document.querySelector('.toolbar-place'))[0].clientHeight;
                    return barH;
                };

                var dataSource = {
                    loadData: function (pageIndex, pageSize) {
                        var deferred = $q.defer();
                        var data = [];
                        for (var i = pageIndex * pageSize; i < pageIndex * pageSize + pageSize; i++) {
                            data.push({
                                name: 'Demo Name' + i,
                                gender: i % 2 === 0 ? 'Male' : 'Female',
                                age: i % 70,
                                phone: '876776565',
                                date: new Date()
                            });
                        }

                        $timeout(function () {
                            deferred.resolve({
                                items: data,
                                pageIndex: pageIndex,
                                pageSize: pageSize,
                                totalCount: 1000
                            });
                        }, 1000);

                        return deferred.promise;
                    }
                };

                function loadData() {
                    console.log('loading data, page: ' + $scope.pageIndex);
                    $scope.loading = true;
                    dataSource.loadData($scope.pageIndex, $scope.pageSize)
                        .then(function (data) {
                            $scope.loading = false;
                            $scope.pageSize = data.pageSize;
                            $scope.pageIndex = data.pageIndex;
                            $scope.totalCount = data.totalCount;
                            angular.forEach(data.items, function (item) {
                                $scope.data.push(item);
                            });
                        });
                }

                loadData();

                $scope.loadMore = function () {
                    $scope.pageIndex++;
                    loadData();
                };

                $scope.onItemClicked = function (item) {
                    console.log(item);
                };

                $scope.toggleHeader = function () {
                    $scope.hideHeader = !$scope.hideHeader;
                };

                $scope.showItemInConsole = function (item) {
                    console.log(item);
                };

                $scope.checkSelections = function () {
                    console.log('checking selections');
                };

                $scope.sort = function (sortField, desc) {
                    console.log(sortField, desc);
                };

                function fn1(item) {
                    console.log(item.name);
                }

                function fn2(item) {
                    console.log(item.age);
                }
            }
        ]);
})();
