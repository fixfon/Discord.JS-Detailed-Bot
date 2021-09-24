const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (member) => {
    const {
        client
    } = member;
    // AUTOROLE
    if(client.config.get(member.guild.id).get('logEvents') && client.config.get(member.guild.id).get('autoRole').enabled && client.config.get(member.guild.id).get('autoRole').roleID){
        const roleID = client.config.get(member.guild.id).get('autoRole').roleID
        member.guild.roles.cache.find(role => {
            if(role.id == roleID){
                member.roles.add(role);
            }
        })
    }
    // WELCOME MESSAGE

    if(client.config.get(member.guild.id).get('logEvents') && client.config.get(member.guild.id).get('logEvents').get('welcomeMessage').enabled && 
    client.config.get(member.guild.id).get('logEvents').get('welcomeMessage').channelID &&
    client.config.get(member.guild.id).get('logEvents').get('welcomeMessage').message){

        const msgChannel = member.guild.channels.cache.find(ch => ch.id == client.config.get(member.guild.id).get('logEvents').get('welcomeMessage').channelID)
        if(msgChannel){
            msgChannel.send(`${member.user} ${client.config.get(member.guild.id).get('logEvents').get('welcomeMessage').message}`)
        }
    }

    // IN-OUT LOG
    if(!client.config.get(member.guild.id).get('logEvents') && !client.config.get(member.guild.id).get('logEvents').get('memberInOutLog').enabled &&
    !client.config.get(member.guild.id).get('logEvents').get('memberInOutLog').channelID) return

    const logCh = member.guild.channels.cache.find(ch => ch.id == client.config.get(member.guild.id).get('logEvents').get('memberInOutLog').channelID)
    if (!logCh) return;

    // const role = member.guild.roles.cache.find(role => role.name === 'ÜYE');

    const userN = member.user.username;
    const avatarURL = member.user.avatarURL({
        size: 4096,
        dynamic: true
    });
    const embed = new Discord.MessageEmbed()
        .setAuthor(`Sunucuya yeni bir üye katıldı!`, avatarURL)
        .setDescription(`${member.user} Sunucuya katıldı.\nSunucudaki üye sayısı: **${member.guild.memberCount}**`)
        .addField("Kullanıcı:", member.user.tag)
        .addField("ID:", member.user.id)
        .addField("Hesap Oluşturulma Tarihi:", moment(member.user.createdAt).format('LLL'))
        .setThumbnail(avatarURL)
        .setColor('GREEN');

    return client.sendEmbed(logCh, embed, false);
};