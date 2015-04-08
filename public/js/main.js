angular.module('myApp', ['unCollage', 'unPlayer'])
	.controller('MainCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){

		$scope.data = {
			posts: []
		};

		$scope.playlist = 'https://api.soundcloud.com/playlists/92416187.json';

		// load images every 65 seconds
		function loadImages(){
			$http.get('/posts.json').success(function(result){
				$scope.data.posts = result;
				$timeout(loadImages, 6500);
			});
		}
		loadImages();
	}]);