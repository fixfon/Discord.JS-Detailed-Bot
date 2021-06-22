const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (member) => {

    let logCh = member.guild.channels.cache.get('855776667121090560');
    if(!logCh) return;

    const { client } = member;
    const userN = member.user.username;
    const avatarURL = member.user.avatarURL({ size:4096, dynamic:true });
    const embed = new Discord.MessageEmbed()
        .setAuthor(userN, avatarURL)
        .setDescription(`**${userN}** sunucudan ayrıldı.\nSunucudaki üye sayısı: **${member.guild.memberCount}**`)
        .addField("Kullanıcı:", member.user.tag)
        .addField("ID:", member.user.id)
        .addField("Hesap Oluşturulma Tarihi:", moment(member.user.createdAt).format('LLL'))
        .setThumbnail(avatarURL)
        .setColor('#cc0000');
    
    client.sendEmbed(logCh, embed, false);
}