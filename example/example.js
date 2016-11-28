(function () {
    'use strict';
    angular.module('tw.ui.table.example', ['tw.ui.table'])
        .controller('MainController', [
            '$scope', '$window',
            function ($scope, $window) {

                $scope.compact = false;

                $scope.data = [{
                    name: 'Zhao Yu',
                    gender: 'Male',
                    age: 0,
                    phone: '876776565',
                    date: new Date(),
                    work: {
                        company: 'Techwuli',
                        title: 'Senior Developer'
                    }
                }, {
                    name: 'Chen Min',
                    gender: 'Female',
                    age: 30,
                    phone: '909876556'
                }, {
                    name: 'Zhao Yunze',
                    gender: 'Male',
                    age: 4
                }];

                $scope.columns = [{
                    title: 'Name',
                    path: 'name',
                    sortable: true,
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
                    optional: true
                }, {
                    title: 'Date',
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

                $scope.switch = function () {
                    $scope.compact = !$scope.compact;
                };

                $scope.addData = function () {
                    $scope.data.push({
                        name: 'Yu Qiying',
                        gender: 'Female',
                        age: 58
                    });
                };

                $scope.addColumn = function () {
                    $scope.columns.push({
                        display: 'Age',
                        name: 'age',
                        numeric: true,
                        path: 'age'
                    });
                };

                $scope.heightOffsetValue = function () {
                    var barH = angular.element(document.querySelector('.toolbar-place'))[0].clientHeight;
                    return barH;
                };

                $scope.largeData = function () {
                    var large = [];
                    var start = new Date().getMilliseconds();
                    for (var i = 0; i < 10000; i++) {
                        large.push({
                            name: 'Demo Name' + i,
                            gender: i % 2 === 0 ? 'Male' : 'Female',
                            age: i % 70,
                            phone: '876776565',
                            date: new Date()
                        });
                    }
                    var end = new Date().getMilliseconds();
                    console.info('create data with:' + end - start);
                    $scope.data = large;
                    var render = new Date().getMilliseconds();
                    console.info('render data with:' + render - end);
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
            }
        ]);
})();
