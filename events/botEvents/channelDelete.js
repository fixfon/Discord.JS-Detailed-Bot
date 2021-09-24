const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async channel => {

    if (!channel.client.config.get(channel.guild.id).get('logEvents') && !channel.client.config.get(channel.guild.id).get('logEvents').get('guildLog').enabled &&
    !channel.client.config.get(channel.guild.id).get('logEvents').get('guildLog').channelID) return

    const {
        client
    } = channel;
    try {
        if(channel.type === "voice" && channel.members.has(client.user.id)) {
            let player = client.manager.players.get(channel.guild.id)
    
            if(player && channel.id == player.voiceChannel){
                player.destroy();
            }
        }
    } catch (error) {
        console.log(error)
    }


    const logCh = channel.guild.channels.cache.find(ch => ch.id == channel.client.config.get(channel.guild.id).get('logEvents').get('guildLog').channelID)

    if(!logCh) return


    const type = {
        voice: "Ses",
        text: "Yazışma",
        category: "Kategori"
    };
    const fetchLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: "CHANNEL_DELETE"
    });
    const auditEntry = fetchLogs.entries.first();
    const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı.";
    const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
        size: 4096,
        dynamic: true
    }) : null;
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${executor} kişisi kanal sildi.`, avatarURL)
        .addField("Kanal İsmi:", channel.name)
        .addField("Kanal ID:", channel.id)
        .addField("Kanal Tipi:", type[channel.type])
        .addField("Kanal Kategorisi:", channel.parent ? channel.parent : "Yok")
        .addField(
            "Oluşturulma Zamanı:",
            moment(channel.createdAt).format('LLL'))
        .addField(
            "Silinme Zamanı:",
            moment(Date.now()).format('LLL'))
        .setColor('RED');

    return client.sendEmbed(logCh, embed, false);
}