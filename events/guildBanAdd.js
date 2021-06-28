const Discord = require("discord.js");
const {
    Perms
} = require("../util/permissions.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (guild, bannedMember) => {

    const logCh = guild.channels.cache.get('855776799915769867');
    const {
        client
    } = bannedMember;
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

    console.log(guild.members.cache.get('278610070948806657'));

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

    client.sendEmbed(logCh, embed, false);
}