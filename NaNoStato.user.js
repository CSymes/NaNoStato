// ==UserScript==
// @name		NaNoStato
// @author		Cary Symes
// @homepage	https://github.com/CSymes/NaNoStato
// @namespace	plasticsquid
// @description	Adds extra stats for NaNoWriMo novels
// @include		http://nanowrimo.org/participants/*/novels/*/stats*
// @version		1.2
// @grant		none
// ==/UserScript==

console.log('NaNoStato :: start');

/*
 * Tear the data points out of the embedded script source
 */

scripts = $('script:not([src])'); // Embedded scripts - these contain the data we want
varMatch = /var \w+ = \[[\d|,]+\]/g; // Matches variable assignments

// If we used JQuery's inbuilt .each({function}) method, the variables declared in the eval would be locked to the function's scope
for(var i = 0; i < scripts.length; i++){
	var s = scripts[i].innerHTML.match(varMatch);
	if (s !== null) {
		for (var d of s)
		// console.log(d);
		eval(d);
	}
}


/*
 * I now have these variables:
 *	 rawCamperData
 *	 parData
 *	 rawRegionData
 */

function addChart(rawData, par, name) {
	var sup = $('#content > .row > .col-sm-7'); // parent object to throw our graph under

	div2 = $('<div>');
	div1 = $('<div>');
	div0 = $('<div>');  // This one has the graph inserted into
	text = $('<text>'); // Title descriptor

	div2.addClass('panel panel-default');
	div1.addClass('panel-body');

	text.html(name);
	text.css({"font-weight": "bold"});

	sup.prepend(div2);
	div2.append(div1);
	div1.append(text);
	div1.append(div0);

	/*
	 * Magic google api guff
	 * All credit to the nano web devs for this stuff
	 */

	google.load('visualization', '1', {
		packages: ['corechart']
	});
	google.setOnLoadCallback(function () {
		var chartData = new google.visualization.DataTable();
		chartData.addColumn('string', 'Day');
		chartData.addColumn('number', 'Words');
		chartData.addColumn('number', 'Par');

		var data = [0].concat(rawData);

		for (var i = 1; i <= 30; i++) {
			var hv = 0;
			if (i <= rawData.length) {
				hv = (data[i] - data[i - 1]);
			}
			chartData.addRow([('Day ' + i), hv, par]);
		}

		// Initialize combo chart
		var chartChart = new google.visualization.ComboChart(div0[0]);
		chartChart.draw(chartData, {
			title: name,
			height: 375,
			backgroundColor: '#FFFFFF',
			chartArea: {
				left: 100,
				top: 10,
				width: '70%',
				height: '70%'
			},
			vAxis: {
				title: 'Words',
				minValue: 0,
				maxValue: 3000
			},
			series: {
				0: {type: 'bars'},
				1: {type: 'line'}
			},
			colors: ['#674732', '#BCBCBC'],
			legend: 'none',
			pointSize: 2
		});
	});
}

addChart(rawCamperData, 1667, 'Words Each Day');

console.log('Extra stats generation completed!');
