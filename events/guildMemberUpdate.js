const Discord = require("discord.js");
const {
    Perms
} = require("../util/permissions.js");
const moment = require("moment");
moment.locale("tr")
const ms = require("ms");

/**
 *
 * @param {Discord.GuildMember} oldMember
 * @param {Discord.GuildMember} newMember
 **/

module.exports = async (oldMember, newMember) => {
    let logCh = newMember.guild.channels.cache.get('856667105775845406');
    const {
        client
    } = newMember;
    // const avatarURL = newMember.user.avatarURL({
    //     size: 4096,
    //     dynamic: true
    // });

    if (oldMember.nickname !== newMember.nickname) {

        const fetchLogs = await newMember.guild.fetchAuditLogs({
            type: "MEMBER_UPDATE"
        });
        const auditEntry = fetchLogs.entries.find((entry) => entry.target.id === newMember.id);
        const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı.";
        const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
            size: 4096,
            dynamic: true
        }) : null;

        const embed = new Discord.MessageEmbed()
            .setDescription(`${newMember.user} kullanıcısının sunucu üzerindeki takma adı değiştirildi.`)
            .addFields({
                name: 'Eski Takma Ad:',
                value: `\`\`\`${oldMember.nickname ? oldMember.nickname : oldMember.user.username}\`\`\``,
                inline: true
            }, {
                name: 'Yeni Takma Ad:',
                value: `\`\`\`${newMember.nickname ? newMember.nickname : newMember.user.username}\`\`\``,
                inline: true
            })
            .setFooter(`${executor} Tarafından değiştirildi.\nDeğiştirilme Tarihi: ${moment(Date.now()).format('LLL')}`, avatarURL)
            .setColor("#00f7ff");
        return client.sendEmbed(logCh, embed, false);
    }

    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {

        const fetchLogs = await newMember.guild.fetchAuditLogs({
            type: "MEMBER_ROLE_UPDATE"
        });
        const auditEntry = fetchLogs.entries.find((entry) => entry.target.id === newMember.id);
        const executor = auditEntry ? auditEntry.executor.username : "Bulunamadı.";
        const avatarURL = auditEntry ? auditEntry.executor.avatarURL({
            size: 4096,
            dynamic: true
        }) : null;


        const oldRoles = oldMember.roles.cache.array();
        const newRoles = newMember.roles.cache.array();

        let {
            givenRoles,
            takenRoles
        } = getChangedItems(oldRoles, newRoles);
        1

        const embed = new Discord.MessageEmbed()
            .setDescription(`${newMember.user} kullanıcısının sunucu üzerindeki rolleri düzenlendi.`)
            .setThumbnail(newMember.user.avatarURL({
                size: 4096,
                dynamic: true
            }))
            .setFooter(`${executor} Tarafından değiştirildi.\nDeğiştirilme Tarihi: ${moment(Date.now()).format('LLL')}`, avatarURL)
            .setColor("#00f7ff");

        takenRoles.length !== 0 ? embed.addField("Alınan Roller:", `\`\`\`${takenRoles[0].name}\`\`\``) : void 0;
        givenRoles.length !== 0 ? embed.addField("Verilen Roller:", `\`\`\`${givenRoles[0].name}\`\`\``) : void 0;

        return client.sendEmbed(logCh, embed, false);
    }

};

function getChangedItems(arr1, arr2) {

    let givenRoles = arr2.filter((item) => !arr1.includes(item));
    let takenRoles = arr1.filter((item) => !arr2.includes(item));
    return {
        givenRoles,
        takenRoles
    };
}