(function($, window) {

// weapons, armor, specials, rings, potions, unknown
var SLOT_ORDER = [1,2,3,17,8,24, 14,6,7, 4,5,11,12,13,15,16,18,19,20,21,22,23,25, 9, 10, 0];

var totals = {}, counters = {}, ids = [];

window.ids = ids

var options = window.options
var option_updated = window.option_updated
var items = window.items


function init_totals() {
	for (var id in items) ids.push(id);
	// sort
	ids.sort(function(a, b) {
		a = items[a];
		b = items[b];
		function slotidx(it) { return SLOT_ORDER.indexOf(it[1]) }
		function tier(it) { return (it[2] < 0) ? 42 : it[2] }
		return (slotidx(a) - slotidx(b)) || (tier(a) - tier(b));
	});
}

function update_totals() {
	$('#totals').hide();
	var old = totals;
	totals = window.totals = {};
	var mules = window.mules

	function upd(arr) {
		if (!arr) return;
		for (var i = 0; i < arr.length; i++) {
			var id = +arr[i];
			if (isbad(id)) continue;
			if (id in totals) totals[id]++; else totals[id] = 1;
		}
	}

	function isbad(id) {
		if (!options.famefilter) return false;
		var i = items[id] || items[-1];
		if (i[5] > +options.fameamount) return false;
		return true;
	}

	// count items
	for (var i in mules) {
		var m = mules[i].items;
		if (mules[i].disabled || !m) continue;
		for (var j = 0; j < m.chars.length; j++) {
			var ch = m.chars[j];
			if (mules[i].opt('equipment')) upd(ch.slice(0, 4));
			if (mules[i].opt('inv')) upd(ch.slice(4, 12));
			if (mules[i].opt('backpack')) upd(ch.slice(12, 20));
		}
		if (mules[i].opt('vaults')) {
			for (j = 0; j < m.vaults.length; j++) {
				upd(m.vaults[j]);
			}
		}
	}

	for (i in old) {
		if (!items[i]) continue;
		if (!(i in totals)) {
			counters[i].hide();
			continue;
		}
		if (totals[i] != old[i]) {
			var a = totals[i];
			counters[i].find('div').toggle(a > 1).text(a);
		}
	}
	for (i in totals) {
		if (i in old) continue;
		if (!items[i]) continue
		if (!counters[i]) {
			var $i = window.item(i);
			var idx = ids.indexOf(i), minid = 0, minidx = 1e6, idxj = -1;
			for (var j in counters) {
				idxj = ids.indexOf(j);
				if (idxj > idx && idxj < minidx) {
					minidx = idxj;
					minid = j;
				}
			}
			if (minid) {
				$i.insertBefore(counters[minid]);
			} else $i.appendTo($('#totals'));
			counters[i] = $i;
		}
		var f = totals[i];
		counters[i].find('div').toggle(f > 1).text(f);
		counters[i].css('display', 'inline-block');
	}
	option_updated('totals');
}

// click-and-find

var filter = {};
window.filter = filter

function toggle_filter() {
	var $self = $(this);
	var id = $self.data('id');
	if (id in filter) delete filter[id]; else filter[id] = 1;
	window.relayout();
}

function update_filter() {
	$('.item.selected').filter(function() {
		return !($(this).data('id') in filter);
	}).removeClass('selected');
	$('.item').filter(function() {
		return $(this).data('id') in filter;
	}).addClass('selected');
	if ($.isEmptyObject(filter) || $('.item.selected:visible').length === 0) {
		var mules = window.mules
		for (var i in mules) if (mules[i].loaded) mules[i].dom.css('display', 'inline-block');
		return;
	}
	// if filtering
	var parts = ['equipment', 'inv', 'backpack', 'vaults', 'gifts'];
	$('.mule').each(function() {
		var $sel = $(this).find('.selected');
		for (var i = 0; i < $sel.length; i++) {
			var $par = $($sel[i]).parent();
			for (var j = 0; j < parts.length; j++) {
				var c = parts[j];
				if (options[c] && $par.hasClass(c)) {
					$(this).css('display', 'inline-block');
					return;
				}
			}
		}
		$(this).hide();
	});
}


window.init_totals = init_totals
window.update_totals = update_totals
window.update_filter = update_filter
window.toggle_filter = toggle_filter

})($, window)

