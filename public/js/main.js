
angular.module('myApp', ['unCollage', 'angularSoundManager'])
	.controller('MainCtrl', function($scope, $http){

		$scope.data = {
			posts: []
		};

		$http.get('/posts.json').success(function(result){
			$scope.data.posts = result;
			//console.log(result);
		});

	})
	.controller('SoundCtrl', ['$scope', 'angularPlayer', function ($scope, angularPlayer) {
		$scope.songs = [];
		
		SC.initialize({
			client_id: "e1c2a174e148e7f9ef62cb7116c1c5fe"
		});
		
		SC.get("/playlists/72999862/tracks", {
			limit: 20
		}, function(tracks) {
			for (var i = 0; i < tracks.length; i ++) {
				SC.stream( '/tracks/' + tracks[i].id, function( sm_object ){
					var track = {
						id: tracks[i].id,
						title: tracks[i].title,
						artist: tracks[i].genre,
						url: sm_object.url
					};
					
					$scope.$apply(function () {
						$scope.songs.push(track);
					});
				});
			}         
		});
	}]);
	









