//File System
const fs = require('fs')

module.exports = (client, Discord) => {

    //New function load_dir
    const load_dir = (dir) => {
        //Gets the files in the current sub directory
        const command_files = fs.readdirSync(`./commands/${dir}`).filter(direct => direct.endsWith('js')); // Makes sure it ends in .js

        //For every file in the sub directory
        for (const file of command_files) {
            //Require the command
            const command = require(`../commands/${dir}/${file}`);
            if (command.name) {
                //And add it to the client.commands list
                client.commands.set(command.name, command);
            } else {
                continue;
            }
        }
    }

    //Commands that are not inside of a sub folder need to be manually added here
    client.commands.set("help", require(`../commands/help.js`));

    //Gets all sub folders in commands, and runs "load_dir" on them
    fs.readdirSync('././commands/').filter(dir => !dir.endsWith('js')).forEach(e => load_dir(e))
}