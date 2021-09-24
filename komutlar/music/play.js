const {
    MessageEmbed
} = require('discord.js');
const { TrackUtils } = require("erela.js");
const msToTime = require('../../util/msToTime')
// const url = require("url");
// import { YouTubeURLParser } from "@iktakahiro/youtube-url-parser"
// urlParser = require("js-video-url-parser/lib/base");
// require("js-video-url-parser/lib/provider/youtube") ;

module.exports = {
    name: "play",
    aliases: ['p'],
    permLvl: 0,
    guildOnly: true,
    description: "Youtube ve Spotify üzerinden müzik ve çalma listeleri dinlemeni sağlar.",
    usage: "Bir arama terimi veya direkt müzik linki - çalma listesi linki sorgulatarak kullanılabilir.",
    category: "music",
    cooldown: 1,
    enabled: true,
    async run(message, args) {
        const {
            client
        } = message

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
            .setColor('#fca103')

        let player = client.manager.players.get(message.guild.id);

        if (!message.member.voice.channel) {
            infoEmbed.setDescription('Bu komutu kullanabilmek için sesli bir kanalda olman gerekmekte.');
            await client.sendEmbed(message.channel, infoEmbed, true, 3000)
            return;
        }
        if (message.guild.voice?.channelID && message.member.voice?.channelID !== message.guild.voice.channelID) {
            infoEmbed.setDescription('Bu komutu kullanabilmek için bot ile aynı sesli kanalda bulunman gerekmekte.')
            await client.sendEmbed(message.channel, infoEmbed, true, 3000);
            return;
            // if(player){
            //     player.setVoiceChannel(message.member.voice?.channelID)
            //     console.log("voice channel changed play33")
            // }
            // else{
            //     message.guild.voice.kick().catch(err => console.log(err));
            //     console.log("kicked play36")
            // }
        }
        if(!args.length && player && player.paused && player.queue.totalSize) { // BURASI İLERİDE SORUN YARATABİLİR Mİ BAK.
            player.set("pausedBy", false);
            return player.pause(false)
        }
        if (!args.length) {
            infoEmbed.setDescription("Alfred'in arayabilmesi için bir URL veya müzik adı yazmalısın.");
            await client.sendEmbed(message.channel, infoEmbed, true, 3000);
            return;
        }

        // Create the player
        if(!player) {
            player = client.manager.create({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                selfDeafen: true,
            });
        }

        // Connect to the voice channel and add the track to the queue
        if (player.state !== "CONNECTED") {
            player.set("message", message); //mesaj objesi ile kanala, guilde erişebilirsin.
            player.set("pausedBy", false); // istenilerek mi durdurulmuş
            player.set("playerAuthor", message.author.id); // playeri açan kişi
            // player.set("queueStartTime", []); // sıradaki her bir şarkının başlangıç zamanını seçer.
            player.set("inactivity", false); // inaktivite varsa playeri kapat.
            player.set("guildSkipVote", false); // aktif oylama olup olmadığı.
            // player.set("votes", []);

            player.connect(); // BURASI SORUN ÇIKARABİLİR HALİ HAZIRDA CONNECT OLMUŞ BİR PLAYER İÇİN TEKRAR BAK.
        } 
        // else if (!message.guild.voice?.channelID){
        //     player.connect();
        // }

        const search = args.join(" ");
        let res;

        const searchEmbed = new MessageEmbed()
            .setFooter(client.user.username, client.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setTimestamp()
            .setColor('#34eb9e')
            .setDescription(`\`${search}\` aranıyor...`)
            .setAuthor('🔎 Alfred Müzik Arama', message.author.avatar ? message.author.avatarURL({
                size: 4096,
                dynamic: true
            }) : null);

        const queueEmbed = new MessageEmbed()
            .setFooter(client.user.username, client.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setTimestamp()
            .setColor('#34eb9e')
            .setAuthor(`🎶 Çalma Sırasına Eklendi`, message.author.avatar ? message.author.avatarURL({
                size: 4096,
                dynamic: true
            }) : null);

        await client.sendEmbed(message.channel, searchEmbed, true, 1500)

        try {
            // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
            // res = await client.manager.search(search, message.author);
            res = await player.search(search, message.author)
            if (res.loadType === "LOAD_FAILED") {
                if (!player.queue.current) player.destroy();
                throw res.exception;
            }
        } catch (err) {
            console.log(err.message);
            infoEmbed.setDescription(`**${search}** aranırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.`);
            await client.sendEmbed(message.channel, infoEmbed, true, 3000);
            return;
        }

        let resolvedTrack;

        switch (res.loadType) {
            case 'NO_MATCHES':
                if (!player.queue.current) player.destroy();
                infoEmbed.setDescription(`**${search}** ile ilgili hiç bir sonuç bulunamadı.`)
                await client.sendEmbed(message.channel, infoEmbed, false)
                return;
            case 'TRACK_LOADED':

                // const songParse = urlParser.parse(search)
                // let startTime = 0;
                // if(songParse.params.start) startTime = songParse.params.start

                resolvedTrack = TrackUtils.buildUnresolved({
                    title: res.tracks[0].title,
                    duration: res.tracks[0].duration
                }, message.author)

                await resolvedTrack.resolve();

                player.queue.add(res.tracks[0]);

                queueEmbed.setDescription(`[${resolvedTrack.title}](${resolvedTrack.uri})`);
                queueEmbed.setThumbnail(resolvedTrack.thumbnail);
                queueEmbed.addFields({
                    name: 'Kanal',
                    value: `${resolvedTrack.author}`, 
                    inline: true,
                }, {
                    name: 'Süre',
                    value: `${msToTime(resolvedTrack.duration)}`,
                    inline: true,
                }, {
                    name: 'Sıradaki Konum',
                    value: `${player.queue.size == 0 ? player.queue.totalSize : player.queue.size}`,
                    inline: true,
                })

                await client.sendEmbed(message.channel, queueEmbed, false);
                // message.reply(`\`${res.tracks[0].title}\` sıraya alındı.`);
                if (!player.playing && !player.paused && !player.queue.size) player.play();
                return;
            case 'PLAYLIST_LOADED':
                player.queue.add(res.tracks);

                resolvedTrack = TrackUtils.buildUnresolved({
                    title: res.tracks[0].title,
                    duration: res.tracks[0].duration
                }, message.author)

                await resolvedTrack.resolve();

                queueEmbed.setDescription(`[${res.playlist.name}](${search})`)
                queueEmbed.setThumbnail(resolvedTrack.thumbnail)
                queueEmbed.addFields({
                    name: 'Çalma Listesi Uzunluğu',
                    value: `${msToTime(res.playlist.duration)}`,
                    inline: true,
                }, {
                    name: 'Sıraya Alınan Adet',
                    value: `${res.tracks.length}`,
                    inline: true,
                }, {
                    name: 'Sıradaki Şarkı Adedi',
                    value: `${player.queue.size}`,
                    inline: true, 
                })

                await client.sendEmbed(message.channel, queueEmbed, false);
                // message.reply(`\`${res.playlist.name}\` isimli çalma listesinden ${res.tracks.length} adet müzik sıraya alındı.`);
                if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
                return;
            case 'SEARCH_RESULT':

                resolvedTrack = TrackUtils.buildUnresolved({
                    title: res.tracks[0].title,
                    duration: res.tracks[0].duration
                }, message.author)

                await resolvedTrack.resolve();

                player.queue.add(res.tracks[0]);

                queueEmbed.setDescription(`[${resolvedTrack.title}](${resolvedTrack.uri})`);
                queueEmbed.setThumbnail(resolvedTrack.thumbnail);
                queueEmbed.addFields({
                    name: 'Kanal',
                    value: `${resolvedTrack.author}`, 
                    inline: true,
                }, {
                    name: 'Süre',
                    value: `${msToTime(resolvedTrack.duration)}`,
                    inline: true,
                }, {
                    name: 'Sıradaki Konum',
                    value: `${player.queue.size == 0 ? player.queue.totalSize : player.queue.size}`,
                    inline: true,
                })

                await client.sendEmbed(message.channel, queueEmbed, false);

                if (!player.playing && !player.paused && !player.queue.size) player.play();
                return;

                // let max = 5, collected, filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);
                // if (res.tracks.length < max) max = res.tracks.length;

                // const results = res.tracks
                //     .slice(0, max)
                //     .map((track, index) => `${++index} - \`${track.title}\``)
                //     .join('\n');

                // message.channel.send(results);

                // try {
                //     collected = await message.channel.awaitMessages(filter, {
                //         max: 1,
                //         time: 30e3,
                //         errors: ['time']
                //     });
                // } catch (e) {
                //     if (!player.queue.current) player.destroy();
                //     return message.reply("you didn't provide a selection.");
                // }

                // const first = collected.first().content;

                // if (first.toLowerCase() === 'end') {
                //     if (!player.queue.current) player.destroy();
                //     return message.channel.send('Cancelled selection.');
                // }

                // const index = Number(first) - 1;
                // if (index < 0 || index > max - 1) return message.reply(`the number you provided too small or too big (1-${max}).`);

                // const track = res.tracks[index];
                // player.queue.add(track);

                // if (!player.playing && !player.paused && !player.queue.size) player.play();
                // return message.reply(`enqueuing \`${track.title}\`.`);
        }
    }
}