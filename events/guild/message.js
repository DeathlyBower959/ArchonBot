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

module.exports = async (client, Discord, message) => {

    //Mongo Checking
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

    let prefix = serverData.prefix;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd))
    
    if (!message.content.startsWith(prefix) || message.author.bot || !command) return;

    //Bot Perms
    if (command.botPerms) {
        let invalidPerms = []
        for (const perm of command.botPerms) {
            if (!validPermissions.includes(perm)) {
                return console.log(`Invalid Permission ${perm} in ${command.name}`)
            }
            if (!client.user.hasPermission(perm)) {
                invalidPerms.push(perm)
            }
        }
        if (invalidPerms.length) {
            const missingPermsEmbed = new Discord.MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(`Sorry, there was an error running that command! I am missing the permission[s]\n\`${invalidPerms}\``)

            return message.channel.send(missingPermsEmbed).then(msg => {
                msg.delete(5000)
            })
        }
    }

    //Mongo Checking
    let profiledata;
    try {
        profileData = await profileModel.findOne({
            userID: message.author.id
        })
        if (!profileData) {
            let profile = await profileModel.create({
                userID: message.author.id,
                serverID: message.guild.id,
                level: 0,
                coins: 100,
                bank: 0
            })
            profile.save();
        }
    } catch (err) {
        console.log(err)
    }

    //AutoDelete
    if (command.deleteAfter > 0) {
        setTimeout(function() {
            message.delete();
        }, command.deleteAfter * 1000)
    }
    if (command.deleteAfter == 0) {
        message.delete();
    }

    //Permissions
    if (command.permissions) {
        let invalidPerms = []
        for (const perm of command.permissions) {
            if (!validPermissions.includes(perm)) {
                return console.log(`Invalid Permission ${perm} in ${command.name}`)
            }
            if (!message.member.hasPermission(perm)) {
                invalidPerms.push(perm)
            }
        }
        if (invalidPerms.length) {
            const missingPermsEmbed = new Discord.MessageEmbed()
                .setColor("RED")
                .setTitle("Error")
                .setDescription(`Sorry you are missing these permission[s]\n\`${invalidPerms}\``)

            return message.channel.send(missingPermsEmbed).then(msg => {
                msg.delete(5000)
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
                    .setTitle("Slow Down!")
                    .setDescription(`Sorry your on cooldown for ${time_left.toFixed(1)} more second[s]!`)

                return message.channel.send(cooldownEmbed).then(msg => {
                    msg.delete(5000)
                })
            }
        }

        // Add cooldown
        time_stamps.set(message.author.id, current_time)

        // Reset Cooldown
        setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount)
    }

    try {
        command.execute(message, args, cmd, client, Discord, prefix, profileData, profileModel, serverData, serverModel);
    } catch (err) {
        message.channel.send("There was an error running that command!")
        console.log(err);
    }
}