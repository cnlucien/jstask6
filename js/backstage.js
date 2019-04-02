"use strict";

angular.module('backstage', ['ui.router','listapp','addlistapp','editlistapp'])
// 路由
    .config(function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.when('', '/w');
      $stateProvider
          .state('w', {
            url: '/w',
            template: '<h1 style="height: 500px;">Welcome!</h1>'
          })
    })
    .controller('backCtrl', function ($scope, $http,$timeout,$state) {
      $scope.logout=function(){
        $http({
          method:'post',
          url: '/carrots-admin-ajax/a/logout'
        }).then(function (res) {
          if(res.data.code===0){
            location.assign('index.html');
          }else {
            alert(res.data.message);
          }
        })
      }
      //nav导航
      $scope.nav = [
        {
          first: 'Article管理',
          state: false,
          flight: false,
          second: [
            {name: 'Article列表', sref: 'list', url: '/carrots-admin-ajax/a/article/search', light: false},
            {name: '无', sref: '', light: false}
          ]
        },
        {
          first: '无内容',
          state: false,
          flight: false,
          second: [
            {name: '其他', sref: '', light: false},
            {name: '其他', sref: '', light: false},
            {name: '其他', sref: '', light: false}
          ]
        },
        {
          first: '无内容',
          state: false,
          flight: false,
          second: [
            {name: '其他', sref: '', light: false},
            {name: '其他', sref: '', light: false}
          ]
        }
      ];
      //显示隐藏二级菜单
      $scope.firstToggler = function () {
        if (this.x.state === false) {
          //先全部关闭和取消所有一级高亮
          $scope.nav.forEach(function (item) {
            item.state = false;
            item.flight = false;
          });
          this.x.state = true;
          this.x.flight = true//打开点击的并高亮
        } else {
          //如果点击的已经打开，则关闭
          this.x.state = false;
          this.x.flight = false;
        }
      };
      //高亮二级菜单并获取相关list
      $scope.secondLink = function () {
        $scope.startAt = undefined;
        $scope.endAt = undefined;
        $scope.type = '';
        $scope.status = '';
        sessionStorage.startAt = JSON.stringify($scope.startAt);
        sessionStorage.endAt = JSON.stringify($scope.endAt);
        sessionStorage.type = JSON.stringify($scope.type);
        sessionStorage.status = JSON.stringify($scope.status);
        if (this.y.light === false) {
          $scope.nav.forEach(function (x) {
            x.flight = false;//取消所有一级高亮
            x.second.forEach(function (y) {
              y.light = false;//取消所有二级高亮
            })
          });
          this.y.light = true;//高亮此次点击的
        } else {
          $scope.nav.forEach(function (x) {
            x.flight = false;//取消所有一级高亮
          })
        }
        sessionStorage.nav = JSON.stringify($scope.nav);//保存高亮状态
        // 跳转到list，并初始化数据
        $state.go(this.y.sref,{},{reload:true});
      };

      //刷新页面时获取保存数组保持高亮,读取article数据
      if (sessionStorage.nav !== undefined) {
        $scope.nav = JSON.parse(sessionStorage.nav);
      }
      if (sessionStorage.article !== undefined) {
        $scope.article = JSON.parse(sessionStorage.article);
      }
      if (sessionStorage.pages !== undefined) {
        $scope.pages = JSON.parse(sessionStorage.pages);
      }
    })




