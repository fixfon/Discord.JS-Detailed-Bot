const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['CHANNEL', 'MESSAGE', 'REACTION', 'USER']
});
const { Manager } = require('erela.js')
const Spotify  = require("erela.js-spotify");
const {
    readdirSync
} = require('fs'); //filesys
require("./util/getUserFromMention")
require("dotenv").config();

client.commands = new Discord.Collection(); //command tracker
client.aliases = new Discord.Collection(); //aliases tracker
client.queue = new Discord.Collection(); // song queue tracker
client.config = new Discord.Collection(); //prefix collection
client.sendEmbed = require('./util/sendEmbed')
client.manager = new Manager({
    nodes: [{
        host: 'localhost',
        port: 9000,
        password: process.env.LAVALINK_PW,
    }],
    plugins: [
        new Spotify({
            clientID: process.env.SPOTIFY_CLIENTID,
            clientSecret: process.env.SPOTIFY_CLIENTSECRET,
        })
    ],
    send(id, payload) {
        const guild = client.guilds.cache.get(id)
        if(guild) guild.shard.send(payload);
    },
});

const commandFolders = readdirSync('./commands');

commandFolders.forEach((folder) =>{
    const commandFiles = readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));

    commandFiles.forEach((file) => {
        const command = require(`./commands/${folder}/${file}`);
    
        if (!command.run || typeof command.run !== "function") throw new Error(`${file} isimli dosyada komutu başlatacak run fonk. bulunmamaktadır.`);
        if (!command.name) throw new Error(`${file} isimli dosyada komut ismi belirtilmemiş.`);
        if (!command.category) throw new Error(`${file} isimli dosyada komut kategorisi belirtilmemiş.`);
        if (!command.permLvl && isNaN(command.permLvl)) throw new Error(`${file} isimli dosyada komut yetki leveli belirtilmemiş.`);
        if (!command.description) throw new Error(`${file} isimli dosyada komut açıklaması belirtilmemiş.`);
        if (!command.usage) throw new Error(`${file} isimli dosyada komutun nasıl kullanılacağı belirtilmemiş.`);
        if (typeof command.enabled !== "boolean") throw new Error(`${file} isimli dosyada enable bölümü true yada false değer alabilir.`);
        if (!Array.isArray(command.aliases)) command.help.aliases = [];
    
        client.commands.set(command.name, command);
        command.aliases.forEach((alias) => client.aliases.set(alias, command.name));
    })
})

require("./util/eventLoader")(client); //event tracker

client.login(process.env.TOKEN).then(async (asd) => {
    // await client.user.setPresence({
    //     activity: {
    //         name: 'Fixfonn',
    //         type: 'STREAMING',
    //         url: 'https://www.twitch.tv/fixfonn'
    //     },
    //     status: 'online'
    // }).then(presence => console.log(`Bot açıldı ve aktivitesi ${presence.activities[0].name} yapıldı.`))
    // .catch(err => console.log(err))

    await client.user.setPresence({
        activity: {
            name: 'Beta v0.5',
        },
        status: 'online',
    }).then(presesence => console.log(`Bot açıldı ve aktivitesi ${presesence.activities[0].name} yapıldı.`))
    .catch(err => console.log(err))
})

module.exports = (client);