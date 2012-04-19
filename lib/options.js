var options_layout = {
	'totals': 'totals',
	'guid': 'emails',
	'chdesc': 'char description',
	'items': 'items',
	'equipment': 'equipped items',
	'famefilter': {
		'label': 'famebonus filter',
		'radio': ['fameamount', {
			'0': '> 0',
			'1': '> 1%',
			'2': '> 2%',
			'3': '> 3%',
			'4': '> 4%',
			'5': '> 5%',
		}]
	},
	'stats': {
		'label': 'stats',
		'radio': ['sttype', {
			'base': 'base',
			'avg': 'distance from average',
			'max': 'left to max',
		}]
	},
	'pcstats': 'additional stats',
	'mcbeth': 'only first char',
}

function gen_option(o) {
	var opt = options_layout[o];
	if (!opt) return $('<h1>').text(o);
	var $o = $('<div>');
	var radio = typeof opt == 'object';
	// checkbox
	var $inp = $('<input>').attr({
		type: 'checkbox',
		name: o,
		value: o,
		id: 'check_' + o,
	});
	// label for checkbox
	var ltext = radio ? opt.label : opt;
	var $lab = $('<label>').attr('for', 'check_' + o).text(ltext);
	
	// events for checkbox
	
	
	//
	
	// tree-style toggle
	if (radio) $inp.change(function(e) {
		$('#radio_' + o).toggle($(this).is(':checked'));
	});
	$inp.appendTo($o);
	$lab.appendTo($o);
	if (!radio) return $o;
	// radio
	var r = opt.radio;
	var rname = r[0], ritems = r[1];
	// radio container
	var $rc = $('<div class="radio">').attr('id', 'radio_' + o);
	for (var i in ritems) {
		var $inp = $('<input>').attr({
			type: 'radio',
			name: rname,
			value: i,
			id: 'radio_' + o + i,
		});
		var $lab = $('<label>').attr('for', 'radio_' + o + i).text(ritems[i]);
		
		// events for this radio
		
		
		//
		$('<div>').append($inp).append($lab).appendTo($rc);
	}
	$rc.appendTo($o);
	return $o;
}


$(function() {
	var $options = $('#options');
	for (var i in options_layout) {
		var $opt = gen_option(i);
		$opt.appendTo($options);
	}
});

