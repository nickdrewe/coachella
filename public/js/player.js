angular.module('unPlayer', [])
	.service('SoundService', [function(){

		// bindable state
		var state = {
			playlist: [],
			trackIndex: 0,
			currentTrack: null,
			playing: false
		};

		// private vars
		var key,
			player,
			currentSound,
			firstPlay = true;

		function randInt(max){
			return Math.floor(Math.random() * max);
		}

		this.setKey = function(_key){
			key = _key;
		};

		this.playTrack = function(index){
			var self = this;
			currentSound = player.createSound({
				url: state.playlist[index].stream_url + '?client_id=' + key,
				autoPlay: true,
				onfinish: function(){
					self.next();
				},
				onplay: function(){
					state.playing = true;
				}
			});
			state.trackIndex = index;
			state.currentTrack = state.playlist[index];
		};

		this.playPause = function(){
			if(state.playing){
				currentSound.pause();
			}else{
				currentSound.play();
			}
			state.playing = !state.playing;
		};

		this.next = function(){
			currentSound.destruct();
			this.playTrack(randInt(state.playlist.length));
		};

		this.loadPlaylist = function(playlist){
			state.playlist = playlist;
			if(!player){
				player = soundManager.setup();
			}
			this.playTrack(randInt(state.playlist.length));
		};

		this.getState = function(){
			return state;
		};
	}])
	.directive('player', ['SoundService', '$http', function(SoundService, $http){
		return {
			scope: {
				trackList: '=player'
			},
			templateUrl: 'templates/player.html',
			link: function(scope, elem, attrs){

				// get the bindable state from the service
				scope.state = SoundService.getState();
				
				scope.nextTrack = function(){
					SoundService.next();
				};

				scope.playPause = function(){
					SoundService.playPause();
				};
				
				// initialise the service
				SoundService.setKey(attrs.key);
				// watch for playlist changes so the system can update
				scope.$watch('trackList', function(newValue, oldValue){
					if(newValue){
						$http.get(newValue + '?streamable=true&client_id=' + attrs.key).success(function(data){

							var streamableTracks = [];
							angular.forEach(data.tracks, function(track){
								if(track.streamable){
									streamableTracks.push(track);
								}
							})
							SoundService.loadPlaylist(streamableTracks);
						});
					}
				});
			}
		};
	}]);