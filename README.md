klinklang
=========

A collection of utilities for [52Poké Wiki](https://wiki.52poke.com/).

[![Build Status](https://api.travis-ci.org/mudkipme/klinklang.svg?branch=master)](http://travis-ci.org/mudkipme/klinklang)

## Requirements

* Node.js
* Apache Kafka

## Features

* Replace Pokémon terminologies from one language to another
* Various maintenance works for 52Poké Wiki
* Automatically generate certain content based on Pokémon game data

## EventBus

This program is a Kafka consumer of [MediaWiki EventBus Extension](https://www.mediawiki.org/wiki/Extension:EventBus).

This program can trigger certain tasks based on events. The triggers should be in [JSON Predicate](https://tools.ietf.org/id/draft-snell-json-test-01.html) syntax.

Here is an example of `config.json`. We use a hook to read the [SCSS](http://sass-lang.com/) content from certain page and convert it to CSS and write to `Common.css`.

```json
{
  "kafka": {
    "config": {
      "metadata.broker.list": "localhost:9092",
      "group.id": "klinklang"
    },
    "topic": "mediawiki"
  },
  "events": {
    "triggers": [
      {
        "task": "scss",
        "topic": "mediawiki.revision-create",
        "predicate": {
          "op": "test",
          "path": "/page_title",
          "value": "神奇宝贝百科:层叠样式表"
        },
        "options": {
          "target": [
            "MediaWiki:Common.css",
            "MediaWiki:Mobile.css"
          ]
        }
      }
    ]
  }
}
```

## See also

* [ClothTableGenerator](https://github.com/lucka-me/toolkit/tree/master/52Pok%C3%A9-Wiki/ClothTableGenerator) - 适用于[精灵宝可梦 究极之日／究极之月](https://wiki.52poke.com/wiki/精灵宝可梦_究极之日／究极之月)的服饰列表生成器

## LICENSE

This project is under [BSD-3-Clause](LICENSE).

52Poké (神奇宝贝部落格/神奇寶貝部落格, 神奇宝贝百科/神奇寶貝百科) is a Chinese-language Pokémon fan site. Neither the name of 52Poké nor the names of the contributors may be used to endorse any usage of codes under this project.

Pokémon ©2019 Pokémon. ©1995-2019 Nintendo/Creatures Inc./GAME FREAK inc. 52Poké and this project is not affiliated with any Pokémon-related companies.