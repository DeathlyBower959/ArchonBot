const cooldowns = new Map();

const profileModel = require('../../models/profileSchema')
const serverModel = require('../../models/serverSchema')

const validPermissions = [
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
]

const checkLevel = async (message, client, Discord, profileData, profileModel) => {
    let xp = profileData.xp;
    let lvl = profileData.level;

    const neededForNextLevel = 5 * (lvl ^ 2) + (50 * lvl) + 100;

    const randomNumber = Math.floor(Math.random() * 13) + 1

    await profileModel.findOneAndUpdate({
        userID: message.author.id
    }, {
        $inc: {
            xp: randomNumber
        }
    })

    if (xp >= neededForNextLevel) {
        const add = xp - neededForNextLevel;
        await profileModel.findOneAndUpdate({
            userID: message.author.id
        }, {
            $inc: {
                level: 1
            },
            $set: {
                xp: add
            }
        })
    }
}

module.exports = async (client, Discord, message) => {

    if (message.author.bot) return;

    //Server  Data MongoDB
    let serverData;
    try {
        serverData = await serverModel.findOne({
            serverID: message.guild.id
        })
        if (!serverData) {
            let server = await serverModel.create({
                serverID: message.guild.id,
                prefix: ">"
            })
            server.save();
            serverData = await serverModel.findOne({
                serverID: message.guild.id
            })
        }
    } catch (err) {
        console.log(err)
    }

    //Profile Data MongoDB
    let profileData;
    try {
        profileData = await profileModel.findOne({
            userID: message.author.id,
        })
        if (!profileData) {
            let profile = await profileModel.create({
                userID: message.author.id,
                xp: 0,
                level: 0,
                coins: 100,
                bank: 0
            })
            profile.save();
            profileData = await profileModel.findOne({
                userID: message.author.id,
            })
        }
    } catch (err) {
        console.log(err)
    }


    checkLevel(message, client, Discord, profileData, profileModel)

    let prefix = serverData.prefix;

    //Check if message mentions bot only
    if (message.content === `<@!${message.client.user.id}>` || message.content === `<@${message.client.user.id}>`) {
        message.delete();
        const forgotPrefixEmbed = new Discord.MessageEmbed()
            .setColor("YELLOW")
            .setTitle("Oops!")
            .setDescription(`Looks like you forgot the prefix! \nMy prefix is \`${prefix}\``)
        return message.channel.send(forgotPrefixEmbed).then(msg => {
            msg.delete({
                timeout: 8000
            })
        });
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd))

    if (!message.content.startsWith(prefix) || !command) return;

    //Bot Perms
    let missingPerms = [];
    let requiredPerms = [];
    if (command.botPerms) {
        requiredPerms = command.botPerms;
    }
    requiredPerms.push("SEND_MESSAGES");
    requiredPerms.push("EMBED_LINKS");
    requiredPerms.push("USE_EXTERNAL_EMOJIS");
    requiredPerms.push("READ_MESSAGE_HISTORY");

    for (const perm of requiredPerms) {
        if (!validPermissions.includes(perm)) {
            return console.log(`Invalid Permission ${perm} in ${command.name}`)
        }
        if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
            missingPerms.push(perm)
        }
    }
    if (missingPerms.length) {
        const missingPermsEmbed = new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Error")
            .setDescription(`Sorry, there was an error running that command! I am missing the permission[s]\n${missingPerms.map(p => `\`${p}\``).join(", ")}`)


        return message.author.send(missingPermsEmbed)
    }

    //AutoDelete
    if (command.deleteAfter > 0) {
        message.delete({
            timeout: command.deleteAfter * 1000
        });
    } else if (command.deleteAfter == 0) {
        message.delete();
    }

    //User Perms
    if (command.permissions) {
        let missingPerms = []
        for (const perm of command.permissions) {
            if (!validPermissions.includes(perm)) {
                return console.log(`Invalid Permission ${perm} in ${command.name}`)
            }
            if (!message.member.hasPermission(perm)) {
                missingPerms.push(perm)
            }
        }
        if (missingPerms.length) {
            const missingPermsEmbed = new Discord.MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(`Sorry you are missing these permission[s]\n${missingPerms.map(p => `\`${p}\``).join(", ")}`)

            return message.channel.send(missingPermsEmbed).then(msg => {
                msg.delete({
                    timeout: 15000
                })
            })
        }
    }

    // Cooldown
    if (command.cooldown) {
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection())
        }

        const current_time = Date.now()
        const time_stamps = cooldowns.get(command.name)
        const cooldown_amount = (command.cooldown) * 1000

        if (time_stamps.has(message.author.id)) {
            const expiration_time = time_stamps.get(message.author.id) + cooldown_amount

            if (current_time < expiration_time) {
                const time_left = (expiration_time - current_time) / 1000

                const cooldownEmbed = new Discord.MessageEmbed()
                    .setColor("RED")
                    .setDescription("")
                    .setTitle("Slow Down!")

                if (time_left.toFixed(1) >= 3600) {
                    let hour = (time_left / 3600).toFixed(1);
                    cooldownEmbed.setDescription(`Sorry your on cooldown for ${hour} more hour[s]!`)
                } else if (time_left.toFixed(1) >= 60) {
                    let minute = (time_left / 60).toFixed(1);
                    cooldownEmbed.setDescription(`Sorry your on cooldown for ${minute} more minute[s]!`)
                } else {

                    let seconds = time_left.toFixed(1);
                    cooldownEmbed.setDescription(`Sorry your on cooldown for ${seconds} more second[s]!`)
                }


                return message.channel.send(cooldownEmbed).then(msg => {
                    msg.delete({
                        timeout: 5000
                    })
                })
            }
        }

        time_stamps.set(message.author.id, current_time)
        setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount)

    }

    try {
        command.execute(message, args, cmd, client, Discord, prefix, profileData, profileModel, serverData, serverModel);
    } catch (err) {
        const errorRunCmd = new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Error")
            .setDescription(`Sorry there was an error running that command!`)
        message.channel.send(errorRunCmd)
        console.log(err);
    }

}