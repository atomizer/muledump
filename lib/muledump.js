/* by atomizer */

// weapons, armor, specials, rings, potions, unknown
var SLOT_ORDER = [1,2,3,17,8, 14,6,7, 4,5,11,12,13,15,16,18,19,20,21,22,23, 9, 10, 0];

// pots, incantation and amulet
var GOOD = [0xa1f, 0xa20, 0xa21, 0xa34, 0xa35, 0xa4c, 0xae9, 0xaea, 0x722, 0xb3e]

// max width of an account box in columns
var ROW = 4;

var URL = 'https://' + ['realmofthemadgod', 'rotmgtesting'][+!!window.testing] + '.appspot.com/char/list?'

var _cnt = 0;

function queue_request(obj) {
	var oc = obj.complete;
	obj.complete = function() {
		if (oc) oc.apply(this, arguments);
		_cnt = $(document).queue('ajax').length;
		update_counter();
		$(document).dequeue('ajax');
	}
	if (_cnt) {
		$(document).queue('ajax', function(){ $.ajax(obj) });
	} else {
		$.ajax(obj);
	}
	_cnt++;
	update_counter();
}

function update_counter() {
	$('#counter').text(_cnt).parent().toggle(!!_cnt);
}

function stat(where, type, text) {
	return $('<strong class="stat">').addClass(type).text(text).appendTo(where);
}

function item(id) {
	var it = items[id] || items[-1]; // should catch more/better than this :/
	return $('<div class="item">')
		.attr('title', it[0] + (~it[2] && it[1] != 10 && it[1] != 9 ? ' (t' + it[2] + ')' : ''))
		.data('id', id)
		.css('background-position', '-' + it[3] + 'px -' + it[4] + 'px')
		.append($('<div>').text('0').hide());
}

function item_listing(arr) {
	var $r = $('<div class="itemsc">');
	for (var i = 0; i < arr.length; i++) {
		item(arr[i]).appendTo($r);
	}
	return $r;
}

function maketable(classname, items) {
	var $t = $('<table>').addClass(classname);
	var $row;
	for (var i = 0; i < items.length; i++) {
		if (i % ROW == 0) {
			if ($row) $t.append($row);
			$row = $('<tr>');
		}
		$('<td class="cont">').append(items[i]).appendTo($row);
	}
	if ($row) $t.append($row);
	var cols = items.length >= ROW ? ROW : items.length;
	cols = cols || 1;
	$t.css('width', '' + (184 * cols + 14 * (cols - 1)) + 'px');
	return $t;
}

var totals = {}, counters = {};

function init_totals() {
	var ids = [];
	for (var id in items) ids.push(id);
	// sort
	ids.sort(function(a, b) {
		a = items[a];
		b = items[b];
		function slotidx(it) { return SLOT_ORDER.indexOf(it[1]) }
		function tier(it) { return (it[2] < 0) ? 42 : it[2] }
		return (slotidx(a) - slotidx(b)) || (tier(a) - tier(b));
	});
	// create counters
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		var $i = item(id);
		$totals.append($i);
		counters[id] = $i.find('div');
		$i.css('display', 'inline-block');
		$i.hide();
	}
	$totals.css('display', 'inline-block');
}

function update_totals() {
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
			if (options.equipment) upd(ch.slice(0, 4));
			if (options.inv) upd(ch.slice(4));
		}
		if (options.vaults) {
			for (var j = 0; j < m.vaults.length; j++) {
				upd(m.vaults[j]);
			}
		}
	}
	
	for (var i in old) {
		if (!items[i]) continue;
		if (i in totals) {
			var a = totals[i];
			counters[i].toggle(a > 1).text(a);
		} else counters[i].parent().hide();
	}
	for (var i in totals) {
		if (i in old) continue;
		if (!items[i]) {
			$errors.append($('<div>').text('update your muledump: found unknown item id #' + i));
			continue;
		}
		var a = totals[i];
		counters[i].toggle(a > 1).text(a);
		counters[i].parent().show();
	}
}

var filter = {};

function toggle_filter() {
	var $self = $(this);
	var id = $self.data('id');
	if (id in filter) delete filter[id]; else filter[id] = 1;
	update_filter();
}

