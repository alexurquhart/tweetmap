/// <reference path="lib/nvd3.d.ts"/>
/// <reference path="lib/d3.d.ts"/>
/// <reference path="lib/jquery.d.ts"/>
/// <reference path="API.ts"/>

interface IChartSeries {
	key: string;
	values: any[];
	color?: string;
	area?: boolean;
}

class Chart {
	constructor(public node: string, public name: string, public API: API) { }

	activate(): void {
		return;
	}

	resize(): void {
		return;
	}
}

class TweetsPerHourChart extends Chart {
	private _data: IChartSeries[];

	constructor(node: string, name: string, API: API) {
		super(node, name, API);

		this.API.getTweetData('tweets/past24hours', (data: any) => {

			// Make an array with the average values
			var average: Array<any> = $.map(data, function(el: any): any {
				return [[el.hour * 1000, el.average]];
			});

			var current: Array<any> = $.map(data, function(el: any): any {
				return [[el.hour * 1000, el.count]];
			});

			// Go through each data point and format them into series
			this._data = [
				{
					key: 'Current',
					values: current,
					color: '#FFF'
				},
				{
					key: 'Average',
					values: average,
					color: '#FFF'
				}
			];

			this.activate();

		});
	}

	activate(): void {
		// Reference: http://bl.ocks.org/mbostock/3883245
alert(1);

		d3.select(this.node)
			.append('svg')
			.attr('id', this.name);

		// Get the dimensions
		nv.addGraph(() => {

			var chart: any = nv.models.lineChart()
				.showLegend(true)
				.showYAxis(true)
				.showXAxis(true);

			chart.xAxis
				.axisLabel('Time');

			chart.yAxis
				.axisLabel('Tweets/Hour');


			d3.select('#' + this.name)
				.datum(this._data)
				.call(chart);

			nv.utils.windowResize(chart.update);

			return chart;
		});
	}
}
