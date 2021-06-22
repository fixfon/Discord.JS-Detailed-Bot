const {
    time
} = require('console');
const Discord = require('discord.js');
const client = new Discord.Client();
const {
    Client,
    MessageEmbed
} = require('discord.js'); //embed message
const {
    readdirSync
} = require('fs'); //filesys
require("./inlineReply"); //inlinereply module
require("./eventLoader/eventLoader.js")(client); //event tracker
const fx = require("./prefix.json");
const moment = require("moment"); //date
moment.locale("tr") //date localization
client.commands = new Discord.Collection(); //command tracker

var prefix = fx.prefix

client.on('ready', () => {
    console.log(`${client.user.tag} olarak sunucuya giriş yapıldı!`);
    client.user.setActivity('Fixfonn', {
            type: 'STREAMING',
            url: 'https://www.twitch.tv/fixfonn'
        })
        .then(presence => console.log(`Aktivite >> ${presence.activities[0].name} oldu.`))
        .catch(console.error);
});

// const commandFiles = readdirSync("./komutlar")

// commandFiles.forEach((file) => {
//     const command = require(`./komutlar/${file}`);

//     if(!command.help) throw new Error(`${file} isimli dosyada komutun help bölümü belirtilmemiş.`);
//     if(!command.run || typeof command.run !== "function") throw new Error(`${file} isimli dosyada komutu başlatacak run fonk. bulunmamaktadır.`);
//     if(!command.help.name) throw new Error(`${file} isimli dosyada komut ismi belirtilmemiş.`);
//     if(!command.help.category) throw new Error(`${file} isimli dosyada komut kategorisi belirtilmemiş.`);
//     if(!command.help.permLevel && isNaN(command.help.permLevel)) throw new Error(`${file} isimli dosyada komut yetki leveli belirtilmemiş.`);
//     if(!command.help.description) throw new Error(`${file} isimli dosyada komut açıklaması belirtilmemiş.`);
//     if(!command.help.usage) throw new Error(`${file} isimli dosyada komutun nasıl kullanılacağı belirtilmemiş.`);
//     if(typeof command.help.enable !== "boolean") throw new Error(`${file} isimli dosyada enable bölümü true yada false değer alabilir.`);
//     if(!Array.isArray(command.help.aliases)) command.help.aliases = [];

//     client.commands.set(command.help.name, command);

//     command.help.aliases.forEach((alias) => client.aliases.set(alias, command.help.name));
// })

client.sendEmbed = async function (channel, content, deleted = false, user, timeout = 10000) {
    let embed;

    if (content instanceof MessageEmbed) embed = content;
    else embed = new MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL({
            size: 4096,
            dynamic: true
        }))
        .setDescription(content);
    embed.setTimestamp()

    const sended = await channel.send(embed);

    if (deleted) sended.delete({
        timeout
    });

    return sended;
}

client.on("messageDelete", async (deletedMessage) => { //silinen mesaj logu
    const deletedMLog = deletedMessage.guild.channels.cache.get('855776941528580137');

    if (!deletedMLog) return
    if (!deletedMessage || deletedMessage.partial) return
    if (typeof deletedMessage.author === "undefined") return
    if (deletedMessage.author && deletedMessage.author.bot === true) return
    if (deletedMessage.channel && deletedMessage.channel.type !== "text") return
    if (!deletedMessage.guild) return

    const entry = await deletedMessage.guild.fetchAuditLogs({
        type: 'MESSAGE_DELETE',
    }).then(audit => audit.entries.first())

    let time_ob = new Date();

    console.log(entry.extra.channel.id + " " + entry.target.id + " " + entry.createdAt + " " + entry.extra.count + " " + entry.executor.tag)

    if ((entry.target.id === deletedMessage.author.id) &&
        (entry.extra.channel.id === deletedMessage.channel.id) &&
        (entry.createdTimestamp > (Date.now() - 5000)) &&
        entry.extra.count >= 1
    ) {
        console.log("İlk durum oldu.")
        const embed = new MessageEmbed()
            .setAuthor(deletedMessage.author.tag + " adlı kişinin mesajı silindi.", deletedMessage.author.avatarURL({
                size: 32,
                dynamic: true
            }))
            // .setThumbnail(deletedMessage.author.avatarURL({ size:4096, dynamic: true}))
            .setColor("RED")
            .addField("Silinen Mesaj:", ` \`${deletedMessage.content}\` `)
            .setFooter(" Mesajı Silen: " + entry.executor.tag + " Mesajın Silindiği Kanal: " + deletedMessage.channel.name +
                "\nMesajın Oluşturulma Tarihi: " + moment(deletedMessage.createdAt).format("LLL") +
                "\nMesajın Silindiği Tarih: " + moment(time_ob).format("LLL"), entry.executor.avatarURL({
                    size: 16,
                    dynamic: true
                }));
        deletedMLog.send(embed);
    } else {
        console.log("İkinci durum oldu.")
        const embed = new MessageEmbed()
            .setAuthor(deletedMessage.author.tag + " adlı kişinin mesajı silindi.", deletedMessage.author.avatarURL({
                size: 32,
                dynamic: true
            }))
            // .setThumbnail(deletedMessage.author.avatarURL({ size:4096, dynamic: true}))
            .setColor("RED")
            .addField("Silinen Mesaj:", ` \`${deletedMessage.content}\` `)
            .setFooter(" Mesajı Silen: " + deletedMessage.author.tag + " Mesajın Silindiği Kanal: " + deletedMessage.channel.name +
                "\nMesajın Oluşturulma Tarihi: " + moment(deletedMessage.createdAt).format("LLL") +
                "\nMesajın Silindiği Tarih: " + moment(time_ob).format("LLL"), deletedMessage.author.avatarURL({
                    size: 16,
                    dynamic: true
                }));
        deletedMLog.send(embed);
    }
});


client.on('message', message => {
    if (message.content.toLowerCase() === 'amına koyarım') {
        message.inlineReply('ananı sikerim senin duydun mu beni?');
    }
});
// client.on('message', message => {
//     var word = message.content.toLowerCase().split(' ').filter(each => each === 'allah').join(' '); //cümleden kelime ayırmak için
//     if (word === 'allah' && message.author.id !== '855428026141638686') {
//         message.inlineReply('<@278610070948806657>');
//     }
// });
// client.on('message', message => {
//     var word = message.content.toLowerCase().split(' ').filter(each => each === 'peygamber').join(' '); //cümleden kelime ayırmak için
//     if (word === 'peygamber' && message.author.id !== '855428026141638686') {
//         message.inlineReply('Hz. <@249501162846420992>');
//     }
// });
client.on('message', message => {
    var word = message.content.toLowerCase().split(' ').filter(each => each === 'kürt').join(' '); //cümleden kelime ayırmak için
    if (word === 'kürt' && message.author.id !== '855428026141638686') {
        message.inlineReply('<@289909373118054420> olay yerine bekleniyorsunuz.');
    }
});
client.on('message', message => {

    if (message.content.toLowerCase().includes('eyv', 'eyvallah') && message.author.id !== '855428026141638686') {
        message.inlineReply('eyvallah bizden dostum');
    }
});
client.on('message', message => {

    if (message.content.toLowerCase() === 'selamın aleyküm' && message.author.id !== '855428026141638686') {
        message.inlineReply('aleyna aleyküm selam');
    }
});

client.login('ODU1NDI4MDI2MTQxNjM4Njg2.YMyVbg.bTBM_afbTESQ-PFfjTkkdmIvNis');