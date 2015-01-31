// Class representing a tweet that has been received by the websocket
function Tweet(marker, data) {
	var self = this;

	self.marker = marker;
	self.id = data.id;
	self.author = data.author;
	self.text = data.text;
	self.hashtags = data.hashtags;
	self.pictures = data.pictures;
}

function AppViewModel() {
	// Observable stuff
	var self = this;
	self.onlineCount = ko.observable(1);
	self.latestTweets = ko.observableArray([]);

	// Return the latest pictures - derived from the latest tweets array
	self.latestPictures = ko.computed(function() {
		return $.grep(self.latestTweets(), function(el, index) {
			return typeof(el.pictures) !== 'undefined';
		});
	}, this);

	// Initialize the map
	self.Map = L.map('map').setView([45.41, -75.698], 12);

	// Add tile layers
	L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	    maxZoom: 16
	}).addTo(self.Map);
	L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
	    maxZoom: 16
	}).addTo(self.Map);

	// Fetches the online user count
	self.updateOnlineCount = function() {
		$.getJSON("http://tweet.alexurquhart.com/ws/info", function(data) {
			self.onlineCount(data.clients);
		});
	};

	// called when a tweet item in the picture or tweet feed was clicked
	// Centers the map on the tweet and opens the marker popup
	self.panToTweet = function(tweet) {
		self.Map.panTo(tweet.marker.getLatLng());
		tweet.marker.openPopup();
	};

	self.showTweet = function(tweet) {
		if (tweet.nodeType === 1) {
			$(tweet).hide().slideDown(500);
		}
	};

	self.hideTweet = function(tweet) {
		if (tweet.nodeType === 1) {
			$(tweet).slideUp(500);
		}
	};

	// Takes raw data received from the websocket
	// Creates a marker object for the map and adds it
	// Creates a new observable tweet class
	self.addTweet = function(data) {
		var markerType;

		if (typeof(data.latitude) !== 'undefined') {
			// If it's me - color it GOOOOOOLD
			if (data.author == 'alexanderurq') {
				markerType = L.AwesomeMarkers.icon({
								icon: 'star',
								prefix: 'fa',
								markerColor: 'orange'
							});
			} else {
				markerType = L.AwesomeMarkers.icon({
								icon: 'twitter',
								prefix: 'fa',
								markerColor: 'cadetblue'
							});
			}

			// Bind popup
			var popup = L.popup().setContent('<a href="http://twitter.com/' + data.author + '" target="_blank">@' + data.author + ':</a> ' + data.text);

			// Create the latest tweets
			var marker = L.marker([data.latitude, data.longitude], {icon: markerType}).bindPopup(popup, {autopan: false});
			marker.addTo(self.Map);
			var newTweet = new Tweet(marker, data);
			self.latestTweets.unshift(newTweet);

			// After 2 minutes - clear the tweet and the marker
			setTimeout(function() {
				 self.Map.removeLayer(self.latestTweets.pop().marker);
			}, 300000);
		}
	};

	// Creates the tweets/24 hrs graph
	self.createTweets24HrsGraph = function() {
		// Get the data
		$.getJSON('/past24Hours', function(data) {
			var current = $.map(data, function(el) {
				var date = new Date(el.hour)
				return [[date, el.count]];
			});

			var average = $.map(data, function(el) {
				var date = new Date(el.hour)
				return [[date, el.average]];
			});


            // Create the graph
			$.plot('#tweetsLast24Hours',
				[
					{
						data: average,
						color: '#EFEFFF',
						label: "Wk Avg"
					},
					{
						data: current,
						color: '#99F',
						label: 'Current'
					}

				], {
				color: 0,
				grid: {
					hoverable: true
				},
				xaxis: {
                    mode: 'time',
                    timezone: 'browser'
                },
				lines: {show: true}
			});

			// Bind the tooltip
			$("#tweetsLast24Hours").bind("plothover", function (event, pos, item) {
				if (item) {
					date = item.series.label + ": " + item.datapoint[1]


					$("#tooltip").html(date)
						.css({top: item.pageY-15, left: item.pageX+5})
						.fadeIn(200);
				} else {
					$("#tooltip").hide();
				}
			});
		});
	};
};

// Listen for tweets
// Maintains connection to the websocket
// Pushes new messages to the view model "addTweet" function
function listenForTweets(url, cb) {

	var ws = new WebSocket(url);

	ws.onopen = function() {
		console.log('Socket Opened');
	};

	// Restart the connection if it closes
	ws.onclose = function() { 
		console.log("Socket Closed... Re-starting");
		listenForTweets(url, cb);
	};

	// Message received...
	ws.onmessage = function(message) {
		var data = JSON.parse(message.data);

		// Make sure it isn't a "nodata" message
		if (typeof(data.latitude) !== 'undefined') {
			// Push data to callback
			cb(data);
		}
	}
}

// Listen For Fake Tweets (testing)
// Emulates receiving tweets so I don't have to wait for the real feed
function listenForFakeTweets(cb) {
	// Receive fake tweets every 2.5s
	var interval = 2500;
	var tick = 0;
	var picInterval = 5;
	var picUrl = 'http://pbs.twimg.com/media/B6rYzqUCUAAGm_q.jpg';

	var Lowerleftlat   = 45.248314;
	var Lowerleftlong  = -75.990692;
	var Upperrightlat  = 45.569604;
	var Upperrightlong = -75.470890;

	var longDiff = Lowerleftlong - Upperrightlong;
	var latDiff = Upperrightlat - Lowerleftlat;

	setInterval(function() {
		var tweet = {
			author: 'alexanderurq',
			text: 'This is tweet # ' + tick,
			hashtags: ['yolo', 'swag', 'tick' + tick],
			latitude: (Math.random() * latDiff) + Lowerleftlat,
			longitude: (Math.random() * longDiff) + Upperrightlong,
		}

		if (tick % picInterval == 0) {
			tweet.pictures = [picUrl];
		}

		cb(tweet);

		tick++;
	}, interval)
}

$(function() {
	$('[data-toggle="tooltip"]').tooltip();
	var vm = new AppViewModel();

	// Update the online users count every 5 seconds
	setInterval(vm.updateOnlineCount, 5000);

	vm.createTweets24HrsGraph();

	listenForTweets('ws://tweet.alexurquhart.com/ws/', vm.addTweet);
	//listenForFakeTweets(vm.addTweet);

	ko.applyBindings(vm);
});
