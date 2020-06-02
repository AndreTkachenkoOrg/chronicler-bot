import { Message, Client } from "discord.js";
import { Config } from "../config";
import { BotCommand } from "../enums/BotCommand";

export class HelpHandlers {
    private client: Client
    private config: Config

    constructor(client: Client, config: Config) {
        this.client = client
        this.config = config
    }

    public handleHelpCall(message: Message) {
        // => Prevent message from the bot
        if (this.client.user != undefined && message.author.id !== this.client.user.id) {
            // => Test command
            if (message.content === this.config.prefix + BotCommand.Help) {
                message.channel.send(`
                List of available commands:
                \`\`\`
                ${this.config.prefix}about - get info about bot
                
                Bot lacks a feature? You can suggest it via https://github.com/andretkachenko/chronicler-bot/issues\`\`\`
                `)
                return
            }

            if (message.content === this.config.prefix + BotCommand.About) {
                this.giveAbout(message)
                return
            }
        }
    }

    private giveAbout(message: Message) {
        message.channel.send(`
                \`\`\`
                Discord bot to write audit of message update and deletion. 
                Want to use it on your server? Follow this link: https://github.com/andretkachenko/chronicler-bot#want-to-use-at-your-server
                Any issues or missing feature? You can post it via https://github.com/andretkachenko/chronicler-bot/issues\`\`\`
                `)
    }
}