/// <reference path="lib/d3.d.ts"/>
/// <reference path="Tweet.ts"/>
/// <reference path="Map.ts"/>
/// <reference path="Feed.ts"/>

class Overlay {
	private _active: boolean;
	private _name: string

	constructor(private _displayName: string, public map: TweetMap) {
		this._name = this._displayName.toLowerCase().replace(' ', '');
		this._active = false;
	}

	get name(): string {
		return this._name;
	}

	get displayName(): string {
		return this._displayName;
	}

	get active(): boolean {
		return this._active;
	}

	activate(): void {
		if (!this._active) {
			this._active = true;
		}
	}

	deactivate(): void {
		if (this._active) {
			this._active = false;
		}
	}
}
