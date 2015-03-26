
angular.module('myApp', [])
	.controller('MainCtrl', function($scope, $http){
		console.log('yo');

		$http.get('/posts.json').success(function(result){
			$scope.posts = result;
			console.log(result);
		});

	});