/* Singleton price table object */
var priceTable = {
  /* ID:Lookup Table */
  lookup_table: {
    'Potion of Attack': 'Attack',
    'Potion of Speed': 'Speed',
    'Potion of Vitality': 'Vitality',
    'Potion of Wisdom': 'Wisdom',
    'Potion of Dexterity': 'Dexterity',
    'Potion of Life': 'Life',
    'Potion of Mana': 'Mana',
    'Potion of Attack': 'Attack',
    'Staff of Diabolic Secrets': 'Staff of Diabolical Secrets',
  },
  price_table: null,
  timestamp: 0,
  fetch_url: 'https://forums.wildshadow.com/node/206558',
  max_age: 3.6e6, // 1 hour
  warning_age: 24 * 3.6e6, // 1 day

  fetch: function(ignore_cache) {
    try {
      this.timestamp = +localStorage['prices_timestamp'];
    } catch (e) {
      ignore_cache = true;
    }
    if (new Date - this.timestamp > this.max_age) ignore_cache = true;

    var c = '';
    try {
      c = localStorage['price_table'];
      c = JSON.parse(c);
    } catch(e) { }
    if(c) {
      this.price_table = c;
      if (!ignore_cache) return;
    }

    /* Not in cache, or cache being ignored */
    var self = this;
    return $.ajax({
      dataType: 'jsonp',
      url: 'http://query.yahooapis.com/v1/public/yql',
      data: {
        q: "SELECT * FROM html WHERE url='" + this.fetch_url + "' AND xpath='//div[@class=\"content clearfix\"]/table/tbody/tr'",
        format: 'json'
      },
      complete: function(xhr) {
        xhr.done(function(data) { self.parse(data); });
      }
    });
  },

  getInnerText: function(obj) {
    if(obj == null) {
      return '';
    }

    var txt = '';
    var keys = Object.keys(obj);

    for(var i in keys) {
      if(['em', 'strong', 'p'].indexOf(keys[i]) != -1) {
        txt += obj[keys[i]] + ' ';
      } else if(typeof(obj[keys[i]]) == 'object') {
        txt += this.getInnerText(obj[keys[i]]);
      }
    }

    return txt.trim();
  },

  parse: function(data) {
    if (!data.query || !data.query.results) {
      if (new Date - this.timestamp > this.warning_age) {
        $('<div>').text('warning: price information is outdated').appendTo($errors);
      }
      return;
    }

    var rows = data.query.results.tr;
    var map = {};
    for(var i in rows) {
      try {
        var offset = (rows[i].td.length == 7 ? 1 : 0);
        var name = this.getInnerText(rows[i].td[0+offset]);
        var price = this.getInnerText(rows[i].td[3+offset]);
        map[name] = price;
      } catch (e) {}
    }

    try {
      localStorage['price_table'] = JSON.stringify(map);
      localStorage['prices_timestamp'] = +(new Date);
    } catch (e) {}

    var old = this.price_table || {};
    this.price_table = map;
    var diff = (function(a, b) {
      for (var i in a) if (a[i] != b[i]) return true;
      for (var i in b) if (a[i] != b[i]) return true;
      return false;
    })(old, map);
    if (!diff) return;
    $totals.empty(); counters = {}; totals = {};
    for (var i in mules) mules[i].query();
  },

  lookup: function(id) {
    if (!this.price_table) return;
    if (!(id in this.price_table)) id = this.lookup_table[id];
    return this.price_table[id];
  }
}

if (false && window.prices) priceTable.fetch();
