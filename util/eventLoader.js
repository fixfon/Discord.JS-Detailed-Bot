const req = file => require(`../events/botEvents/${file}`);
const req2 = file2 => require(`../events/lavalinkEvents/${file2}`)

module.exports = async (client) => {
  client.on("message", req("message.js"));

  client.on("ready", () => req("ready.js")(client));

  client.on("error", req("error.js"));

  client.on("raw", (d) => client.manager.updateVoiceState(d));

  client.on("guildCreate", req("guildCreate.js"));

  client.on("guildDelete", req("guildDelete.js"));

  // client.on("guildUpdate", req("guildUpdate.js"));

  client.on("guildMemberAdd", req("guildMemberAdd.js"));

  client.on("guildMemberRemove", req("guildMemberLeave.js"));

  client.on("guildMemberUpdate", req("guildMemberUpdate.js"));

  client.on("guildBanAdd", req("guildBanAdd.js"));

  client.on("guildBanRemove", req("guildBanRemove.js"));

  client.on("messageDelete", req("messageDelete.js"));

  client.on("messageUpdate", req("messageUpdate.js"));

  client.on("roleCreate", req("roleCreate.js"));

  client.on("roleDelete", req("roleDelete.js"));

  client.on("roleUpdate", req("roleUpdate.js"));

  client.on("channelCreate", req("channelCreate.js"));

  client.on("channelDelete", req("channelDelete.js"));

  client.on("channelUpdate", req("channelUpdate.js"));

  client.on("voiceStateUpdate", req("voiceLog.js"));

  client.manager.on("nodeConnect", node => console.log(`Node ${node.options.identifier} connected.`));

  client.manager.on("nodeCreate", node => console.log(`Node ${node.options.identifier} created.`));

  client.manager.on("nodeReconnect", node => console.log(`Node ${node.options.identifier} reconnected.`));

  client.manager.on("nodeDisconnect", node => console.log(`Node ${node.options.identifier} disconnected.`));

  client.manager.on("nodeDestroy", node => console.log(`Node ${node.options.identifier} destroyed.`));

  client.manager.on("nodeError", (node, error) => console.log(`Node ${node.options.identifier} error occured.\n${error}`));

  // client.manager.on("nodeRaw", payload => console.log(payload));

  client.manager.on("playerCreate", req2("playerCreate.js"));

  client.manager.on("playerDestroy", req2("playerDestroy.js"));

  client.manager.on("playerMove", req2("playerMove.js"));

  client.manager.on("trackStart", req2("trackStart.js"));

  client.manager.on("trackEnd", req2("trackEnd.js"));

  client.manager.on("trackStuck", req2("trackStuck.js"));

  client.manager.on("trackError", req2("trackError.js"));

  client.manager.on("queueEnd", (player) => req2("queueEnd.js")(client, player));

  client.manager.on("socketClosed", req2("socketClosed.js"));

};