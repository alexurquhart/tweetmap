/// <reference path="lib/leaflet.d.ts"/>

enum MarkerType {
	King,
	Prince,
	Plebian
};

interface TweetData {
	id: string;
	user: string;
	text: string;
	latitude: number;
	longitude: number;
	hashtags?: string[];
	pictures?: string[];
}

// 
class Tweet {
	private _marker: L.Marker;

	constructor(private data: TweetData, private type: MarkerType = MarkerType.Plebian) {
		this.setupMarker();
	}

	get marker(): L.Marker {
		return this._marker;
	}

	getPopupText(): string {
		return '<a href="http://twitter.com/'
			 + this.data.user
			 + '" target="_blank">@'
			 + this.data.user
			 + ':</a> ' + this.data.text;
	}

	setupMarker(): void {

		var settings: L.AwesomeMarker;
		settings.prefix = 'fa';

		// Setup marker based on type
		switch (this.type) {
			case MarkerType.King:
					settings.icon = 'star';
					settings.markerColor = 'orange';
				break;
			default:
				settings.icon = 'star';
				settings.markerColor = 'orange';
				break;
		}

		// Create the popup
		var popup: L.Popup = L.popup().setContent(this.getPopupText());

		// Create the marker
		var icon: L.Icon = L.AwesomeMarkers.icon(settings);
		var latLng: L.LatLng = new L.LatLng([this.data.latitude, this.data.longitude]);
		this._marker = L.marker(latLng, { icon: icon }).bindPopup(popup, { autopan: false });
	}
}
