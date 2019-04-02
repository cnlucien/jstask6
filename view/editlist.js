'use strict';
angular.module('editlistapp', ['backstage', 'ui.router', 'angularFileUpload', 'ngDialog'])
    .config(function ($stateProvider) {
      $stateProvider.state('editlist', {
        url: '/addlist/:id:title:type:content:url:img:industry:createAt',
        templateUrl: 'view/editlist.html',
        controller: 'editlistCtrl'
      });
    })
    .controller('editlistCtrl', function ($scope, FileUploader, ngDialog, $http, $state, $stateParams) {
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
      //接受list参数
      $scope.dtitle = $stateParams.title;
      $scope.dtype = $stateParams.type;
      // $scope.dcontent = $stateParams.content;
      um.setContent($stateParams.content);
      $scope.durl = $stateParams.url;
      $scope.imgURL = $stateParams.img;
      $scope.dindustry = $stateParams.industry;
      var eid = $stateParams.id;
      var createAt = $stateParams.createAt;
      console.log('din', $scope.dindustry);

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

      //编辑articleurl
      function editlistURL(id, data) {
        return $http({
          method: 'put',
          url: '/carrots-admin-ajax/a/u/article/' + id,
          params: data
          // headers: {'Content-Type': 'Application/json'}
        })
      }

      var data = {};
      //  立即上线
      $scope.pubArticle = function () {
        if (!isNaN($scope.dindustry)) {
          data = {
            title: $scope.dtitle,
            img: $scope.imgURL,
            // content:$scope.dcontent,
            content: um.getContent(),
            url: $scope.durl,
            industry: $scope.dindustry,
            type: parseInt($scope.dtype),
            createAt: parseInt(createAt)
          }
        }else{
          data={
            title: $scope.dtitle,
            img: $scope.imgURL,
            // content:$scope.dcontent,
            content: um.getContent(),
            url: $scope.durl,
            // industry: $scope.dindustry,
            type: parseInt($scope.dtype),
            createAt: parseInt(createAt)
          }
        }
        data.status = '2';

        editlistURL(eid, data).then(function (res) {
          console.log(res);
          if (res.data.code === 0) {
            reSetParams();
            openModal('编辑完成！', false);//调用modal
          } else {
            alert(res.data.message);
          }
        });
      }
      //存为草稿
      $scope.saveArticle = function () {
        if (!isNaN($scope.dindustry)) {
          data = {
            title: $scope.dtitle,
            img: $scope.imgURL,
            // content:$scope.dcontent,
            content: um.getContent(),
            url: $scope.durl,
            industry: $scope.dindustry,
            type: parseInt($scope.dtype),
            createAt: parseInt(createAt)
          }
        }else{
          data={
            title: $scope.dtitle,
            img: $scope.imgURL,
            // content:$scope.dcontent,
            content: um.getContent(),
            url: $scope.durl,
            // industry: $scope.dindustry,
            type: parseInt($scope.dtype),
            createAt: parseInt(createAt)
          }
        }
        data.status = '1';

        editlistURL(eid, data).then(function (res) {
          console.log(res);
          if (res.data.code === 0) {
            reSetParams();
            openModal('编辑完成！', false);//调用modal
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