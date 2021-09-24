const Discord = require('discord.js')

module.exports = {
    name: "restart",
    aliases: [],
    permLvl: 0,
    guildOnly: false,
    developerOnly: true,
    description: "restart.",
    usage: `restart`,
    category: "owner",
    cooldown: 15,
    enabled: true,
    async run (message, args){

        message.reply("Bot restartlanıyor...").then(msg => message.delete().then(dmg => process.exit(1)).catch(err => console.log(err))).catch(err => console.log(err));
    }
}