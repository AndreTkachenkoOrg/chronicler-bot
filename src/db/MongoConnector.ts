import { Config } from '../config'
import { MongoClient } from 'mongodb'
import { AuditChannel } from '../entities/AuditChannel';

export class MongoConnector {
    private client: MongoClient
    private channelCollectionName: string
    private dbName: string

    constructor(config: Config) {
        this.channelCollectionName = config.channelCollectionName
        this.dbName = config.mongoDb
        let uri = `mongodb+srv://${config.mongoName}:${config.mongoPassword}@${config.mongoCluster}`
        this.client = new MongoClient(uri, { useNewUrlParser: true });

        this.client.connect((err) => {
            if (err) {
                console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
                return;
            }
        })
    }

    public async getId(guildId: string): Promise<string> {
        let channelId: string = ''
        let db = this.client.db(this.dbName);
        let auditChannels = db.collection<AuditChannel>(this.channelCollectionName);
        let aggregation = auditChannels.find({ guildId: guildId })
        return aggregation.toArray()
            .then(channels => {
                let auditChannel = channels[0];
                if (auditChannel !== undefined) channelId = auditChannel.channelId
                return channelId
            })
    }

    public add(auditChannel: AuditChannel) {
        let db = this.client.db(this.dbName)
        let introMaps = db.collection(this.channelCollectionName)
        introMaps.insertOne(auditChannel, (err) => {
            if (err) console.log(err)
            console.log("document inserted")
        })
    }
}