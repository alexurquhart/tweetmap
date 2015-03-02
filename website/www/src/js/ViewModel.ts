/// <reference path="lib/knockout.d.ts"/>
/// <reference path="lib/jquery.d.ts"/>
/// <reference path="Tweet.ts"/>
/// <reference path="Map.ts"/>
/// <reference path="Feed.ts"/>
/// <reference path="API.ts"/>
/// <reference path="Overlay.ts"/>

class ViewModel {
	public onlineCount: KnockoutObservable<number>;
	public latestTweets: KnockoutObservableArray<Tweet>;
	public lastTweet: KnockoutComputed<Tweet>;
	public latestPictures: KnockoutComputed<Tweet[]>;
	public activeOverlay: KnockoutObservable<string>;

	public panToTweet: any = (tweet: Tweet) => {
		this._map.panTo(tweet);
		return true;
	};

	private _map: TweetMap;
	private _feed: Feed;
	private _api: API;

	constructor() {
		this._api = new API('http://tweet.alexurquhart.com/');
		this.latestTweets = ko.observableArray([]);
		this.latestPictures = ko.computed(() => { return this.getLatestPictures(); });
		this.lastTweet = ko.computed(() => { return this.latestTweets()[0]; });

		// Set the online count and update every 5 seconds or so
		this.updateOnlineCount();

		this.activeOverlay = ko.observable('liveFeed');

		// Only update the last tweet once every 1500ms (for mobile)
		this.lastTweet.extend({ rateLimit: { timeout: 1500, method: 'notifyAtFixedRate' }});

		// Subscribe to changes to the last tweet
		// TODO - add glow effect to alert box when new
		// tweet appears
		// this.lastTweet.subscribe(function(newTweet: Tweet): void {
		// 	console.log('New tweet');
		// });

		// Start the map and the feed
		this._map = new TweetMap;
		this._feed = new Feed('ws://tweet.alexurquhart.com/ws/', (tweet: Tweet) => { this.addTweet(tweet); });
	}

	addTweet(tweet: Tweet): void {
		this._map.addTweet(tweet);
		this.latestTweets.unshift(tweet);
		window.setTimeout(() => { this._map.removeTweet(this.latestTweets.pop()); }, 300000);
	}

	getLatestPictures(): Tweet[] {
		return $.grep<Tweet>(this.latestTweets(), function(el: Tweet, index: number): boolean {
			if (el.pictures) {
				return true;
			} else {
				return false;
			}
		});
	}

	showTweet(tweet: any): void {
		if (tweet.nodeType === 1) {
			$(tweet).hide().slideDown(500);
		}
	}

	hideTweet(tweet: any): void {
		if (tweet.nodeType === 1) {
			$(tweet).slideUp(500);
		}
	}

	changeOverlay(newOverlay: string): void {
		this.activeOverlay(newOverlay);
	}

	updateOnlineCount(): void {
		this.onlineCount = ko.observable(1);
		setInterval(() => {
			this._api.getOnlineCount((count: number) => { this.onlineCount(count); });
		}, 5000);
	}
}
