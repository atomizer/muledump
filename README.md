## Synopsis

This tool allows you to list contents of all your accounts in a single page (characters, their stats and items, items in vaults). Also it generates a summary of all the items - you probably saw screenshots of these in trading forum ([example](http://i755.photobucket.com/albums/xx195/Ind3sisiv3/Ilovemuledump.png)).

The point of playing the game is to have fun. Muling is not fun. I am trying to increase overall fun ratio by decreasing amount of time spent fussing with mules and storagekeeping.

## Download

All released versions are [here](https://github.com/atomizer/muledump/tags).

## Howto

- unpack
- edit **`accounts_sample.js`**
- rename it to **`accounts.js`**
- open **`muledump.html`**

## Not so obvious features

- click on item to filter accounts that hold it
- click on account name for individual options menu
- ctrl-click account name to temporarily hide it from totals
- read the `accounts.js` file, it has some variables to play with

## Troubleshooting & Frequently Asked Questions

### It redirected me to [this video](http://www.youtube.com/watch?v=KJ-wO7SMtOg)! What did I do wrong?

There are four common pitfalls:
- you didnt edit your `accounts.js` file. I mean, come on.
- you didnt delete/replace both example accounts from said file.
- you broke syntax when you were editing your `accounts.js`. Use an editor with syntax hilighting and common sense.
- you failed to rename it properly because of your file manager. In Windows, try to [enable file name extensions](http://windows.microsoft.com/en-US/windows7/Show-or-hide-file-name-extensions).

### It doesnt work in my Internet Explorer!

A modern browser is required for muledump to work. Use latest [Firefox](http://getfirefox.com), [Chrome](https://www.google.com/chrome) or [Opera](http://www.opera.com/).

### Q: How do I use it with a Kongregate account?

- open console while on the game's page on Kongregate (Chrome: F12, Firefox: Ctrl+Shift+K)
- paste the following snippet there and hit Enter: **document.location.href = 'http://' + 'realmofthemadgod.appspot.com/kongregate/getcredentials?' + jQuery.param({ userId: active_user.id(), gameAuthToken: active_user.gameAuthToken()})**
- a page will open with the credentials; put them in your `accounts.js`, using `GUID` as email and `Secret` as password

### Q: How do I use it with a Steam account?
[Make a web account](http://i.imgur.com/kKUAo.png).

### I want to contribute!

Great! Fork the repo, make your changes, send pull request. Alternatively, you can just send me a diff or something.

## Optional feature: one click login

**Windows only!** Apparently doesnt work on Chrome at the moment!

FizzeBu wrote a great AutoIt script, which allows this magic to be real.

**How to enable:**

* install [AutoIt](http://www.autoitscript.com/site/autoit/downloads/)
* change `mulelogin` in `accounts.js` to `1`
* run `lib/mulelogin.au3` once
* refresh, click arrows next to reload buttons
* never share your `muledump:` links!

**How to remove:**

If you are too sceptical/afraid to even try, just remove `mulelogin.au3`. No harm done.

If already installed:

* change `mulelogin` to `0`
* run `lib/mulelogin.au3`, select "uninstall".

## License

Copyright (c) 2013 [atomizer](https://github.com/atomizer)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
