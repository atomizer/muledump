(function($, window) {

var options = window.options
var accounts = window.accounts


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

Mule.prototype.cache_id = function() {
	return 'muledump:' + (!!window.testing ? 'testing:' : '') + this.guid
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

	var params = { guid: this.guid }
	var pass = accounts[this.guid] || ''
	params[this.guid.indexOf('kongregate:') == 0 ? 'secret' : 'password'] = pass;

	window.realmAPI('char/list', params, function(xhr) {
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
	})
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
			$c.append(printstats(c, d, this.opt('goals'), this.opt('pcstats')));
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
		for (var i = 0; i < chests.length; i++) {
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
	relayout();
}

})($, window)
