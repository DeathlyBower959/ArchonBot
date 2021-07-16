const fs = require('fs');

module.exports = (client, Discord) => {

        const event_files = fs.readdirSync('./others/').filter(file => file.endsWith('.js'))

        for (const file of event_files) {
            const event = require(`../others/${file}`);
            const event_name = file.split('.')[0]
            client.others.set(event.name, event)
        }
}