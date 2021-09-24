const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")
const ms = require("ms");

module.exports = async (deletedMessage) => {
    const {
        client
    } = deletedMessage;

    if (!deletedMessage || deletedMessage.partial) return
    if (typeof deletedMessage.author === "undefined") return
    if (deletedMessage.author && deletedMessage.author.bot === true) return
    if (deletedMessage.channel && deletedMessage.channel.type !== "text") return
    if (!deletedMessage.guild) return

    if(!client.config.get(deletedMessage.guild.id).get('logEvents') && !client.config.get(deletedMessage.guild.id).get('logEvents').get('messageLog').enabled &&
    !client.config.get(deletedMessage.guild.id).get('logEvents').get('messageLog').channelID) return

    const deletedMLog = deletedMessage.guild.channels.cache.find(ch => ch.id == client.config.get(deletedMessage.guild.id).get('logEvents').get('messageLog').channelID)
    // const deletedMLog = client.config.get(deletedMessage.guild.id).get('logEvents').get('messageLog').channelID
    if (!deletedMLog) return

    if(client.config.get(deletedMessage.guild.id).get('excludedChannels') && client.config.get(deletedMessage.guild.id).get('excludedChannels').find(chID => chID == deletedMessage.channel.id) ||
    client.config.get(deletedMessage.guild.id).get('excludedCategories').find(catID => catID == deletedMessage.channel.parentID)) return

    const entry = await deletedMessage.guild.fetchAuditLogs({
        type: 'MESSAGE_DELETE',
    }).then(audit => audit.entries.first())

    let time_ob = new Date();

    if ((entry.target.id === deletedMessage.author.id) &&
        (entry.extra.channel.id === deletedMessage.channel.id) &&
        (entry.createdTimestamp > (Date.now() - 1500)) &&
        entry.extra.count >= 1
    ) {
        const embed = new Discord.MessageEmbed()
            .setAuthor(deletedMessage.author.tag + " adlı kişinin mesajı silindi.", deletedMessage.author.avatarURL({
                size: 32,
                dynamic: true
            }))
            // .setThumbnail(deletedMessage.author.avatarURL({ size:4096, dynamic: true}))
            .setColor("RED")
            .setDescription(`Mesajın Silindiği Kanal: ${deletedMessage.channel}`)
            .addField("Silinen Mesaj:", ` \`${deletedMessage.content}\` `)
            .setFooter(" Mesajı Silen: " + entry.executor.tag +
                "\nMesajın Oluşturulma Tarihi: " + moment(deletedMessage.createdAt).format("LLL") +
                "\nMesajın Silindiği Tarih: " + moment(time_ob).format("LLL"), entry.executor.avatarURL({
                    size: 16,
                    dynamic: true
                }));
        return client.sendEmbed(deletedMLog, embed, false);
    } else {
        const embed = new Discord.MessageEmbed()
            .setAuthor(deletedMessage.author.tag + " adlı kişinin mesajı silindi.", deletedMessage.author.avatarURL({
                size: 32,
                dynamic: true
            }))
            // .setThumbnail(deletedMessage.author.avatarURL({ size:4096, dynamic: true}))
            .setColor("RED")
            .setDescription(`Mesajın Silindiği Kanal: ${deletedMessage.channel}`)
            .addField("Silinen Mesaj:", ` \`${deletedMessage.content}\` `)
            .setFooter(" Mesajı Silen: " + deletedMessage.author.tag +
                "\nMesajın Oluşturulma Tarihi: " + moment(deletedMessage.createdAt).format("LLL") +
                "\nMesajın Silindiği Tarih: " + moment(time_ob).format("LLL"), deletedMessage.author.avatarURL({
                    size: 16,
                    dynamic: true
                }));
        return client.sendEmbed(deletedMLog, embed, false);
    }
}