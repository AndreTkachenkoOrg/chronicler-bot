import { Message, MessageEmbed } from "discord.js";
import { Config } from "../config";
import { BotCommand } from "../enums/BotCommand";

export class InfoHandlers {
    private config: Config

    constructor(config: Config) {
        this.config = config
    }

    public handleHelpCall(message: Message) {
        // => Prevent message from the bot
        if (!message.author.bot) {
            if (message.content === this.config.prefix + BotCommand.Help) {
                this.giveHelp(message)
                return
            }
        }
    }

    private giveHelp(message: Message) {
        let embed = new MessageEmbed()
        .setTitle("Chronicler Bot")
        .setDescription("Discord bot to write audit of message update and deletion. ")
        .setColor("#0099ff")
        .setAuthor('Chronicler', this.config.img, 'https://github.com/andretkachenko/chronicler-bot')
        .setThumbnail(this.config.img)
        .addField("**Want to use it on your server?**", "Follow this link: https://github.com/andretkachenko/chronicler-bot#want-to-use-at-your-server")
        .addField("**Any issues or missing feature?**", "You can suggest it via https://github.com/andretkachenko/chronicler-bot/issues")
        .setFooter(`Chronicler bot`);
        message.channel.send(embed)
    }
}