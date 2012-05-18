var pcstatnames = {
	0: 'Shots',
	1: 'ShotsThatDamage',
	2: 'SpecialAbilityUses',
	3: 'TilesUncovered',
	4: 'Teleports',
	5: 'PotionsDrunk',
	6: 'MonsterKills',
	7: 'MonsterAssists',
	8: 'GodKills',
	9: 'GodAssists',
	10: 'CubeKills',
	11: 'OryxKills',
	12: 'QuestsCompleted',
	13: 'PirateCavesCompleted',
	14: 'UndeadLairsCompleted',
	15: 'AbyssOfDemonsCompleted',
	16: 'SnakePitsCompleted',
	17: 'SpiderDensCompleted',
	18: 'SpriteWorldsCompleted',
	19: 'LevelUpAssists',
	20: 'MinutesActive',
	21: 'TombsCompleted',
	22: 'TrenchesCompleted',
	23: 'JunglesCompleted',
	24: 'ManorsCompleted',
}

var bonuses = {
	'Ancestor': function(s, c) {
		return (c.id < 2) ? {mul: 0.1, add: 20} : 0;
	},
	'Legacy Builder': function(s, c, d) {
		// 0.1
	},
	'Pacifist': function(s) {
		return s[1] ? 0 : 0.25;
	},
	'Thirsty': function(s) {
		return s[5] ? 0 : 0.25;
	},
	'Mundane': function(s) {
		return s[2] ? 0 : 0.25;
	},
	'Boots on the Ground': function(s) {
		return s[4] ? 0 : 0.25;
	},
	'Tunnel Rat': function(s) {
		var dungs = [13, 14, 15, 16, 17, 18, 21, 22, 23, 24];
		for (var i = 0; i < dungs.length; i++) if (!s[dungs[i]]) return 0;
		return 0.1;
	},
	'Enemy of the Gods': function(s) {
		return (s[8] / (s[6] + s[8]) > 0.1) ? 0.1 : 0;
	},
	'Slayer of the Gods': function(s) {
		return (s[8] / (s[6] + s[8]) > 0.5) ? 0.1 : 0;
	},
	'Oryx Slayer': function(s) {
		return s[11] ? 0.1 : 0;
	},
	'Accurate': function(s) {
		return (s[1] / s[0] > 0.25) ? 0.1 : 0;
	},
	'Sharpshooter': function(s) {
		return (s[1] / s[0] > 0.5) ? 0.1 : 0;
	},
	'Sniper': function(s) {
		return (s[1] / s[0] > 0.75) ? 0.1 : 0;
	},
	'Explorer': function(s) {
		return (s[3] > 1e6) ? 0.05 : 0;
	},
	'Cartographer': function(s) {
		return (s[3] > 4e6) ? 0.05 : 0;
	},
	'Team Player': function(s) {
		return (s[19] > 100) ? 0.1 : 0;
	},
	'Leader of Men': function(s) {
		return (s[19] > 1000) ? 0.1 : 0;
	},
	'Doer of Deeds': function(s) {
		return (s[12] > 1000) ? 0.1 : 0;
	},
	'Friend of the Cubes': function(s) {
		return s[10] ? 0 : 0.1;
	},
	'Well Equipped': function(s, c) {
		var eq = c.Equipment.split(',');
		var b = 0;
		for (var i = 0; i < 4; i++) {
			var it = items[+eq[i]] || items[-1];
			b += it[5];
		}
		return b * 0.01;
	},
	'First Born': function(s, c, d, f) {
		return (d.Account.Stats.BestCharFame < f) ? 0.1: 0;
	},
}


function readstats(pcstats) {
	function readInt32BE(str, idx) {
		var r = 0;
		for (var i = 0; i < 4; i++) {
			var t = str.charCodeAt(idx + 3 - i);
			r += t << (8 * i);
		}
		return r;
	}
	
	var b = atob(pcstats.replace(/-/g, '+').replace(/_/g, '/'));
	var r = [];
	for (var i = 0; i < b.length; i += 5) {
		var f = b.charCodeAt(i);
		var val = readInt32BE(b, i + 1);
		r[f] = val;
	}
	for (var i in pcstatnames) if (!r[i]) r[i] = 0;
	return r;
}

function printstats(c, d) {
	
	var st = readstats(c.PCStats);
	var $c = $('<table class="pcstats" />');
	
	for (var i in st) {
		if (!st[i]) continue;
		var sname = pcstatnames[i] || '#' + i;
		$('<tr>')
			.append($('<td>').text(sname))
			.append($('<td class="pcstat">').text(st[i]))
			.appendTo($c);
	}
	
	var fame = +c.CurrentFame;
	if (!fame) return $c;
	for (var k in bonuses) {
		var b = bonuses[k](st, c, d, fame);
		if (!b) continue;
		var incr = 0;
		if (typeof b == 'object') {
			incr += b.add;
			b = b.mul;
		}
		incr += Math.floor(fame * b);
		fame += incr;
		$('<tr>')
			.append($('<td>').text(k))
			.append($('<td class="bonus">').text('+' + incr))
			.appendTo($c);
	}
	$('<tr>').append($('<td>').text('Total Fame'))
		.append($('<td class="bonus">').text(fame)).appendTo($c);
	
	return $c;
}

