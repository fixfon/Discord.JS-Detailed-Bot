const {
    time
} = require('console');
const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['CHANNEL', 'MESSAGE', 'REACTION', 'USER']
});
const {
    Client,
    MessageEmbed
} = require('discord.js'); //embed message
const {
    readdirSync
} = require('fs'); //filesys
require("./inlineReply"); //inlinereply module
require("dotenv").config();
require("./eventLoader/eventLoader.js")(client); //event tracker
const prefix = require("./prefix.json").prefix;
const moment = require("moment"); //date
moment.locale("tr") //date localization
client.commands = new Discord.Collection(); //command tracker

client.on('ready', () => {
    console.log(`${client.user.tag} olarak sunucuya giriş yapıldı!`);
    client.user.setActivity('Fixfonn', {
            type: 'STREAMING',
            url: 'https://www.twitch.tv/fixfonn'
        })
        .then(presence => console.log(`Aktivite >> ${presence.activities[0].name} oldu.`))
        .catch(console.error);
});

const commandFiles = readdirSync("./komutlar").filter(file => file.endsWith(".js"));

commandFiles.forEach((file) => {
    const command = require(`./komutlar/${file}`);

    if(!command.run || typeof command.run !== "function") throw new Error(`${file} isimli dosyada komutu başlatacak run fonk. bulunmamaktadır.`);
    if(!command.name) throw new Error(`${file} isimli dosyada komut ismi belirtilmemiş.`);
    if(!command.category) throw new Error(`${file} isimli dosyada komut kategorisi belirtilmemiş.`);
    if(!command.permLvl && isNaN(command.permLvl)) throw new Error(`${file} isimli dosyada komut yetki leveli belirtilmemiş.`);
    if(!command.description) throw new Error(`${file} isimli dosyada komut açıklaması belirtilmemiş.`);
    if(!command.usage) throw new Error(`${file} isimli dosyada komutun nasıl kullanılacağı belirtilmemiş.`);
    if(typeof command.enable !== "boolean") throw new Error(`${file} isimli dosyada enable bölümü true yada false değer alabilir.`);
    if(!Array.isArray(command.aliases)) command.help.aliases = [];

    client.commands.set(command.name, command);

    command.help.aliases.forEach((alias) => client.aliases.set(alias, command.help.name));
})

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

client.login(process.env.TOKEN);