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
                    phone: '18680858642',
                    date: new Date()
                }, {
                    name: 'Chen Min',
                    gender: 'Female',
                    age: 30,
                    phone: '18696750011'
                }, {
                    name: 'Zhao Yunze',
                    gender: 'Male',
                    age: 4
                }];

                var allColumns = [{
                    display: 'Name',
                    name: 'name',
                    alwaysShow: true
                }, {
                    display: 'Gender',
                    name: 'gender'
                }, {
                    display: 'Phone',
                    name: 'phone',
                    numeric: true
                }, {
                    display: 'Age',
                    name: 'age',
                    numeric: true
                }, {
                    display: 'Date',
                    name: 'date',
                    numeric: true
                }];

                $scope.columns = [];

                $scope.switch = function() {
                    showSimpleTable = !showSimpleTable;
                    initTable();
                };

                $scope.addData = function() {
                    $scope.data.push({
                        name: 'Yu Qiyong',
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
