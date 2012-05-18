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
  fetch_url: 'http://forums.wildshadow.com/node/36820',

  fetch: function(ignore_cache) {
    if(!ignore_cache) {
      var c = '';
      try {
	c = localStorage['price_table'];
	c = JSON.parse(c);
      } catch(e) { }

      if(c) {
	this.price_table = c;
	return;
      }
    }

    /* Not in cache, or cache being ignored */
    var self = this;
    return $.ajax({
      dataType: 'jsonp',
      url: 'http://query.yahooapis.com/v1/public/yql',
      data: {
	q: "SELECT * FROM html WHERE url='" + this.fetch_url + "' AND xpath='//tbody/tr'",
	format: 'json'
      },
      complete: function(xhr) {
	xhr
	  .done(function(data) {
	    self.parse(data);
	  })
	  .fail(function() {
	    self.error('Price fetch failed');
	  });
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
    if(!data.query) {
      this.error('YQL service error');
      return;
    } else if(!data.query.results) {
      this.error('WildShadow server error');
      return;
    }

    var rows = data.query.results.tr;
    var map = {};
    for(var i in rows) {
      var name = this.getInnerText(rows[i].td[0]);
      var price = this.getInnerText(rows[i].td[3]);
      map[name] = price;
    }

    this.price_table = map;
    localStorage['price_table'] = JSON.stringify(map);
  },

  lookup: function(id) {
    if(id in this.lookup_table) {
      id = this.lookup_table[id];
    }

    if(id in this.price_table) {
      return { found: true, result: this.price_table[id] };
    } else {
      return { found: false, result: 'N/D' };
    }
  },

  error: function(s) {
    var self = this;
    var $e = $('<div>').text('Price Fetch Error: ' + s || 'unknown error');
    var $r = $('<span>').text('↑↓');
    $r.click(function() {
      self.fetch(true);
      $(this).parent().remove();
    });
    $e.addClass('error').append($r).appendTo($errors);
  }
}

priceTable.fetch();
