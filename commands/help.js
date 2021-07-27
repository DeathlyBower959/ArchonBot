const fs = require('fs');

const jsonfile = require('jsonfile');

module.exports = {
  name: "help",
  description: "Lists all avaliable bot commands",
  aliases: ['h'],
  autoDelete: true,
  cooldown: 5,
  async execute(message, args, cmd, client, Discord, prefix, profileData) {

    const dirs = jsonfile.readFileSync('./dirs.json')

    //Constructing Embed

    let pages = []

    let page = 1

    let dirNames = []

    const helpEmbed = new Discord.MessageEmbed() //Create new embed
      .setColor("RED") //Embed Color
      //.setThumbnail('')

    let dirIndex = 0

    //Loop through command directories
    Object.keys(dirs).forEach((dirName) => {

      dirNames.push(dirName)
      pages[dirIndex] = "\n\n"

      //Loop through all commands in specified directory
      Object.keys(dirs[dirName]).forEach((fileName) => {
        
        var desc = client.commands.get(fileName).description
        var usage = client.commands.get(fileName).usage
        var alia = client.commands.get(fileName).aliases

        if (usage && alia) {
          pages[dirIndex] += `\n**${prefix}${fileName}**\nDescription: ${desc}\nUsage: ${usage}\nAliases: ${alia}\n`
        } else if (usage) {
          pages[dirIndex] += `\n**${prefix}${fileName}**\nDescription: ${desc}\nUsage: ${usage}\n`
        } else if (alia) {
          pages[dirIndex] += `\n**${prefix}${fileName}**\nDescription: ${desc}\nAliases: ${alia}\n`
        } else {
          pages[dirIndex] += `\n**${prefix}${fileName}**\nDescription: ${desc}\n`
        }

      })
      dirIndex++
    })

    helpEmbed.setTitle('Help Page - ' + dirNames[0]) //Embed Title
    helpEmbed.setDescription(pages[page - 1]) //Sets desc as default page
    helpEmbed.setFooter(`Page ${page} of ${pages.length}`) //Showing page location


    message.channel.send(helpEmbed).then(msg => {

      // Replace with buttons later on (Dont delete functions)

      msg.react('⏮️')
      msg.react('⬅️')
      msg.react('➡️')
      msg.react('⏭️')
      msg.react('🗑️')

      //Filters
      const firstFilter = (reaction, user) => reaction.emoji.name === '⏮️' && user.id === message.author.id;
      const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === message.author.id;
      const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡️' && user.id === message.author.id;
      const lastFilter = (reaction, user) => reaction.emoji.name === '⏭️' && user.id === message.author.id;
      const trashFilter = (reaction, user) => reaction.emoji.name === '🗑️' && user.id === message.author.id;

      const first = msg.createReactionCollector(firstFilter, {
        time: 60000
      }); //Time in milliseconds
      const backwards = msg.createReactionCollector(backwardsFilter, {
        time: 60000
      }); //Time in milliseconds
      const forwards = msg.createReactionCollector(forwardsFilter, {
        time: 60000
      }); //Time in milliseconds
      const last = msg.createReactionCollector(lastFilter, {
        time: 60000
      }); //Time in milliseconds
      const trash = msg.createReactionCollector(trashFilter, {
        time: 60000
      }); //Time in milliseconds

      //Collections
      first.on('collect', async (reaction, user) => { //Runs when backwardsb reaction happens
        reaction.users.remove(user);
        if (page === 1) return; //Make sure on the first page, and return so you cant go back.
        page = 1;
        helpEmbed.setTitle(dirNames[page - 1]);
        helpEmbed.setDescription(pages[page - 1]);
        helpEmbed.setFooter(`Page ${page} of ${pages.length}`);
        msg.edit(helpEmbed)
      })

      backwards.on('collect', async (reaction, user) => { //Runs when backwards reaction happens
        reaction.users.remove(user);
        if (page === 1) return; //Make sure on the first page, and return so you cant go back.
        page--; //If it can go back, move back a page number
        helpEmbed.setTitle(dirNames[page - 1]);
        helpEmbed.setDescription(pages[page - 1]);
        helpEmbed.setFooter(`Page ${page} of ${pages.length}`);
        msg.edit(helpEmbed)

      })

      forwards.on('collect', async (reaction, user) => { //Runs when forwards reaction happens
        reaction.users.remove(user);
        if (page === pages.length) return; //Make sure on the last page, and return so you cant go forward.
        page++; //If it can go forward, move forward a page number
        helpEmbed.setTitle(dirNames[page - 1]);
        helpEmbed.setDescription(pages[page - 1]);
        helpEmbed.setFooter(`Page ${page} of ${pages.length}`);
        msg.edit(helpEmbed);
      })

      last.on('collect', async (reaction, user) => { //Runs when forwardsf reaction happens
        reaction.users.remove(user);
        if (page === pages.length) return; //Make sure on the last page, and return so you cant go forward.
        page = pages.length
        helpEmbed.setTitle(dirNames[page - 1]);
        helpEmbed.setDescription(pages[page - 1]);
        helpEmbed.setFooter(`Page ${page} of ${pages.length}`);
        msg.edit(helpEmbed)
      })

      trash.on('collect', r => { //Runs when trash reaction happens
        msg.delete(helpEmbed);
      })

      // End of replace with buttons later on
    })

  }
}