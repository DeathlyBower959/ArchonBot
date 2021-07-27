const { createCanvas, loadImage, registerFont } = require('canvas')
registerFont("./roboto.ttf", { family: "Roboto" })

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 60;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return context.font;
};

module.exports = {
  name: "rank",
  description: "Returns your current rank!",
  aliases: ['level', 'r'],
  cooldown: 5, // Optional
  deleteAfter: 0, // Optional (-1 = dont delete | 0 = insta delete | 0> = delete after x seconds)
  async execute(message, args, cmd, client, Discord, prefix, profileData, profileModel, serverData, serverModel) {

    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    const background = await loadImage('./images/RankBackground.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);    

    //Username
    ctx.font = applyText(canvas, message.author.username) //message.member.displayName for nickname
    ctx.fillStyle = '#ffffff';
    ctx.fillText(message.author.username, 225, 125);

    const avatar = await loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
    let avatarSize = 150
    let avatarLocationX = 40
    let avatarLocationY = 50
    ctx.arc(avatarLocationX + avatarSize/2, avatarLocationY + avatarSize/2, avatarSize/2 + 10, 0, Math.PI * 2);
    ctx.fillStyle = "#232323";
    ctx.fill();
    // Pick up the pen
	  ctx.beginPath();
	  // Start the arc to form a circle
	  ctx.arc(avatarLocationX + avatarSize/2, avatarLocationY + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
	  // Put the pen down
	  ctx.closePath();
	  // Clip off the region you drew on
	  ctx.clip();

    ctx.drawImage(avatar, avatarLocationX, avatarLocationY, avatarSize, avatarSize);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'RankCard.png');

    message.channel.send("", attachment);
  }
}