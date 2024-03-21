# Gowon

_어떤 꿈조차도 전부 이뤄질 듯한 느낌_

Gowon is a Last.FM discord bot in active development.

Check out the indexing server over at [gowon-bot/lilac](https://github.com/gowon-bot/lilac)

Check out the website over at [gowon-bot/gowon.ca](https://github.com/gowon-bot/gowon.ca)

Check out the api gateway over at [gowon-bot/doughnut](https://github.com/gowon-bot/doughnut)

Check out the image generation server over at [gowon-bot/pantomime](https://github.com/gowon-bot/pantomime)

## Running yourself

Gowon now uses Docker and Docker Compose to run. She still accesses the database on the host machine however, so ensure you have Postgres installed, and a database called `gowon` exists (`createdb gowon`).

Copy `config.example.json` to `config.json`, and fill in all the fields. Then, do the same with `ormconfig.example.json`.

If you want to run a development version of the bot, you can create a `docker-compose.yml.override` to specify exposed ports and a development Dockerfile (where you could setup auto-reload with nodemon).

To start docker-compose, run `docker-compose up`. Note you will have to download and build the Mirrorball docker image. (Available at [gowon-bot/lilac](https://github.com/gowon-bot/lilac))

## Commands list

_You can find the source code for all the commands at [/src/commands](/src/commands)_

There are now too many commands to list in the README, see `!help all` or visit https://gowon.bot/commands for a list of all commands.

## Special Thanks

- All my alpha testers, for breaking everything:

  - Luca
  - Kat
  - Enya ([Go checkout REM](https://github.com/yayuyokitano/rem-next))
  - DunsterJR
  - Manu
  - Ten
  - Dana
  - Itsuko
  - Catchy

- DunsterJR for making the (old) profile picture, and for the friends plays idea
- mypetrobot for building the `Who Knows?` bot, the backbone and inspiration for this bot
- Frikandel (.fmbot developer) and Ish (Chuu developer) for being great bot developers to share a space with!
- Egg and Mags for contributing the Yoink! emojis
- Last.fm, for existing

## Any questions?

Somethings broken? Just curious how something works?

Feel free to shoot me a Discord dm at `john!#2527`
or join the support server! https://discord.gg/9Vr7Df7TZf

Become a patreon at [patreon.com/gowon\_](https://www.patreon.com/gowon_)
