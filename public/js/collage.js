// Animated collage directive

angular.module('unCollage', [])
	.directive('collage', ['$window', '$timeout', '$compile', function($window, $timeout, $compile){
		return {
			scope: {
				allImages: '=collage'
			},
			templateUrl: 'templates/collage.html',
			link: function(scope, elem, attrs){

				// initialisation
				function initialise(){

					scope.isOpen = false;
					scope.rows = 4;

					// initialise the image arrays for each row
					scope.rowData = [];
					for(var i=0; i<scope.rows; i++){
						scope.rowData.push({
							images: []
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
							if(scope.isOpen){
								row = randInt(2) + 1;
							}else{
								row = randInt(scope.rows);
							}							
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
				initialise();

				// start the image loop
				imageLoop();

				function animateRowY(index, offset) {
					TweenLite.to(elem.children()[index], 0.5, {
						y: offset,
						ease: Power2.easeOut,
						onComplete: function(){
							//scope.completeFunc();
						}
					});
				}

				scope.$on('image_clicked', function(){
					if(!scope.isOpen){
						scope.isOpen = true;
						// open the rows
						animateRowY(1, -200);
						animateRowY(2, -200);
						animateRowY(3, 200);
						animateRowY(4, 200);
					}					
				});

				scope.closeInner = function(){
					scope.isOpen = false;
					// open the rows
					animateRowY(1, 0);
					animateRowY(2, 0);
					animateRowY(3, 0);
					animateRowY(4, 0);
				};
			}
		}
	}])		
	.directive('imageRow', ['$timeout', '$window', function($timeout, $window){
		return {
			scope: {
				rowData: '=imageRow'
			},
			template: '<div class="image" ng-repeat="image in rowData.images" ng-click="selectImage(image)"><div insta-image="image" on-load="loaded()" on-animation-complete="animationComplete()"></div></div>',
			link: function(scope, elem, attrs){

				// called once the image has loaded
				scope.loaded = function(){
					$timeout(function(){
						// an image has loaded, so update all the image positions
						var width = elem[0].clientWidth;
						var height = elem[0].clientHeight;

						var images = scope.rowData.images;

						var total = images.length;
						var start = width - height;

						for(var i=total-1; i>=0; i--){
							images[i].left = start;
							start -= height;
						}
						scope.$apply();
					});					
				};

				scope.animationComplete = function(){
					var height = elem[0].clientHeight;
					var images = scope.rowData.images;
					var total = images.length;
					for(var i=0; i<total; i++){
						if(images[i].left >= -height){
							break;
						}
						images.shift();
					}	
					scope.$apply();
				};

				angular.element($window).bind('resize', function(){
					scope.$apply(scope.loaded);
				});

				// click on image behaviour
				scope.selectImage = function(image){
					scope.$emit('image_clicked');
/*
					TweenLite.to(elem.parent()[0], 0.5, {
						top: 0,
						bottom: 0,
						ease: Power2.easeOut,
						onComplete: function(){
							//scope.completeFunc();
						}
					});
*/
					//elem.parent().css('top', 0);
					//elem.parent().css('bottom', 0);
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