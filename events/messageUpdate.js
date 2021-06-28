const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")
const ms = require("ms");


module.exports = async (oldMessage, newMessage) => {
    if (!oldMessage.author) return;
    if (oldMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const logCh = newMessage.guild.channels.cache.get('855776941528580137');
    if (!logCh) return;

    const {
        client
    } = newMessage;

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${oldMessage.author.username} kişisi mesajını düzenledi.`, oldMessage.author.avatarURL({
            size: 4096,
            dynamic: true
        }))
        .setDescription(`Mesajın Bulunduğu Kanal: ${oldMessage.channel}`)
        .addField('Eski Mesaj İçeriği', `\`\`\`${oldMessage.content}\`\`\``)
        .addField('Yeni Mesaj İçeriği', `\`\`\`${newMessage.content}\`\`\``)
        .addField('Mesajın Oluşturulma Tarihi: ', moment(oldMessage.createdAt).format('LLL'))
        .addField('Mesajın Düzenlenme Tarihi: ', moment(Date.now()).format('LLL'))
        .setFooter(`Mesaj ID: ${newMessage.id}`)
        .setColor('BLUE');
    client.sendEmbed(logCh, embed, false);
}