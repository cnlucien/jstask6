'use strict';
angular.module('listapp', ['backstage', 'ui.router', 'tm.pagination', 'ngDialog'])
    .config(function ($stateProvider) {
      $stateProvider.state('list', {
        url: '/list',
        templateUrl: 'view/list.html',
        controller: 'listCtrl'//注册list的控制器
      })
    })
    .controller('listCtrl', function ($scope, ngDialog, $http, $state, $filter, $stateParams) {

      //根据条件搜索list函数
      function getlist(page, size, startAt, endAt, type, status) {
        $http({
          method: 'get',
          url: '/carrots-admin-ajax/a/article/search',
          params: {page: page, size: size, startAt: startAt, endAt: endAt, type: type, status: status}
        }).then(function (res) {
          if (res.data.code === 0) {
            $scope.paginationConf.totalItems = res.data.data.total;// 变更分页的总数
            $scope.article = res.data.data.articleList; // 变更产品条目
            sessionStorage.article = JSON.stringify($scope.article);
            console.log(3, $scope.article);
          }
        })
      }

      //点击分页重新获取数据
      function reGetList() {
        console.log('reget');
        if ($scope.startAt !== undefined && $scope.startAt !== null) {
          var startAt = $scope.startAt.getTime();
        }
        if ($scope.endAt !== undefined && $scope.endAt !== null) {
          var endAt = $scope.endAt.getTime() + 24 * 60 * 60 * 1000;
        }
        getlist($scope.paginationConf.currentPage, $scope.paginationConf.itemsPerPage, startAt, endAt, $scope.type, $scope.status);
      }

      // 配置分页基本参数
      $scope.paginationConf = {
        currentPage: 1
      };
      // 通过$watch currentPage和itemperPage 当他们一变化的时候，重新获取数据条目
      $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', reGetList);

      //点击搜索
      $scope.search = function () {
        //存储发布时间，类型，状态
        if ($scope.startAt !== undefined && $scope.startAt !== null) {
          var startAt = $scope.startAt.getTime();
          console.log(11, $scope.startAt, startAt);
          sessionStorage.startAt = JSON.stringify($scope.startAt);
        }
        if ($scope.endAt !== undefined && $scope.endAt !== null) {
          var endAt = $scope.endAt.getTime() + 24 * 60 * 60 * 1000;
          console.log(12, $scope.endAt, endAt);
          sessionStorage.endAt = JSON.stringify($scope.endAt);
        }
        if ($scope.type !== undefined) {
          sessionStorage.type = JSON.stringify($scope.type);
        }
        if ($scope.status !== undefined) {
          sessionStorage.status = JSON.stringify($scope.status);
        }
        $scope.paginationConf.currentPage = 1;//当前页重置为1
        //调用搜索函数
        getlist($scope.paginationConf.currentPage, $scope.paginationConf.itemsPerPage, startAt, endAt, $scope.type, $scope.status);
      }
      //点击清空
      $scope.clear = function () {
        $scope.startAt = undefined;
        $scope.endAt = undefined;
        $scope.type = '';
        $scope.status = '';
        sessionStorage.startAt = JSON.stringify($scope.startAt);
        sessionStorage.endAt = JSON.stringify($scope.endAt);
        sessionStorage.type = JSON.stringify($scope.type);
        sessionStorage.status = JSON.stringify($scope.status);
        $scope.paginationConf.currentPage = 1;//当前页重置为1
        getlist($scope.paginationConf.currentPage, $scope.paginationConf.itemsPerPage);
      }

//打开modal框
      function openModal(conh, cel, fun) {
        return ngDialog.open({
          template: 'src/ngDialog/dialog.html',
          className: 'ngdialog-theme-default',
          scope: $scope,
          controller: function ($scope) {
            $scope.modalConh = conh;
            $scope.nocancel = cel;
            $scope.confirm = function () {
              fun();
              $state.go('list', {}, {reload: true});//跳转到list
              $scope.closeThisDialog();
            };
            $scope.cancel = function () {
              $scope.closeThisDialog();
            };
          }
        })
      }

      //删除数据URL
      function delURL(id) {
        return $http({
          method: 'delete',
          url: '/carrots-admin-ajax/a/u/article/' + id,
        }).then(function (res) {
          console.log('删除', res.data.message);
        })
      }

      //删除数据
      $scope.delete = function (id, index) {
        openModal('确认删除吗？', true, function () {
          delURL(id);
        });

      }

      //修改article的上架/下架url
      function changeStatusURL(id, status) {
        return $http({
          method: 'put',
          url: '/carrots-admin-ajax/a/u/article/status',
          params: {id: id, status: status}
        }).then(function (res) {
          console.log('上下线', res.data.message);
        })
      }

      //修改修改article的上架/下架
      $scope.changeStatus = function (id, status) {
        var s = $filter('reverse')(status);
        if (status === 1) {
          var st = 2;
        } else {
          st = 1;
        }
        openModal('是否执行' + s + '操作？', true, function () {
          changeStatusURL(id, st);
        });
      }

//获得单个articleURL
      function getArticleURL(id) {
        return $http({
          method: 'get',
          url: '/carrots-admin-ajax/a/article/' + id,
        })
      }

      $scope.addlist = function () {
        $state.go('addlist', {}, {reload: true});
      }
      //编辑跳转到rditlist
      $scope.edit = function (id) {
        getArticleURL(id).then(function (res) {
          if (res.data.code === 0) {
            var article = res.data.data.article;
            console.log('编辑单个', article);
            var id = article.id;
            var title = article.title;
            var type = parseInt(article.type);
            var img = article.img;
            var content = article.content;
            var url = article.url;
            var industry = parseInt(article.industry);
            var createAt = parseInt(article.createAt);
            console.log('编辑单个', createAt);
            $state.go('editlist', {
              id: id,
              title: title,
              type: type,
              img: img,
              content: content,
              url: url,
              industry: industry,
              createAt: createAt
            }, {reload: true})
          }
        })
      }
      //刷新后读取本地数据
      if (sessionStorage.size !== undefined) {
        $scope.size = JSON.parse(sessionStorage.size);
      }//每页条数
      if (sessionStorage.startAt !== undefined) {
        if (sessionStorage.startAt === 'undefined') {
          $scope.startAt = undefined;
        } else {
          $scope.startAt = new Date(JSON.parse(sessionStorage.startAt));
        }
      }//发布时间
      if (sessionStorage.endAt !== undefined) {
        if (sessionStorage.endAt === 'undefined') {
          $scope.endAt = undefined;
        } else {
          $scope.endAt = new Date(JSON.parse(sessionStorage.endAt));
        }
      }
      if (sessionStorage.type !== undefined) {
        $scope.type = JSON.parse(sessionStorage.type);
      }//类型
      if (sessionStorage.status !== undefined) {
        $scope.status = JSON.parse(sessionStorage.status);
      }//状态
    })
    //类型过滤器
    .filter('typeFilter', function () {
      return function (text) {
        switch (text) {
          case 0:
            text = '首页Banner';
            break;
          case 1:
            text = '找职位Banner';
            break;
          case 2:
            text = '找精英Banner';
            break;
          case 3:
            text = '行业大图';
            break;
        }
        return text;
      }
    })
    //状态filter
    .filter('statusFilter', function () {
      return function (t) {
        switch (t) {
          case 1:
            t = '草稿';
            break;
          case 2:
            t = '上线';
            break
        }
        return t;
      }
    })
    //上线下线filter
    .filter('reverse', function () {
      return function (t) {
        switch (t) {
          case 1:
            t = '上线';
            break;
          case 2:
            t = '下线';
            break
        }
        return t;
      }
    })