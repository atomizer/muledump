(function($, window) {

var options = window.options
var accounts = window.accounts
var items = window.items
var classes = window.classes

// max width of an account box in columns
var ROW = window.rowlength || 7

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
	if (id != -1 && it[1] === 0) {
		$r.append($('<span>').text(ids))
	}
	var title = it[0];
	if (~it[2] && it[1] != 10 && it[1] != 9) title += ' (T' + it[2] + ')';
	if (it[6]) title += '\nFeed Power: ' + it[6]
	return $r.attr('title', title)
		.css('background-position', '-' + it[3] + 'px -' + it[4] + 'px')
}
window.item = item


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
		if (i % row === 0) {
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

function addreloader(mule, target) {
	var rld = $('<div class="button">')
	rld.text('\u21bb')
	if (mule.data) {
		var updated = new Date(mule.data.query.created)
		rld.attr('title', 'last updated: ' + updated.toLocaleString())
	}
	rld.click(function(){ mule.reload() })
	rld.appendTo(target)
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
	var l = $('<a>').addClass('button');
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
	var r = [], i, j;
	for (i = 0; i < VAULTORDER.length; i++) {
		if (i % 7 === 0 && r.length) {
			for (j = 0; j < r.length; j++) if (r[j]) break;
			if (j >= r.length) r = [];
		}
		var c = v[VAULTORDER[i] - 1];
		if (typeof c != 'undefined') r.push(c); else r.push(0);
	}
	var w = 7;
	for (i = 6; i >= 0; i--) {
		for (j = i; j < r.length; j+=w) if (r[j]) break;
		if (j < r.length) continue;
		w--;
		for (j = i; j < r.length; j+=w) r.splice(j, 1);
	}
	if (ROW < w) return [0, v];
	return [w, r];
}


// Mule object

var Mule = function(guid) {
	if (!guid || !(guid in accounts)) return;
	this.guid = guid;
	this.fails = 0;
	this.dom = $('<div class="mule">');
	this.dom.appendTo($('#stage')).hide();
}

Mule.prototype.opt = function(name) {
	var o = options[this.guid];
	if (o && name in o) {
		return o[name];
	}
	return options[name];
}

Mule.prototype.cache_id = function() {
	return 'muledump:' + (!!window.testing ? 'testing:' : '') + this.guid
}

Mule.prototype.log = function(s, cl) {
	if (!this.overlay) {
		this.overlay = $('<div class="overlay">')
		var c = $('<div class="button">').text('X').appendTo(this.overlay)
		c.click(function() {
			$(this).parent().hide()
		})
		this.overlay.append($('<div class="log">'))
		this.overlay.appendTo(this.dom)
	}
	this.overlay.show()
	var log = this.overlay.find('.log')
	cl = cl || 'info'
	$('<div class="line">').text(s).addClass(cl).appendTo(log)
}

Mule.prototype.error = function(s) {
	this.log(s, 'error')
	var err = $('<div>')
	err.text(this.guid + ': ' + s)
	err.appendTo($('#errors'))
	addreloader(this, err)
	err.find('.button').click(function() { $(this).parent().remove() })
}

Mule.prototype.query = function(ignore_cache) {
	var self = this;
	if (this.busy) return; // somewhat protects against parallel reloads
	this.busy = true;
	this.loaded = false;
	$('#accopts').hide().data('guid', '');

	// read from cache if possible
	if (!ignore_cache) {
		var c = '';
		try {
			c = localStorage[this.cache_id()];
			c = JSON.parse(c);
		} catch(e) {}
		if (c) {
			this.parse(c);
			this.busy = false;
			return;
		}
	}

	var CR = { guid: this.guid }
	var pass = accounts[this.guid] || ''
	CR[this.guid.indexOf('kongregate:') === 0 ? 'secret' : 'password'] = pass;

	this.log('loading data')
	window.realmAPI('char/list', CR, function(xhr) {
		xhr.done(onResponse).fail(onFail)
	})

	function onFail() {
		self.log('failed')
		self.busy = false;
		self.fails++;
		if (self.fails < 5) {
			self.query(true);
		} else {
			self.error('failed too many times, giving up');
		}
	}

	function onResponse(data) {
		self.busy = false;
		if (!data.query || !data.query.results) {
			self.error(data.query ? 'server error' : 'YQL service denied');
			if (data.query) {
				self.log('full response:' + JSON.stringify(data.query))
			}
			return;
		}
		var res = data.query.results

		function watchProgress(percent) {
			if (typeof percent != 'string') {
				self.error('migration failed')
				return
			}
			if (percent == '100') {
				self.reload()
				return
			}
			self.log('migration: ' + percent + '%')
			window.realmAPI('migrate/progress', CR, function(xhr) {
				xhr.fail(onFail).done(function(data) {
					var res = data && data.query && data.query.results
					var per = res.Progress && res.Progress.Percent
					watchProgress(per)
				})
			})
		}

		if (res.Migrate) {
			self.log('attempting migration')

			window.realmAPI('migrate/doMigration', CR, { iframe: true }, function() {
				watchProgress('0')
			})
			return
		}

		if (!res.Chars) {
			self.error(res.Error || 'bad reply: ' + JSON.stringify(res))
			return;
		}

		res = res.Chars

		if ('TOSPopup' in res) {
			window.realmAPI('account/acceptTOS', CR, { iframe: true })
		}

		if (res.Account && res.Account.IsAgeVerified != 1) {
			CR.isAgeVerified = 1
			window.realmAPI('account/verifyage', CR, { iframe: true })
		}

		self.parse(data)
	}
}

Mule.prototype.reload = function() {
	this.fails = 0
	if (this.overlay) this.overlay.find('.log').empty()
	this.query(true)
}


var PROPTAGS = 'ObjectType Level Exp CurrentFame'.split(' ')
var STATTAGS = 'MaxHitPoints MaxMagicPoints Attack Defense Speed Dexterity HpRegen MpRegen'.split(' ')
var STATABBR = 'HP MP ATT DEF SPD DEX VIT WIS'.split(' ')
Mule.prototype.parse = function(data) {
	if (this.overlay) this.overlay.hide()

	var d = data.query.results.Chars
	d = {
		Char: d.Char,
		Account: d.Account || {}
	}
	data.query.results.Chars = d

	// check if data changed?
/*	if (this.data && compare(d, this.data.query.results.Chars)) {
		return
	}*/

	this.data = data
	this.dom.hide().empty()
	this.overlay = null

	// write cache
	try {
		localStorage[this.cache_id()] = JSON.stringify(data);
	} catch(e) {}


	if (this.opt('guid')) {
		$('<input type="text" readonly="readonly">')
		.addClass('guid').val(this.guid).appendTo(this.dom);
		$('<br>').appendTo(this.dom);
	}

	addreloader(this, this.dom)

	if (!('VerifiedEmail' in d.Account)) {
		var $warn = $('<span class="button warn">').text('!!')
		$warn.attr('title', 'email not verified').appendTo(this.dom)
	}

	if (window.mulelogin) this.dom.append(mulelink(this.guid, accounts[this.guid]));

	d.Account = d.Account || {}
	var $name = $('<div>').addClass('name').text(d.Account.Name || '(no name)');
	addstar(this.dom, d);
	var self = this;
	$name.click(function(e) {
		if (e.target != this) return;
		if (e.ctrlKey) {
			self.disabled = !self.disabled;
			self.dom.toggleClass('disabled', self.disabled);
			window.update_totals();
			return;
		}
		var $ao = $('#accopts');
		$ao.css({
			left: e.pageX - 5 + 'px',
			top: e.pageY - 5 + 'px'
		});
		window.updaccopts(self.guid);
		$ao.css('display', 'block');
	});
	$name.appendTo(this.dom);

	this.items = { chars: [], vaults: [] };

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
			window.portrait(portimg, c.ObjectType, c.Tex1, c.Tex2);
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
				var $row
				if (t % 2 === 0) $row = $('<tr>');
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
			if (this.opt('equipment')) itc.append(item_listing(eq.slice(0, 4), 'equipment'));
			if (this.opt('inv')) itc.append(item_listing(eq.slice(4, 12), 'inv'));
			if (dobp) itc.append(item_listing(eq.slice(12,20), 'backpack'));
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
			$c.append(window.printstats(c, d, this.opt('goals'), this.opt('pcstats')));
		}
		arr.push($c);
	}
	if (f) {
		this.dom.append($('<hr class="chars">'));
		maketable('chars', arr).appendTo(this.dom);
	}
	arr = [];

	function makechest(items, classname) {
		var il = item_listing(items.slice(0, 8), classname)
		return $('<div class="items">').append(il)
	}

	if (this.opt('vaults')) {
		this.dom.append($('<hr class="vaults">'));
		// gift chest
		var gifts = d.Account.Gifts;
		if(gifts && this.opt('gifts')) {
			var items = gifts.split(',').reverse();
			this.items.vaults.push(items);  // for totals
			var garr = []
			while (items.length) {
				while (items.length < 8) items.push(-1)
				garr.push(makechest(items, 'gifts'))
				items = items.slice(8);
			}
			maketable('giftchest', garr).appendTo(this.dom)
		}

		// vault
		var chests = d.Account.Vault ? d.Account.Vault.Chest || ['-1'] : ['-1'];
		if (typeof chests == 'string') chests = [chests];
		var w = arrangevaults(chests);
		chests = w[1];
		for (i = 0; i < chests.length; i++) {
			if (chests[i] === 0) {
				arr.push(null);
				continue;
			}
			var chest = (chests[i] || '-1').split(',');
			while (chest.length < 8) chest.push(-1);
			this.items.vaults.push(chest);
			arr.push(makechest(chest, 'vaults'));
		}
		maketable('vaults', arr, w[0]).appendTo(this.dom);
	}
	this.loaded = true;
	this.dom.css('display', 'inline-block')
	window.relayout();
}

window.Mule = Mule


})($, window)
