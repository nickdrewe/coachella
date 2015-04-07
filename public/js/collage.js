// Animated collage directive

angular.module('unCollage', [])
	.directive('collage', ['$window', '$timeout', '$compile', function($window, $timeout, $compile){
		return {
			scope: {
				allImages: '=collage'
			},
			template: '<div ng-repeat="row in rowData" class="row-wrapper"><div image-row="row" class="row"></div></div>',
			link: function(scope, elem, attrs){

				// initialisation
				function initialiseRows(){

					// calculate the optimum number of rows and create them
					var width = $window.innerWidth;
					var height = $window.innerHeight - 95; // toolbar

					var rows = Math.min(4, Math.floor(Math.sqrt((attrs.maxImages * height) / width)));

					// calculate the row dimensions
					var rowHeight = height / rows;
					var rowWidth = Math.ceil(width / rowHeight) * rowHeight;

					// initialise the image arrays for each row
					scope.rowData = [];
					for(var i=0; i<rows; i++){
						scope.rowData.push({
							images: [],
							top: i * rowHeight,
							width: rowWidth,
							height: rowHeight
						});
					}
				}

				// random integer (between 0 and max)
				function randInt(max){
					return Math.floor(Math.random() * max);
				}

				// add a new image to the view
				function addImage(row){
					if(scope.allImages.length > 0){
						// shift off the front of the images array
						var image = scope.allImages.shift();

						if(typeof row === 'undefined'){
							// get a random row
							row = randInt(scope.rowData.length);
						}						
						scope.rowData[row].images.push(image);
					}
				}

				function imageLoop(){
					addImage();
					if(scope.allImages.length > 0){
						$timeout(imageLoop, 1500);
					}else{
						$timeout(imageLoop, 200);
					}					
				}

				/*** setup ***/

				// initialise the directive
				initialiseRows();

				// start the image loop
				imageLoop();

				// deal with resizing
				angular.element($window).bind('resize', function(){
					scope.$apply(initialiseRows);
				});
			}
		}
	}])		
	.directive('imageRow', ['$timeout', function($timeout){
		return {
			scope: {
				rowData: '=imageRow'
			},
			template: '<div class="image" ng-repeat="image in rowData.images"><div insta-image="image" on-load="loaded()" on-animation-complete="animationComplete()"></div></div>',
			link: function(scope, elem, attrs){

				// alter the width/height once it has been visualised
				$timeout(function(){
					elem.css('width', scope.rowData.width);
					elem.css('height', scope.rowData.height);
					elem.parent().css('top', scope.rowData.top);
				});
				
				// called once the image has loaded
				scope.loaded = function(){
					$timeout(function(){
						// an image has loaded, so update all the image positions
						var width = elem[0].clientWidth;
						var height = elem[0].clientHeight;

						var images = scope.rowData.images;

						var total = images.length;
						var start = width - scope.rowData.height;

						for(var i=total-1; i>=0; i--){
							images[i].left = start;
							start -= scope.rowData.height;
						}
						scope.$apply();
					});					
				};

				scope.animationComplete = function(){
					var images = scope.rowData.images;
					if(images.length >= scope.rowData.width / scope.rowData.height){
						var total = images.length;
						for(var i=0; i<total; i++){
							if(images[i].left >= 0){
								break;
							}
							images.shift();
						}	
						scope.$apply();
					}
				};
			}
		};
	}])
	.directive('instaImage', ['$timeout', function($timeout){
		return {
			scope: {
				image: '=instaImage',
				loadFunc: '&onLoad',
				completeFunc: '&onAnimationComplete'
			},
			template: '<div><img class="photo" ng-src="{{image.images.low_resolution.url}}" image-loaded="loaded()"/></div>',
			link: function(scope, elem, attrs){

				function translateX(pos){
					var amount = 'translateX(' + pos + 'px)';
					angular.forEach(['-ms-transform', '-webkit-transform', 'transform'], function(style){
						elem.parent().css(style, amount);
					});
				}

				scope.loaded = function() {
					// once the image has loaded, call the attribute function
					scope.loadFunc();
				};

				scope.$watch('image.left', function(newValue, oldValue){
					if(oldValue !== newValue){
						// due to the css differences between translate and left, we have to hack the animation
						// basically we translate the image to the right off the screen, and then turn off left before animating
						translateX(elem.parent().parent()[0].offsetWidth);
						elem.parent().css('left', 'auto');
						TweenLite.to(elem.parent()[0], 1, {
							x: newValue,
							ease: Cubic.easeInOut,
							onComplete: function(){
								scope.completeFunc();
							}
						});
					}
				});
			}
		};
	}])
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