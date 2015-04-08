// Animated collage directive

angular.module('unCollage', [])
	.directive('collage', ['$window', '$timeout', '$compile', function($window, $timeout, $compile){
		return {
			scope: {
				allImages: '=collage'
			},
			templateUrl: 'templates/collage.html',
			link: function(scope, elem, attrs){

				var backgrounds = [
					'images/01.jpg',
					'images/02.jpg',
					'images/03.jpg',
					'images/04.jpg'
				];
				var slideSpeed = 0.5;

				// initialisation
				function initialise(){

					scope.isOpen = false;
					scope.rows = 4;

					// initialise the image arrays for each row
					scope.rowData = [];
					for(var i=0; i<scope.rows; i++){
						scope.rowData.push({
							images: [],
							background: backgrounds[i]
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

				/*** row opening functions ***/

				function offsetRowY(index, offset, speed){
					if(typeof speed === 'undefined'){
						speed = 0.5;
					}
					TweenLite.to(elem.children()[index], speed, {
						y: offset,
						ease: Power2.easeOut
					});
				}

				function calcYOffset(){
					var height = elem[0].clientHeight;
					return height * 0.375;
				}

				function doSlideAnim(speed, offset){
					offsetRowY(1, -offset, speed);
					offsetRowY(2, -offset, speed);
					offsetRowY(3, offset, speed);
					offsetRowY(4, offset, speed);
				}

				/*** setup ***/

				// initialise the directive
				initialise();

				// start the image loop
				imageLoop();

				scope.$on('image_clicked', function(e, args){
					if(!scope.isOpen){
						scope.isOpen = true;
						doSlideAnim(slideSpeed, calcYOffset());
					}
					if(args && args.image){
						scope.selectedImage = args.image;
					}else{
						scope.selectedImage = null;
					}					
				});

				scope.closeInner = function(){
					scope.isOpen = false;
					doSlideAnim(slideSpeed, 0);
				};

				// deal with resizing
				angular.element($window).bind('resize', function(){
					if(scope.isOpen){
						doSlideAnim(0, calcYOffset());
						scope.$apply();	
					}					
				});
			}
		}
	}])		
	.directive('imageRow', ['$timeout', '$window', function($timeout, $window){
		return {
			scope: {
				rowData: '=imageRow'
			},
			template: '<div class="image" ng-repeat="image in rowData.images" ng-click="selectImage(image)"><div insta-image="image" on-load="loaded()"></div></div>',
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
							// remove any images on the recalc (rather than after any animations)
							if(start < -(2*height)){
								images.splice(0, i);
								break;
							}
							images[i].left = start;
							start -= height + 3;
						}
						scope.$apply();
					});					
				};

				angular.element($window).bind('resize', function(){
					scope.$apply(scope.loaded);
				});

				// click on image behaviour
				scope.selectImage = function(image){
					scope.$emit('image_clicked', { image: image });
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
			template: '<div class="photo-outer"><img class="photo" ng-src="{{image.images.low_resolution.url}}" image-loaded="loaded()"/></div>',
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
								//scope.completeFunc();
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
		};
	}])
	.directive('backImage', [function(){
		return {
			link: function(scope, elem, attrs){
				attrs.$observe('backImage', function(value) {
					var img = 'url(' + value +')';
					if(attrs.overlay){
						img = attrs.overlay + ', ' + img;
					}
					elem.css({
						'background': img,
						'background-size' : 'cover',
						'background-position' : 'center'
					});
				});
			}
		};
	}]);