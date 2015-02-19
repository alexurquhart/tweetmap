/// <reference path="lib/knockout.d.ts"/>
/// <reference path="lib/jquery.d.ts"/>
/// <reference path="Tweet.ts"/>
/// <reference path="Map.ts"/>
/// <reference path="Feed.ts"/>
/// <reference path="API.ts"/>

class ViewModel {
	public latestTweets: KnockoutObservableArray<Tweet>;
	public latestPictures: KnockoutComputed<Tweet[]>;
	public onlineCount: KnockoutObservable<number>;

	public panToTweet: any = (tweet: Tweet) => {
		this.map.panTo(tweet);
	};

	private map: TweetMap;
	private feed: Feed;
	private api: API;

	constructor() {
		this.api = new API('http://tweet.alexurquhart.com/');
		this.latestTweets = ko.observableArray([]);
		this.latestPictures = ko.computed(() => { return this.getLatestPictures(); });

		// Start the map and the feed
		this.map = new TweetMap;
		this.feed = new Feed('ws://tweet.alexurquhart.com/ws/', (tweet: Tweet) => { this.addTweet(tweet); });

		this.onlineCount = this.api.onlineCount;
	}

	addTweet(tweet: Tweet): void {
		this.map.addTweet(tweet);
		this.latestTweets.unshift(tweet);

		// Remove the tweet after 2 minutes
		window.setTimeout(() => { this.map.removeTweet(this.latestTweets.pop()); }, 300000);
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
}
