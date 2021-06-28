module.exports = {
    name: "istatistik",
    aliases: [],
    permLvl: 0,
    guildOnly: true,
    description: "",
    usage: "",
    category: "",
    enabled: true,
    async run (client, message, args){
        const Discord = require('discord.js')
        const embed = new Discord.MessageEmbed()
            .setTitle("Alfred'e sahip olan sunucu listesi")
            .setColor('RANDOM')
            .setDescription(guilds)
            .setFooter(message.author.tag);
        message.channel.send(serverlist);
    }
}