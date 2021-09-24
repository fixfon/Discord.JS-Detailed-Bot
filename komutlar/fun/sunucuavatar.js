const Discord = require('discord.js')

module.exports = {
    name: "sunucuavatar",
    aliases: ["guildavatar", "savatar"],
    permLvl: 0,
    guildOnly: true,
    description: "Sunucunun avatarını gösterir.",
    usage: `**sunucuavatar**`,
    category: "fun",
    cooldown: 3,
    enabled: true,
    async run (message, args){
        const client = message.client

        const embed = new Discord.MessageEmbed()
            .setColor('#03fcfc')
            .setAuthor(`${message.guild.name} Sunucusunun Avatarı`)
            .setImage(message.guild.icon ? message.guild.iconURL({ size:4096, dynamic:true}) : null)
            .setFooter(message.author.tag, message.author.avatar ? message.author.avatarURL({ size:4096, dynamic:true }) : null)
            .setTimestamp();
        
        client.sendEmbed(message.channel, embed, false);
    }
}