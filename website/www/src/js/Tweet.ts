/// <reference path="lib/leaflet.d.ts"/>

enum MarkerType {
	King,
	Prince,
	Plebian
};

interface ITweetData {
	id: string;
	author: string;
	text: string;
	latitude: number;
	longitude: number;
	hashtags?: string[];
	pictures?: string[];
}

class Tweet {
	private _marker: L.Marker;

	constructor(private data: ITweetData, private type: MarkerType = MarkerType.Plebian) {
		this.setupMarker();
	}

	get marker(): L.Marker {
		return this._marker;
	}

	get hashtags(): string[] {
		return this.data.hashtags;
	}

	get pictures(): string[] {
		if (this.data.pictures) {
			return this.data.pictures;
		} else {
			return [];
		}
	}

	get author(): string {
		return this.data.author;
	}

	get text(): string {
		return this.data.text;
	}

	getPopupText(): string {
		return '<a href="http://twitter.com/'
			 + this.data.author
			 + '" target="_blank">@'
			 + this.data.author
			 + ':</a> ' + this.data.text;
	}

	setupMarker(): void {
		var settings: L.AwesomeMarker = {};
		settings.prefix = 'fa';

		// Setup marker based on type
		switch (this.type) {
			case MarkerType.King:
					settings.icon = 'star';
					settings.markerColor = 'orange';
				break;
			default:
				settings.icon = 'twitter';
				settings.markerColor = 'cadetblue';
				break;
		}

		// Create the popup
		var popup: L.Popup = L.popup().setContent(this.getPopupText());

		// Create the marker
		var icon: L.Icon = L.AwesomeMarkers.icon(settings);
		var latLng: L.LatLng = new L.LatLng(this.data.latitude, this.data.longitude);
		this._marker = L.marker(latLng, { icon: icon }).bindPopup(popup, { autopan: false });
	}
}
