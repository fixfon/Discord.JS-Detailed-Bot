const {
    MessageEmbed
} = require('discord.js');
require("../../util/inlineReply"); //inlinereply module


module.exports = {
    name: "skip",
    aliases: ['voteskip', 'skipsong', 'skipvote', 's'],
    permLvl: 0,
    guildOnly: true,
    description: "Aktif şarkıyı geçmeni sağlar.",
    usage: "**Şarkıyı açan kişi sensen direkt, sen değilsen oylama sonucu şarkıyı geçmek için komutu kullanabilirsin.**",
    category: "music",
    cooldown: 2,
    enabled: true,
    async run(message, args) {

        const { client } = message

        let player = client.manager.players.get(message.guild.id);

        const infoEmbed = new MessageEmbed()
            .setFooter(client.user.username, client.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setTimestamp()
            .setAuthor('❌ Hata!', message.author.avatar ? message.author.avatarURL({
                size: 4096,
                dynamic: true
            }) : null)
            .setColor('#fca103');
        
        if (player.state !== 'CONNECTED') {
            infoEmbed.setDescription("Herhangi bir sesli kanalda olmadığım için bu komutu kullanamazsın.")
            await client.sendEmbed(message.channel, infoEmbed, true, 3000)
            return;
        }
        if (!message.member.voice.channel) {
            infoEmbed.setDescription("Bu komutu kullanabilmek için sesli bir kanalda olman gerekmekte.")
            await client.sendEmbed(message.channel, infoEmbed, true, 3000)
            return;
        }
        if (message.guild.voice && message.member.voice?.channelID !== message.guild.voice.channelID) {
            if(message.guild.voice.channelID) {
                infoEmbed.setDescription("Bu komutu kullanabilmek için bot ile aynı sesli kanalda bulunman gerekmekte.");
                await client.sendEmbed(message.channel, infoEmbed, true, 3000);
                return;
            }
        }
        if (!player || player.queue.totalSize == 0) {
            if(message.guild.me.voice.channel) {
                if(player) player.destroy()
                else await message.guild.me.voice.channel.leave()
                infoEmbed.setDescription("Aktif olarak çalınan bir şarkı olmadığı için başarılı bir şekilde player kapatıldı.");
                await client.sendEmbed(message.channel, infoEmbed, true, 3000);
                return;
            }
            else {
                infoEmbed.setDescription("Aktif olarak çalınan bir şarkı bulunmuyor.");
                await client.sendEmbed(message.channel, infoEmbed, true, 3000);
                return;
            }
        }

        infoEmbed.setAuthor('Şarkı Geçme', message.author.avatar ? message.author.avatarURL({
                size: 4096,
                dynamic: true
            }) : null)

        if(player && !player.get("guildSkipVote")) { // ortada bir skip oylaması yoksa
            if(player.queue.current.requester.id == message.author.id) { // oylama açmaya çalışan şarkı sahibiyse

                if(player.queue.size == 0) { // sırada başka şarkı yoksa
                    try {
                        infoEmbed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri})\nŞarkı başarılı bir şekilde geçildi ve inaktiviteden dolayı kanaldan ayrılındı.`);
                        infoEmbed.setThumbnail(player.queue.current.thumbnail);
                        player.stop();
                        player.destroy();
                        await client.sendEmbed(message.channel, infoEmbed, false);
                    } catch (error) {
                        console.log(error)
                        infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`)
                        await client.sendEmbed(message.channel, infoEmbed, false);
                    }
                    return;
                }
                else if(player.queue.size >= 1) { // sırada en az 1 şarkı varsa
                    if(!args.length) { // 1 şarkı geçilmek isteniyorsa
                        try {
                            infoEmbed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri})\nŞarkı başarılı bir şekilde geçildi.`);
                            infoEmbed.setThumbnail(player.queue.current.thumbnail);
                            player.stop();
                            await client.sendEmbed(message.channel, infoEmbed, false);
                        } catch (error) {
                            console.log(error)
                            infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`)
                            await client.sendEmbed(message.channel, infoEmbed, false);
                        }
                        return;
                    }
                    else { // bir veya daha fazla şarkı geçilmek isteniyorsa
                        const skipCount = args[0]
                        const queueTotalSize = player.queue.totalSize
                        if(isNaN(skipCount)) {
                            infoEmbed.setDescription(`Belirttiğin miktar geçerli bir sayı değeri değil!`);
                            await client.sendEmbed(message.channel, infoEmbed, true, 750);
                            return;
                        }

                        if(skipCount >= player.queue.totalSize) { // tüm queue geçilecek şuanki dahil.
                            try {
                                infoEmbed.setDescription(`${queueTotalSize} Adet şarkı başarılı bir şekilde geçildi ve inaktiviteden dolayı kanaldan ayrılındı.`);
                                player.queue.clear()
                                player.stop()
                                player.destroy();
                                await client.sendEmbed(message.channel, infoEmbed, false);
                            } catch (error) {
                                console.log(error)
                                infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`);
                                await client.sendEmbed(message.channel, infoEmbed, false);
                            }
                            return;
                        }
                        else { // şuanki dahil geçilecek şarkı adedi.
                            try {
                                infoEmbed.setDescription(`${skipCount} adet şarkı başarıyla geçildi.`);
                                player.queue.remove(0, skipCount - 1);
                                player.stop()
                                await client.sendEmbed(message.channel, infoEmbed, false);
                            } catch (error) {
                                console.log(error)
                                infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`);
                                await client.sendEmbed(message.channel, infoEmbed, false);
                            }
                            return;
                        }
                    }
                }
            }
            else { // oylama açmaya çalışan şarkı sahibi değilse

                player.set("guildSkipVote", true);
                const queueTotalSize = player.queue.totalSize
                const voiceCh = message.guild.channels.cache.find(ch => ch.id == player.voiceChannel)
                let memberArray = []
                voiceCh.members.map(user => {
                    if(user.id !== client.user.id && user.id !== message.author.id) memberArray.push(user.id)
                })
                let neededVoteCount = voiceCh.members.size - 1;
                neededVoteCount = Math.floor(neededVoteCount / 2) + 1;
                let collectedVote = 1; // author of the message counted.
                
                if(!args.length) { // 1 adet şarkı için oylama.

                    infoEmbed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri})\nİsimli şarkıyı geçmek için **1/${neededVoteCount}** adet oy gerekmekte.\nOy vermek için emojiyi kullanabilirsin.`);
                    const sended = await client.sendEmbed(message.channel, infoEmbed, false);
                    await sended.react('✅')
                    let reactFilter = (reaction, user) => (reaction.emoji.name == '✅') && (memberArray.includes(user.id));

                    const reactCollector = sended.createReactionCollector(reactFilter, {
                        max: neededVoteCount,
                        time: 45000,
                    })

                    reactCollector.on('collect', async (reaction, user) => {
                        collectedVote++;

                        if(!player.get("guildSkipVote")) return reactCollector.stop()
                        infoEmbed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri})\nİsimli şarkıyı geçmek için **${collectedVote}/${neededVoteCount}** adet oy gerekmekte.\nOy vermek için emojiyi kullanabilirsin.`);
                        await sended.edit(infoEmbed);
                        if(collectedVote === neededVoteCount) return reactCollector.stop()
                    })

                    const result = reactCollector.on('end', async (collected) => {
                        if(!player.get("guildSkipVote")) return;

                        if(collectedVote === neededVoteCount) {
                            try {
                                infoEmbed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri})\nİsimli şarkı başarılı bir şekilde geçildi.`);
                                await client.sendEmbed(message.channel, infoEmbed, false);
                                if(player.queue.size == 0) { // sırada hiç şarkı yoksa
                                    player.stop();
                                    player.destroy();
                                }
                                else {
                                    player.stop();
                                }
                            } catch (error) {
                                infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`);
                                await client.sendEmbed(message.channel, infoEmbed, false);
                                console.log(error);
                            }
                            return;
                        }
                        else{
                            player.set("guildSkipVote", false)
                            infoEmbed.setDescription(`Verilen süre içerisinde yeterli oya ulaşılamadığı için oylama sonlandırıldı ve şarkı geçilemedi.`);
                            await client.sendEmbed(message.channel, infoEmbed, false);
                            return;
                        }
                    })
                    return result;
                }
                else { // 1 ve fazlası için oylama
                    const skipCount = args[0];
                    if(isNaN(skipCount)) {
                        infoEmbed.setDescription(`Belirttiğin miktar geçerli bir sayı değeri değil!`);
                        await client.sendEmbed(message.channel, infoEmbed, true, 750);
                        return;
                    }

                    infoEmbed.setDescription(`${skipCount} adet şarkıyı geçmek için **1/${neededVoteCount}** adet oy gerekmekte.\nOy vermek için emojiyi kullanabilirsin.`);
                    const sended = await client.sendEmbed(message.channel, infoEmbed, false);
                    await sended.react('✅')
                    let reactFilter = (reaction, user) => (reaction.emoji.name == '✅') && (memberArray.includes(user.id));

                    const reactCollector = sended.createReactionCollector(reactFilter, {
                        max: neededVoteCount,
                        time: 45000,
                    })

                    reactCollector.on('collect', async (reaction, user) => {
                        collectedVote++;

                        if(!player.get("guildSkipVote")) return reactCollector.stop()
                        infoEmbed.setDescription(`${skipCount} adet şarkıyı geçmek için **${collectedVote}/${neededVoteCount}** adet oy gerekmekte.\nOy vermek için emojiyi kullanabilirsin.`);
                        await sended.edit(infoEmbed);
                        if(collectedVote === neededVoteCount) return reactCollector.stop();
                    })

                    const result = reactCollector.on('end', async (collected) => {
                        if(!player.get("guildSkipVote")) return;

                        if(collectedVote === neededVoteCount) {

                            if(skipCount >= player.queue.totalSize) { // tüm queue geçilecek şuanki dahil.
                                try {
                                    infoEmbed.setDescription(`${player.queue.totalSize} adet şarkı başarılı bir şekilde geçildi.`);
                                    player.queue.clear();
                                    player.stop();
                                    player.destroy();
                                    await client.sendEmbed(message.channel, infoEmbed, false);
                                }
                                catch (error) {
                                    infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`);
                                    await client.sendEmbed(message.channel, infoEmbed, false);
                                    console.log(error)
                                }
                                return;
                            }
                            else { // şuanki dahil geçilecek şarkı adedi.
                                try {
                                    infoEmbed.setDescription(`${skipCount} adet şarkı başarılı bir şekilde geçildi.`);
                                    player.queue.remove(0, skipCount - 1);
                                    player.stop();
                                    await client.sendEmbed(message.channel, infoEmbed, false);
                                }
                                catch (error) {
                                    infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`);
                                    await client.sendEmbed(message.channel, infoEmbed, false);
                                    console.log(error)
                                }
                                return;
                            }
                        }
                        else{
                            player.set("guildSkipVote", false)
                            infoEmbed.setDescription(`Verilen süre içerisinde yeterli oya ulaşılamadığı için oylama sonlandırıldı ve şarkı geçilemedi.`);
                            await client.sendEmbed(message.channel, infoEmbed, false);
                            return;
                        }
                    })
                    return result;
                }
            }
        }
        else if (player && player.get("guildSkipVote")) {
            if(message.author.id === player.queue.current.requester.id) {
                player.set("guildSkipVote", false)
                try {
                    infoEmbed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri})\nŞarkı başarılı bir şekilde geçildi.`);
                    infoEmbed.setThumbnail(player.queue.current.thumbnail);
                    player.stop();
                    await client.sendEmbed(message.channel, infoEmbed, false);
                } catch (error) {
                    console.log(error)
                    infoEmbed.setDescription(`Şarkıyı geçerken bir sorun oluştu.`)
                    await client.sendEmbed(message.channel, infoEmbed, false);
                }
                return;
            }
            else {
                infoEmbed.setDescription(`Aktif olarak bir oylama olduğu için yeni bir oylama başlatılamıyor.`);
                await client.sendEmbed(message.channel, infoEmbed, false);
                return;
            }
        } else return console.log("skip de boşta kalan bir ifade olmalı.")
    }
}