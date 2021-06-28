const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")
const ms = require("ms");

module.exports = async (oldState, newState) => {
    if (!oldState.guild || !newState.guild) return;

    let logCh = newState.guild.channels.cache.get('855776924240183316');
    if (!logCh) return;

    const {
        client
    } = newState;

    if (!oldState.channel) {
        let embed = new Discord.MessageEmbed()
            .setAuthor('Sesli Kanala Katılma', newState.member.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setDescription(`${newState.member} kişisi ${newState.channel} isimli sesli kanala katıldı.`)
            .setColor('GREEN');
        client.sendEmbed(logCh, embed, false)
    } else if (!newState.channel) {
        const fetchLogs = await newState.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_DISCONNECT',
        });
        const auditEntry = fetchLogs.entries.first();
        const executor = auditEntry ? auditEntry.executor : 'Bulunamadı.';
        const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
            size: 4096,
            dynamic: true
        }) : null;

        let embed = new Discord.MessageEmbed()
            .setAuthor('Sesli Kanaldan Ayrılma', oldState.member.user.avatarURL({
                size: 4096,
                dynamic: true
            }));

        if (auditEntry && (Date.now() - auditEntry.createdTimestamp) <= 5000) {
            embed.setDescription(`${oldState.member} kişisi ${executor} tarafından ${oldState.channel} isimli sesli kanaldan çıkarıldı.`)
            embed.setColor('RED');
            embed.setThumbnail(avatarURL);
            client.sendEmbed(logCh, embed, false)
        } else {
            embed.setDescription(`${oldState.member} kişisi ${oldState.channel} isimli sesli kanaldan ayrıldı.`)
            embed.setColor('RED');
            client.sendEmbed(logCh, embed, false)
        }
    }

    if (oldState.streaming && !newState.streaming && oldState.channelID === newState.channelID) {
        const embed = new Discord.MessageEmbed()
            .setAuthor('Ekran Paylaşımı Kapatıldı!')
            .setDescription(`${newState.member.user}, ${newState.channel} kanalındaki ekran paylaşımını sonlandırdı.`)
            .setColor('ORANGE')
            .setThumbnail(newState.member.user.avatarURL({
                size: 4096,
                dynamic: true
            }));
        client.sendEmbed(logCh, embed, false);
    }

    if (!oldState.streaming && newState.streaming && oldState.channelID === newState.channelID) {
        const embed = new Discord.MessageEmbed()
            .setAuthor('Yeni Bir Ekran Paylaşımı Açıldı!')
            .setDescription(`${newState.member.user}, ${newState.channel} kanalında ekranını paylaşmaya başladı.`)
            .setColor('ORANGE')
            .setThumbnail(newState.member.user.avatarURL({
                size: 4096,
                dynamic: true
            }));
        client.sendEmbed(logCh, embed, false);
    }

    if (oldState.channelID && newState.channelID) {
        const embed = new Discord.MessageEmbed();
        embed.setAuthor(`${newState.member.user.username} kullanıcısının sesli kanal üzerindeki durumu değişti.`, newState.member.user.avatarURL({
            size: 4096,
            dynamic: true
        }))

        if (oldState.serverMute !== newState.serverMute) {
            const fetchLogs = await newState.guild.fetchAuditLogs({
                type: "MEMBER_UPDATE"
            });
            const auditEntry = fetchLogs.entries.first();
            const executor = auditEntry ? auditEntry.executor.username : 'Bulunamadı.';
            const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
                size: 4096,
                dynamic: true
            }) : null;

            embed.setDescription(`\`\`\`${newState.serverMute ? `${executor} tarafından sunucuda susturuldu.`: `${executor} tarafından sunucudaki susturulması kaldırıldı.`}\`\`\``);
            embed.setThumbnail(avatarURL);
            embed.setColor('BLUE');
            client.sendEmbed(logCh, embed, false);
        }

        if (oldState.serverDeaf !== newState.serverDeaf) {
            const fetchLogs = await newState.guild.fetchAuditLogs({
                type: "MEMBER_UPDATE"
            });
            const auditEntry = fetchLogs.entries.first();
            const executor = auditEntry ? auditEntry.executor.username : 'Bulunamadı.';
            const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
                size: 4096,
                dynamic: true
            }) : null;

            embed.setDescription(`\`\`\`${newState.serverDeaf ? `${executor} tarafından sunucuda sağırlaştırıldı.`: `${executor} tarafından sunucudaki sağırlaştırılması kaldırıldı.`}\`\`\``);
            embed.setThumbnail(avatarURL);
            embed.setColor('BLUE');
            client.sendEmbed(logCh, embed, false);
        }

        if (oldState.channelID !== newState.channelID) {
            const fetchLogs = await newState.guild.fetchAuditLogs({
                type: "MEMBER_MOVE"
            });
            const auditEntry = fetchLogs.entries.first();
            const executor = auditEntry ? auditEntry.executor.username : 'Bulunamadı.';
            const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
                size: 4096,
                dynamic: true
            }) : null;

            if (auditEntry && (Date.now() - auditEntry.createdTimestamp) < 2000) {
                const embed2 = new Discord.MessageEmbed()
                    .setAuthor(`${newState.member.user.username} kişisi ${executor} tarafından taşındı.`, avatarURL)
                    .addField('Bulunduğu Kanal', oldState.channel)
                    .addField('Taşındığı Kanal', newState.channel)
                    .setThumbnail(newState.member.user.avatarURL({
                        size: 4096,
                        dynamic: true
                    }))
                    .setColor('BLUE');
                client.sendEmbed(logCh, embed2, false);
            } else {
                const embed2 = new Discord.MessageEmbed()
                    .setAuthor(`${newState.member.user.username} kişisi farklı bir sesli kanala geçiş yaptı.`)
                    .addField('Eski Kanal', oldState.channel)
                    .addField('Yeni Kanal', newState.channel)
                    .setThumbnail(newState.member.user.avatarURL({
                        size: 4096,
                        dynamic: true
                    }))
                    .setColor('BLUE');
                client.sendEmbed(logCh, embed2, false);
            }
        }
    }
}