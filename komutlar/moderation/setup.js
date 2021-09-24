const getUser = require("../../util/getUserFromMention")
require("../../util/inlineReply"); //inlinereply module
const Discord = require('discord.js')
const moment = require("moment");
moment.locale("tr")
const mongo = require('../../database/db')
const GuildSchema = require('../../database/schemas/GuildSchema');
const {
    update
} = require("../../database/schemas/GuildSchema");
const subSettings = ['prefix', 'modRoles', 'autoRole', 'welcomeMessage', 'memberInOutLog', 'messageLog', 'guildLog', 'banKickLog', 'voiceLog', 'excludedChannels', 'excludedCategories', 'musicChannel']

module.exports = {
    name: "setup",
    aliases: ['ayarla', 'kur', 'kurulum', 'settings', 'ayarlar'],
    permLvl: 3,
    guildOnly: true,
    description: "Alfred'in tüm ayarlarını yönetmenizi sağlar.",
    usage: `**setup** veya\nTek bir ayarı değiştirmek için **setup \`${subSettings.join(', ')}\`**`,
    category: "moderation",
    cooldown: 2,
    enabled: true,
    async run(message, args) {
        if (message.channel.type != "text") return message.inlineReply('Bu komut yalnızca sunucu metin kanallarında çalışmaktadır.');

        const client = message.client
        let prefix = client.config.get(message.guild.id).get('prefix')
        const infoEmbed = new Discord.MessageEmbed() //info embed
            .setFooter(message.author.tag, message.author.avatar ? message.author.avatarURL({
                size: 4096,
                dynamic: true
            }) : null)
            .setTimestamp()
            .setColor('#34eb9e')
            .setAuthor('Alfred Kurulum', message.client.user.avatarURL({
                size: 4096,
                dynamic: true
            }));

        const updateEmbed = new Discord.MessageEmbed() // update info embed
            .setFooter(message.author.tag, message.author.avatar ? message.author.avatarURL({
                size: 4096,
                dynamic: true
            }) : null)
            .setTimestamp()
            .setColor('#fca103')
            .setAuthor('Alfred Güncellendi', message.client.user.avatarURL({
                size: 4096,
                dynamic: true
            }));

        if (!args.length) { // entire setup
            const author = message.author.id
            let result;

            if (client.config.get(message.guild.id).get('firstConfig')) { // First configuration
                const info = `Kurulum aşamaları boyunca aşağıdaki seçenekleri sırasıyla ayarlayacağız.\n\n
                1️⃣ Prefix Ayarları\n
                2️⃣ Moderatör Rolleri(Moderatör rolleri ve yönetici yetkisi olanlar, moderasyon komutlarını kullanabilir)\n
                3️⃣ Otomatik Rol Verme\n
                4️⃣ Hoşgeldin Mesajı\n
                5️⃣ Giriş-Çıkış Logu\n
                6️⃣ Mesaj Logu\n
                7️⃣ Sunucu Logları\n
                8️⃣ Ban-Kick Logları\n
                9️⃣ Ses Kanal Logu\n
                🔟 Müzik Komut Kanalı\n`
                infoEmbed.setTitle(`Alfred Kurulumuna Hoşgeldin`)
                infoEmbed.setDescription(info);

                const sended1 = await client.sendEmbed(message.channel, infoEmbed, false)
                await sended1.react('✅')
                await sended1.react('⛔')
                let reactFilter = (reaction, user) => (reaction.emoji.name == '✅') || (reaction.emoji.name == '⛔') && (user.id == message.author.id);

                result = await sended1.awaitReactions(reactFilter, {
                        max: 1,
                        time: 30000
                    })
                    .then(collected => {
                        if (collected.first().emoji.name == '⛔') {
                            sended1.delete()
                            message.channel.send(`Kurulum sonlandırıldı. Kurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false
                        }
                        return true;
                    })
                    .catch(err => {
                        if (err) {
                            sended1.delete()
                            message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false

                        }
                    });

                if (!result) return;

                infoEmbed.setTitle(`Prefix Ayarları`) // // PREFIX
                infoEmbed.setDescription(`➡️ **Alfred'in Güncel Prefix'i: *${prefix}***\n\nAyarlamak istediğin Prefix'i yazabilir, aynı kalmasını istiyorsan güncel Prefix'i belirtebilirsin.`);

                const sended2 = await client.sendEmbed(message.channel, infoEmbed, false);
                let msgFilter = msg => msg.author.id === author;

                result = await message.channel.awaitMessages(msgFilter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    })
                    .then(async (collected) => {
                        const arg = collected.first().content.trim().split(/ +/);
                        if (!arg.length) return false
                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            prefix: arg[0]
                        }, {
                            upsert: true
                        }).then(olderConfig => {
                            updateEmbed.setDescription(`**Eski Prefix:** ${olderConfig.get('prefix')}\n**Yeni Prefix:** ${arg[0]}`)
                            sended2.delete()
                            client.sendEmbed(message.channel, updateEmbed, true, 6000)
                        }).catch(err => console.log(err))
                        client.config.get(message.guild.id).set('prefix', arg[0])
                        prefix = client.config.get(message.guild.id).get('prefix')
                        return true;
                    })
                    .catch(err => {
                        if (err) {
                            sended2.delete()
                            message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false
                        }
                    });

                if (!result) return;

                infoEmbed.setTitle(`Moderatör Rolleri`) // // MODROLES
                let infoArray = client.config.get(message.guild.id).get('modRoles').length ? client.config.get(message.guild.id).get('modRoles') : 'Yok';
                
                if (infoArray != 'Yok') {
                    if (client.config.get(message.guild.id).get('modRolesArray')) {
                        infoArray = client.config.get(message.guild.id).get('modRolesArray')
                    } else {
                        
                            if(Array.isArray(infoArray)){
                                infoArray.forEach((role, index, arr) => {
                                    if(!role.startsWith('<@&')) arr[index] = `<@&${arr[index]}>`
                                })
                            }else{
                                infoArray = `<@&${infoArray}>`
                            }
                        
                        client.config.get(message.guild.id).set('modRolesArray', infoArray)
                    }
                }

                infoEmbed.setDescription(`Moderatör rolleri sunucudaki moderasyon komutlarını kullanabilecek kişilerdir. Bu komutları ayrıca yönetici yetkisi olan kişiler de kullanabilir.\n
                ➡️ **Moderatör Rolleri:** ${Array.isArray(infoArray) ? infoArray.join(', ') : infoArray}\n
                Moderatör rollerini akfitleştirmek istiyor musun?`);

                const sended3 = await client.sendEmbed(message.channel, infoEmbed, false);
                await sended3.react('✅')
                await sended3.react('⛔')

                result = await sended3.awaitReactions(reactFilter, {
                        max: 1,
                        time: 30000
                    })
                    .then(async (collected) => {
                        if (collected.first().emoji.name == '⛔') {
                            await GuildSchema.findOneAndUpdate({
                                _id: message.guild.id
                            }, {
                                modRoles: [],
                            }, {
                                upsert: true
                            }).then(async (olderConfig) => {
                                sended3.delete()
                                updateEmbed.setDescription(`Moderatör rolleri kapatıldı.`)
                                await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                            }).catch(err => console.log(err))
                            client.config.get(message.guild.id).set('modRoles', [])
                            return '⛔'
                        }
                        sended3.delete()
                        return true;
                    })
                    .catch(err => {
                        if (err) {
                            sended3.delete()
                            message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false

                        }
                    });

                if (!result) return;
                if (result != '⛔') {
                    updateEmbed.setDescription(`Seçilen moderatör rollerinin tümünü etiketleyin...`)
                    const update1 = await client.sendEmbed(message.channel, updateEmbed, false)

                    result = await message.channel.awaitMessages(msgFilter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(async (collected) => {
                            const roleArray = [];
                            collected.first().mentions.roles.forEach(role => {
                                roleArray.push(role.id)
                            })
                            if (!roleArray.length) {
                                update1.delete()
                                message.channel.send(`Belirtilen süre içerisinde moderatör rolleri etiketlenmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                                return false;
                            }

                            await GuildSchema.findOneAndUpdate({
                                _id: message.guild.id
                            }, {
                                modRoles: roleArray
                            }, {
                                upsert: true
                            }).then(async(olderConfig) => {
                                update1.delete()
                                if(Array.isArray(roleArray)){
                                    roleArray.forEach((role, index, arr) => {
                                        arr[index] = `<@&${arr[index]}>`
                                    })
                                }
                                updateEmbed.setDescription(`**Eski Moderatör Rolleri:** ${Array.isArray(infoArray) ? infoArray.join(', ') : infoArray}\n**Yeni Moderatör Rolleri:** ${Array.isArray(roleArray) ? roleArray.join(', ') : '<@&' + roleArray}`)
                                await client.sendEmbed(message.channel, updateEmbed, true, 6000)
                            }).catch(err => console.log(err));
                            client.config.get(message.guild.id).set('modRoles', roleArray)
                            return true
                        })
                        .catch(err => {
                            if (err) {
                                console.log(err)
                                update1.delete()
                                message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                                return false
                            }
                        });

                    if (!result) return;
                }
                infoEmbed.setTitle('Otomatik Rol') // // AUTOROLE
                infoEmbed.setDescription(`Sunucuya yeni katılan üyelere otomatik olarak belirlediğin rol verilir.\n
                ➡️ **Otomatik Verilecek Rol:** ${client.config.get(message.guild.id).get('autoRole').get('roleID') ? '<@&' + client.config.get(message.guild.id).get('autoRole').get('roleID') + '>' : 'Yok'}\n
                Otomatik rol sistemi aktifleştirilsin mi?`)

                const sended4 = await client.sendEmbed(message.channel, infoEmbed, false)
                await sended4.react('✅')
                await sended4.react('⛔')

                result = await sended4.awaitReactions(reactFilter, {
                        max: 1,
                        time: 30000
                    })
                    .then(async (collected) => {
                        if (collected.first().emoji.name == '⛔') {
                            await GuildSchema.findOneAndUpdate({
                                _id: message.guild.id
                            }, {
                                'autoRole.enabled': false
                            }, {
                                
                            }).then(async (olderConfig) => {
                                sended4.delete()
                                updateEmbed.setDescription(`Otomatik rol verme kapatıldı.`)
                                await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                            }).catch(err => console.log(err))
                            client.config.get(message.guild.id).get('autoRole').enabled = false
                            return '⛔'
                        }
                        sended4.delete()
                        return true;
                    })
                    .catch(err => {
                        if (err) {
                            sended4.delete()
                            message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false
                        }
                    });

                if (!result) return;
                if (result != '⛔') {
                    updateEmbed.setDescription(`Otomatik olarak verilecek rolü etiketleyin...`)
                    const update2 = await client.sendEmbed(message.channel, updateEmbed, false)

                    result = await message.channel.awaitMessages(msgFilter, {
                        max: 1,
                        time: 45000,
                        errors: ['time']
                    }).then(async (collected) => {
                        const roleID = collected.first().mentions.roles.first().id
                        if (!roleID) {
                            update2.delete()
                            message.channel.send(`Herhangi bir rol etiketlenmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false;
                        }

                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            autoRole: {
                                enabled: true,
                                roleID
                            }
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            update2.delete()
                            updateEmbed.setDescription(`**Otomatik Rol** <@&${roleID}> olarak ayarlandı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 6000)
                        }).catch(err => console.log(err))
                        client.config.get(message.guild.id).get('autoRole').roleID = roleID
                        client.config.get(message.guild.id).get('autoRole').enabled = true
                        return true;
                    }).catch(err => {
                        if (err) {
                            console.log(err)
                            update2.delete()
                            message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false
                        }
                    })
                    if (!result) return
                }

                infoEmbed.setTitle('Hoşgeldin Mesajı') // WELCOME MESSAGE
                infoEmbed.setDescription(`Sunucuya yeni katılan üyeler için belirlediğiniz kanala hoşgeldin mesajı gönderilir.\n
                **Hoşgeldin Kanalı:** ${client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').channelID ? '<#' + client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').channelID + '>' : 'Yok'}\n
                **Hoşgeldin Mesajı:** ${client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').message ? '```' + client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').message + '```' : 'Yok'}\n
                Hoşgeldin mesaj sistemi aktifleştirilsin mi?`)

                const sended5 = await client.sendEmbed(message.channel, infoEmbed, false)
                await sended5.react('✅')
                await sended5.react('⛔')

                result = await sended5.awaitReactions(reactFilter, {
                    max: 1,
                    time: 30000
                })
                .then(async(collected) => {
                    if (collected.first().emoji.name == '⛔') {
                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            'logEvents.welcomeMessage.enabled' : false
                        }, {
                            
                        }).then(async (olderConfig) => {
                            sended5.delete()
                            updateEmbed.setDescription(`Hoşgeldin mesajı kapatıldı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                        }).catch(err => console.log(err))
                        client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').enabled = false
                        return '⛔'
                    }
                    sended5.delete()
                    return true;
                })
                .catch(err => {
                    if (err) {
                        sended5.delete()
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        return false
                    }
                });

                if (!result) return;
                if(result != '⛔') {
                    updateEmbed.setDescription('Hoşgeldin mesajı için mesajın gönderileceği kanalı etiketleyip gönderilecek mesajı yazın...')
                    const update3 = await client.sendEmbed(message.channel, updateEmbed, false)

                    result = await message.channel.awaitMessages(msgFilter, {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }).then(async (collected) => {
                        const channelID = collected.first().mentions.channels.first().id
                        if (!channelID) {
                            update3.delete()
                            message.channel.send(`Herhangi bir kanal etiketlenmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false;
                        }
                        const args = collected.first().content.slice(channelID.length + 3).trim().split(/ +/);
                        if(!args){
                            update3.delete()
                            message.channel.send(`Herhangi bir mesaj yazılmadığı için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false;
                        }

                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            'logEvents.welcomeMessage.enabled': true,
                            'logEvents.welcomeMessage.message': args.join(' '),
                            'logEvents.welcomeMessage.channelID': channelID,
                        }, {
                            
                        }).then(async (olderConfig) => {
                            update3.delete()
                            updateEmbed.setDescription(`**Hoşgeldin Mesaj Kanalı:** <#${channelID}>\n
                            **Hoşgeldin Mesajı:** \`\`\`${args.join(' ')}\`\`\` olarak ayarlandı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 9000)
                        }).catch(err => console.log(err))

                        client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').enabled = true
                        client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').message = args.join(' ')
                        client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').channelID = channelID
                        return true
                    }).catch(err => {
                        if(err){
                            update3.delete()
                            console.log(err)
                            return false
                        }
                    })
                    if (!result) return
                }

                infoEmbed.setTitle('Log Kanalları') // LOG CHANNELS
                infoEmbed.setDescription(`Sunucudaki her bir logun gönderileceği kanalı ayarlar.\n
                Log sistemini aktifleştirmek istiyor musun?`)
                const sended6 = await client.sendEmbed(message.channel, infoEmbed, false)
                await sended6.react('✅')
                await sended6.react('⛔')

                result = await sended6.awaitReactions(reactFilter, {
                    max: 1,
                    time: 30000
                })
                .then(async(collected) => {
                    if (collected.first().emoji.name == '⛔') {
                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            'logEvents.memberInOutLog.enabled': false,
                            'logEvents.messageLog.enabled': false,
                            'logEvents.guildLog.enabled': false,
                            'logEvents.banKickLog.enabled': false,
                            'logEvents.voiceLog.enabled': false,
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            sended6.delete()
                            updateEmbed.setDescription(`Log sistemi kapatıldı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                        }).catch(err => console.log(err))
                        client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').enabled = false
                        client.config.get(message.guild.id).get('logEvents').get('messageLog').enabled = false
                        client.config.get(message.guild.id).get('logEvents').get('guildLog').enabled = false
                        client.config.get(message.guild.id).get('logEvents').get('banKickLog').enabled = false
                        client.config.get(message.guild.id).get('logEvents').get('voiceLog').enabled = false

                        // console.log(client.config.get(message.guild.id).get('logEvents').get('voiceLog').enabled)
                        // console.log(client.config.get(message.guild.id).get('logEvents').get('voiceLog'))
                        return '⛔'
                    }
                    sended6.delete()
                    return true;
                })
                .catch(err => {
                    if (err) {
                        sended6.delete()
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        return false
                    }
                });

                if (!result) return;
                if(result != '⛔'){
                    infoEmbed.setTitle('Log Kanalları')
                    infoEmbed.setDescription(`
                    Tüm log kanallarının otomatik ayarlanmasını istiyor musun?\n
                    ➡️ Sunucuya Katılma - Ayrılma Logu\n
                    ➡️ Mesaj Logları\n
                    ➡️ Sunucu Logları\n
                    ➡️ Ban - Kick Logları\n
                    ➡️ Sesli Kanal Logları\n
                    (Eğer bu seçenek seçilmezse tüm log kanalları için sırasıyla ayar yapılacak.)`)
                    const sended7 = await client.sendEmbed(message.channel, infoEmbed, false)
                    await sended7.react('✅')
                    await sended7.react('⛔')

                    result = await sended7.awaitReactions(reactFilter, {
                        max: 1,
                        time: 30000
                    }).then(async (collected) => {
                        if(collected.first().emoji.name == '✅'){
                            return '✅'
                        }
                        else if(collected.first().emoji.name == '⛔'){
                            return '⛔'
                        }
                    }).catch(err => {
                        if(err){
                            sended7.delete()
                            message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                            return false
                        }
                    })
                    if(!result) return
                    if (result == '✅'){
                        sended7.delete()
                        const chArray = []
                        await message.guild.channels.create('LOG', {
                            type: 'category',
                            permissionOverwrites: [
                                {
                                    id: message.guild.id,
                                    deny: ['VIEW_CHANNEL'],
                                }
                            ],
                        }).then(async (cat) => {
                            await message.guild.channels.create('Giriş-Çıkış-Log', {
                                type: 'text',
                                parent: cat.id,
                            }).then(ch => {
                                ch.lockPermissions()
                                chArray.push(ch.id)
                            }).catch(err => console.log(err))
                            await message.guild.channels.create('Ban-Kick-Log', {
                                type: 'text',
                                parent: cat.id,
                            }).then(ch => {
                                ch.lockPermissions()
                                chArray.push(ch.id)
                            }).catch(err => console.log(err))
                            await message.guild.channels.create('Sesli-Kanal-Log', {
                                type: 'text',
                                parent: cat.id,
                            }).then(ch => {
                                ch.lockPermissions()
                                chArray.push(ch.id)
                            }).catch(err => console.log(err))
                            await message.guild.channels.create('Mesaj-Log', {
                                type: 'text',
                                parent: cat.id,
                            }).then(ch => {
                                ch.lockPermissions()
                                chArray.push(ch.id)
                            }).catch(err => console.log(err))
                            await message.guild.channels.create('Sunucu-Log', {
                                type: 'text',
                                parent: cat.id,
                            }).then(ch => {
                                ch.lockPermissions()
                                chArray.push(ch.id)
                            }).catch(err => console.log(err))
                        }).catch(err => console.log(err))
                        
                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            'logEvents.memberInOutLog.enabled': true,
                            'logEvents.memberInOutLog.channelID': chArray[0],

                            'logEvents.banKickLog.enabled': true,
                            'logEvents.banKickLog.channelID': chArray[1],

                            'logEvents.voiceLog.enabled': true,
                            'logEvents.voiceLog.channelID': chArray[2],

                            'logEvents.messageLog.enabled': true,
                            'logEvents.messageLog.channelID': chArray[3],

                            'logEvents.guildLog.enabled': true,
                            'logEvents.guildLog.channelID': chArray[4],
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            updateEmbed.setDescription(`Log kanalları ayarlandı.\n
                            ➡️ Sunucuya Katılma - Ayrılma Logu <#${chArray[0]}>\n
                            ➡️ Ban - Kick Logları <#${chArray[1]}>\n
                            ➡️ Sesli Kanal Logları <#${chArray[2]}>\n
                            ➡️ Mesaj Logları <#${chArray[3]}>\n
                            ➡️ Sunucu Logları <#${chArray[4]}>`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 6000)

                            client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').enabled = true
                            client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').channelID = chArray[0]

                            client.config.get(message.guild.id).get('logEvents').get('banKickLog').enabled = true
                            client.config.get(message.guild.id).get('logEvents').get('banKickLog').channelID = chArray[1]

                            client.config.get(message.guild.id).get('logEvents').get('voiceLog').enabled = true
                            client.config.get(message.guild.id).get('logEvents').get('voiceLog').channelID = chArray[2]

                            client.config.get(message.guild.id).get('logEvents').get('messageLog').enabled = true
                            client.config.get(message.guild.id).get('logEvents').get('messageLog').channelID = chArray[3]

                            client.config.get(message.guild.id).get('logEvents').get('guildLog').enabled = true
                            client.config.get(message.guild.id).get('logEvents').get('guildLog').channelID = chArray[4]
                        }).catch(err => console.log(err))
                    } else if(result == '⛔') {
                        sended7.delete()

                        infoEmbed.setTitle('Log Kanalları')
                        infoEmbed.setDescription(`Sunucuya Katılma - Ayrılma loglarını aktifleştirmek istiyor musun?`)
                        const sended8 = await client.sendEmbed(message.channel, infoEmbed, false)
                        await sended8.react('✅')
                        await sended8.react('⛔')

                        result = await sended8.awaitReactions(reactFilter, {
                            max: 1,
                            time: 30000
                        })
                        .then(async(collected) => {
                            if (collected.first().emoji.name == '⛔') {
                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.memberInOutLog.enabled': false,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) => {
                                    sended8.delete()
                                    updateEmbed.setDescription(`Sunucuya Katılma - Ayrılma logları kapatıldı.`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                }).catch(err => console.log(err))
                                client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').enabled = false
                                return '⛔'
                            }
                            sended8.delete()
                            return true;
                        })
                        .catch(err => {
                            if (err) {
                                sended8.delete()
                                message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                                return false
                            }
                        });

                        if(!result) return

                        let catID;
                        if(result != '⛔'){                            
                            await message.guild.channels.create('LOG', {
                                type: 'category',
                                permissionOverwrites: [
                                    {
                                        id: message.guild.id,
                                        deny: ['VIEW_CHANNEL'],
                                    }
                                ],
                            }).then(async (cat) => {
                                catID = cat.id

                                await message.guild.channels.create('Giriş-Çıkış-Log', {
                                    type: 'text',
                                    parent: catID,
                                }).then(async (ch) => {
                                    ch.lockPermissions()

                                    await GuildSchema.findOneAndUpdate({
                                        _id: message.guild.id
                                    }, {
                                        'logEvents.memberInOutLog.enabled': true,
                                        'logEvents.memberInOutLog.channelID': ch.id,
                                    }, {
                                        upsert: true
                                    }).then(async (olderConfig) =>{
                                        updateEmbed.setDescription(`Sunucuya Katılma - Ayrılma logları etkinleştirildi.\n
                                        Log Kanalı: <#${ch.id}>`)
                                        await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                        client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').enabled = true
                                        client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').channelID = ch.id
                                    }).catch(err => console.log(err))
                                }).catch(err => console.log(err))
                            }).catch(err => console.log(err))
                        }

                        infoEmbed.setTitle('Log Kanalları')
                        infoEmbed.setDescription(`Mesaj loglarını aktifleştirmek istiyor musun?`)
                        const sended9 = await client.sendEmbed(message.channel, infoEmbed, false)
                        await sended9.react('✅')
                        await sended9.react('⛔')

                        result = await sended9.awaitReactions(reactFilter, {
                            max: 1,
                            time: 30000
                        })
                        .then(async (collected) => {
                            if (collected.first().emoji.name == '⛔') {
                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.messageLog.enabled': false,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) => {
                                    sended9.delete()
                                    updateEmbed.setDescription(`Mesaj logları kapatıldı.`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                }).catch(err => console.log(err))
                                client.config.get(message.guild.id).get('logEvents').get('messageLog').enabled = false
                                return '⛔'
                            }
                            sended9.delete()
                            return true;
                        })
                        .catch(err => {
                            if (err) {
                                sended9.delete()
                                message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                                return false
                            }
                        });

                        if(!result) return

                        if(result != '⛔'){
                            if(!catID){
                                await message.guild.channels.create('LOG', {
                                    type: 'category',
                                    permissionOverwrites: [
                                        {
                                            id: message.guild.id,
                                            deny: ['VIEW_CHANNEL'],
                                        }
                                    ],
                                }).then(async (cat) => {
                                    catID = cat.id
                                })
                            }
                            await message.guild.channels.create('Mesaj-Log', {
                                type: 'text',
                                parent: catID,
                            }).then(async (ch) => {
                                ch.lockPermissions()

                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.messageLog.enabled': true,
                                    'logEvents.messageLog.channelID': ch.id,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) =>{
                                    updateEmbed.setDescription(`Mesaj logları etkinleştirildi.\n
                                    Log Kanalı: <#${ch.id}>`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                    client.config.get(message.guild.id).get('logEvents').get('messageLog').enabled = true
                                    client.config.get(message.guild.id).get('logEvents').get('messageLog').channelID = ch.id
                                }).catch(err => console.log(err))
                            }).catch(err => console.log(err))
                        }

                        infoEmbed.setTitle('Log Kanalları')
                        infoEmbed.setDescription(`Sunucu loglarını aktifleştirmek istiyor musun?`)
                        const sended10 = await client.sendEmbed(message.channel, infoEmbed, false)
                        await sended10.react('✅')
                        await sended10.react('⛔')

                        result = await sended10.awaitReactions(reactFilter, {
                            max: 1,
                            time: 30000
                        })
                        .then(async (collected) => {
                            if (collected.first().emoji.name == '⛔') {
                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.guildLog.enabled': false,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) => {
                                    sended10.delete()
                                    updateEmbed.setDescription(`Sunucu logları kapatıldı.`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                }).catch(err => console.log(err))
                                client.config.get(message.guild.id).get('logEvents').get('guildLog').enabled = false
                                return '⛔'
                            }
                            sended10.delete()
                            return true;
                        })
                        .catch(err => {
                            if (err) {
                                sended10.delete()
                                message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                                return false
                            }
                        });

                        if(!result) return

                        if(result != '⛔'){
                            if(!catID){
                                await message.guild.channels.create('LOG', {
                                    type: 'category',
                                    permissionOverwrites: [
                                        {
                                            id: message.guild.id,
                                            deny: ['VIEW_CHANNEL'],
                                        }
                                    ],
                                }).then(async (cat) => {
                                    catID = cat.id
                                })
                            }
                            await message.guild.channels.create('Sunucu-Log', {
                                type: 'text',
                                parent: catID,
                            }).then(async (ch) => {
                                ch.lockPermissions()

                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.guildLog.enabled': true,
                                    'logEvents.guildLog.channelID': ch.id,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) =>{
                                    updateEmbed.setDescription(`Sunucu logları etkinleştirildi.\n
                                    Log Kanalı: <#${ch.id}>`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                    client.config.get(message.guild.id).get('logEvents').get('guildLog').enabled = true
                                    client.config.get(message.guild.id).get('logEvents').get('guildLog').channelID = ch.id
                                }).catch(err => console.log(err))
                            }).catch(err => console.log(err))
                        }

                        infoEmbed.setTitle('Log Kanalları')
                        infoEmbed.setDescription(`Ban - Kick loglarını aktifleştirmek istiyor musun?`)
                        const sended11 = await client.sendEmbed(message.channel, infoEmbed, false)
                        await sended11.react('✅')
                        await sended11.react('⛔')

                        result = await sended11.awaitReactions(reactFilter, {
                            max: 1,
                            time: 30000
                        })
                        .then(async (collected) => {
                            if (collected.first().emoji.name == '⛔') {
                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.banKickLog.enabled': false,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) => {
                                    sended11.delete()
                                    updateEmbed.setDescription(`Ban - Kick logları kapatıldı.`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                }).catch(err => console.log(err))
                                client.config.get(message.guild.id).get('logEvents').get('banKickLog').enabled = false
                                return '⛔'
                            }
                            sended11.delete()
                            return true;
                        })
                        .catch(err => {
                            if (err) {
                                sended11.delete()
                                message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                                return false
                            }
                        });

                        if(!result) return

                        if(result != '⛔'){
                            if(!catID){
                                await message.guild.channels.create('LOG', {
                                    type: 'category',
                                    permissionOverwrites: [
                                        {
                                            id: message.guild.id,
                                            deny: ['VIEW_CHANNEL'],
                                        }
                                    ],
                                }).then(async (cat) => {
                                    catID = cat.id
                                })
                            }
                            await message.guild.channels.create('Ban-Kick-Log', {
                                type: 'text',
                                parent: catID,
                            }).then(async (ch) => {
                                ch.lockPermissions()

                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.banKickLog.enabled': true,
                                    'logEvents.banKickLog.channelID': ch.id,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) =>{
                                    updateEmbed.setDescription(`Ban - Kick logları etkinleştirildi.\n
                                    Log Kanalı: <#${ch.id}>`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                    client.config.get(message.guild.id).get('logEvents').get('banKickLog').enabled = true
                                    client.config.get(message.guild.id).get('logEvents').get('banKickLog').channelID = ch.id
                                }).catch(err => console.log(err))
                            }).catch(err => console.log(err))
                        }

                        infoEmbed.setTitle('Log Kanalları')
                        infoEmbed.setDescription(`Sesli Kanal loglarını aktifleştirmek istiyor musun?`)
                        const sended12 = await client.sendEmbed(message.channel, infoEmbed, false)
                        await sended12.react('✅')
                        await sended12.react('⛔')

                        result = await sended12.awaitReactions(reactFilter, {
                            max: 1,
                            time: 30000
                        })
                        .then(async(collected) => {
                            if (collected.first().emoji.name == '⛔') {
                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.voiceLog.enabled': false,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) => {
                                    sended12.delete()
                                    updateEmbed.setDescription(`Sesli Kanal logları kapatıldı.`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                }).catch(err => console.log(err))
                                client.config.get(message.guild.id).get('logEvents').get('voiceLog').enabled = false
                                return '⛔'
                            }
                            sended12.delete()
                            return true;
                        })
                        .catch(err => {
                            if (err) {
                                sended12.delete()
                                message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                                return false
                            }
                        });

                        if(!result) return

                        if(result != '⛔'){
                            if(!catID){
                                await message.guild.channels.create('LOG', {
                                    type: 'category',
                                    permissionOverwrites: [
                                        {
                                            id: message.guild.id,
                                            deny: ['VIEW_CHANNEL'],
                                        }
                                    ],
                                }).then(async (cat) => {
                                    catID = cat.id
                                })
                            }
                            await message.guild.channels.create('Sesli-Kanal-Log', {
                                type: 'text',
                                parent: catID,
                            }).then(async (ch) => {
                                ch.lockPermissions()

                                await GuildSchema.findOneAndUpdate({
                                    _id: message.guild.id
                                }, {
                                    'logEvents.voiceLog.enabled': true,
                                    'logEvents.voiceLog.channelID': ch.id,
                                }, {
                                    upsert: true
                                }).then(async (olderConfig) =>{
                                    updateEmbed.setDescription(`Sesli Kanal logları etkinleştirildi.\n
                                    Log Kanalı: <#${ch.id}>`)
                                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                                    client.config.get(message.guild.id).get('logEvents').get('voiceLog').enabled = true
                                    client.config.get(message.guild.id).get('logEvents').get('voiceLog').channelID = ch.id
                                }).catch(err => console.log(err))
                            }).catch(err => console.log(err))
                        }
                    }
                }

                infoEmbed.setTitle('Dışlanmış Kanal ve Kategoriler') // Excluded Channels and Categories.
                infoEmbed.setDescription(`Sunucudaki logları tutulmayacak kanal veya kategorileri belirler.\n
                Logları tutulmayacak kategorileri belirtmek istiyor musun?`)
                const sended13 = await client.sendEmbed(message.channel, infoEmbed, false)
                await sended13.react('✅')
                await sended13.react('⛔')

                result = await sended13.awaitReactions(reactFilter, {
                    max: 1,
                    time: 30000
                })
                .then(async (collected) => {
                    if (collected.first().emoji.name == '⛔') {
                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            excludedCategories : []
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            sended13.delete()
                            updateEmbed.setDescription(`Dışlanmış kategoriler kapatıldı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                        }).catch(err => console.log(err))
                        client.config.get(message.guild.id).set('excludedCategories', [])
                        return '⛔'
                    }
                    sended13.delete()
                    return true;
                })
                .catch(err => {
                    if (err) {
                        sended13.delete()
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        return false
                    }
                });

                if (!result) return;
                if (result != '⛔'){
                    
                    updateEmbed.setDescription(`Logları tutulmayacak kategorilerin ID'lerini yazınız...\n(Bu kategorilerin altında bulunan hiç bir kanalın logu tutulmayacaktır.)`)
                    const update4 = await client.sendEmbed(message.channel, updateEmbed, false)

                    result = await message.channel.awaitMessages(msgFilter, {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }).then(async (collected) => {
                        const arg = collected.first().content.trim().split(/ +/)
                        const catArray = []
                        const tempArray = Array.from(message.guild.channels.cache.values())

                        Loop1:
                        for (let i = 0; i < arg.length; i++) {

                            Loop2:
                            for (let j = 0; j < tempArray.length; j++) {
                                tempArray[2]
                                if(tempArray[j].parentID == arg[i]){
                                    catArray.push(arg[i])
                                    continue Loop1;
                                }
                            }
                            
                        }
                        // Loop1:
                        // arg.forEach(catID => {
                        //     console.log(catID)
                        //     Loop2:
                        //     message.guild.channels.cache.forEach(channel => {
                        //         if(channel.parentID == catID) {
                        //             catArray.push(catID)
                        //             continue Loop1;
                        //         }
                        //     })
                        // })

                        if(!catArray.length) {
                            message.channel.send(`Belirtilen ID'ler sunucu üzerindeki kategori ID'leri ile eşleşmediği için herhangi bir kategori kaydedilemedi. Daha sonra dışlanan kategorileri ayarlayabilirsin.`)
                            update4.delete()
                            return true
                        }

                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            excludedCategories: catArray
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            
                            updateEmbed.setDescription(`**Dışlanan Kategori ID'leri:**\n${catArray.join(' ')}\nOlarak ayarlandı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 5000)
                            client.config.get(message.guild.id).set('excludedCategories', catArray)
                            update4.delete()
                        }).catch(err => console.log(err))
                        
                        return true
                    }).catch(err => {
                        console.log(err)
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        update4.delete()
                        return false
                    })

                    if(!result) return
                }

                infoEmbed.setTitle('Dışlanmış Kanal ve Kategoriler') // Excluded Channels and Categories.
                infoEmbed.setDescription(`Sunucudaki logları tutulmayacak kanal veya kategorileri belirler.\n
                Logları tutulmayacak kanalları belirtmek istiyor musun?`)
                const sended14 = await client.sendEmbed(message.channel, infoEmbed, false)
                await sended14.react('✅')
                await sended14.react('⛔')

                result = await sended14.awaitReactions(reactFilter, {
                    max: 1,
                    time: 30000
                })
                .then(async(collected) => {
                    if (collected.first().emoji.name == '⛔') {
                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            excludedChannels : []
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            updateEmbed.setDescription(`Dışlanmış kanallar kapatıldı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                            sended14.delete()
                        }).catch(err => console.log(err))
                        client.config.get(message.guild.id).set('excludedChannels', [])
                        return '⛔'
                    }
                    sended14.delete()
                    return true;
                })
                .catch(err => {
                    if (err) {
                        sended14.delete()
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        return false
                    }
                });

                if (!result) return;
                if (result != '⛔'){
                    
                    updateEmbed.setDescription(`Logları tutulmayacak kanalları etiketleyin...`)
                    const update5 = await client.sendEmbed(message.channel, updateEmbed, false)

                    result = await message.channel.awaitMessages(msgFilter, {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }).then(async (collected) => {
                        const chList = []
                        collected.first().mentions.channels.forEach(ch => {
                            chList.push(ch.id)
                        })

                        if(!chList.length) {
                            
                            message.channel.send(`Etiketlenen kanal olmadığı için dışlanan kanallar kapatıldı. Daha sonra dışlanmış kanalları ayarlayabilirsin.`)
                            update5.delete()
                            return true
                        }

                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            excludedChannels: chList
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            
                            client.config.get(message.guild.id).set('excludedChannels', chList)
                            chList.forEach((ch, index, arr) => {
                                arr[index] = `<#${arr[index]}>`
                            })
                            updateEmbed.setDescription(`**Dışlanan Kanallar:**\n${chList.join(', ')}\nOlarak ayarlandı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 5000)
                            update5.delete()
                        }).catch(err => console.log(err))
                        
                        return true
                    }).catch(err => {
                        console.log(err)
                        update5.delete()
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        return false
                    })

                    if(!result) return
                }

                infoEmbed.setTitle('Müzik Komut Kanalları') // Music Sets.
                infoEmbed.setDescription(`Müzik komutlarının kullanılabileceği kanalı belirler.\n
                Müzik komut kanalını belirlemek istiyor musun? (Belirlenmezse tüm yazılı kanallarda müzik komutları kullanılabilir.)`)
                const sended15 = await client.sendEmbed(message.channel, infoEmbed, false)
                await sended15.react('✅')
                await sended15.react('⛔')

                result = await sended15.awaitReactions(reactFilter, {
                    max: 1,
                    time: 30000
                })
                .then(async(collected) => {
                    if (collected.first().emoji.name == '⛔') {
                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            'musicSets.commandChannelID.channelID' : null
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            
                            updateEmbed.setDescription(`Müzik komut kanalı kapatıldı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                            sended15.delete()
                        }).catch(err => console.log(err))
                        client.config.get(message.guild.id).get('musicSets').get('commandChannelID').channelID = null
                        return '⛔'
                    }
                    sended15.delete()
                    return true;
                })
                .catch(err => {
                    if (err) {
                        sended15.delete()
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        return false
                    }
                });

                if (!result) return;
                if (result != '⛔'){
                    updateEmbed.setDescription(`Müzik komut kanalını etiketleyin...`)
                    const update6 = await client.sendEmbed(message.channel, updateEmbed, false)

                    result = await message.channel.awaitMessages(msgFilter, {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }).then(async (collected) => {
                        const chID = collected.first().mentions.channels.first().id

                        if(!chID) {
                            
                            message.channel.send(`Etiketlenen kanal olmadığı için müzik komut kanalı kapatıldı. Daha sonra müzik komut kanalını ayarlayabilirsin.`)
                            update6.delete()
                            return true
                        }

                        await GuildSchema.findOneAndUpdate({
                            _id: message.guild.id
                        }, {
                            'musicSets.commandChannelID.channelID' : chID
                        }, {
                            upsert: true
                        }).then(async (olderConfig) => {
                            
                            client.config.get(message.guild.id).get('musicSets').get('commandChannelID').channelID = chID
                            console.log(client.config.get(message.guild.id).get('musicSets').get('commandChannelID').channelID)
                            updateEmbed.setDescription(`**Müzik Komut Kanalı:**\n<#${chID}>\nOlarak ayarlandı.`)
                            await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                            update6.delete()
                        }).catch(err => console.log(err))
                        
                        return true
                    }).catch(err => {
                        console.log(err)
                        update6.delete()
                        message.channel.send(`Belirtilen süre içerisinde tepki verilmediği için kurulum sonlandırıldı.\nKurulumu tekrar yapmak için **${prefix}setup** komutunu, tüm komutlar için **${prefix}help** komutunu kullanabilirsin.`)
                        return false
                    })

                    if(!result) return
                }

                await GuildSchema.findOneAndUpdate({
                    _id: message.guild.id
                },{
                    firstConfig: false,
                }, {
                    upsert: true
                }).then(async (olderConfig) => {
                    updateEmbed.setDescription(`Kurulum başarıyla sonuçlandırıldı...`)
                    await client.sendEmbed(message.channel, updateEmbed, true, 4000)
                    client.config.get(message.guild.id).set('firstConfig', false)
                }).catch(err => console.log(err))

            } else { // Not first. Will show status of each command.

                let channelList;

                if(client.config.get(message.guild.id).get('excludedChannels').length){
                    channelList = client.config.get(message.guild.id).get('excludedChannels')
                    channelList.forEach((ch, index, arr) => {
                        arr[index] = `<#${arr[index]}>`
                    })
                }

                let modList;

                if(client.config.get(message.guild.id).get('modRoles').length){
                    modList = client.config.get(message.guild.id).get('modRoles')
                    modList.forEach((role, index, arr) => {
                        arr[index] = `<@&${arr[index]}>`
                    })
                }

                const info = `➡ Prefix: ${client.config.get(message.guild.id).get('prefix')}\n
                ➡ Moderatör Rolleri: ${client.config.get(message.guild.id).get('modRoles').length ? modList.join(', ') : '**PASİF**'}\n
                ➡ Otomatik Rol: ${client.config.get(message.guild.id).get('autoRole').enabled ? '<@&' + client.config.get(message.guild.id).get('autoRole').roleID + '>' : '**PASİF**'}\n
                ➡ Hoşgeldin Mesajı: ${client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').enabled ? '**AKTİF** - Mesaj Kanalı: ' + '<#' + client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').channelID + '>\n\`\`\`' + client.config.get(message.guild.id).get('logEvents').get('welcomeMessage').message + '\`\`\`\n' : '**PASİF**'}\n
                ➡ Giriş Çıkış Logları: ${client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').enabled ? '**AKTİF** - Log Kanalı: ' + '<#' + client.config.get(message.guild.id).get('logEvents').get('memberInOutLog').channelID + '>' : '**PASİF**'}\n
                ➡ Mesaj Logları: ${client.config.get(message.guild.id).get('logEvents').get('messageLog').enabled ? '**AKTİF** - Log Kanalı: ' + '<#' + client.config.get(message.guild.id).get('logEvents').get('messageLog').channelID + '>' : '**PASİF**'}\n
                ➡ Sunucu Logları: ${client.config.get(message.guild.id).get('logEvents').get('guildLog').enabled ? '**AKTİF** - Log Kanalı: ' + '<#' + client.config.get(message.guild.id).get('logEvents').get('guildLog').channelID + '>' : '**PASİF**'}\n
                ➡ Ban Kick Logları: ${client.config.get(message.guild.id).get('logEvents').get('banKickLog').enabled ? '**AKTİF** - Log Kanalı: ' + '<#' + client.config.get(message.guild.id).get('logEvents').get('banKickLog').channelID + '>' : '**PASİF**'}\n
                ➡ Sesli Kanal Logları: ${client.config.get(message.guild.id).get('logEvents').get('voiceLog').enabled ? '**AKTİF** - Log Kanalı: ' + '<#' + client.config.get(message.guild.id).get('logEvents').get('voiceLog').channelID + '>' : '**PASİF**'}\n
                ➡ Dışlanmış Kanallar: ${client.config.get(message.guild.id).get('excludedChannels').length ? '**AKTİF** - Kanallar: ' + channelList.join(', ') : '**PASİF**'}\n
                ➡ Dışlanmış Kategoriler: ${client.config.get(message.guild.id).get('excludedCategories').length ? `**AKTİF** - Kategori ID'leri: ` + client.config.get(message.guild.id).get('excludedCategories').join(', ') : '**PASİF**'}\n
                ➡ Müzik Komut Kanalı: ${client.config.get(message.guild.id).get('musicSets').get('commandChannelID').channelID ? '**AKTİF** - Kanal: ' + '<#' + client.config.get(message.guild.id).get('musicSets').get('commandChannelID').channelID + '>' : '**PASİF**'}\n`

                infoEmbed.setTitle(`Alfred'in Bu Sunucu İçin Seçenekleri`)
                infoEmbed.setDescription(info)
                infoEmbed.addField(`Herhangi bir ayarı değiştirmek için ${prefix}setup [AYARİSMİ] komutunu kullanabilirsin\nAyar Komutları:`, `\`${subSettings.join(', ')}\``)
                await client.sendEmbed(message.channel, infoEmbed, false)
                return

            }
        } else if (subSettings.find(setting => setting === args[0])) {
            // const config = await GuildSchema.findById(message.guild.id).catch(error => console.log(error));
            // const setting = client.config.get(message.guild.id)
            // console.log(config)


        }

    }
}