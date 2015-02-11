/// <reference path="Tweet.ts"/>

class Feed {

	constructor(private _url: string, public callback: (data: Tweet) => void) {
		this.listen();
	}

	listen(): void {
		var ws: WebSocket = new WebSocket(this._url);
		ws.onopen = this.onOpen;
		ws.onclose = () => { this.onClose(); };
		ws.onmessage = (data: any) => { this.onMessage(data); };
	}

	onOpen(): void {
		console.log('Socket Opened');
	}

	onClose(): void  {
		this.listen();
		console.log('Socket Closed');
	}

	onMessage(message: any): void {
		var data: any = JSON.parse(message.data);

		if (!data.str) {
			var tweet: Tweet = this.makeTweet(data);
			this.callback(tweet);
		}
	}

	makeTweet(tweet: TweetData): Tweet {
		// Determine if they mentioned tweetmap
		if (tweet.user === 'alexanderurq') {
			return new Tweet(tweet, MarkerType.King);
		} else if (tweet.hashtags && tweet.hashtags.indexOf('tweetmap') !== -1) {
			return new Tweet(tweet, MarkerType.Prince);
		} else {
			return new Tweet(tweet);
		}
	}
}
