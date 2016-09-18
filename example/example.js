(function() {
    'use strict';
    angular.module('tw.ui.table.example', ['tw.ui.table'])
        .controller('MainController', [
            '$scope',
            function($scope) {

                var showSimpleTable = false;
                var initTable = function() {
                    $scope.columns = [];
                    for (var i = 0; i < allColumns.length; i++) {
                        if (allColumns[i].alwaysShow || !showSimpleTable) {
                            $scope.columns.push(allColumns[i]);
                        }
                    }
                };

                $scope.data = [{
                    name: 'Zhao Yu',
                    gender: 'Male',
                    age: 34,
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

                var allColumns = [{
                    title: 'Name',
                    path: 'name',
                    alwaysShow: true
                }, {
                    title: 'Gender',
                    path: 'gender'
                }, {
                    title: 'Phone',
                    path: 'phone',
                    numeric: true
                }, {
                    title: 'Age',
                    path: 'age',
                    numeric: true
                }, {
                    title: 'Date',
                    path: 'date',
                    numeric: true,
                    dataType: 'date',
                    dateFormat:'MM/dd/yyyy HH:mm:ss'
                }, {
                    title: 'Work',
                    path: 'work.title'
                }];

                $scope.columns = [];

                $scope.switch = function() {
                    showSimpleTable = !showSimpleTable;
                    initTable();
                };

                $scope.addData = function() {
                    $scope.data.push({
                        name: 'Yu Qiying',
                        gender: 'Female',
                        age: 58
                    });
                };

                $scope.addColumn = function() {
                    $scope.columns.push({
                        display: 'Age',
                        name: 'age',
                        numeric: true
                    });
                };

                $scope.onItemClicked = function(item) {
                    console.log(item);
                };

                initTable();
            }
        ]);
})();
