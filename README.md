# Rippers Response Bot
### Providing services to over 2,000 people. Built on Discord.JS and the GSpread API.
This is a Discord bot for use on Model Ripping servers such as [Destiny Model Rips](https://discord.gg/jm3CZRAkjm) and [Halo Model Resource](https://discord.gg/DGHF6dy) to search their spreadsheets for items. If you want this bot on your server contact me, or see the contribution section.

## Features
* Prefix detection and phrase detection
  * `?_ XYZ` and `Has anyone ripped XYZ?` will both search for `XYZ`.
* Query disambiguation 
  * If multiple rows have the same name, the bot will respond will all of them identified with the sheet title.
  * A query can also have multiple qualifiers to narrow down the search. (`?_ pelican` vs. `?_ Reach pelican`)
* Alias matching and query overrides
  * If an item has alternative names, the bot can also match against those.
* Fuzzy query matching
  * A query does not have to match exactly to match an item.


## Contribution
Each server that is supported requires its own Responder class. If you want this bot on your server, fork this repository and submit a pull request with the required code (Contribution Guide WIP).
