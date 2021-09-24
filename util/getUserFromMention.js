const Discord = require('discord.js')

module.exports = (mention, client) => {

    const matches = mention.match(/^<@!?(\d+)>$/) //^ and $ take entrine string. <@ > id. ! and ? optional. \d+ only digits.

    if(!matches) return

    const id = matches[1]
    return client.users.cache.get(id)
}