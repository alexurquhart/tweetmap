/// <reference path="lib/jquery.d.ts"/>
/// <reference path="lib/c3.d.ts"/>
/// <reference path="API.ts"/>

class Chart {
	constructor(public node: string, public API: API) { }

	activate(): void {
		return;
	}

	resize(): void {
		return;
	}
}

class Last24HoursChart extends Chart {
	private _data: any;
	private _chart: any;

	constructor(node: string, API: API) {
		super(node, API);

		// Get the data for the chart
		this.API.getTweetData('tweets/past24hours', (data: any) => {
			this._data = $.map(data, function(el: any): any {
				el.hour = el.hour * 1000;
				return el;
			});

			this.activate();
		});
	}

	activate(): void {
		this._chart = c3.generate({
			bindTo: this.node,
			data: {
			    json: this._data,
			    keys: {
			        x: 'hour',
			        value: ['count', 'average']
			    },
			    names: {
			        count: 'Observed',
			        average: 'Weekly Average'
			    },
			    colors: {
			    	count: '#E8EEFF',
			    	average: '#383C47'
			    },
			    type: 'spline'
			},
			axis: {
			    x: {
			        type: 'timeseries'
			    }
			},
			grid: {
			    x: {
			        show: true
			    },
			    y: {
			        show: true
			    }
			},
			tooltip: {
				format: {
					title: function(d: Date): string { return d.toDateString() + ' ' + d.getHours() + ':00'; }
				}
			}
		});
	}
}
