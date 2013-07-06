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

- follow [this](http://forums.wildshadow.com/node/27826) to **step 8**
- from step 8, take **`user_id`** and **`game_auth_token`** values
- go [here](http://realmofthemadgod.appspot.com/kongregate/getcredentials?userId=YOUR_USER_ID&gameAuthToken=YOUR_GAT)
- in address bar, replace fields written in CAPS with your user id and auth token
- take `GUID` and `Secret` from result - use them as email and password

### Q: How do I use it with a Steam account?
[Make a web account](http://i.imgur.com/kKUAo.png).

### I want to say something! And there is no thread! Wat do?

Feel free to send me a [private message](https://forums.wildshadow.com/messages/new/4041) on the forums. Maybe later there will be more options.

### I want to contribute!

Great! Fork the repo, make your changes, send pull request. Alternatively, you can just send me a diff or something.

## Skins

There are BMJ's [skins](http://realmtools.com/forums/?topic=muledump-skins) for those who dont like the default look.

## Optional feature: one click login

**Windows only!** Apparently doesnt work on Chrome at the moment!

[FizzeBu](http://forums.wildshadow.com/user/24488) wrote a great AutoIt script, which allows this magic to be real.

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

## Optional feature: display prices from a price guide

[aiedail92](https://github.com/aiedail92) implemented scraping of price guide threads. Currently using [MustafaD](https://forums.wildshadow.com/node/139685).

**How to enable:** change `prices` in `accounts.js` to `1`

## History

**11/1/2011**

- added ability to hide equipped items
- extended stats with roll checks and distances from max
- added options on the right since there are too many of them now
- added tiers in tooltips
- fixed spell vertical position (same as rings, in-game they're shifted 1/2 "pixel" from the "grid"; tell me if you catch more inconsistences in rendering)
- added comments in the sample file since some people had trouble editing it
- switched to local copy of jquery for true offline to be possible

**11/12/2011**

Added options to toggle totals, names/emails, only first char.
Also, in Firefox 8 localStorage bug is fixed, so cache will work there too.

**11/15/2011**

- colored distances from average
- option to hide all items (gorzerk-mode)
- names/emails --> emails
- "left to max" now shows amount of potions (thanks zxcv)

**11/22/2011**

A bunch of bug fixes, thanks joshd19 and Mcbeth for calling my attention to them!

- hopefully fixed errors on unexpected input
- fixed empty vault being empty
- fixed "only first char" regression
- fixed roll calculations for non-lvl20
- added min-width to prevent the boxes from collapsing

**11/28/2011**

Updated with the 4 new items (tomb rings and key).

**01/10/2012**

- added new items from build 121
- now you can switch to testing by adding line "`testing = 1`" at the begginning or end of your `accounts.js` file

**02/14/2012**

- items as of build 122.0.1
- "left to max" shows both points and potions for HP/MP

**03/20/2012**

- items preemptively updated for build 122.2 (123?)
- new feature - extended character stats and death screen emulation
- rough control to hide "bad" items (currently everything 1% fame or less, controlled by var FAMETHRESHOLD in the main script)
- made stats copypaste-friendlyish by using `<table>`

**04/01/2012**

- build 122.3.2
- fixed incorrect "Well Equipped" calculation with amulet on

**04/29/2012**

version 0.2

- using JQuery Masonry plugin to lay out the accounts
- multi-column layout for accounts with several characters / vault chests
- options are now in a hover-menu
- mules are always in the same order
- faster loading
- corrected some problems with totals
- toggle a mule in totals by clicking on account name
- filter by any amount of fame bonus
- fixed bugs with item search, tweaked selected item style
- favicon by BMJ

**05/02/2012**

version 0.2.1

- fixed some visual bugs and edge cases introduced in previous update
- back to old method of issuing requests (slow but more stable)
- you can make options to stay open by clicking
- moved additional stats to the bottom
- updated JQuery

**05/06/2012**

version 0.2.2

- stars
- automatic update checker

**05/08/2012**

version 0.2.3

- fixed star counter
- better Opera compatibility
- various performance optimizations
- update checking is now on-demand

**06/13/2012**

version 0.3: collaboration edition

- 123.3 stats
- export to TXT, CSV, JSON, PNG
- accuracy and god kill ratio
- fixed "sticky" options bug
- new reload symbol
- optional: one-click login -- by [FizzeBu](http://forums.wildshadow.com/user/24488); more info above
- optional: display prices from Kazansky -- by [aiedail92](https://github.com/aiedail92); more info above

**07/04/2012**

0.3.1

- 123.3.2 items
- fixed price guide url
- fixed some visual glitches

**08/05/2012**

0.3.2

- 123.4.1 items
- reduced probability of duplicate error messages

**08/25/2012**

0.4

- 123.4.4 items
- ability to set options for each account individually - click account name for menu (intended use: keep global options to items only and expand the good accounts as needed)
- added achievement progress calculation (thanks to Pfiffel, even though I didnt use your code)
- vault chests are now in their in-game order (thanks to Hals for assistance)
- improved page load time
- added redirect to Kable's video

**09/04/2012**

0.4.1

- 123.5.0 items

**09/16/2012**

0.4.3

- authentic character portraits
- fixed long names breaking the box

**09/25/2012**

0.4.4

- new accounts.js option: "nomasonry" - set to 1 to turn off smart layout
- fixed some problems with per-account menus
- ctrl-click on name toggles the account in the totals

**10/05/2012**

0.4.5

- ninja, 124.0 items

**10/11/2012**

0.4.6

- ninja equipment fame bonuses
- fixed star color calculation

**10/25/2012**

0.4.7

- 3.1 items
- made achievement progress and additional stats options independent of each other

**11/2/2012**

0.4.8

- 4.0 items
- item names and tiers now match the in-game tooltips (except dosed items like elixirs)
- fixed char description sometimes spanning more lines than it should

**11/16/2012**

0.4.9

- 5.0 items
- added backpacks
- fixed ninja equips position in totals

**12/12/2012**

0.4.10

- 7.0 items
- changed price guide to MustafaD (pull request by [avoxgames](https://github.com/avoxgames))

**01/22/2013**

0.4.11

- 9.0 items

**02/08/2013**

0.4.12

- 11.0 items

0.4.13

- 12.1 items
