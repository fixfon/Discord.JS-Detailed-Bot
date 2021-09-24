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

        if(!player || player.queue.totalSize == 0) {
            if(message.guild.me.voice.channel) {
                if(player) player.destroy()
                else await message.guild.me.voice.channel.leave()
                await message.inlineReply("Aktif olarak çalınan bir şarkı olmadığı için başarılı bir şekilde kanaldan ayrılındı.");
                return;
            }
            else {
                return message.inlineReply("Aktif olarak çalınan bir şarkı bulunmuyor.")
            }
        }
        if(player.state !== 'CONNECTED') return message.inlineReply("Herhangi bir sesli kanalda olmadığım için bu komutu kullanamazsın.")
        if (!message.member.voice.channel) return message.inlineReply("Bu komutu kullanabilmek için sesli bir kanalda olman gerekmekte.");
        if (message.guild.voice && message.member.voice?.channelID !== message.guild.voice.channelID) {
            if(message.guild.voice.channelID) {
                return message.inlineReply("Bu komutu kullanabilmek için bot ile aynı sesli kanalda bulunman gerekmekte.");
            }
        }

        const infoEmbed = new MessageEmbed()
            .setFooter(client.user.username, client.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setTimestamp()
            .setAuthor('Şarkı Geçme', message.author.avatar ? message.author.avatarURL({
                size: 4096,
                dynamic: true
            }) : null)
            .setColor('#fca103')

        if(player && !player.get("guildSkipVote")) { // ortada bir skip oylaması yoksa
            if(player.queue.current.requester.id == message.author.id) { // oylama açmaya çalışan şarkı sahibiyse

                if(player.queue.size == 0) { // sırada başka şarkı yoksa
                    try {
                        player.stop()
                        player.destroy()
                    } catch (error) {
                        console.log(error)
                    }
                    
                    infoEmbed.setDescription(`[${player.queue.current.title}](${player.queue.current.uri})`)
                    return message.inlineReply("Şarkı başarılı bir şekilde geçildi ve inaktiviteden dolayı kanaldan ayrılındı.").catch(err => console.log(err));
                }
                else if(player.queue.size >= 1) { // sırada en az 1 şarkı varsa
                    if(!args.length) { // 1 şarkı geçilmek isteniyorsa
                        try {
                            player.stop()
                        } catch (error) {
                            console.log(error)
                        }
                        
                        return message.inlineReply("Şarkı başarılı bir şekilde geçildi.").catch(err => console.log(err));
                    }
                    else { // bir veya daha fazla şarkı geçilmek isteniyorsa
                        const skipCount = args[0]
                        const queueTotalSize = player.queue.totalSize
                        if(skipCount >= player.queue.totalSize) { // tüm queue geçilecek şuanki dahil.
                            try {
                                player.queue.clear()
                                player.stop()
                                player.destroy();
                            } catch (error) {
                                console.log(error)
                            }

                            return message.inlineReply(`${queueTotalSize} adet şarkı başarıyla geçildi ve inaktiviteden dolayı kanaldna ayrılındı.`).catch(err => console.log(err));
                        }
                        else { // şuanki dahil geçilecek şarkı adedi.

                            try {
                                player.queue.remove(0, skipCount - 1);
                                player.stop()
                            } catch (error) {
                                console.log(error)
                            }

                            return message.inlineReply(`${skipCount} adet şarkı başarıyla geçildi.`).catch(err => console.log(err));
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

                    const sended = await message.inlineReply(`\`${player.queue.current.title}\` isimli şarkıyı geçmek için **1/${neededVoteCount}** adet oy gerekmekte.\nOy vermek için emojileri kullanabilirsin.`)
                    await sended.react('✅')
                    let reactFilter = (reaction, user) => (reaction.emoji.name == '✅') && (memberArray.includes(user.id));

                    const reactCollector = sended.createReactionCollector(reactFilter, {
                        max: neededVoteCount,
                        time: 45000,
                    })

                    reactCollector.on('collect', async (reaction, user) => {
                        collectedVote++;

                        if(!player.get("guildSkipVote")) return reactCollector.stop()
                        if(collectedVote === neededVoteCount) return reactCollector.stop()

                        await sended.edit(`\`${player.queue.current.title}\` isimli şarkıyı geçmek için **${collectedVote}/${neededVoteCount}** adet oy gerekmekte.\nOy vermek için emojileri kullanabilirsin.`)
                    })

                    const result = reactCollector.on('end', async (collected) => {
                        if(!player.get("guildSkipVote")) return;

                        if(collectedVote === neededVoteCount) {
                            console.log(collected.first().count)
                            try {
                                await message.channel.send(`Oylama sonucu ${player.queue.current.title} isimli şarkı başarılı bir şekilde geçildi.`)
                                if(player.queue.size == 0) { // sırada hiç şarkı yoksa
                                    player.stop()
                                    player.destroy()
                                    return;
                                }
                                else {
                                    player.stop()
                                    return;
                                }
                            } catch (error) {
                                console.log(error)
                                return;
                            }
                        }
                        else{
                            player.set("guildSkipVote", false)
                            await message.channel.send("Verilen süre içerisinde yeterli oya ulaşılamadığı için oylama sonlandırıldı ve şarkı geçilemedi.")
                            return;
                        }
                    })
                    return result;
                }
                else { // 1 ve fazlası için oylama
                    const skipCount = args[0]
                    return
                }

            }
        }
        else if (player && player.get("guildSkipVote")) { // bir skip oylaması varsa hata döndür var olan oylamaya katılmasını iste.

        } else return console.log("skip de boşta kalan bir ifade olmalı.")

    }
}