function update_filter() {
	$('.item.selected').filter(function() {
		return !($(this).data('id') in filter);
	}).removeClass('selected');
	$('.item').filter(function() {
		return $(this).data('id') in filter;
	}).addClass('selected');
	if ($.isEmptyObject(filter) || $('.item.selected:visible').length == 0) {
		for (var i in mules) if (mules[i].loaded) mules[i].dom.show();
		$stage.masonry('reload');
		return;
	}
	// if filtering
	var parts = ['equipment', 'inv', 'vaults'];
	$('.mule').each(function() {
		$sel = $(this).find('.selected');
		for (var i = 0; i < $sel.length; i++) {
			var $par = $($sel[i]).parent();
			for (var j = 0; j < parts.length; j++) {
				var c = parts[j];
				if (options[c] && $par.hasClass(c)) {
					$(this).show();
					return;
				}
			}
		}
		$(this).hide();
	});
	$stage.masonry('reload');
}

function cache_id(mule) {
	return 'muledump:' + (!!window.testing ? 'testing:' : '') + mule.guid;
}

var Mule = function(guid) {
	if (!guid || !(guid in accounts)) return;
	this.guid = guid;
	this.fails = 0;
	this.dom = $('<div class="mule">');
	this.dom.appendTo($stage).hide();
}

Mule.prototype.error = function(s) {
	var self = this;
	var $e = $('<div>').text(this.guid + ': ' + s || 'unknown error');
	var $r = $('<span>').text('↑↓');
	$r.click(function() {
		self.reload();
		$(this).parent().remove();
	});
	$e.addClass('error').append($r).appendTo($errors);
}

Mule.prototype.query = function(ignore_cache) {
	var self = this;
	if (this.busy) return; // somewhat protects against parallel reloads
	this.busy = true;
	this.loaded = false;
	this.items = { chars: [], vaults: [] };
	update_totals();
	this.dom.hide().empty();
	$('<div class="reload">')
		.text('↑↓').attr('title', 'reload')
		.click(function(){ self.reload() }).appendTo(this.dom);
	$('<input type="text" readonly="readonly">')
		.addClass('guid').val(this.guid)
		.appendTo(this.dom);
	
	// read from cache if possible
	if (!ignore_cache) {
		var c = '';
		try {
			c = localStorage[cache_id(this)];
			c = JSON.parse(c);
		} catch(e) {}
		if (c) {
			this.parse(c);
			this.busy = false;
			return;
		}
	}
	
	var params = {guid: this.guid, ignore: Math.floor(1e3 + 9e3 * Math.random())};
	var pass = accounts[this.guid] || '';
	params[this.guid.indexOf('kongregate:') == 0 ? 'secret' : 'password'] = pass;
	var url = URL + $.param(params);
	
	queue_request({
		dataType: 'jsonp',
		url: 'https://query.yahooapis.com/v1/public/yql',
		data: {
			q: 'select * from xml where url="' + url + '"',
			format: 'json',
		},
		complete: function(xhr) {
			self.busy = false;
			xhr
			.done(function(data){
				self.parse(data);
			})
			.fail(function() {
				self.fails++;
				if (self.fails < 5) {
					setTimeout(function() { self.query(true) }, 3000);
				} else {
					self.error('request failed');
				}
			});
		},
	});
}

Mule.prototype.reload = function() {
	this.fails = 0;
	this.query(true);
}

