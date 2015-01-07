function AppViewModel() {
	var self = this;
	this.onlineCount = ko.observable(1);
	this.latestTweets = ko.observableArray([]);

	this.updateOnlineCount = function() {
		$.getJSON("http://tweet.alexurquhart.com/ws/info", function(data) {
			self.onlineCount(data.clients);
		});
	}
	setInterval(this.updateOnlineCount, 5000);
};

$(function() {
	$('[data-toggle="tooltip"]').tooltip();
	var vm = new AppViewModel();
	ko.applyBindings(vm);
	var a = new MapController();
});

// Tweet Marker Factory
// This function connects to the websocket specified by "url"
// It provides the tweet data, as well as the formatted leaflet marker to the callback function cb
function TweetMarkerFactory(url, cb) {

	var ws = new WebSocket(url);

	ws.onopen = function() {
		console.log('Socket Opened');
	};

	// Restart the connection if it closes
	ws.onclose = function() { 
		console.log("Socket Closed... Re-starting");
		TweetMarkerFactory(url, cb);
	};

	ws.onmessage = function(message) {
		var data = JSON.parse(message.data);
		console.log(data)
		var marker;

		if (typeof(data.latitude) !== 'undefined') {
			// If it's me - color it GOOOOOOLD
			if (data.author == 'alexanderurq') {
				marker = L.AwesomeMarkers.icon({
								icon: 'star',
								prefix: 'fa',
								markerColor: 'orange'
							});
			} else {
				marker = L.AwesomeMarkers.icon({
								icon: 'twitter',
								prefix: 'fa',
								markerColor: 'cadetblue'
							});
			}

			// Bind popup
			var popup = L.popup().setContent('<a href="http://twitter.com/' + data.author + '" target="_blank">@' + data.author + ':</a> ' + data.text);

			// Call the callback with the data, and the formatted marker
			cb(data, L.marker([data.latitude, data.longitude], {icon: marker}).bindPopup(popup, {autopan: false}));
		}
	};

	// Close the websocket before page close
	window.onbeforeunload = function() {
		ws.onclose = function () {};
		ws.close();
	}
}

function MapController(dataCb) {

	// Initialize the map
	this.Map = L.map('map').setView([45.41, -75.698], 12);

	// Add tile layers
	L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	    maxZoom: 16
	}).addTo(this.Map);
	L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
	    maxZoom: 16
	}).addTo(this.Map);

	// Create the marker list
	this.Markers = [];

	// Start the tweetfeed
	var _this = this;
	TweetMarkerFactory('ws://tweet.alexurquhart.com/ws/', function(data, marker) {
		// Add the marker to the list
		_this.Markers.push(marker);

		// Add it to the map
		marker.addTo(_this.Map);

		// Delete the marker after 1 minute

		// Remove other markers if there is more than the limit
		if (_this.Markers.length > 100) {
			_this.Map.removeLayer(_this.Markers.shift());
		}
	});
}