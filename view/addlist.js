'use strict';
angular.module('addlistapp', ['backstage', 'ui.router', 'angularFileUpload', 'ngDialog'])
    .config(function ($stateProvider) {
      $stateProvider.state('addlist', {
        url: '/addlist',
        templateUrl: 'view/addlist.html',
        controller: 'addlistCtrl'
      });
    })
    .controller('addlistCtrl', function ($scope, FileUploader, ngDialog, $http, $state, $stateParams) {
      //富文本
      var um = UM.getEditor('myEditor',{
        //focus时自动清空初始化时的内容
        autoClearinitialContent:true,
        //关闭字数统计
        wordCount:false,
        //关闭elementPath
        elementPathEnabled:false,
        //默认的编辑区域高度
        initialFrameWidth:'100%',
        initialFrameHeight:200,
        //是否保持toolbar的位置不动,默认true
        autoFloatEnabled:false
        //更多其他参数，请参考umeditor.config.js中的配置项
      });

      //重置筛选参数
      function reSetParams() {
        $scope.startAt = undefined;
        $scope.endAt = undefined;
        $scope.type = '';
        $scope.status = '';
        sessionStorage.startAt = JSON.stringify($scope.startAt);
        sessionStorage.endAt = JSON.stringify($scope.endAt);
        sessionStorage.type = JSON.stringify($scope.type);
        sessionStorage.status = JSON.stringify($scope.status);
      }

      //上传图片
      var uploader = $scope.uploader = new FileUploader({
        url: '/carrots-admin-ajax/a/u/img/task',
      });
      // FILTERS
      uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
      // CALLBACKS
      //上传成功返回img的url
      uploader.onSuccessItem = function (fileItem, response, status, headers) {
        $scope.imgURL = response.data.url;
      };

//新增articleurl函数
      function addlistURL(data) {
        return $http({
          method: 'post',
          url: '/carrots-admin-ajax/a/u/article',
          data: data,
          // data:$.param(data),
          headers: {'Content-Type': undefined}
          // headers:{'Content-Type': 'application/x-www-form-urlencoded'}
        })
      }

//打开modal框
      function openModal(conh, cel) {
        return ngDialog.open({
          template: 'src/ngDialog/dialog.html',
          className: 'ngdialog-theme-default',
          scope: $scope,
          controller: function ($scope) {
            $scope.modalConh = conh;
            $scope.nocancel = cel;
            $scope.confirm = function () {
              $state.go('list', {}, {reload: true});//跳转到list
              $scope.closeThisDialog();
            };
            $scope.cancel = function () {
              $scope.closeThisDialog();
            };
          }
        })
      }

      //  立即上线
      $scope.pubArticle = function () {
        //获取表单元素
        var dform = document.querySelector('#dform');
        //创建formdata
        var addfd = new FormData(dform);
        addfd.append('status', 2);
        addfd.append('img', $scope.imgURL);
        console.log(addfd.get('content'));
        addlistURL(addfd).then(function (res) {
          console.log(res);
          if (res.data.code === 0) {
            reSetParams();
            openModal('添加成功！', false);//调用modal
          } else {
            alert(res.data.message);
          }
        });
      }
      //存为草稿
      $scope.saveArticle = function () {
        //获取表单元素
        var dform = document.querySelector('#dform');
        //创建formdata
        var addfd = new FormData(dform);
        addfd.append('status', 1);
        addfd.append('img', $scope.imgURL);
        addlistURL(addfd).then(function (res) {
          console.log(res);
          if (res.data.code === 0) {
            reSetParams();
            openModal('添加成功！', false);//调用modal
          } else {
            alert(res.data.message);
          }
        });
      }


      //  取消
      $scope.cancel = function () {
        reSetParams();
        history.back();
      }
    })