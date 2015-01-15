var VERSION = '0.4.26';

// weapons, armor, specials, rings, potions, unknown
var SLOT_ORDER = [1,2,3,17,8,24, 14,6,7, 4,5,11,12,13,15,16,18,19,20,21,22,23,25, 9, 10, 0];

// pots, incantation and amulet
var GOOD = [0xa1f, 0xa20, 0xa21, 0xa34, 0xa35, 0xa4c, 0xae9, 0xaea, 0x722, 0xb3e]

// max width of an account box in columns
var ROW = window.rowlength || 7

// are totals not following equip/inv/vaults options?
var TKGP = false;

// dom snippet generators

function stat(where, type, text) {
	return $('<strong class="stat">').addClass(type).text(text).appendTo(where);
}

function item(id) {
	id = +id
	var ids = '0x' + id.toString(16)
	var $r = $('<div class="item">').data('id', id).append($('<div>').text('0').hide())
	var it = items[id]
	if (!it) {
		it = items[id] = ['item ' + ids, 0, -1, 0, 0, 0, 0]
	}
	if (id != -1 && it[1] == 0) {
		$r.append($('<span>').text(ids))
	}
	var title = it[0];
	if (~it[2] && it[1] != 10 && it[1] != 9) title += ' (T' + it[2] + ')';
	if (it[6]) title += '\nFeed Power: ' + it[6]
	if (false && window.prices) {
		var price = priceTable.lookup(it[0]);
		if (price) title += '\nPrice: ' + price;
	}
	return $r.attr('title', title)
		.css('background-position', '-' + it[3] + 'px -' + it[4] + 'px')
}

function item_listing(arr, classname) {
	var $r = $('<div class="itemsc">');
	for (var i = 0; i < arr.length; i++) {
		item(arr[i]).appendTo($r);
	}
	if (classname) $r.addClass(classname);
	return $r;
}

function maketable(classname, items, row) {
	row = row || ROW;
	var $t = $('<table>').addClass(classname);
	var $row;
	for (var i = 0; i < items.length; i++) {
		if (i % row == 0) {
			if ($row) $t.append($row);
			$row = $('<tr>');
		}
		$('<td class="cont">').append(items[i]).appendTo($row);
	}
	if ($row) $t.append($row);
	var cols = items.length >= row ? row : items.length;
	cols = cols || 1;
	$t.css('width', '' + (184 * cols + 14 * (cols - 1)) + 'px');
	return $t;
}

var NUMCLASSES = 0;
for (var i in classes) NUMCLASSES++;

var STARFAME = [20, 150, 400, 800, 2000];
var STARCOLOR = ['#8a98de', '#314ddb', '#c1272d', '#f7931e', '#ffff00', '#ffffff'];
function addstar($t, d) {
	var r = 0;
	if (!d.Account.Stats || !d.Account.Stats.ClassStats) return;
	var s = d.Account.Stats.ClassStats;
	if (!s.length) s = [s];
	for (var i = 0; i < s.length; i++) {
		var b = +s[i].BestFame || 0;
		for (var j = 0; b >= STARFAME[j] && j < 5; j++);
		r += j;
	}
	if (r < 1) return;
	var $s = $('<span>').addClass('scont');
	$('<span>').text(r).appendTo($s);
	var $st = $('<span>').text('\u2605').addClass('star');
	$st.css('color', STARCOLOR[Math.floor(r / NUMCLASSES)] || 'lime');
	$st.appendTo($s);
	$s.appendTo($t);
}

function mulelink(guid) {
	function toHex(s) {
		var r = '', t = '';
		for (var i = 0; i < s.length; i++) {
			t = s.charCodeAt(i).toString(16);
			if (t.length == 1) t = '0' + t;
			r += t;
		}
		return r;
	}
	var l = $('<a>').addClass('mulelink');
	l.text('\u21d7');
	l.attr('href', 'muledump:' + toHex(guid) + '-' + toHex(accounts[guid]));
	l.attr('title', 'open this account');
	return l;
}

var VAULTORDER = [34, 32, 30, 28, 31, 33, 35,
                  27, 25, 21, 20, 22, 26, 29,
                  23, 17, 13, 11, 14, 18, 24,
                  16,  9,  6,  4,  7, 10, 19,
                  12,  5,  2,  1,  3,  8, 15];
function arrangevaults(v) {
	while(VAULTORDER.length < v.length){
		var a = VAULTORDER[0] + 2;
		VAULTORDER.splice(0, 0, a+5, a+3, a+1, a, a+2, a+4, a+6);
	}
	var r = [];
	for (var i = 0; i < VAULTORDER.length; i++) {
		if (i % 7 == 0 && r.length) {
			for (var j = 0; j < r.length; j++) if (r[j]) break;
			if (j >= r.length) r = [];
		}
		var c = v[VAULTORDER[i] - 1];
		if (typeof c != 'undefined') r.push(c); else r.push(0);
	}
	var w = 7;
	for (var i = 6; i >= 0; i--) {
		for (var j = i; j < r.length; j+=w) if (r[j]) break;
		if (j < r.length) continue;
		w--;
		for (var j = i; j < r.length; j+=w) r.splice(j, 1);
	}
	if (ROW < w) return [0, v];
	return [w, r];
}

