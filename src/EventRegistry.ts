import { Client, Message, PartialMessage } from "discord.js"
import { Logger } from "./handlers/Logger"
import { AuditHandler } from "./handlers/AuditHandler"
import { ClientEvent } from "./enums/ClientEvent"
import { ProcessEvent } from "./enums/ProcessEvent"
import { Config } from "./config"
import { HelpHandlers } from "./handlers/HelpHandlers"
import { MongoConnector } from "./db/MongoConnector"

export class EventRegistry {
    private client: Client
    private config: Config

    private logger: Logger
    private auditHandler: AuditHandler
    private helpHandlers: HelpHandlers

    constructor(client: Client, config: Config) {
        this.client = client
        this.config = config

        let mongoConnector = new MongoConnector(config)

        this.logger = new Logger()
        this.auditHandler = new AuditHandler(mongoConnector)
        this.helpHandlers = new HelpHandlers(client, config)
    }

    public registerEvents() {
        // => Log bot started and listening
        this.registerReadyHandler()

        // => Main worker handlers
        this.registerMessageHandler()
        this.registerMessageUpdateHandler()
        this.registerMessageDeleteHandler()

        // => Bot error and warn handlers
        this.client.on(ClientEvent.Error, this.logger.logError)
        this.client.on(ClientEvent.Warn, this.logger.logWarn)

        // => Process handlers
        this.registerProcessHandlers()
    }

    // ---------------- //
    //  Event Handlers  //
    // ---------------- //

    private registerReadyHandler() {
        !
            this.client.once(ClientEvent.Ready, () => {
                this.logger.introduce(this.client, this.config);
            });
    }

    private registerMessageHandler() {
        this.client.on(ClientEvent.Message, (message: Message) => {
            this.helpHandlers.handleHelpCall(message)
        })
    }

    private registerMessageUpdateHandler() {
        this.client.on(ClientEvent.MessageUpdate, (messageBefore : Message | PartialMessage, messageAfter : Message | PartialMessage) => {
            this.auditHandler.handleMessageUpdate(messageBefore, messageAfter)
        })
    }

    private registerMessageDeleteHandler() {
        this.client.on(ClientEvent.MessageDelete, (message: Message | PartialMessage) => {
            this.auditHandler.handleMessageDelete(message)
        })
    }

    private registerProcessHandlers() {
        process.on(ProcessEvent.Exit, () => {
            const msg = `[Chronicler-bot] Process exit.`
            this.logger.logEvent(msg)
            console.log(msg)
            this.client.destroy()
        })

        process.on(ProcessEvent.UncaughtException, (err: Error) => {
            const errorMsg = (err ? err.stack || err : '').toString().replace(new RegExp(`${__dirname}\/`, 'g'), './')
            this.logger.logError(errorMsg.substring(0, 500))
            console.log(errorMsg.substring(0, 500))
        })

        process.on(ProcessEvent.UnhandledRejection, (reason: {} | null | undefined) => {
            const msg = `Uncaught Promise rejection: ${reason}`
            this.logger.logError(msg.substring(0, 500))
            console.log(msg.substring(0, 500))
        })
    }

    private hasAdminPermission(message: Message): boolean {
        return message.member !== null && message.member.hasPermission("ADMINISTRATOR")
    }
}