var PROPTAGS = 'ObjectType Level Exp CurrentFame'.split(' ')
var STATTAGS = 'MaxHitPoints MaxMagicPoints Attack Defense Speed Dexterity HpRegen MpRegen'.split(' ')
var STATABBR = 'HP MP ATT DEF SPD DEX VIT WIS'.split(' ')
Mule.prototype.parse = function(data) {
	if (!data.query || !data.query.results) {
		this.error(data.query ? 'server error' : 'YQL service denial');
		return;
	}
	if (!data.query.results.Chars) {
		this.error(data.query.results.Error || 'bad reply');
		return;
	}
	this.data = data.query.results.Chars;
	var d = this.data;
	delete d.Servers;
	delete d.News;
	// write cache
	try {
		localStorage[cache_id(this)] = JSON.stringify(data);
	} catch(e) {}
	
	this.updated = new Date(data.query.created);
	this.dom.find('.reload').attr('title', 'last updated: ' + this.updated.toLocaleString());
	var $name = $('<div>').addClass('name').text(d.Account.Name || '(no name)');
	var self = this;
	$name.click(function() {
		self.disabled = !self.disabled;
		self.dom.toggleClass('disabled', self.disabled);
		update_totals();
	});
	$name.appendTo(this.dom);
	this.dom.append($('<hr class="chars">'));
	var carr = [];
	if (d.Char) { // stupid array/object detection
		if (!d.Char.length) carr = [d.Char]; else carr = d.Char;
	}
	var arr = [];
	for (var i = 0; i < carr.length; i++) {
		var c = carr[i], $c = $('<div class="char">');
		if (!c || c.Dead != 'False') continue;
		var cl = classes[c.ObjectType];
		if (!cl) continue;
		$('<div class="chdesc">')
			.append($('<div>').text(cl[0] + ' ' + c.Level + ', char #' + c.id))
			.append($('<div>').text(c.CurrentFame + ' Fame ' + c.Exp + ' Exp'))
			.appendTo($c);
		
		var $stats = $('<table class="stats">');
		
		for (var t = 0; t < STATTAGS.length; t++) {
			if (t % 2 == 0) var $row = $('<tr>');
			$('<td class="sname">').text(STATABBR[t]).appendTo($row);
			var $s = $('<td>');
			var s = +c[STATTAGS[t]] || 0;
			
			stat($s, 'base', s).toggleClass('maxed', s == cl[3][t]);
			
			var avgd = s - Math.floor(cl[1][t] + (cl[2][t] - cl[1][t]) * (+c.Level - 1) / 19);
			stat($s, 'avg', (avgd > 0 ? '+' : '') + avgd)
				.addClass(avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : ''))
				.toggleClass('very', Math.abs(avgd) > 14);
			
			var l2m = cl[3][t] - s;
			if (t < 2) l2m = l2m + ' (' + Math.ceil(l2m / 5) + ')';
			stat($s, 'max', l2m)
				.toggleClass('maxed', cl[3][t] == s);
			
			$s.appendTo($row);
			if (t % 2) $row.appendTo($stats);
		}
		$c.append($stats);
		
		// items
		var eq = c.Equipment.split(',');
		this.items.chars.push(eq);
		$('<div>').addClass('items')
			.append(item_listing(eq.slice(0, 4)).addClass('equipment'))
			.append(item_listing(eq.slice(4, 12)).addClass('inv'))
			.appendTo($c);
		
		$c.append(printstats(c, d));
		arr.push($c);
	}
	maketable('chars', arr).appendTo(this.dom);
	arr = [];
	this.dom.append($('<hr class="vaults">'));
	// vault
	var chests = d.Account.Vault ? d.Account.Vault.Chest || ['-1'] : ['-1'];
	if (typeof chests == 'string') chests = [chests];
	for (var i = 0; i < chests.length; i++) {
		eq = (chests[i] || '-1').split(',');
		if (eq.length < 8) {
			for (var j = eq.length; j < 8; j++) eq[j] = -1;
		}
		this.items.vaults.push(eq);
		arr.push($('<div class="items">').append(item_listing(eq).addClass('vaults')));
	}
	maketable('vaults', arr).appendTo(this.dom);
	this.loaded = true;
	apply_options(this.dom);
	this.dom.show();
	update_totals();
	update_filter();
}


var mules = {};

$(function() {
	if (typeof accounts != 'object') {
		$('<h2>').addClass('error')
			.text('accounts.js is missing or corrupted')
			.appendTo($errors);
		return;
	}
	
	$.ajaxSetup({
		cache: false,
		timeout: 5000,
	});
	
	$('body').delegate('.item', 'click', toggle_filter);
	$('body').delegate('.guid', 'click', function(){ this.select(); });
	
	$('#reloader').click(function() {
		for (var i in mules) mules[i].reload();
	});
	
	$('#ohandle').click(function() {
		var $o = $('#options');
		if ($o.attr('style')) $o.attr('style', ''); else $o.css('display', 'block');
	});
	
	$stage.masonry({
		itemSelector : '.mule:visible',
		columnWidth : 198,
	});
	
	init_totals();
	for (var k in options) option_updated(k);
	
	for (var i in accounts) {
		mules[i] = new Mule(i);
	}
	for (var i in mules) mules[i].query();
	setTimeout(function() { $stage.masonry('reload') }, 100);
});

