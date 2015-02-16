/// <reference path="lib/jquery.d.ts"/>

class API {
	static endpoints = {
		onlineCount: 'ws/info',
		wards: {
			past24Hours: 'wards/past24Hours'
		}
	};

	public onlineCount: number;

	constructor(private baseURL: string) {
		this.onlineCount = 1;
	}

	getJSON(endpoint: string, callback: (data: any) => void): any {
		$.getJSON(this.baseURL + API.endpoints[endpoint], callback);
	}
}
