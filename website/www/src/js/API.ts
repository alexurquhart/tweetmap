/// <reference path="lib/jquery.d.ts"/>
/// <reference path="lib/knockout.d.ts"/>

class API {
	private _onlineCount: KnockoutObservable<number>;

	constructor(private baseURL: string) {
		this._onlineCount = ko.observable(1);

		this.updateOnlineCount();
		setInterval(() => { this.updateOnlineCount(); }, 5000);
	}

	get onlineCount(): KnockoutObservable<number> {
		return this._onlineCount;
	}

	updateOnlineCount(): void {
		$.getJSON(this.baseURL + 'ws/info', (data: any) => { this._onlineCount(data.clients); });
	}
}
