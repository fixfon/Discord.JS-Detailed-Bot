const Discord = require("discord.js");
const moment = require("moment");
moment.locale("tr")
const ms = require("ms");

module.exports = async (oldState, newState) => {
    if (!oldState.guild || !newState.guild) return;

    const {
        client
    } = newState;

    let player = client.manager.players.get(oldState.guild.id);
    let voiceCh;
    if(player) voiceCh = oldState.guild.channels.cache.find(ch => ch.id === player.voiceChannel);

    if(!newState.channel && player && voiceCh && voiceCh.members.size == 1) {
        console.log("player inaktiviteden yok etmek için timeouta girildi.")
        setTimeout(async () => { // will disconnect when channel is empty after 3 min.
            if(player && voiceCh.members.size == 1 && oldState.guild.voice.channel) {

                if(client.config.get(oldState.guild.id).get('musicSets').commandChannelID) {
                    let musicCmdCh = client.config.get(oldState.guild.id).get('musicSets').commandChannelID;
                    musicCmdCh = oldState.guild.channels.cache.find(ch => ch.id == musicCmdCh);

                    musicCmdCh.send('Sesli odadaki inaktiviteden dolayı Alfred kanaldan ayrıldı.')
                }

                try {
                    console.log("Kanal boşluğundan player kapatıldı.")
                    // return player.destroy();
                    return oldState.guild.voice.channel.leave();
                } catch (error) {
                    console.log(error)
                }
            }
        }, 180000);
    }

    if(!client.config.get(newState.guild.id).get('logEvents') && !client.config.get(newState.guild.id).get('logEvents').get('voiceLog').enabled &&
    !client.config.get(newState.guild.id).get('logEvents').get('voiceLog').channelID) return

    const logCh = newState.guild.channels.cache.find(ch => ch.id == client.config.get(newState.guild.id).get('logEvents').get('voiceLog').channelID)
    if (!logCh) return;

    if (!oldState.channel) {
        let embed = new Discord.MessageEmbed()
            .setAuthor('Sesli Kanala Katılma', newState.member.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setDescription(`${newState.member} kişisi ${newState.channel} isimli sesli kanala katıldı.`)
            .setColor('GREEN');
        
        return client.sendEmbed(logCh, embed, false)
    } else if (!newState.channel) { // disconnect from channel.

        // if(oldState.id === client.user.id && player) {
            
        //     if(player && player.state !== "CONNECTED") {

        //         try {
        //             player.destroy();
        //             console.log("Kanaldan atıldığından player kapatıldı.")
        //         } catch (error) {
        //             console.log(error)
        //         }
        //         if(client.config.get(oldState.guild.id).get('musicSets').commandChannelID) {
        //             const musicCmdCh = client.config.get(oldState.guild.id).get('musicSets').commandChannelID;

        //             return musicCmdCh.send('İnaktiflikten dolayı player sonlandırıldı.');
        //         }
        //     }
        // }

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
            return client.sendEmbed(logCh, embed, false)
        } else {
            embed.setDescription(`${oldState.member} kişisi ${oldState.channel} isimli sesli kanaldan ayrıldı.`)
            embed.setColor('RED');
            return client.sendEmbed(logCh, embed, false)
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
        return client.sendEmbed(logCh, embed, false);
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
        return client.sendEmbed(logCh, embed, false);
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

            return client.sendEmbed(logCh, embed, false);
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

            // if(newState.id == client.user.id && oldState.serverDeaf === true && newState.serverDeaf === false){
            //     try {
            //         newState.guild.members.cache.find(member => {
            //             if(member.id == executor.id){
            //                 member.send("Alfred'in sağırlaştırmasını kaldırmaman gerekmekte. Tekrardan sağırlaştırıldı.").catch(err);
            //             }
            //         })
            //         newState.setDeaf(true);
            //     } catch (error) {
            //         console.log(error);
            //     }
            // }

            embed.setDescription(`\`\`\`${newState.serverDeaf ? `${executor} tarafından sunucuda sağırlaştırıldı.`: `${executor} tarafından sunucudaki sağırlaştırılması kaldırıldı.`}\`\`\``);
            embed.setThumbnail(avatarURL);
            embed.setColor('BLUE');

            return client.sendEmbed(logCh, embed, false);
        }

        if (oldState.channelID !== newState.channelID) { // move

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

                return client.sendEmbed(logCh, embed2, false);
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

                return client.sendEmbed(logCh, embed2, false);
            }
        }
    }
}