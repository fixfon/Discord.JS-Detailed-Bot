const Discord = require("discord.js");
const {
    Perms
} = require("../util/permissions.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (role) => {
    const logCh = role.guild.channels.cache.get('856667105775845406');
    if (!logCh) return
    const {
        client
    } = role;

    const fetchLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: "ROLE_DELETE"
    });
    const auditEntry = fetchLogs.entries.first();
    const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı."
    const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
        size: 4096,
        dynamic: true
    }) : null;

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${executor} kişisi bir rol sildi.`, avatarURL)
        .addField("Rol İsmi:", role.name)
        .addField("Rol ID:", role.id)
        .addField("Rol Rengi :", role.hexColor)
        .addField("Rolün Yetkileri:", `\`\`\`${role.permissions.toArray().map((perm) => Perms[perm]).join(" - ")}\`\`\``)
        .addField(
            "Oluşturulma Zamanı:",
            moment(role.createdAt).format('LLL'))
        .addField(
            "Silinme Zamanı:",
            moment(Date.now()).format('LLL'))
        .setColor('RED');

    client.sendEmbed(logCh, embed, false);
}