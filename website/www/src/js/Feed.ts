/// <reference path="Tweet.ts"/>

interface IngestCallback {
	(tweet: Tweet)
}

class Feed {
	private _ws: WebSocket;

	constructor(private _url:string, public callback: IngestCallback) {
		this.listen();
	}

	listen(): void {
		this._ws = new WebSocket(this._url);
		this._ws.onopen = this.onOpen();
		this._ws.onclose = this.onClose();
	}

	onOpen(): void {
		console.log('Socket Opened');
	}

	onClose(): void  {
		this.listen();
		console.log('Socket Closed');
	}

	onMessage(message: any): void {

	}
}
