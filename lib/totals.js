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
		var itemname = items[id][0];
		if (itemname == 'Valentine Generator' || itemname == 'Beach Ball Generator' || itemname == 'Beer Slurp Generator') {
			// special generators (added to pets)
			items[id][1] = 26;
		} else if (items[id][1] == 10) {
			// set item tier for consumable sorting
			items[id][2] = consumable_tier(id, itemname);
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

function consumable_tier(id, itemname) {
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
	switch (itemname) {
		case 'Minor Health Potion':
		case 'Minor Magic Potion':
		case 'Greater Health Potion':
		case 'Greater Magic Potion':
		case 'Potion of Health1':
		case 'Potion of Health2':
		case 'Potion of Health3':
		case 'Potion of Health4':
		case 'Potion of Health5':
		case 'Potion of Health6':
			return 0;
		case 'Health Potion':
		case 'Magic Potion':
			return 1;
		case 'Potion of Attack':
		case 'Potion of Defense':
		case 'Potion of Speed':
		case 'Potion of Vitality':
		case 'Potion of Wisdom':
		case 'Potion of Dexterity':
		case 'Potion of Life':
		case 'Potion of Mana':
			return 2;
		case 'Fire Water':
		case 'Cream Spirit':
		case 'Chardonnay':
		case 'Melon Liquer':
		case 'Cabernet':
		case 'Vintage Port':
		case 'Sauvignon Blanc':
		case 'Muscat':
		case 'Rice Wine':
		case 'Shiraz':
			return 3;
		case 'Greater Potion of Attack':
		case 'Greater Potion of Defense':
		case 'Greater Potion of Speed':
		case 'Greater Potion of Vitality':
		case 'Greater Potion of Wisdom':
		case 'Greater Potion of Dexterity':
		case 'Greater Potion of Life':
		case 'Greater Potion of Mana':
			return 4;
		case 'Wine Cellar Incantation':
			return 5;
		case 'Snake Oil':
		case 'Healing Ichor':
		case 'Pirate Rum':
		case 'Magic Mushroom':
		case 'Coral Juice':
		case 'Pollen Powder':
		case 'Holy Water':
		case 'Ghost Pirate Rum':
		case 'Speed Sprout':
			return 6;
		case 'Tincture of Fear':
		case 'Tincture of Courage':
		case 'Tincture of Dexterity':
		case 'Tincture of Life':
		case 'Tincture of Mana':
		case 'Tincture of Defense':
		case 'Effusion of Dexterity':
		case 'Effusion of Life':
		case 'Effusion of Mana':
		case 'Effusion of Defense':
			return 8;
		case 'Bahama Sunrise':
		case 'Blue Paradise':
		case 'Pink Passion Breeze':
		case 'Lime Jungle Bay':
		case 'Mad God Ale':
		case 'Oryx Stout':
		case 'Realm-wheat Hefeweizen':
		case 'Rock Candy':
		case 'Red Gumball':
		case 'Purple Gumball':
		case 'Blue Gumball':
		case 'Green Gumball':
		case 'Yellow Gumball':
		case 'Candy Corn':
			return 9;
		case 'Elixir of Health 7':
		case 'Elixir of Health 6':
		case 'Elixir of Health 5':
		case 'Elixir of Health 4':
		case 'Elixir of Health 3':
		case 'Elixir of Health 2':
		case 'Elixir of Health 1':
		case 'Elixir of Magic 7':
		case 'Elixir of Magic 6':
		case 'Elixir of Magic 5':
		case 'Elixir of Magic 4':
		case 'Elixir of Magic 3':
		case 'Elixir of Magic 2':
		case 'Elixir of Magic 1':
			return 10;
		case 'Small Firecracker':
		case 'Large Firecracker':
		case 'Sand Pail 5':
		case 'Sand Pail 4':
		case 'Sand Pail 3':
		case 'Sand Pail 2':
		case 'Sand Pail 1':
		case 'Transformation Potion':
		case 'XP Booster':
		case 'XP Booster Test':
		case 'Loot Tier Potion':
		case 'Loot Drop Potion':
		case 'XP Booster 1 hr':
		case 'XP Booster 20 min':
		case 'Backpack':
		case 'Old Firecracker':
		case 'Draconis Potion':
		case 'Lucky Clover':
		case 'Saint Patty\'s Brew':
			return 11;
		case 'Soft Drink':
		case 'Fries':
		case 'Great Taco':
		case 'Power Pizza':
		case 'Chocolate Cream Sandwich Cookie':
		case 'Grapes of Wrath':
		case 'Superburger':
		case 'Double Cheeseburger Deluxe':
		case 'Ambrosia':
			return 12;
		case 'Treasure Map':
			return 13;
		case 'Golden Ankh':
		case 'Eye of Osiris':
		case 'Pharaoh\'s Mask':
		case 'Golden Cockle':
		case 'Golden Conch':
		case 'Golden Horn Conch':
		case 'Golden Nut':
		case 'Golden Bolt':
		case 'Golden Femur':
		case 'Golden Ribcage':
		case 'Golden Skull':
		case 'Golden Candelabra':
		case 'Holy Cross':
		case 'Pearl Necklace':
		case 'Golden Chalice':
		case 'Ruby Gemstone':
			return 14;
		default:
			var lastword = itemname.split(" ");
			var itemtype = lastword[lastword.length - 1];
			if (itemtype == "Egg") {
				return 7;
			} else if(itemtype == "Key") {
				return 13;
			} else if(itemtype == "Card") {
				return 15;
			} else if(itemtype == "Skin") {
				return 16;
			} else if(itemtype == "Dye") {
				return 17;
			} else if(itemtype == "Cloth") {
				return 18;
			} else { // unknown item, abandon ship! (leave its tier at -1)
				console.log("Unknown item: " + id + " " + items[id][0]);
				return -1;
			}
		// end switch
	}
}


window.init_totals = init_totals
window.update_totals = update_totals
window.update_filter = update_filter
window.toggle_filter = toggle_filter

})($, window)
