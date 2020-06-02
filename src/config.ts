import * as dotenv from "dotenv";

export class Config {
    token: string
    environment: string
    prefix: string
    mongoName: string
    mongoPassword: string
    mongoCluster: string
    mongoDb: string
    channelCollectionName: string

    constructor() {
        dotenv.config()
        this.token = process.env.TOKEN as string
        this.environment = process.env.NODE_ENV as string
        this.prefix = process.env.PREFIX as string
        this.mongoName = process.env.MONGO_NAME as string
        this.mongoPassword = process.env.MONGO_PWD as string
        this.mongoCluster = process.env.MONGO_CLUSTER as string
        this.mongoDb=process.env.MONGO_DB as string
        this.channelCollectionName = process.env.MONGO_CH_COLLECTION as string
    }
}