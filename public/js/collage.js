// Animated collage directive

angular.module('unCollage', [])
	.directive('collage', ['$window', '$timeout', '$compile', 
	function($window, $timeout, $compile){
		return {
			scope: {
				collage: '=collage'
			},
			link: function(scope, elem, attrs){

				// internals
				scope.allImages = [];
				scope.rowImages = [];

				var rows = 0;

				/*** helper functions ***/

				// random integer (between 0 and max)
				function randInt(max){
					return Math.floor(Math.random() * max);
				}

				// initialisation
				function initialise(maxImages){

					// calculate the optimum number of rows and create them
					var width = $window.innerWidth;
					var height = $window.innerHeight;

					rows = Math.floor(Math.sqrt((maxImages * height) / width));

					// initialise the image arrays for each row
					for(var i=0; i<rows; i++){
						scope.rowImages.push([]);
					}

					// create rows
					for(var i=0; i<rows; i++){
						elem.append('<div image-row="rowImages[' + i + ']" class="row row1"></div>');	
					}				

					// compile the initialised row objects
					$compile(elem.contents())(scope);	
				}

				// add a new image to the view
				function addImage(){
					// shift off the front of the images array
					var image = scope.allImages.shift();

					var row = randInt(rows);
					//$scope.allImages[0].left = -900;
					scope.rowImages[row].push(image);
				}

				function newImage(){
					addImage();
					$timeout(newImage, 2000);
				}

				/*** setup ***/

				// initialise the directive
				initialise(attrs.maxImages);

				// watch for changes to the image set
				// NOTE: for now we are just watching for an entire list update,
				// not for additions/removals from the list
				scope.$watch('collage', function(newValue, oldValue){
					if(newValue.length > 0){
						// change the primary image set to the new one
						scope.allImages = newValue;
						
						// ensure the image updating process is occuring

						newImage();
					}
				});
			}
		}
	}])		
	.directive('imageRow', ['$timeout', function($timeout){
		return {
			scope: {
				images: '=imageRow'
			},
			template: '<div class="image" ng-repeat="image in images"><div insta-image="image"></div></div>',
			link: function(scope, elem, attrs){
				
				// called once the image has loaded
				scope.loaded = function(){
					$timeout(function(){
						// an image has loaded, so update all the image positions
						var width = elem[0].clientWidth;
						var height = elem[0].clientHeight;

						var total = scope.images.length;
						var start = width - 200;

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
			scope: {
				image: '=instaImage'
			},
			template: '<div><img class="photo" ng-src="{{image.images.low_resolution.url}}" image-loaded="loaded()"/></div>',
			link: function(scope, elem, attrs){

				//scope.$watch

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
	// directive for triggering functions once an image has loaded
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