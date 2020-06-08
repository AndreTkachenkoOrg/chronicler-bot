import { Config } from '../config'
import { MongoClient } from 'mongodb'
import { AuditChannelRepository } from './AuditChannelRepository';
import { IgnoredChannelsRepository } from './IgnoredChannelRepository';

export class MongoConnector {
    private client: MongoClient

    public auditChannels : AuditChannelRepository
    public ignoredChannels : IgnoredChannelsRepository

    constructor(config: Config) {
        let uri = `mongodb+srv://${config.mongoName}:${config.mongoPassword}@${config.mongoCluster}`
        this.client = new MongoClient(uri, { useNewUrlParser: true });

        this.client.connect((err) => {
            if (err) {
                console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
                return;
            }
        })

        this.auditChannels = new AuditChannelRepository(this.client, config)
        this.ignoredChannels = new IgnoredChannelsRepository(this.client, config)
    }
}