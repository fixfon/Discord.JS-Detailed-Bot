const Discord = require("discord.js");
const {
    Perms
} = require("../../util/permissions.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (role) => {
    const {
        client
    } = role;

    if(!client.config.get(role.guild.id).get('logEvents') && !client.config.get(role.guild.id).get('logEvents').get('guildLog').enabled &&
    !client.config.get(role.guild.id).get('logEvents').get('guildLog').channelID) return

    const logCh = role.guild.channels.cache.find(ch => ch.id == client.config.get(role.guild.id).get('logEvents').get('guildLog').channelID)
    if (!logCh) return

    const fetchLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: "ROLE_CREATE"
    });
    const auditEntry = fetchLogs.entries.first();
    const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı."
    const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
        size: 4096,
        dynamic: true
    }) : null;

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${executor} kişisi bir rol oluşturdu.`, avatarURL)
        .addField("Rol İsmi:", role)
        .addField("Rol ID:", role.id)
        .addField("Rol Rengi :", role.hexColor)
        .addField("Rolün Yetkileri:", `\`\`\`${role.permissions.toArray().map((perm) => Perms[perm]).join(" - ")}\`\`\``)
        .addField(
            "Oluşturulma Zamanı:",
            moment(role.createdAt).format('LLL'))
        .setColor('GREEN');

    return client.sendEmbed(logCh, embed, false);
}