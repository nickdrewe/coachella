angular.module('myApp', ['unCollage', 'unPlayer'])
	.controller('MainCtrl', ['$scope', '$http', function($scope, $http){

		$scope.data = {
			posts: []
		};

		$scope.playlist = 'https://api.soundcloud.com/playlists/92416187.json';

		$http.get('/posts.json').success(function(result){
			$scope.data.posts = result;
		});
	}]);