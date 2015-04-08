angular.module('myApp', ['unCollage', 'unPlayer'])
	.controller('MainCtrl', ['$scope', '$http', '$timeout', '$rootScope',
	function($scope, $http, $timeout, $rootScope){

		$scope.data = {
			posts: []
		};

		$scope.playlist = 'https://api.soundcloud.com/playlists/92416187.json';

		$scope.showInfo = function(){
			$rootScope.$broadcast('image_clicked');
		};

		// load images every 65 seconds
		function loadImages(){
			$http.get('/posts.json').success(function(result){
				$scope.data.posts = result;
				$timeout(loadImages, 65000);
			});
		}
		loadImages();
	}]);