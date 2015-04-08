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
		var keys = {};
		var keyCount = 0;

		function loadImages(){
			$http.get('/posts.json').success(function(result){
				// catch all if someone leaves the site on
				if(keyCount > 50000){
					keys = {};
					keyCount = 0;
				}

				angular.forEach(result, function(item){
					if(!keys[item.link]){
						keys[item.link] = true;
						keyCount++;
						$scope.data.posts.push(item);
					}
				});
				if($scope.data.posts.length > 200){
					$scope.data.posts.splice(0, $scope.data.posts.length - 200);
				}
				$timeout(loadImages, 65000);
			});
		}
		loadImages();
	}]);