
angular.module('myApp', ['ngAnimate'])
	.controller('MainCtrl', function($scope, $http){

		$scope.data = {
			posts: []
		};

		$http.get('/posts.json').success(function(result){
			$scope.data.posts = result;
			//console.log(result);
		});

	})
	.controller('CollageCtrl', ['$scope', '$window', function($scope, $window){

		$scope.allImages = [];
		$scope.rowImages = [];

		this.initialise = function(maxImages){
			var width = $window.innerWidth;
			var height = $window.innerHeight;

			this.rows = Math.floor(Math.sqrt((maxImages * height) / width));

			// initialise the image arrays for each row
			for(var i=0; i<this.rows; i++){
				$scope.rowImages.push([]);
			}

			return this.rows;
		};

		this.updateImages = function(images) {
			$scope.allImages = images;
		};

		// get a row image buffer


		function randInt(max){
			return Math.floor(Math.random() * max);
		}


		// add an image to a random row
		this.addImage = function(){
			// shift off the front of the images array
			var image = $scope.allImages.shift();

			var row = randInt(this.rows);
//			$scope.allImages[0].left = -900;
			$scope.rowImages[row].push(image);
			/*$scope.allImages[1].left = -200;
			$scope.rowImages[1].push($scope.allImages[1]);
			$scope.allImages[2].left = -200;
			$scope.rowImages[1].push($scope.allImages[2]);
			$scope.allImages[3].left = -200;
			$scope.rowImages[1].push($scope.allImages[3]);
			*/
		};
	}])
	.directive('collage', ['$window', '$timeout', '$compile', function($window, $timeout, $compile){
		return {
			scope: {
				collage: '=collage'
			},
			controller: 'CollageCtrl',
			link: function(scope, elem, attrs, ctrl){

				function newImage(){
					ctrl.addImage();
					$timeout(newImage, 2000);
				}

				scope.$watch('collage', function(newValue, oldValue){
					if(newValue.length > 0){
						// add the images to the controller set
						ctrl.updateImages(newValue);
						//ctrl.addImage();
						newImage();
					}
				});	

				// calculate the optimum number of rows and create them
				var rows = ctrl.initialise(attrs.maxImages);
				
				// create rows
				for(var i=0; i<rows; i++){
					elem.append('<div image-row="rowImages[' + i + ']" class="row row1"></div>');	
				}				

				// compile the initialised row objects
				$compile(elem.contents())(scope);			

			}
		}
	}])
	.directive('imageRow', ['$timeout', function($timeout){
		return {
			require: '^collage',
			scope: {
				images: '=imageRow'
			},
			controller: 'CollageCtrl',
			template: '<div class="image" ng-repeat="image in images"><div insta-image="image"></div></div>',
			link: function(scope, elem, attrs, ctrl){
				
				/*scope.$watch('images', function(newValue, oldValue){
					console.log(newValue);
				});*/

				// called once the image has loaded
				scope.loaded = function(){
					$timeout(function(){
						// an image has loaded, so update all the image positions
						var width = elem[0].clientWidth;
						var height = elem[0].clientHeight;

						var total = scope.images.length;
						var start = width - 200;
						/*if(total >= 8){
							start += 200 * (total-7);
						}*/

						for(var i=total-1; i>=0; i--){
							scope.images[i].left = start;
							start -= 200;
						}
						scope.$apply();
					});					
				};

				scope.cleanup = function(){
					if(scope.images.length >= 9){
						var width = elem[0].clientWidth;
						var total = scope.images.length;
						for(var i=0; i<total; i++){
							if(scope.images[i].left < width){
								break;
							}
							scope.images.shift();	
						}						
						scope.$apply();
					}
				};
			}
		};
	}])
	.directive('instaImage', function(){
		return {
			require: '^imageRow',
			controller: 'CollageCtrl',
			template: '<div><img class="photo" ng-src="{{image.images.low_resolution.url}}" image-loaded="loaded()"/></div>',
			link: function(scope, elem, attrs, ctrl){

				scope.$watch('image.left', function(newValue, oldValue){
					if(oldValue !== newValue){
						// if the position has changed, tween it with complete callback
						TweenLite.to(elem.parent()[0], 1, {
							x: newValue,
							ease: Cubic.easeInOut,
							onComplete: function(){
								scope.cleanup();
							}
						});
					}
				});
			}
		};
	})
	.directive('imageLoaded', ['$parse', function($parse){
		return {
			link: function(scope, elem, attrs){
				var handler = $parse(attrs.imageLoaded);
				elem.bind('load', function(){
					handler(scope);
				});
			}
		}
	}]);









