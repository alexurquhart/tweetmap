/// <reference path="types/knockout/knockout.d.ts"/>
/// <reference path="Tweet.ts"/>

class ViewModel {
	private onlineCount: KnockoutObservable<number>;
	private latestTweets: KnockoutObservableArray<Tweet>;
	private latestPictures: KnockoutComputedStatic;

	constructor() {
		this.onlineCount = ko.observable(1);
		this.latestTweets = ko.observableArray([]);
		this.latestPictures = ko.computed()
		this.

		console.log(this.latestTweets());
	}

	getLatestPictures(): KnockoutComputedStatic {

	}
}
