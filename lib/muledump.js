var VERSION = '0.4.18';

// weapons, armor, specials, rings, potions, unknown
var SLOT_ORDER = [1,2,3,17,8,24, 14,6,7, 4,5,11,12,13,15,16,18,19,20,21,22,23,25, 9, 10, 0];

// pots, incantation and amulet
var GOOD = [0xa1f, 0xa20, 0xa21, 0xa34, 0xa35, 0xa4c, 0xae9, 0xaea, 0x722, 0xb3e]

// max width of an account box in columns
var ROW = window.rowlength || 7

// are totals not following equip/inv/vaults options?
var TKGP = false;

var URL = 'https://' + ['realmofthemadgod', 'rotmgtesting'][+!!window.testing] + '.appspot.com/char/list?'

var autherr = {}

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

function item_listing(arr) {
	var $r = $('<div class="itemsc">');
	for (var i = 0; i < arr.length; i++) {
		item(arr[i]).appendTo($r);
	}
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
	var parts = ['equipment', 'inv', 'backpack', 'vaults'];
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

Mule.prototype.opt = function(name) {
	var o = options[this.guid];
	if (o && name in o) {
		return o[name];
	}
	return options[name];
}

Mule.prototype.error = function(s) {
	if (autherr[this.guid]) return;
	var self = this;
	var $e = $('<div>').text(this.guid + ': ' + s || 'unknown error');
	var $r = $('<span>').text('\u21bb');
	$r.click(function() {
		self.reload();
	});
	$e.addClass('error').append($r).appendTo($errors);
	autherr[this.guid] = $e;
}

Mule.prototype.query = function(ignore_cache) {
	var self = this;
	if (this.busy) return; // somewhat protects against parallel reloads
	this.busy = true;
	this.loaded = false;
	this.items = { chars: [], vaults: [] };
	relayout();
	this.dom.hide().empty();
	$('#accopts').hide().data('guid', '');

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
			format: 'json'
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
					self.query(true);
				} else {
					self.error('request failed');
				}
			});
		}
	});
}