// totals

var totals = {}, counters = {}, ids = [];

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
	$totals.hide();
	var old = totals;
	totals = {};

	function upd(arr) {
		if (!arr) return;
		for (var i = 0; i < arr.length; i++) {
			var id = +arr[i];
			if (isbad(id)) continue;
			if (id in totals) totals[id]++; else totals[id] = 1;
		}
	}

	function isbad(id) {
		if (!options.famefilter || ~GOOD.indexOf(+id)) return false;
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
			if (TKGP || mules[i].opt('equipment')) upd(ch.slice(0, 4));
			if (TKGP || mules[i].opt('inv')) upd(ch.slice(4, 12));
			if (TKGP || mules[i].opt('backpack')) upd(ch.slice(12, 20));
		}
		if (TKGP || mules[i].opt('vaults')) {
			for (var j = 0; j < m.vaults.length; j++) {
				upd(m.vaults[j]);
			}
		}
	}

	for (var i in old) {
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
	for (var i in totals) {
		if (i in old) continue;
		if (!items[i]) continue
		if (!counters[i]) {
			var $i = item(i);
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
			} else $i.appendTo($totals);
			counters[i] = $i;
		}
		var a = totals[i];
		counters[i].find('div').toggle(a > 1).text(a);
		counters[i].css('display', 'inline-block');
	}
	option_updated('totals');
}

// click-and-find

var filter = {};

function toggle_filter() {
	var $self = $(this);
	var id = $self.data('id');
	if (id in filter) delete filter[id]; else filter[id] = 1;
	relayout();
}

function update_filter() {
	$('.item.selected').filter(function() {
		return !($(this).data('id') in filter);
	}).removeClass('selected');
	$('.item').filter(function() {
		return $(this).data('id') in filter;
	}).addClass('selected');
	if ($.isEmptyObject(filter) || $('.item.selected:visible').length == 0) {
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

// Mule

// version check

function cmpver(v1, v2) {
	v1 = v1.split('.'); v2 = v2.split('.');
	for (var i = 0; i < v1.length && i < v2.length; i++) {
		var r = v1[i] - v2[i];
		if (r) return r;
	}
	return v1.length - v2.length;
}

function checkversion() {
	function checkupd(data) {
		if (data.meta.status != 200) return;
		var d = data.data, topver = VERSION, url;
		for (var i = 0; i < d.length; i++) {
			if (cmpver(d[i].name, topver) > 0) {
				topver = d[i].name;
				url = d[i].zipball_url;
			}
		}
		var $u = $('#update');
		if (!url) {
			$u.text('latest version').delay(1000).hide(0);
			return;
		}
		var link = $('<a>').attr('href', url).text('download ' + topver);
		$u.replaceWith(link);
	}
	$.ajax({
		dataType: 'jsonp',
		url: 'https://api.github.com/repos/atomizer/muledump/tags',
		complete: function(xhr) {
			xhr.done(checkupd);
		}
	});
}


var mules = {};

$(function() {
	if (typeof accounts != 'object' || accounts['email1'] || accounts['email2']) {
		window.location = 'http://www.youtube.com/watch?v=KJ-wO7SMtOg';
		return;
	}

	$.ajaxSetup({
		cache: false,
		timeout: 5000
	});

	$('body').delegate('.item', 'click', toggle_filter);
	$('body').delegate('.guid', 'click', function(){ this.select(); });

	$('#reloader').click(function() {
		$errors.empty();
		autherr = {};
		for (var i in mules) mules[i].reload();
	});

	$('#options').prev().click(function() {
		var $o = $('#options');
		if ($o.attr('style')) $o.attr('style', ''); else $o.css('display', 'block');
	});

	$('#update').one('click', function() {
		$(this).text('loading...').css('cursor', 'default');
		checkversion();
	});

	init_totals();

	for (var i in accounts) {
		mules[i] = new Mule(i);
	}
	for (var i in mules) mules[i].query();

	if (!window.nomasonry) {
		$stage.masonry({
			itemSelector : '.mule',
			columnWidth : 198,
			transitionDuration: 0
		});
	}

	relayout();
});

var mtimer;

function relayout() {
	if (mtimer) return;
	mtimer = setTimeout(function() {
		update_totals();
		update_filter();
		if (!window.nomasonry) $stage.masonry('layout');
		mtimer = 0;
	}, 0);
}

window.onload = relayout
