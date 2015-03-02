/// <reference path="lib/leaflet.d.ts"/>
/// <reference path="lib/jquery.d.ts"/>
/// <reference path="Tweet.ts"/>

class TweetMap {
	private _map: L.Map;

	constructor(div: string = 'map') {
		this._map = new L.Map(div).setView(new L.LatLng(45.41, -75.698), 12);

		L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
		    maxZoom: 16
		}).addTo(this._map);
		L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
		    maxZoom: 16
		}).addTo(this._map);
	}

	addTweet(tweet: Tweet): void {
		this._map.addLayer(tweet.marker);
	}

	removeTweet(tweet: Tweet): void {
		this._map.removeLayer(tweet.marker);
	}

	panTo(tweet: Tweet): void {
		this._map.panTo(tweet.marker.getLatLng());
		tweet.marker.openPopup();
	}

	// Toggles the marker and shadow panes off -also closes any popup windows
	toggleMarkers(tweets: Tweet[]): void {

		$.each(tweets, function(index: number, tweet: Tweet): void {
			tweet.marker.closePopup();
		});

		$('.leaflet-marker-pane, .leaflet-shadow-pane').fadeToggle();
	}
}
