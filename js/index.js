"use strict";
angular.module('loginapp', [])
    .controller('logincon', function ($scope, $http, $timeout) {
      $scope.login = function () {
        console.log($scope.user, $scope.password);
        if ($scope.user === undefined && $scope.password === undefined) {
          $scope.message = '用户名和密码不能为空';
        } else {
          $http({
            method: 'post',
            url: '/carrots-admin-ajax/a/login',
            params: {name: $scope.user, pwd: $scope.password}
            // config: {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
          }).then(function (response) {
            console.log(response);
            let data = response.data;
            if (data.code === 0) {
              location.assign("backstage.html");
            } else {
              $scope.message = data.message;
            }

          });
        }

        $timeout(function () {
          $scope.message = '';
        }, 2000);

      }
    });



