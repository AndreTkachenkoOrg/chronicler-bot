import { VoiceState, TextChannel, Message, PartialMessage } from "discord.js";
import { ChannelType } from "../enums/ChannelType"
import { MongoConnector } from "../db/MongoConnector";
import { AuditChannel } from "../entities/AuditChannel";

export class AuditHandler {
	private mongoConnector: MongoConnector
	private readonly dmNotSupported = "Direct messages are not supported";

	constructor(mongoConnector: MongoConnector) {
		this.mongoConnector = mongoConnector
	}

	public async handleMessageUpdate(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
		if(oldMessage.author !== null && oldMessage.author.bot) return;
		let auditChannel = await this.resolve(oldMessage)
		auditChannel.send(`Message was edited.
		Link to message: https://discordapp.com/channels/${newMessage.guild?.id}/${newMessage.channel.id}/${newMessage.id}
		Channel: <#${newMessage.channel.id}>
		Before: \`\`\`${oldMessage.content}\`\`\`
		After: \`\`\`${newMessage.content}\`\`\`
		`)
	}

	public async handleMessageDelete(message: Message | PartialMessage) {
		if(message.author !== null && message.author.bot) return;
		let auditChannel = await this.resolve(message)
		let channelName = message.guild?.channels.resolve(message.channel.id)?.name
		auditChannel.send(`Message was deleted.
		Channel: ${channelName}
		Content: \`\`\`${message.content}\`\`\`
		`)
	}

	private async createTextChannel(message: Message | PartialMessage) {
		let guild = message.guild
		if (guild !== null && guild !== undefined) {
			guild.channels.create('audit', {
				permissionOverwrites: [{ id: guild.id, deny: ['VIEW_CHANNEL'] }],
				type: ChannelType.text
			})
				.then(ch => {
					let auditChannel: AuditChannel = { guildId: ch.guild.id, channelId: ch.id }
					this.mongoConnector.add(auditChannel)
				})
		}
	}

	private async resolve(message: Message | PartialMessage): Promise<TextChannel> {
		if (message.guild !== null) {
			let guildId = message.guild.id as string
			let channelId = await this.mongoConnector.getId(guildId)
			if (channelId === null || channelId === undefined || channelId === '') {
				await this.createTextChannel(message)
				channelId = await this.mongoConnector.getId(guildId)
			}
			return message.guild.channels.resolve(channelId) as TextChannel
		}
		else {
			message.reply(this.dmNotSupported)
			throw new Error(this.dmNotSupported)
		}
	}
}