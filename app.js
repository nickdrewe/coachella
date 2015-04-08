var express = require('express');
var ig = require('instagram-node').instagram();
var lessMiddleware = require('less-middleware');
var _ = require('lodash');

// ig.use({ access_token: 'YOUR_ACCESS_TOKEN' });
ig.use({ client_id: '3d7bf45865124de8b0a8d8ddca775b2f', client_secret: '73b72e3dd1c34bb8ae45e9e1b64dfebb' });

var app = express();

app.use(lessMiddleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

//Routes
app.get('/posts.json', function (req, res) {
  res.send(posts);
});

//Server
var server = app.listen(3000, function (req, res) {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});


var posts = [];

everyMinute();
setInterval(function(){
	everyMinute()
}, 60000);

function everyMinute(){

	var i = 0;
	var j = 0;
	var pages = 10;
	var optTag = { count: 33 };
	var optLoc = { count: 33, distance: 2000 };

	posts = [];

	updatePostsTag(optTag);
	//updatePostsLoc(optLoc);

	function updatePostsTag(optTag){
		ig.tag_media_recent('coachella', optTag, function(err, medias, pagination, remaining, limit) {
			//add media to posts
			medias.forEach(function(media){
				//Push to array
				pushPost(media);
			});

			i++;
			//Loop if less than 3 pages
			if(i < pages){
				optTag = { count: 33, max_id: pagination.next_max_id };
				updatePostsTag(optTag);
				//after 3 pages:
			} else {
				console.log('Posts updated: ' + posts.length);
			}
		});
	}

	function updatePostsLoc(optLoc){
		ig.media_search(33.682198, -116.238262, optLoc, function(err, medias, remaining, limit) {
			//add media to posts
			medias.forEach(function(media){
				//Push to array
				pushPost(media);
			});

			j++;
			//Loop if less than 3 pages
			if(j < pages){
				//use min created_time for pagination
				var times = _.pluck(medias, 'created_time');
				var minTime = Math.min.apply(Math, times);
				//max_timestamp for next request is min timestamp from previous
				optLoc = { count: 25, distance: 2000, max_timestamp: minTime };
				updatePostsTag(optLoc);
				//after 3 pages:
			} else {
				console.log('Posts updated: ' + posts.length);
			}
		});
	}

	function pushPost(media){
		//prevent duplicates in posts
		var links = _.pluck(posts, 'link');
		if(!_.includes(links, media.link)){
			//Buid post object
			//console.log(media);

			var post = {
				username: media.user.username,
				link: media.link,
				type: media.type,
				images: media.images,
				videos: media.videos
			}

			if(media.caption && media.caption.text){
				post.caption = media.caption.text;
			}

			if(media.location && media.location.latitude){
				post.location = media.location;
			}
			//Check for spam
			if(!isSpam(post)){
				//Push to posts array
				posts.push(post);
			}
		}
	}
}

var spamAccounts = [
	'harlemragshop1934',
	'ueksszkud',
	'srbhcocjy',
	'uyjhvdhxa',
	'rufuuutjg',
	'kkvzfatsy',
	'qwsebxgti',
	'cielolaaa',
	'flzxiweph',
	'kyjgepkww',
	'pjdombykv',
	'vjvldrttm',
	'zjbuwbgyu',
	'goqjmjzlk',
	'chmacphsj',
	'jtmanalex',
	'sammiesheadwear',
	'zgueqckdp',
	'stylenistaboutique',
	'la_edm_designs',
	'zebedesign',
	'echbritwf',
	'hzzwcxjjc',
	'cdkizunux',
	'mgnrjxzse',
	'klvzyhcvh',
	'aavhfckrr',
	'wanderlustcouture',
	'atxogoper',
	'happinessbrand',
	'wanderlustcouture',
	'shophomegrowndesigns',
	'wanderlustcouture',
	'rave_naked',
	'hbimcklee',
	'artistexpressions',
	'pistolandlucy',
	'bellexo_boutique',
	'graciejiujitsupd',
	'qwsebxgti',
	'orflagapop'


];

var spamStrings = /(my\sbio|8613566347511|8615706823096|Keepitsecretstore|contest|coupon)/;

function isSpam(post){
	if (post.caption && spamStrings.test(post.caption)){
		//console.log('SPAM!');
		// console.log(post.caption);
		return true;
	} else if(_.includes(spamAccounts, post.username)){
		return true;
	} else {
		return false;
	}
}


