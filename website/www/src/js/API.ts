/// <reference path="lib/jquery.d.ts"/>

class API {
	public onlineCount: number;

	constructor(private baseURL: string) {
		this.onlineCount = 1;
	}
}
