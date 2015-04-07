angular.module('myApp', ['unCollage'])
	.controller('MainCtrl', function($scope, $http){

		$scope.data = {
			posts: []
		};

		$http.get('/posts.json').success(function(result){
			$scope.data.posts = result;
			//console.log(result);
		});

	})
	.value('scKey', 'e1c2a174e148e7f9ef62cb7116c1c5fe')
	.controller('SoundCtrl', ['$scope', '$http', 'soundService', 'scKey', function ($scope, $http, soundService, scKey) {	
		$scope.sndSvc = soundService;
		$scope.loaded = false;
		$scope.playing = false;
		$scope.currentTrack;

		var playlistUrl = 'https://api.soundcloud.com/playlists/72999862.json' + '?streamable=true&client_id=' + scKey;
		$http.get(playlistUrl).success(function(data){

			var streamableTracks = [];
			angular.forEach(data.tracks, function(track){
				if(track.streamable){
					streamableTracks.push(track);
				}
			})
			soundService.newPlayer(streamableTracks);
			$scope.loaded = true;
		});

		$scope.nextTrack = function(){
			soundService.next();
		}
		$scope.pause = function(){
			soundService.pause();
		}
		$scope.play = function(){
			soundService.play();
		}

		//watch soundService for playing status
		$scope.$watch('sndSvc.playing', function(newVal){
			$scope.playing = newVal;
			console.log('playing: ' + newVal);
		});
		//watch soundService for current track
		$scope.$watch('sndSvc.currentTrack', function(newVal){
			$scope.currentTrack = newVal;
			console.log(newVal);
		});

	}])
	.service('soundService', ['scKey', function(scKey){
		
		var player = {};
		var playlist = [];
		var playingIndex = 0;
		var currentSound;
		
		this.currentTrack = {};
		this.playing = false;

		this.newPlayer = function(tracks){
			playlist = tracks;
			player = soundManager.setup({
				//something
			});
			this.playTrack(0);
			this.playing = true;
			// soundService.play();
		}
		this.playTrack = function(index){
			var url = playlist[index].stream_url + '?client_id=' + scKey;
			currentSound = player.createSound({
				id: index,
				url: url,
				autoPlay: true,
				onfinish: function(){
					this.next();
				}
			});
			playingIndex = index;
			this.currentTrack = playlist[index];
			this.playing = true;

		}
		this.play = function(){
			currentSound.play();
			this.playing = true;
		}
		this.next = function(){
			currentSound.destruct();
			playingIndex++;
			this.playTrack(playingIndex);
			this.playing = true;
		}
		this.pause = function(){
			currentSound.pause();
			this.playing = false;
		}

	}]);
	









