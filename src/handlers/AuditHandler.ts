import { TextChannel, Message, PartialMessage, MessageEmbed, User } from "discord.js";
import { ChannelType } from "../enums/ChannelType"
import { MongoConnector } from "../db/MongoConnector";
import { AuditChannel } from "../entities/AuditChannel";
import { Config } from "../config";

export class AuditHandler {
	private config: Config
	private mongoConnector: MongoConnector
	private readonly dmNotSupported = "Direct messages are not supported";

	constructor(config: Config, mongoConnector: MongoConnector) {
		this.config = config
		this.mongoConnector = mongoConnector
	}

	public async handleMessageUpdate(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
		if((oldMessage.author !== null && oldMessage.author.bot) || newMessage.editedAt === null) return;

		let isIgnored = await this.mongoConnector.ignoredChannels.isIgnored(newMessage.guild?.id as string, newMessage.channel.id)
		if(isIgnored) return;

		let auditChannel = await this.resolve(oldMessage)

		let embed = new MessageEmbed()
		.setTitle("**UPDATED MESSAGE**")
		.setColor("#e4c03e")
		.setAuthor('Chronicler', this.config.img, 'https://github.com/andretkachenko/chronicler-bot')
		.setThumbnail(this.config.img)
		.addField("Author", newMessage.author?.tag, true)
		.addField("Channel", newMessage.channel, true)
		.addField("Before", oldMessage.content)		
		.addField("After", newMessage.content)
		.addField("Link to message", `https://discordapp.com/channels/${newMessage.guild?.id}/${newMessage.channel.id}/${newMessage.id}`)
		.setFooter(`Message ID: ${oldMessage.id} | Author ID: ${oldMessage.author?.id}`);

		auditChannel.send(embed);
	}

	public async handleMessageDelete(message: Message | PartialMessage) {
		let isIgnored = await this.mongoConnector.ignoredChannels.isIgnored(message.guild?.id as string, message.channel.id)
		if(isIgnored) return;

		let auditChannel = await this.resolve(message)
		const entry = await message.guild?.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first())
		let user: User | null
		  if ((entry?.extra as any).channel.id === message.channel.id
			&& ((entry?.target as any).id === message.author?.id)
			&& (entry?.createdTimestamp !== undefined) && (entry?.createdTimestamp > (Date.now() - 5000))
			&& ((entry?.extra as any).count >= 1)) {
		  user = entry.executor
		} else { 
		  user = message.author
		}

		if(user !== null && user.bot) return;

		let embed = new MessageEmbed()
		.setTitle("**DELETED MESSAGE**")
		.setColor("#fc3c3c")
		.setAuthor('Chronicler', this.config.img, 'https://github.com/andretkachenko/chronicler-bot')
		.setThumbnail(this.config.img)
		.addField("Author", message.author?.tag, true)
		.addField("Channel", message.channel, true)
		.addField("Message", message.content)
		.addField("Executor", user, true)
		.addField("Reason", entry?.reason || "Unspecified", true)
		.setFooter(`Message ID: ${message.id} | Author ID: ${message.author?.id}`);

		auditChannel.send(embed);
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
					this.mongoConnector.auditChannels.add(auditChannel)
				})
		}
	}

	private async resolve(message: Message | PartialMessage): Promise<TextChannel> {
		if (message.guild !== null) {
			let guildId = message.guild.id as string
			let channelId = await this.mongoConnector.auditChannels.getId(guildId)
			if (channelId === null || channelId === undefined || channelId === '') {
				await this.createTextChannel(message)
				channelId = await this.mongoConnector.auditChannels.getId(guildId)
			}
			return message.guild.channels.resolve(channelId) as TextChannel
		}
		else {
			message.reply(this.dmNotSupported)
			throw new Error(this.dmNotSupported)
		}
	}
}