require("../../util/inlineReply"); //inlinereply module
const Discord = require('discord.js')
const moment = require("moment");
moment.locale("tr")

module.exports = {
    name: "unban",
    aliases: ['bankaldır', 'yasakkaldır'],
    permLvl: 0,
    guildOnly: true,
    description: "ID'si verilen kişiyi eğer yetkiniz varsa sunucudaki yasaklamasını kaldırır.",
    usage: `**unban KULLANICI ID** yazarak komutu kullanabilirsiniz.`,
    category: "moderation",
    cooldown: 2,
    enabled: true,
    async run (message, args){
        const matches = args[0].match(/^(\d+)$/);
        const bannedID = matches[0]
        if(!bannedID) return message.inlineReply('Geçersiz ID belirtildi.')

        const fetchLogs = await message.guild.fetchAuditLogs({limit:1,type:"MEMBER_BAN_REMOVE"});
        const auditEntry = fetchLogs.entries.first();
        const executor = auditEntry.executor

        try{
            await message.guild.members.unban(bannedID)
            message.inlineReply(`**${auditEntry.target.tag} (${bannedID})** kullanıcısının yasaklaması kaldırıldı.`)
        }
        catch (error){
            console.log(error);
            return message.inlineReply(`**${bannedID}** kullanıcısının yasaklaması kaldırılamadı.`);
        }

        if (!message.client.config.get(message.guild.id).get('logEvents').get('banKickLog').enabled &&
        !message.client.config.get(message.guild.id).get('logEvents').get('banKickLog').channelID) return

        const logCh = message.guild.channels.cache.find(ch => ch.id == message.client.config.get(message.guild.id).get('logEvents').get('banKickLog').channelID)

        if(!logCh) return
        
        const emoji = "https://cdn.discordapp.com/emojis/801513596772286506.gif?v=1";
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${auditEntry.target.tag} kişisinin bu sunucu için olan yasaklaması kaldırıldı!`, emoji)
            .addField('Yasaklamanın Kaldırılma Tarihi', `\`\`\`${moment(Date.now()).format('LLL')}\`\`\``)
            .setDescription(`${auditEntry.target} Kullanıcısının ID'si: ${bannedID}`)
            .setColor('GREEN')
            .setFooter(`Yasaklamayı Kaldıran Kişi: ${message.author.tag}`, message.author.avatarURL({ size:4096, dynamic:true }))
            .setThumbnail(auditEntry.target.avatarURL({ size:4096, dynamic:true }));
        message.client.sendEmbed(logCh, embed, false);
    }
}