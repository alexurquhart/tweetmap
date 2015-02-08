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

// Download and join the wards geoJSON and latest activity statistics
// TODO - add error handling - convert to jQuery functions for getting JSON
function wardStatistics(cb) {
	d3.json('js/wards.json', function(collection) {

		d3.json('/wards/past24hours', function(stats) {

			// Join the stats to the wards json
			$.each(collection.features, function(fIndex, fValue) {
				$.each(stats, function(sIndex, sValue) {
					if (sValue.wardId === fValue.properties.id) {
						fValue.properties.past24hrs = sValue.past24Hrs;
						fValue.properties.dayChange = sValue.dayChange;
					}
				});
			});
			cb(collection);
		});
	});
}

// Given a domain array, scale, colors and div id, generate a legend
function generateLegend(scale, id) {
	var domain = scale.domain().reverse();
	console.log(domain)

	// Go through each color and return the sorted domain of values that corresponds to each class
	var breaks = $.map(scale.range(), function(color) {
		var current = []
		for (i = domain[0]; i <= domain[1]; i++) {
			if (scale(i) == color) {
				current.push(i);
			}
		}

		return {
			color: color,
			min: d3.min(current),
			max: d3.max(current),
		}
	});

	var row = d3.select('#' + id)
		.selectAll('div')
		.data(breaks)
		.enter().append('div')
		.classed('legend-row clearfix', true)

	// Add the legend cell
	row.append('div')
		.classed('legend-cell', true)
		.style('background-color', function(d) {
			// Extract the RGB value from the RGBA string
			return d.color;
		})

	row.append('div')
		.classed('legend-label', true)
		.text(function(d) {
			return d.min + ' to ' + d.max;
		});
}

// Create the chloropleth map
function createChloropleth(map) {
	var svg = d3.select(map.getPanes().overlayPane).append('svg');
	var g = svg.append('g').attr('class', 'leaflet-zoom-hide');

	function project(x, y) {
		var point = map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}

	// Get the ward statistics
	wardStatistics(function(collection) {
		var transform = d3.geo.transform({point: project});
		var path = d3.geo.path().projection(transform);

		// Set up the colors
		var colors = [
			'rgba(241,238,246,0.3)',
			'rgba(189,201,225,0.3)',
			'rgba(116,169,207,0.3)',
			'rgba(43,140,190,0.3)',
			'rgba(4,90,141,0.3)'
		].reverse();

		var colors2 = [
			'rgba(202,0,32,0.3)',
			'rgba(244,165,130,0.3)',
			'rgba(247,247,247,0.3)',
			'rgba(146,197,222,0.3)',
			'rgba(5,113,176,0.3)'
		].reverse();

		var domain = $.map(collection.features, function(el, index) {
			return el.properties.past24hrs;
		});
		domain = domain.sort(d3.descending);

		var scale = d3.scale.quantize()
			.domain(domain)
			.range(d3.range(colors.length).map(function(i) { return colors[i] }));

		generateLegend(scale, 'legend');

		var feature = g.selectAll('path')
			.data(collection.features)
			.enter()
			.append('path')
			.attr('fill', function(d) { return scale(d.properties.past24hrs); })
			.attr('stroke', 'rgba(0, 22, 41, 0.3)');

		map.on('viewreset', reset);
		reset();

		function reset() {
			var bounds = path.bounds(collection);
			var topLeft = bounds[0];
			var bottomRight = bounds[1];

			svg.attr("width", bottomRight[0] - topLeft[0])
				.attr("height", bottomRight[1] - topLeft[1])
				.style("left", topLeft[0] + "px")
				.style("top", topLeft[1] + "px");

			g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

			feature.attr("d", path);
		}
	});
}

function clearChloropleth(map) {

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

	createChloropleth(self.Map);

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
		$.getJSON('/tweets/past24hours', function(data) {
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
						label: 'Today'
					}

				], {
				color: 0,
				legend: {
					position: 'sw'
				},
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
                    hour = new Date(item.datapoint[0])
                    str = (hour.getDay() + 1) + "/" + (hour.getMonth() + 1) + "/" + hour.getFullYear() + " @ " + hour.getHours() + ":00"
					date = str + "<br>" + item.series.label + ": " + item.datapoint[1]


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
