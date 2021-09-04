# Archive Librarian
### Providing services to over 2,000 users. Built on Discord.JS and the GSpread API.
This is a Discord bot for use on Model Ripping servers such as [Destiny Model Rips](https://discord.gg/jm3CZRAkjm) and [Halo Model Resource](https://discord.gg/DGHF6dy) to search their spreadsheets for items. If you want this bot on your server please contact me, or see the contribution section.

## Features
* Slash commands
  * `/search`: Searches for the given query.
  * `/about`: Displays a information about the bot.
  * `/source`: Links to this repository.
* Optional phrase detection
  * The message `Has anyone ripped X?` will search for `X`.
* Query disambiguation 
  * If multiple rows have the same name, the bot will respond will all of them identified with the sheet title.
  * A query can also have multiple qualifiers to narrow down the search. (`/search query: pelican` vs. `/search query: pelican game: Halo Reach`)
* Alias matching and query overrides
  * If an item has alternative names, the bot can also match against those.
  * Ex. "chief" is an alias for "Master Chief"
* Fuzzy query matching
  * To handle typos, a query does not have to match exactly to match an item.


## Contribution
Each server that is supported requires its own Responder class. If you want this bot on your server, fork this repository and submit a pull request with the required code (Contribution Guide WIP).
