const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async channel => {
    if (!channel.guild) return;

    let logCh = channel.guild.channels.cache.get('856667105775845406');
    if (!logCh) return;

    const {
        client
    } = channel;
    const type = {
        voice: "Ses",
        text: "Yazışma",
        category: "Kategori"
    };
    const fetchLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: "CHANNEL_CREATE"
    });
    const auditEntry = fetchLogs.entries.first();
    const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı.";
    const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
        size: 4096,
        dynamic: true
    }) : null;
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${executor} kişisi kanal oluşturdu.`, avatarURL)
        .addField("Kanal İsmi:", channel)
        .addField("Kanal ID:", channel.id)
        .addField("Kanal Tipi:", type[channel.type])
        .addField("Kanal Kategorisi:", channel.parent ? channel.parent : "Yok")
        .addField(
            "Oluşturulma Zamanı:",
            moment(channel.createdAt).format('LLL'))
        .setColor('GREEN');

    client.sendEmbed(logCh, embed, false);
}