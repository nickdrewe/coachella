var express = require('express');
var ig = require('instagram-node').instagram();
var lessMiddleware = require('less-middleware');

// ig.use({ access_token: 'YOUR_ACCESS_TOKEN' });
ig.use({ client_id: '3d7bf45865124de8b0a8d8ddca775b2f', client_secret: '73b72e3dd1c34bb8ae45e9e1b64dfebb' });

var app = express();

app.use(lessMiddleware(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

//Routes
app.get('/posts.json', function (req, res) {
  res.send(posts);
})

//Server
var server = app.listen(3000, function (req, res) {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});


var posts = [];

everyMinute();
/*
setInterval(function(){
	everyMinute()
}, 60000);
*/

function everyMinute(){

	var i = 0;
	var pages = 3;
	var opt = { count: 33 };

	posts = [];

	updatePosts(opt);

	function updatePosts(opt){
		ig.tag_media_recent('coachella', opt, function(err, medias, pagination, remaining, limit) {
			//add media to posts
			medias.forEach(function(media){

				//Buid post object
				var post = {
					link: media.link,
					type: media.type,
					images: media.images,
					videos: media.videos
				}
				//Push to posts array
				posts.push(post);
			});

			i++;
			//Loop if less than 3 pages
			if(i < pages){
				opt = { count: 33, max_id: pagination.next_max_id };
				updatePosts(opt);
				//after 3 pages:
			} else {
				console.log('Posts updated: ' + posts.length);
			}
		});
	}
}


