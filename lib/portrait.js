(function() {

var ready = false

var sprites = {}

var sprc
function extract_sprites(img, sx, sy) {
	sx = sx || 8
	sy = sy || sx
	sprc = sprc || document.createElement('canvas')
	var c = sprc
	c.width = img.width
	c.height = img.height
	var ctx = c.getContext('2d')
	ctx.drawImage(img, 0, 0)
	var i = 0, r = []
	for (var y = 0; y < c.height; y += sy) {
		for (var x = 0; x < c.width; x += sx, i++) {
			r[i] = ctx.getImageData(x, y, sx, sy)
		}
	}
	return r
}

function load_img(src, t, s) {
	var i = new Image()
	var d = new $.Deferred()
	i.onload = function() { d.resolve(this, t, s) }
	i.onerror = function() { 
		console.log(src, 'failed to load')
		d.reject(src)
	}
	i.src = src
	return d.promise()
}

function load_sheets() {
	var d = new $.Deferred(), wait = 6
	for (var i in sheetsrc) {
		var src = sheetsrc[i]
		load_img(src, i, +i).done(function(img, t, s) {
			sprites[t] = extract_sprites(img, s)
			if (!--wait) d.resolve()
		})
		.fail(function(){ d.reject() })
	}
	return d.promise()
}

// helpers for working with imagedata pixel values

// single component
function p_comp(s, x, y, i) {
	return s.data[((s.width * y + x) << 2) + i]
}

// single pixel
function p_dict(s, x, y) {
	var offset = (s.width * y + x) << 2
	for (var i = 0, d = []; i < 4; i++) d[i] = s.data[offset + i]
	return d
}

// css-compatible
function p_css(s, x, y) {
	var d = p_dict(s, x, y)
	d[3] /= 255
	return 'rgba(' + d.join(',') + ')'
}

var fs = {}
var fsc
function textofs(tex) {
	tex = +tex || 0
	if (fs[tex]) return fs[tex]
	var i = (tex & 0xff000000) >> 24
	var c = tex & 0xffffff
	if (i == 0) return 'transparent'
	if (i == 1) {
		c = c.toString(16)
		while (c.length < 6) c = '0' + c
		fs[tex] = '#' + c
		return fs[tex]
	}
	if (!sprites[i]) return 'transparent'
	var spr = sprites[i][c]
	fsc = fsc || document.createElement('canvas')
	var ca = fsc
	ca.width = spr.width
	ca.height = spr.height
	var cact = ca.getContext('2d')
	cact.mozImageSmoothingEnabled = false
	cact.putImageData(spr, 0, 0)
	var p = cact.createPattern(ca, 'repeat')
	cact.scale(0.5, 0.5)
	cact.translate(-1, -1)
	cact.fillStyle = p
	cact.fillRect(0, 0, ca.width * 3, ca.height * 3)
	fs[tex] = cact.createPattern(ca, 'repeat')
	return fs[tex]
}

var pcache = {}
function pcacheid(c, t0, t1) {
	return [c, (+t0 || 0), (+t1 || 0)].join(':')
}

var queue = []

var st
window.portrait = function(img, objid, tex1, tex2) {
	if (!ready) return queue.push(Array.prototype.slice.apply(arguments))
	var clid = 0
	for (var i in window.classes) {
		if (i == objid) break
		clid++
	}
	var c = pcache[pcacheid(clid, tex1, tex2)]
	if (c) return img.attr('src', c)
	var fs1 = textofs(tex1)
	var fs2 = textofs(tex2)
	var oddity = +!(tex1 || tex2)
	var rnd = oddity ? Math.ceil : Math.floor
	st = st || document.createElement('canvas')
	st.width = st.height = 22
	var c = st.getContext('2d')
	c.save()
	c.clearRect(0, 0, st.width, st.height)
	c.translate(1, 1)
	
	var i = clid * 21
	var spr = sprites['players'][i]
	var mask = sprites['players_mask'][i]
	for (var xi = 0; xi < 8; xi++) {
		var x = rnd(xi * 2.5)
		var w = 2 + (xi + oddity) % 2
		for (var yi = 0; yi < 8; yi++) {
			if (!p_comp(spr, xi, yi, 3)) continue // transparent
			var y = rnd(yi * 2.5)
			var h = 2 + (yi + oddity) % 2
			// standart
			c.fillStyle = p_css(spr, xi, yi)
			c.fillRect(x, y, w, h)
			// if there is something on mask, paint over
			var vol = 0
			function dotex(tex) {
				c.fillStyle = tex
				c.fillRect(x, y, w, h)
				c.fillStyle = 'rgba(0,0,0,' + ((255 - vol) / 255) + ')'
				c.fillRect(x, y, w, h)
			}
			if (tex1 && (vol = p_comp(mask, xi, yi, 0))) dotex(fs1)
			if (tex2 && (vol = p_comp(mask, xi, yi, 1))) dotex(fs2)
			// outline
			c.save()
			c.globalCompositeOperation = 'destination-over'
			c.strokeRect(x-0.5, y-0.5, w+1, h+1)
			c.restore()
		}
	}
	c.restore()
	var r = st.toDataURL()
	pcache[pcacheid(clid, tex1, tex2)] = r
	img.attr('src', r)
}


var preload = load_sheets()

$(function() {
	preload.done(function() {
		ready = true
		for (var i = 0; i < queue.length; i++) {
			portrait.apply(null, queue[i])
		}
	})
})

})()

