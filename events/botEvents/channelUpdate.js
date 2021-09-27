const Discord = require("discord.js");
const {
    Perms
} = require("../../util/permissions.js");
const moment = require("moment");
moment.locale("tr")
const ms = require("ms");

/**
 *
 * @param {Discord.GuildChannel} oldChannel
 * @param {Discord.GuildChannel} newChannel
 */

module.exports = async (oldChannel, newChannel) => {

    if (!newChannel.client.config.get(newChannel.guild.id).get('logEvents') && !newChannel.client.config.get(newChannel.guild.id).get('logEvents').get('guildLog').enabled &&
        !newChannel.client.config.get(newChannel.guild.id).get('logEvents').get('guildLog').channelID) return

    const logCh = newChannel.guild.channels.cache.find(ch => ch.id == newChannel.client.config.get(newChannel.guild.id).get('logEvents').get('guildLog').channelID)

    if(!logCh) return

    const {
        client
    } = newChannel;
    const fetchLogs = await newChannel.guild.fetchAuditLogs({
        limit: 1,
        type: 'CHANNEL_UPDATE',
    });
    // const auditEntry = fetchLogs.entries.find((entry) => entry.target.id === newChannel.id);
    const auditEntry = fetchLogs.entries.first();
    const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı.";
    const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
        size: 4096,
        dynamic: true
    }) : null;
    let changeList = [];

    if (oldChannel.name !== newChannel.name) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski İsim:',
                value: oldChannel.name,
                inline: true
            }, {
                name: 'Yeni İsim:',
                value: newChannel.name,
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    // if (oldChannel.rawPosition !== newChannel.rawPosition) {
    //     const embed = new Discord.MessageEmbed()
    //         .addFields({
    //             name: 'Eski Pozisyon:',
    //             value: `${oldChannel.rawPosition}. sırada`,
    //             inline: true
    //         }, {
    //             name: 'Yeni Pozisyon:',
    //             value: `${newChannel.rawPosition}. sırada`,
    //             inline: true
    //         }, {
    //             name: 'Kategori:',
    //             value: newChannel.parent ? newChannel.parent : 'Yok',
    //             inline: false
    //         }, {
    //             name: '\u200B',
    //             value: '\u200B'
    //         }, );
    //     changeList.push(embed);
    // }

    if (oldChannel.topic !== newChannel.topic) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski Kanal Konusu:',
                value: oldChannel.topic ? oldChannel.topic : 'Boş',
                inline: true
            }, {
                name: 'Yeni Kanal Konusu:',
                value: newChannel.topic ? newChannel.topic : 'Boş',
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldChannel.nsfw !== newChannel.nsfw) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski NSFW Durumu:',
                value: oldChannel.nsfw ? 'Açık' : 'Kapalı',
                inline: true
            }, {
                name: 'Yeni NSFW Durumu:',
                value: newChannel.nsfw ? 'Açık' : 'Kapalı',
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldChannel.bitrate !== newChannel.bitrate) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski Bitrate:',
                value: oldChannel.bitrate,
                inline: true
            }, {
                name: 'Yeni Bitrate:',
                value: newChannel.bitrate,
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldChannel.userLimit !== newChannel.userLimit) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski Üye Limiti:',
                value: oldChannel.userLimit,
                inline: true
            }, {
                name: 'Yeni Üye Limiti:',
                value: newChannel.userLimit,
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        const oldParsed = parseMs(ms(ms(`${oldChannel.rateLimitPerUser}s`)));
        const newParsed = parseMs(ms(ms(`${newChannel.rateLimitPerUser}s`)));

        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski Yavaş Mod Bekleme Süresi:',
                value: oldParsed.startsWith('0') ? '0 saniye' : oldParsed,
                inline: true
            }, {
                name: 'Yeni Yavaş Mod Bekleme Süresi:',
                value: newParsed.startsWith('0') ? '0 saniye' : newParsed,
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    let memberOrRole;

    const oldChannelPermissionsUserOrRoleID = oldChannel.permissionOverwrites.map((item) => item.id);
    const newChannelPermissionsUserOrRoleID = newChannel.permissionOverwrites.map((item) => item.id);

    oldChannelPermissionsUserOrRoleID.forEach((id) => {
        const _memberOrRole = newChannel.guild.roles.cache.get(id) || newChannel.guild.members.cache.get(id);
        if (_memberOrRole) {
            let oldPerms = oldChannel.permissionsFor(_memberOrRole);
            let newPerms = newChannel.permissionsFor(_memberOrRole);
            if (oldPerms.bitfield !== newPerms.bitfield) {
                oldPerms = oldPerms.toArray();
                newPerms = newPerms.toArray();
                let {
                    givenPerms,
                    takenPerms
                } = getChangedItems(oldPerms, newPerms);
                memberOrRole = _memberOrRole
                const embed = new Discord.MessageEmbed();
                takenPerms.length !== 0 ? embed.addField("Alınan İzinler:", `\`\`\`${takenPerms.map((perm) => Perms[perm]).join("\n")}\`\`\``) : void 0;
                givenPerms.length !== 0 ? embed.addField("Verilen İzinler:", `\`\`\`${givenPerms.map((perm) => Perms[perm]).join("\n")}\`\`\``) : void 0;
                changeList.push(embed);
            }
        }
    });

    if (changeList.length === 0) return;
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${executor} ${newChannel.name} üzerinde değişiklikler yaptı`, avatarURL);
    memberOrRole ? embed.setDescription(`${memberOrRole} rolünün ${newChannel} üzerinde yetkileri değişti.`) : void 0;
    embed.fields = [...(changeList.map((embed) => embed.fields))];
    embed.setColor('BLUE');
    return client.sendEmbed(logCh, embed, false);
};

function getChangedItems(arr1, arr2) {

    let givenPerms = arr2.filter((item) => !arr1.includes(item));
    let takenPerms = arr1.filter((item) => !arr2.includes(item));
    return {
        givenPerms,
        takenPerms
    };
}

function parseMs(ms) {
    return ms
        .replace("m", " dakika")
        .replace("s", " saniye")
        .replace("h", " saat")
}