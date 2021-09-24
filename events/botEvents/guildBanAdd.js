const Discord = require("discord.js");
const {
    Perms
} = require("../../util/permissions.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (guild, bannedMember) => {
    const {
        client
    } = bannedMember;

    if (!client.config.get(guild.id).get('logEvents') && !client.config.get(guild.id).get('logEvents').get('banKickLog').enabled &&
    !client.config.get(guild.id).get('logEvents').get('banKickLog').channelID) return

    const logCh = guild.channels.cache.find(ch => ch.id == client.config.get(guild.id).get('logEvents').get('banKickLog').channelID)

    if(!logCh) return

    const fetchLogs = await guild.fetchAuditLogs({
        limit: 1,
        type: "MEMBER_BAN_ADD"
    });
    const auditEntry = fetchLogs.entries.first();
    const executor = auditEntry ? auditEntry.executor.tag : "Bulunamadı."
    const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
        size: 4096,
        dynamic: true
    }) : null;
    const emoji = "https://cdn.discordapp.com/emojis/801513596772286506.gif?v=1";

    if(auditEntry.executor.id == '855428026141638686') return

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${auditEntry.target.tag} adlı kişi sunucudan yasaklandı!`, emoji)
        .addField('Yasaklanma Sebebi', `\`\`\`${auditEntry.reason}\`\`\``)
        .addField('Yasaklanma Tarihi', `\`\`\`${moment(Date.now()).format('LLL')}\`\`\``)
        .setDescription(`${auditEntry.target} Kullanıcısının ID'si: ${auditEntry.target.id}`)
        .setColor('RED')
        .setFooter(`Yasaklayan Kişi: ${executor}`, avatarURL)
        .setThumbnail(auditEntry.target.avatarURL({
            size: 4096,
            dynamic: true
        }));

    return client.sendEmbed(logCh, embed, false);
}