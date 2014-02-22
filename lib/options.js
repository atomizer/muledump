var options = {
	totals: true,
	guid: false,
	chdesc: false,
	equipment: true,
	hpmp: false,
	inv: true,
	vaults: true,
	famefilter: false,
	fameamount: '0',
	stats: false,
	sttype: 'base',
	pcstats: false,
	goals: false,
	backpack: true,
	gifts: true
}

var options_layout = {
	'totals': 'totals',
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
	'guid': 'email',
	'chdesc': 'char description',
	'equipment': 'equipment',
	'hpmp': 'hp/mp pots',
	'inv': 'inventory',
	'backpack': 'backpacks',
	'vaults': 'vaults',
	'gifts': 'gift chests',
	'stats': {
		'label': 'stats',
		'radio': ['sttype', {
			'base': 'base',
			'avg': 'distance from average',
			'max': 'left to max',
		}]
	},
	'pcstats': 'additional stats',
	'goals': 'achievement progress',
}

var globalopts = { 'totals': 1, 'famefilter': 1 }
var hiddenopts = { 'sttype': 1, 'fameamount': 1 }

function gen_option(o, $targ, guid) {
	var opt = options_layout[o];
	var onacc = $targ.attr('id') == 'accopts';
	var oas = onacc ? 'acc_' : ''
	var $o = $('<div>');
	$targ.append($o);
	var radio = typeof opt == 'object';
	// checkbox
	var $inp = $('<input>').attr({
		type: 'checkbox',
		name: o,
		value: o,
		id: 'check_' + oas + o,
	});
	if (guid ? mules[guid].opt(o) : options[o]) $inp.attr('checked', 'checked');
	// label for checkbox
	var ltext = radio ? opt.label : opt;
	var $lab = $('<label>').attr('for', 'check_' + oas + o).text(ltext);
	
	$inp.change(function() {
		var name = $(this).attr('name');
		if (onacc) {
			options[guid] = options[guid] || {};
			options[guid][name] = $(this).is(':checked');
			mules[guid].query();
		} else {
			options[name] = $(this).is(':checked');
			option_updated(name);
		}
	});
	// tree-style toggle
	if (radio) {
		$inp.change(function(e) {
			$('#radio_' + oas + o).toggle($(this).is(':checked'));
		});
	}
	$inp.appendTo($o);
	$lab.appendTo($o);
	if (!radio) return $o;
	// radio
	var r = opt.radio;
	var rname = r[0], ritems = r[1];
	// radio container
	var $rc = $('<div class="radio">').attr('id', 'radio_' + oas + o);
	for (var i in ritems) {
		var $inp = $('<input>').attr({
			type: 'radio',
			name: rname,
			value: i,
			id: 'radio_' + oas + o + i,
		});
		if ((onacc ? mules[guid].opt(rname) : options[rname]) == i) $inp.attr('checked', 'checked');
		var $lab = $('<label>').attr('for', 'radio_' + oas + o + i).text(ritems[i]);
		
		$inp.change(function() {
			var $this = $(this), name = $this.attr('name');
			if (onacc) {
				var guid = $targ.data('guid');
				if (!guid) return;
				options[guid] = options[guid] || {};
				options[guid][name] = $this.is(':checked') ? $this.val() : false;
				mules[guid].query();
			} else {
				options[name] = $this.is(':checked') ? $this.val() : false;
				option_updated(name);
			}
		});
		
		$('<div>').append($inp).append($lab).appendTo($rc);
	}
	$rc.toggle(!!(onacc ? mules[guid].opt(o) : options[o])).appendTo($o);
}

// update everything with single option
function option_updated(o) {
	if (o == 'equipment' || o == 'inv' || o == 'vaults') {
		update_totals();
		update_filter();
	}
	if (o == 'totals') {
		$totals.toggle(!!options.totals);
	}
	if (o == 'famefilter' || o == 'fameamount') {
		update_totals();
	}
	if (!(o in globalopts)) {
		for (var i in options) {
			if (i in options_layout || i in hiddenopts) continue;
			if (o in options[i]) delete options[i][o];
		}
		for (var i in mules) {
			mules[i].query();
		}
	}
	// save
	try {
		localStorage['muledump:options'] = JSON.stringify(options);
	} catch (e) {}
	relayout();
}

function updaccopts(guid) {
	var $ao = $('#accopts');
	$ao.empty();
	$ao.data('guid', guid);
	for (var i in options_layout) {
		if (!(i in globalopts)) gen_option(i, $ao, guid);
	}
}


$(function() {
	$totals = $('#totals');
	$errors = $('#errors');
	$stage = $('#stage');
	// read options from cache
	var c = '';
	try {
		c = localStorage['muledump:options'];
	} catch (e) {
		localStorage.clear();
	}
	if (c) {
		try {
			c = JSON.parse(c);
			for (var k in c) {
				if (k in options || k in accounts) options[k] = c[k];
			}
		} catch (e) {}
	}
	
	var $options = $('#options');
	for (var i in options_layout) {
		gen_option(i, $options);
	}
	$('#accopts').on('mouseleave', function() { $(this).hide(); });
});
