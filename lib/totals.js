(function($, window) {

// weapons, armor, specials, rings, potions, unknown
var SLOT_ORDER = [1,2,3,17,8,24, 14,6,7, 4,5,11,12,13,15,16,18,19,20,21,22,23,25, 9, 10, 26, 0];

var totals = {}, counters = {}, ids = [];

window.ids = ids

var options = window.options
var option_updated = window.option_updated
var items = window.items


function init_totals() {
	for (var id in items) {
		if (id == 0x151f || id == 0x153f || id == 0x1547) {
			// Valentine, Beach Ball, and Beer Slurp Generators
			// special generators (added to pets)
			items[id][1] = 26;
		} else if (items[id][1] == 10) {
			// set item tier for consumable sorting
			items[id][2] = consumable_tier(id);
		}
		ids.push(id);
	}
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

function consumable_tier (id) {
	/*
	0: Vanity HP/MP
	1: HP/MP
	2: Stat Pots
	3: Wines
	4: Greater Stat Pots
	5: Incantation
	6: Dungeon Consumables
	7: Drake Eggs
	8: Tinctures and Effusions
	9: Holiday Candy and Alcohol
	10: Elixirs
	11: Shop Stuff
	12: Pet Food
	13: Keys
	14: Treasures
	15: Cards
	16: Skins
	17: Dyes
	18: Cloths
	*/
	intid = parseInt(id);
	switch (intid) {
		case 0xab0: // Minor Health Potion
		case 0xadd: // Minor Magic Potion
		case 0xaeb: // Greater Health Potion
		case 0xaec: // Greater Magic Potion
		case 0x224b:  // Potion of Health1
		case 0x225e:  // Potion of Health2
		case 0x225b:  // Potion of Health3
		case 0x224c:  // Potion of Health4
		case 0x223c:  // Potion of Health5
		case 0x223d:  // Potion of Health6
			items[id][2] = 0;
			break;
		case 0xa22: // Health Potion
		case 0xa23: // Magic Potion
			items[id][2] = 1;
			break;
		case 0xa1f: // Potion of Attack
		case 0xa20: // Potion of Defense
		case 0xa21: // Potion of Speed
		case 0xa34: // Potion of Vitality
		case 0xa35: // Potion of Wisdom
		case 0xa4c: // Potion of Dexterity
		case 0xae9: // Potion of Life
		case 0xaea: // Potion of Mana
			items[id][2] = 2;
			break;
		case 0xb34: // Fire Water
		case 0xb35: // Cream Spirit
		case 0xb36: // Chardonnay
		case 0xb37: // Melon Liquer
		case 0xb38: // Cabernet
		case 0xb39: // Vintage Port
		case 0xb3a: // Sauvignon Blanc
		case 0xb3b: // Muscat
		case 0xb3c: // Rice Wine
		case 0xb3d: // Shiraz
			items[id][2] = 3;
			break;
		case 0x2368: // Greater Potion of Attack
		case 0x2369: // Greater Potion of Defense
		case 0x236a: // Greater Potion of Speed
		case 0x236b: // Greater Potion of Vitality
		case 0x236c: // Greater Potion of Wisdom
		case 0x236d: // Greater Potion of Dexterity
		case 0x236e: // Greater Potion of Life
		case 0x236f: // Greater Potion of Mana
			items[id][2] = 4;
			break;
		case 0x722: // Wine Cellar Incantation
			items[id][2] = 5;
			break;
		case 0xa3f: // Snake Oil
		case 0x707: // Healing Ichor
		case 0xa50: // Pirate Rum
		case 0xa51: // Magic Mushroom
		case 0xc12: // Coral Juice
		case 0xc1a: // Pollen Powder
		case 0xc21: // Holy Water
		case 0xc25: // Ghost Pirate Rum
		case 0xc80: // Speed Sprout
			items[id][2] = 6;
			break;
		case 0x77b: // Tincture of Fear
		case 0x77c: // Tincture of Courage
		case 0xb0c: // Tincture of Dexterity
		case 0xb0d: // Tincture of Life
		case 0xb0e: // Tincture of Mana
		case 0xb0f: // Tincture of Defense
		case 0xb10: // Effusion of Dexterity
		case 0xb11: // Effusion of Life
		case 0xb12: // Effusion of Mana
		case 0xb13: // Effusion of Defense
			items[id][2] = 8;
			break;
		case 0xc39: // Bahama Sunrise
		case 0xc3a: // Blue Paradise
		case 0xc3b: // Pink Passion Breeze
		case 0xc3c: // Lime Jungle Bay
		case 0xc5b:9; // Mad God Ale
		case 0xc5c:9; // Oryx Stout
		case 0xc5d:9; // Realm-wheat Hefeweizen
		case 0xc60: // Rock Candy
		case 0xc63: // Red Gumball
		case 0xc64: // Purple Gumball
		case 0xc65: // Blue Gumball
		case 0xc66: // Green Gumball
		case 0xc67: // Yellow Gumball
		case 0x2375: // Candy Corn
			items[id][2] = 9;
			break;
		case 0xb14: // Elixir of Health 7
		case 0xb15: // Elixir of Health 6
		case 0xb16: // Elixir of Health 5
		case 0xb17: // Elixir of Health 4
		case 0xa81: // Elixir of Health 3
		case 0xa48: // Elixir of Health 2
		case 0xa49: // Elixir of Health 1
		case 0xb18: // Elixir of Magic 7
		case 0xb19: // Elixir of Magic 6
		case 0xb1a: // Elixir of Magic 5
		case 0xb1b: // Elixir of Magic 4
		case 0xa4a: // Elixir of Magic 3
		case 0xaed: // Elixir of Magic 2
		case 0xaee: // Elixir of Magic 1
			items[id][2] = 10;
			break;
		case 0xc2b: // Small Firecracker
		case 0xc2c: // Large Firecracker
		case 0xc34: // Sand Pail 5
		case 0xc35: // Sand Pail 4
		case 0xc36: // Sand Pail 3
		case 0xc37: // Sand Pail 2
		case 0xc38: // Sand Pail 1
		case 0xc41: // Transformation Potion
		case 0xc42: // XP Booster
		case 0xc43: // XP Booster Test
		case 0xc68: // Loot Tier Potion
		case 0xc69: // Loot Drop Potion
		case 0xc6a: // XP Booster 1 hr
		case 0xc6b: // XP Booster 20 min
		case 0xc6c: // Backpack
		case 0xc81: // Old Firecracker
		case 0xcc1: // Draconis Potion
		case 0xcc2: // Lucky Clover
		case 0xcc3: // Saint Patty's Brew
			items[id][2] = 11;
			break;
		case 0xcc9: // Soft Drink
		case 0xccb: // Fries
		case 0xcc6: // Great Taco
		case 0xcc5: // Power Pizza
		case 0xcc4: // Chocolate Cream Sandwich Cookie
		case 0xcca: // Grapes of Wrath
		case 0xcc8: // Superburger
		case 0xcc7: // Double Cheeseburger Deluxe
		case 0xccc: // Ambrosia
			items[id][2] = 12;
			break;
		case 0x5e2d: // Treasure Map
			items[id][2] = 13;
			break;
		case 0xc70: // Golden Ankh
		case 0xc71: // Eye of Osiris
		case 0xc72: // Pharaoh's Mask
		case 0xc73: // Golden Cockle
		case 0xc74: // Golden Conch
		case 0xc75: // Golden Horn Conch
		case 0xc76: // Golden Nut
		case 0xc77: // Golden Bolt
		case 0xc78: // Golden Femur
		case 0xc79: // Golden Ribcage
		case 0xc7a: // Golden Skull
		case 0xc7b: // Golden Candelabra
		case 0xc7c: // Holy Cross
		case 0xc7d: // Pearl Necklace
		case 0xc7e: // Golden Chalice
		case 0xc7f: // Ruby Gemstone
			items[id][2] = 14;
			break;
		default:
			var itemname = items[id][0];
			var lastword = itemname.split(" ");
			var itemtype = lastword[lastword.length - 1];
			if (itemtype == "Egg") {
				items[id][2] = 7;
			} else if(itemtype == "Key") {
				items[id][2] = 13;
			} else if(itemtype == "Card") {
				items[id][2] = 15;
			} else if(itemtype == "Skin") {
				items[id][2] = 16;
			} else if(itemtype == "Dye") {
				items[id][2] = 17;
			} else if(itemtype == "Cloth") {
				items[id][2] = 18;
			} else { // unknown item, abandon ship! (leave its tier at -1)
				console.log("Unknown item: " + id + " " + items[id][0]);
			}
		// end switch
	}
}


window.init_totals = init_totals
window.update_totals = update_totals
window.update_filter = update_filter
window.toggle_filter = toggle_filter

})($, window)
