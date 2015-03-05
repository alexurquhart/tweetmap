/// <reference path="lib/jquery.d.ts"/>
/// <reference path="lib/knockout.d.ts"/>

class API {
	constructor(private _baseURL: string) {}

	getOnlineCount(callback: (count: number) => void): void {
		$.getJSON(this._baseURL + 'ws/info', (data: any) => { callback(data.clients); });
	}

	getJSON(name: string, callback: (json: any) => void): void {
		$.getJSON(this._baseURL + 'assets/' + name + '.json', function(data: any, status: any): void {
			if (status !== 'success') {
				console.log('Could not load ' + name + '.json');
			} else {
				callback(data);
			}
		});
	}

	getTweetData(endpoint: string, callback: (json: any) => void): void {
		$.getJSON(this._baseURL + endpoint, function(data: any, status: any): void {
			if (status !== 'success') {
				console.log('Could not load ' + name + '.json');
			} else {
				callback(data);
			}
		});
	}
}
