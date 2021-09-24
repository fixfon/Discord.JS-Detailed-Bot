const Discord = require('discord.js')

module.exports = {
    name: "avatar",
    aliases: ["profil", "pp"],
    permLvl: 0,
    guildOnly: false,
    description: "Etiketlenen kullanıcının, etiketlenen kullanıcı yoksa sorgulayan kişinin avatarını gönderir.",
    usage: `**avatar @KULLANICI**`,
    category: "fun",
    cooldown: 3,
    enabled: true,
    async run (message, args){
        const mention = message.mentions.members.first();
        const embed = new Discord.MessageEmbed()
            .setColor('#03fcfc')
            .setTimestamp()
            .setFooter(message.author.tag, message.author.avatarURL({ size:4096, dynamic:true }));

        if(!mention) {
            embed.setAuthor(`${message.author.tag} Kullanıcısının Avatarı`)
            embed.setImage(message.author.avatar ? message.author.avatarURL({ size:4096, dynamic:true }) : null)
        }
        else{
            embed.setAuthor(`${mention.user.tag} Kullanıcısının Avatarı`)
            embed.setImage(mention.user.avatar ? mention.user.avatarURL({ size:4096, dynamic:true }) : null)
        }

        client.sendEmbed(message.channel, embed, false);
    }
}