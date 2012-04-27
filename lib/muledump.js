/* by atomizer */

// "good" are only items with this or more famebonus
var FAMETHRESHOLD = 2
// or these (pots, incantation and amulet)
var GOOD = [0xa1f, 0xa20, 0xa21, 0xa34, 0xa35, 0xa4c, 0xae9, 0xaea, 0x722, 0xb3e]

var URL = 'https://' + ['realmofthemadgod', 'rotmgtesting'][+!!window.testing] + '.appspot.com/char/list?'

var _cnt = 0;

function stat(where, type, text) {
	return $('<strong class="stat" />').addClass(type).text(text).appendTo(where);
}

function item(id) {
	var it = items[id] || items[-1]; // should catch more/better than this :/
	return $('<div class="item" />')
		.attr('title', it[0] + (~it[2] && it[1] != 10 && it[1] != 9 ? ' (t' + it[2] + ')' : ''))
		.data('id', id)
		.css('background-position', '-' + it[3] + 'px -' + it[4] + 'px')
		.append($('<div>').text('0').hide())
		.data('amount', 0);
}

function item_listing(arr) {
	var $r = $('<div class="itemsc" />');
	for (var i = 0; i < arr.length; i++) {
		item(arr[i]).appendTo($r);
	}
	return $r;
}

// weapons, armor, specials, rings, potions, unknown
var SLOT_ORDER = [1,2,3,17,8, 14,6,7, 4,5,11,12,13,15,16,18,19,20,21,22,23, 9, 10, 0];
function sort_items(where) {
	var $its = where.find('.item');
	$its.sort(function(a, b){
		var aid = $(a).data('id'), bid = $(b).data('id');
		a = items[aid] || items[-1];
		b = items[bid] || items[-1];
		function slotidx(it) {return SLOT_ORDER.indexOf(it[1])}
		function tier(it) {return (it[2] < 0) ? 42 : it[2]}
		if (slotidx(a) > slotidx(b)) return 1;
		if (slotidx(a) < slotidx(b)) return -1;
		if (tier(a) > tier(b)) return 1;
		if (tier(a) < tier(b)) return -1;
		if (aid > bid) return 1;
		if (aid < bid) return -1;
	});
	$its.appendTo(where);
}

function update_totals($arr, act) {
	var totals = $('#totals');
	totals.detach();
	
	function upd_cnt($cnt, amt) {
		var $cd = $cnt.find('div');
		var nc = $cnt.data('amount') + amt;
		if (nc < 0) nc = 0;
		$cd.text(nc);
		if (nc > 1) $cd.show();
		if (nc < 2) $cd.hide();
		$cnt.data('amount', nc);
	}
	
	$.each($arr, function() {
		var $it = $(this);
		var id = $it.data('id');
		var it = items[id] || items[-1];
		var $cnt = totals.find('.item').filter(function() { return $(this).data('id') == id; });
		if (!$cnt.length) $cnt = item(id);
		if (act == '-') upd_cnt($cnt, -1);
		if (act == '+') {
			var adding = options.crap || it[5] >= FAMETHRESHOLD || ~GOOD.indexOf(+id);
			adding = adding && (options.equipment || !$it.first().parent().hasClass('equipment'));
			if (adding) upd_cnt($cnt, 1);
		}
		if ($cnt.data('amount') < 1) {
			$cnt.remove();
		} else {
			$cnt.appendTo(totals);
		}
	});
	sort_items(totals);
	totals.insertAfter($('#top'));
}

function cache_id(mule) {
	return 'muledump:' + (!!window.testing ? 'testing:' : '') + mule.guid;
}

var Mule = function(guid) {
	if (!guid || !(guid in accounts)) return;
	this.guid = guid;
	this.fails = 0;
	this.dom = $('<div />').addClass('mule');
	this.dom.hide().appendTo($stage);
	this.query();
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
	update_totals(this.dom.find('.item'), '-');
	this.dom.hide().empty();
	$('<div class="reload" />')
		.text('↑↓').attr('title', 'reload')
		.click(function(){ self.reload() }).appendTo(this.dom);
	$('<input type="text" readonly="readonly" />')
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
	
	var $c = $('#counter');
	if (_cnt < 1) $c.parent().show();
	$c.text(++_cnt);
	
	$.ajax({
		dataType: 'json',
		url: 'https://query.yahooapis.com/v1/public/yql?callback=?',
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
			$c.text(--_cnt);
			if (_cnt < 1) $c.parent().hide();
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
	this.name = d.Account.Name;
	this.unique = !!d.Account.NameChosen;
	$('<div class="name" />').text(this.name || '(no name)').appendTo(this.dom);
	var carr = [];
	if (d.Char) { // stupid array/object detection
		if (!d.Char.length) carr = [d.Char]; else carr = d.Char;
	}
	for (var i = 0; i < (options.mcbeth ? 1 : carr.length); i++) {
		var c = carr[i], $c = $('<div class="char" />');
		if (!c || c.Dead != 'False') continue;
		var cl = classes[c.ObjectType];
		if (!cl) continue;
		$('<div class="chdesc" />')
			.append($('<div />').text(cl[0] + ' ' + c.Level + ', char #' + c.id))
			.append($('<div />').text(c.CurrentFame + ' Fame ' + c.Exp + ' Exp'))
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
		
		$c.append(printstats(c, d));
		
		// items
		var eq = c.Equipment.split(',');
		$i = $('<div class="items" />');
		$i.append(item_listing(eq.slice(0, 4)).addClass('equipment'))
			.append(item_listing(eq.slice(4, 12)));
		$c.append($i);
		
		this.dom.append($c);
	}
	
	// vault
	var chests = d.Account.Vault ? d.Account.Vault.Chest || ['-1'] : ['-1'];
	if (typeof chests == 'string') chests = [chests];
	$vaults = $('<div class="vaults" />');
	for (var i = 0; i < chests.length; i++) {
		eq = (chests[i] || '-1').split(',');
		if (eq.length < 8) {
			for (var j = eq.length; j < 8; j++) eq[j] = -1;
		}
		$('<div class="items" />').append(item_listing(eq)).appendTo($vaults);
	}
	$vaults.appendTo(this.dom);
	
	update_totals(this.dom.find('.item'), '+');
	apply_options(this.dom);
	this.dom.show();
}


function toggle_filter() {
	var $self = $(this);
	$('.item').filter(function() {
		if (!options.equipment) {
			if ($(this).parent().hasClass('equipment')) return false;
		}
		return $(this).data('id') == $self.data('id');
	}).toggleClass('selected', !$self.hasClass('selected'));
	
	if ($('.selected').length) { // if filtering
		$('.mule').each(function() {
			$(this).toggle(!!$(this).find('.selected').length);
		});
	} else {
		$('.mule').show();
	}
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
	
	for (var i in accounts) {
		mules[i] = new Mule(i);
	}
});

