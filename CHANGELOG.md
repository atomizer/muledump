**2014-03-01** version 0.4.20

- gift chests option
- artemis skin

**2014-02-21** version 0.4.19

- 19.2 items

**2013-12-19** version 0.4.18

- 19.0 items

**2013-12-13** version 0.4.17

- 18.0 items, small ring positioning tweaks

**2013-09-14** version 0.4.16

- 16.4 items (in advance)
- gift chests ([Nightfirecat](https://github.com/Nightfirecat))
- more tolerant to corrupt char data (zub)
- disabled price lookup since the forums are dead
- email not verified warning

**2013-08-28** version 0.4.15

- 16.0 items
- 16.0 vault chest order ([Nightfirecat](https://github.com/Nightfirecat))
- display characters always in same order ([Nightfirecat](https://github.com/Nightfirecat))
- added `rowlength` variable to accounts.js
- better handling of unknown items (separate counters, item id in hex)
- use DarkDaemon's price guide ([aiedail92](https://github.com/aiedail92))
- updated JQuery and masonry
- more attempts to fix masonry-related rendering bugs

**2013-08-01** version 0.4.14

- 15.0 items
- hp/mp pot counters ([SlugKing](https://github.com/SlugKing), [Nightfirecat](https://github.com/Nightfirecat))
- feed power in tooltips
- copyright and license notes

**2013-03-31** version 0.4.13

- 12.1 items

**2013-02-08** version 0.4.12

- 11.0 items

**2013-01-22** version 0.4.11

- 9.0 items

**2012-12-12** version 0.4.10

- 7.0 items
- changed price guide to MustafaD (pull request by [avoxgames](https://github.com/avoxgames))

**2012-11-16** version 0.4.9

- 5.0 items
- added backpacks
- fixed ninja equips position in totals

**2012-11-2** version 0.4.8

- 4.0 items
- item names and tiers now match the in-game tooltips (except dosed items like elixirs)
- fixed char description sometimes spanning more lines than it should

**2012-10-25** version 0.4.7

- 3.1 items
- made achievement progress and additional stats options independent of each other

**2012-10-11** version 0.4.6

- ninja equipment fame bonuses
- fixed star color calculation

**2012-10-05** version 0.4.5

- ninja, 124.0 items

**2012-09-25** version 0.4.4

- new accounts.js option: "nomasonry" - set to 1 to turn off smart layout
- fixed some problems with per-account menus
- ctrl-click on name toggles the account in the totals

**2012-09-16** version 0.4.3

- authentic character portraits
- fixed long names breaking the box

**2012-09-04** version 0.4.1

- 123.5.0 items

**2012-08-25** version 0.4

- 123.4.4 items
- ability to set options for each account individually - click account name for menu (intended use: keep global options to items only and expand the good accounts as needed)
- added achievement progress calculation (thanks to Pfiffel, even though I didnt use your code)
- vault chests are now in their in-game order (thanks to Hals for assistance)
- improved page load time
- added redirect to Kable's video

**2012-08-05** version 0.3.2

- 123.4.1 items
- reduced probability of duplicate error messages

**2012-07-04** version 0.3.1

- 123.3.2 items
- fixed price guide url
- fixed some visual glitches

**2012-06-13** version 0.3: collaboration edition

- 123.3 stats
- export to TXT, CSV, JSON, PNG
- accuracy and god kill ratio
- fixed "sticky" options bug
- new reload symbol
- optional: one-click login -- by [FizzeBu](http://forums.wildshadow.com/user/24488); more info above
- optional: display prices from Kazansky -- by [aiedail92](https://github.com/aiedail92); more info above

**2012-05-08**

version 0.2.3

- fixed star counter
- better Opera compatibility
- various performance optimizations
- update checking is now on-demand

**2012-05-06** version 0.2.2

- stars
- automatic update checker

**2012-05-02** version 0.2.1

- fixed some visual bugs and edge cases introduced in previous update
- back to old method of issuing requests (slow but more stable)
- you can make options to stay open by clicking
- moved additional stats to the bottom
- updated JQuery

**2012-04-29** version 0.2

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

**2012-04-01**

- build 122.3.2
- fixed incorrect "Well Equipped" calculation with amulet on

**2012-03-20**

- items preemptively updated for build 122.2 (123?)
- new feature - extended character stats and death screen emulation
- rough control to hide "bad" items (currently everything 1% fame or less, controlled by var FAMETHRESHOLD in the main script)
- made stats copypaste-friendlyish by using `<table>`

**2012-02-14**

- items as of build 122.0.1
- "left to max" shows both points and potions for HP/MP

**2012-01-10**

- added new items from build 121
- now you can switch to testing by adding line "`testing = 1`" at the begginning or end of your `accounts.js` file

**2011-11-28**

Updated with the 4 new items (tomb rings and key).

**2011-11-22**

A bunch of bug fixes, thanks joshd19 and Mcbeth for calling my attention to them!

- hopefully fixed errors on unexpected input
- fixed empty vault being empty
- fixed "only first char" regression
- fixed roll calculations for non-lvl20
- added min-width to prevent the boxes from collapsing

**2011-11-15**

- colored distances from average
- option to hide all items (gorzerk-mode)
- names/emails --> emails
- "left to max" now shows amount of potions (thanks zxcv)

**2011-11-12**

Added options to toggle totals, names/emails, only first char.
Also, in Firefox 8 localStorage bug is fixed, so cache will work there too.

**2011-11-1**

- added ability to hide equipped items
- extended stats with roll checks and distances from max
- added options on the right since there are too many of them now
- added tiers in tooltips
- fixed spell vertical position (same as rings, in-game they're shifted 1/2 "pixel" from the "grid"; tell me if you catch more inconsistences in rendering)
- added comments in the sample file since some people had trouble editing it
- switched to local copy of jquery for true offline to be possible
