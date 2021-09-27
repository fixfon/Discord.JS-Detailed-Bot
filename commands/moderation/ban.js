const getUser = require("../../util/getUserFromMention")
require("../../util/inlineReply"); //inlinereply module
const Discord = require('discord.js')
const moment = require("moment");
moment.locale("tr")

module.exports = {
    name: "ban",
    aliases: ['yasakla', 'sunucudanyasakla'],
    permLvl: 0,
    guildOnly: true,
    description: "Etiketlediğiniz ve sebebini belirttiğin kişiyi yetkiniz varsa sunucudan yasaklar.",
    usage: `**ban @KULLANICI <YASAKLAMA SEBEBİ>**`,
    category: "moderation",
    cooldown: 2,
    enabled: true,
    async run (message, args){
        if(args.length < 2) return message.inlineReply('Yasaklamak istediğin kullanıcıyı ve sebebini belirtmen gerekmekte.')

        const mention = getUser(args[0], message.client)
        if(!mention) return message.inlineReply('Etiketlediğin kullanıcı bulunamadı.')

        const reason = args.slice(1).join(' ');

        try{
            await message.guild.members.ban(mention, { reason })
        }
        catch (error){
            console.log(error);
            return message.inlineReply(`${mention} yasaklanamadı.`);
        }

        message.inlineReply(`**${mention.tag} (${mention.id})** kullanıcısı başarıyla yasaklandı.`)

        if (!message.client.config.get(message.guild.id).get('logEvents').get('banKickLog').enabled &&
        !message.client.config.get(message.guild.id).get('logEvents').get('banKickLog').channelID) return

        const logCh = message.guild.channels.cache.find(ch => ch.id == message.client.config.get(message.guild.id).get('logEvents').get('banKickLog').channelID)

        if(!logCh) return

        const emoji = "https://cdn.discordapp.com/emojis/801513596772286506.gif?v=1";
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${mention.tag} adlı kişi sunucudan yasaklandı!`, emoji)
            .addField('Yasaklanma Sebebi', `\`\`\`${reason}\`\`\``)
            .addField('Yasaklanma Tarihi', `\`\`\`${moment(Date.now()).format('LLL')}\`\`\``)
            .setDescription(`${mention} Kullanıcısının ID'si: ${mention.id}`)
            .setColor('RED')
            .setFooter(`Yasaklayan Kişi: ${message.author.tag}`, message.author.avatarURL({ size:4096, dynamic:true }))
            .setThumbnail(mention.avatarURL({ size:4096, dynamic:true }));
        message.client.sendEmbed(logCh, embed, false);
    }
}