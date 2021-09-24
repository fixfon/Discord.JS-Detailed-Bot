const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (member) => {
    const {
        client
    } = member;

    let logCh;
    if (client.config.get(member.guild.id).get('logEvents') && client.config.get(member.guild.id).get('logEvents').get('memberInOutLog').enabled && 
    client.config.get(member.guild.id).get('logEvents').get('memberInOutLog').channelID){
        logCh = member.guild.channels.cache.find(ch => ch.id == client.config.get(member.guild.id).get('logEvents').get('memberInOutLog').channelID)
        if(logCh) {
        const embed = new Discord.MessageEmbed()
            .setAuthor(`Sunucudan bir üye ayrıldı!`, member.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setDescription(`${member.user} Sunucudan ayrıldı.\nSunucudaki üye sayısı: **${member.guild.memberCount}**`)
            .addField("Kullanıcı:", member.user.tag)
            .addField("ID:", member.user.id)
            .addField("Hesap Oluşturulma Tarihi:", moment(member.user.createdAt).format('LLL'))
            .setThumbnail(member.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setColor('#cc0000');
    
        client.sendEmbed(logCh, embed, false);
        }
    }

    let kickLogCh;
    // let kickLogCh = member.guild.channels.cache.get('855776799915769867')

    if (client.config.get(member.guild.id).get('logEvents') && client.config.get(member.guild.id).get('logEvents').get('banKickLog').enabled &&
    client.config.get(member.guild.id).get('logEvents').get('banKickLog').channelID) {
        kickLogCh = member.guild.channels.cache.find(ch => ch.id == client.config.get(member.guild.id).get('logEvents').get('banKickLog').channelID)
        
        if (!kickLogCh) return

        const fetchLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: "MEMBER_KICK"
        });
        const auditEntry = fetchLogs.entries.first();
        const executor = auditEntry ? auditEntry.executor.tag : "Bulunamadı."
        const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
            size: 4096,
            dynamic: true
        }) : null;
    
        if(auditEntry.executor.id == '855428026141638686') return;
    
        if (auditEntry && (Date.now() - auditEntry.createdTimestamp) <= 500) {
            const embed2 = new Discord.MessageEmbed()
                .setAuthor(`${member.user.tag} adlı kişi sunucudan atıldı!`, member.user.avatarURL({
                    size: 4096,
                    dynamic: true
                }))
                .setDescription(`${member.user} Kullanıcısının ID'si: ${member.user.id}`)
                .addField('Atılma Sebebi', `\`\`\`${auditEntry.reason}\`\`\``)
                .addField('Sunucuya Katılma Tarihi', `\`\`\`${member.joinedAt ? moment(member.joinedAt).format('LLL') : 'Bilinmiyor'}\`\`\``)
                .addField('Atılma Tarihi', `\`\`\`${moment(Date.now()).format('LLL')}\`\`\``)
                .setColor('RED')
                .setThumbnail(member.user.avatarURL({
                    size: 4096,
                    dynamic: true
                }))
                .setFooter(`Yasaklayan Kişi: ${executor}`, avatarURL);
    
            return client.sendEmbed(kickLogCh, embed2, false);
        }
    }
    else return
}