Mule.prototype.reload = function() {
	this.fails = 0;
	if (autherr[this.guid]) {
		autherr[this.guid].remove();
		delete autherr[this.guid];
	}
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
	if (this.opt('guid')) {
		$('<input type="text" readonly="readonly">')
		.addClass('guid').val(this.guid).appendTo(this.dom);
		$('<br>').appendTo(this.dom);
	}
	$('<div class="reload">')
		.text('\u21bb').attr('title', 'reload')
		.click(function(){ self.reload() }).appendTo(this.dom);
	this.dom.find('.reload').attr('title', 'last updated: ' + this.updated.toLocaleString());
	if (window.mulelogin) this.dom.append(mulelink(this.guid));
	d.Account = d.Account || {}
	var $name = $('<div>').addClass('name').text(d.Account.Name || '(no name)');
	addstar(this.dom, d);
	if (!('VerifiedEmail' in d.Account)) {
		var $warn = $('<span class="warn">').text('!!')
		$warn.attr('title', 'email not verified').appendTo(this.dom)
	}
	var self = this;
	$name.click(function(e) {
		if (e.target != this) return;
		if (e.ctrlKey) {
			self.disabled = !self.disabled;
			self.dom.toggleClass('disabled', self.disabled);
			update_totals();
			return;
		}
		var $ao = $('#accopts');
		$ao.css({
			left: e.pageX - 5 + 'px',
			top: e.pageY - 5 + 'px'
		});
		updaccopts(self.guid);
		$ao.css('display', 'block');
	});
	$name.appendTo(this.dom);
	var carr = [];
	if (d.Char) { // stupid array/object detection
		if (!d.Char.length) carr = [d.Char]; else carr = d.Char;
	}
	var f = false;
	var arr = [];
	carr.sort(function(a,b) {return a.id - b.id});
	for (var i = 0; i < carr.length; i++) {
		var c = carr[i], $c = $('<div class="char">');
		if (!c) continue;
		var cl = classes[c.ObjectType];
		if (!cl) continue;
		if (this.opt('chdesc')) {
			f = true;
			var portimg = $('<img class="portrait">');
			portrait(portimg, c.ObjectType, c.Tex1, c.Tex2);
			$('<div class="chdesc">')
				.append(portimg)
				.append($('<div>').text(cl[0] + ' ' + c.Level + ', #' + c.id))
				.append($('<div>').text(c.CurrentFame + ' F ' + c.Exp + ' XP'))
				.appendTo($c);
		}
		if (this.opt('stats')) {
			f = true;
			var $stats = $('<table class="stats">');

			for (var t = 0; t < STATTAGS.length; t++) {
				if (t % 2 == 0) var $row = $('<tr>');
				$('<td class="sname">').text(STATABBR[t]).appendTo($row);
				var $s = $('<td>');
				var s = +c[STATTAGS[t]] || 0;
				var stt = this.opt('sttype');
				if (stt == 'base') {
					stat($s, 'base', s).toggleClass('maxed', s == cl[3][t]);
				} else if (stt == 'avg') {
					var avgd = s - Math.floor(cl[1][t] + (cl[2][t] - cl[1][t]) * (+c.Level - 1) / 19);
					stat($s, 'avg', (avgd > 0 ? '+' : '') + avgd)
						.addClass(avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : ''))
						.toggleClass('very', Math.abs(avgd) > 14);
				} else if (stt == 'max') {
					var l2m = cl[3][t] - s;
					if (t < 2) l2m = l2m + ' (' + Math.ceil(l2m / 5) + ')';
					stat($s, 'max', l2m)
						.toggleClass('maxed', cl[3][t] <= s);
				}
				$s.appendTo($row);
				if (t % 2) $row.appendTo($stats);
			}
			$c.append($stats);
		}

		// items
		var eq = (c.Equipment || '').split(',');
		this.items.chars.push(eq);
		var dobp = this.opt('backpack') && +c.HasBackpack
		if (this.opt('equipment') || this.opt('inv') || dobp) {
			f = true;
			var itc = $('<div>').addClass('items');
			if (this.opt('equipment')) itc.append(item_listing(eq.slice(0, 4)).addClass('equipment'));
			if (this.opt('inv')) itc.append(item_listing(eq.slice(4, 12)).addClass('inv'));
			if (dobp) itc.append(item_listing(eq.slice(12,20)).addClass('backpack'));
			itc.appendTo($c);
		}
		if (this.opt('hpmp')) {
			var hp = $('<div class="hp">');
			var mp = $('<div class="mp">');
			hp.append(c.HealthStackCount);
			mp.append(c.MagicStackCount);
			$c.append(hp);
			$c.append(mp);
		}
		if (this.opt('pcstats') || this.opt('goals')) {
			f = true;
			$c.append(printstats(c, d, this.opt('goals'), this.opt('pcstats')));
		}
		arr.push($c);
	}
	if (f) {
		this.dom.append($('<hr class="chars">'));
		maketable('chars', arr).appendTo(this.dom);
	}
	arr = [];
	if (this.opt('vaults')) {
		this.dom.append($('<hr class="vaults">'));
		// gift chest
		var gifts = d.Account.Gifts;
		if(gifts){
			var items = gifts.split(',');
			var spots = (items.length % 4) ? items.length +  (4 - (items.length % 4)) : items.length;
			if (spots === 4) spots = 8;
			this.items.vaults.push(items);	//add before making empty slots
			if (items.length < spots) {
				for (var i = items.length; i < spots; i++) items[i] = -1;
			}
			var giftchest = $('<tr class="giftchest">');
			giftchest.append($('<td class="cont" colspan="7">').append($('<div class="items">').append(item_listing(items).addClass('vaults'))));
		} else {
			giftchest = false;
		}
		
		// vault
		var chests = d.Account.Vault ? d.Account.Vault.Chest || ['-1'] : ['-1'];
		if (typeof chests == 'string') chests = [chests];
		var w = arrangevaults(chests);
		chests = w[1];
		for (var i = 0; i < chests.length; i++) {
			if (chests[i] === 0) {
				arr.push(null);
				continue;
			}
			eq = (chests[i] || '-1').split(',');
			if (eq.length < 8) {
				for (var j = eq.length; j < 8; j++) eq[j] = -1;
			}
			this.items.vaults.push(eq);
			arr.push($('<div class="items">').append(item_listing(eq).addClass('vaults')));
		}
		var vaultstable = maketable('vaults', arr, w[0]);
		if (giftchest) {
			vaultstable.prepend(giftchest);
		}
		vaultstable.appendTo(this.dom);
	}
	this.loaded = true;
	this.dom.css('display', 'inline-block')
	relayout();
}

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
