const Discord = require("discord.js");
const {
    Perms
} = require("../util/permissions.js");
const moment = require("moment");
moment.locale("tr")

module.exports = async (oldRole, newRole) => {
    const logCh = newRole.guild.channels.cache.get('856667105775845406');
    if (!logCh) return
    const {
        client
    } = newRole;

    const fetchLogs = await newRole.guild.fetchAuditLogs({
        limit: 1,
        type: "ROLE_UPDATE"
    });
    const auditEntry = fetchLogs.entries.first();
    const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı."
    const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
        size: 4096,
        dynamic: true
    }) : null;

    let changeList = [];

    if (oldRole.name !== newRole.name) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski İsim:',
                value: oldRole.name,
                inline: true
            }, {
                name: 'Yeni İsim:',
                value: newRole.name,
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldRole.rawPosition !== newRole.rawPosition) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski Pozisyon:',
                value: `${oldRole.rawPosition}. sırada`,
                inline: true
            }, {
                name: 'Yeni Pozisyon:',
                value: `${newRole.rawPosition}. sırada`,
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldRole.hexColor !== newRole.hexColor) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Eski Renk:',
                value: oldRole.hexColor,
                inline: true
            }, {
                name: 'Yeni Renk:',
                value: newRole.hexColor,
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldRole.mentionable !== newRole.mentionable) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Tüm roller tarafından etiketlenebilir mi?',
                value: newRole.mentionable ? "Etiketlenebilir" : "Etiketlenemez",
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldRole.hoist !== newRole.hoist) {
        const embed = new Discord.MessageEmbed()
            .addFields({
                name: 'Geri kalan çevrimiçi üyelerden ayrı göster',
                value: newRole.hoist ? "Evet" : "Hayır",
                inline: true
            }, {
                name: '\u200B',
                value: '\u200B'
            }, );
        changeList.push(embed);
    }

    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        const oldPerms = oldRole.permissions.toArray();
        const newPerms = newRole.permissions.toArray();

        let {
            givenPerms,
            takenPerms
        } = getChangedItems(oldPerms, newPerms);

        const embed = new Discord.MessageEmbed();

        takenPerms.length !== 0 ? embed.addField("Alınan İzinler:", `\`\`\`${takenPerms.map((perm) => Perms[perm]).join("\n")}\`\`\``) : void 0;
        givenPerms.length !== 0 ? embed.addField("Verilen İzinler:", `\`\`\`${givenPerms.map((perm) => Perms[perm]).join("\n")}\`\`\``) : void 0;

        changeList.push(embed);
    }

    if (changeList.length === 0) return;

    const embed = new Discord.MessageEmbed()
        .setAuthor(`${executor}, ${newRole.name} rolü üzerinde değişiklikler yaptı`, avatarURL);
    embed.setDescription(`Güncellenme Tarihi: ${moment(Date.now()).format('LLL')}`);
    embed.fields = [...(changeList.map((embed) => embed.fields))];
    embed.setColor('BLUE');
    client.sendEmbed(logCh, embed, false);
};

function getChangedItems(arr1, arr2) {

    let givenPerms = arr2.filter((item) => !arr1.includes(item));
    let takenPerms = arr1.filter((item) => !arr2.includes(item));
    return {
        givenPerms,
        takenPerms
    };
}