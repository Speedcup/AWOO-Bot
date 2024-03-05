import {ChannelType, Guild, GuildMember, Snowflake, VoiceChannel} from "discord.js";
import {discord_bot} from "../../index";
import {channel} from "diagnostics_channel";

// Since we are currently not using a cache system, this is unused.
type PrivateChannel = {
    id: Snowflake,
    owner: Snowflake,
    blocked_users: Snowflake[]
}

export default class ChannelManager {
    static can_create_channel(member: GuildMember, base_channel: VoiceChannel): boolean {
        // Since I am way too lazy rn to program a modular, dynamic category & creation channel whitelist, I will hardcode my single one.

        // Do not allow VANGUARD (the bot) to create channels. This should never be a possibility in the first place, but to be safe.
        if (member.id == "1071500194467819540") {
            return false;
        }

        return base_channel.id == "1214478426547949568";
    }

    // Returns whether a channel is deletable.
    //
    // A Channel is considered deletable when ...
    // ... the channel is empty.
    // ... the channel was created by the ChannelManager. (This means the channel was registered by a user who joined a creator channel.)
    static async is_channel_deletable(channel: VoiceChannel): Promise<boolean> {
        // Do not (try to) delete non-empty channels.
        if (channel.members.size > 0) {
            return false;
        }

        // If the channel is generally not deletable (for example if the bot does not have sufficient permissions) return false.
        if (!channel.deletable) {
            return false;
        }

        // We could check the local cache here, but if for some reason the bot does not have an up to date cache, checking the cache would fail.
        // Since the discord is not big enough to have reasonable concerns of performance, doing db checks here should be alright.

        const database = await discord_bot.Client.DB.connect();

        let results = await database.query(`SELECT channel_id FROM channels WHERE channel_id = '${channel.id}'`);
        database.release();

        // If we have a result (and it should be == 1) the channel is practically deletable.
        return (results.rowCount > 0);
    }

    // Creates a channel within the base channel category. If none is specified, it will not be created in a category.
    static async create_channel(member: GuildMember, base_channel: VoiceChannel) {
        if (!this.can_create_channel(member, base_channel)) {
            return
        }

        const database = await discord_bot.Client.DB.connect();

        await base_channel.guild.channels.create({
            name: `${member ? member.displayName : 'Unknown'}'s Channel`,
            type: ChannelType.GuildVoice,
            parent: base_channel.parentId
        }).then(async channel => {
            await database.query(`INSERT INTO channels (channel_id, owner_id) VALUES ('${channel.id}', '${member.id}')`);

            // Move the user to their new channel
            await member.voice.setChannel(channel);
        });

        database.release();
    }

    static async delete_channel(channel: VoiceChannel) {
        // Check whether this channel is deletable.
        if (!await this.is_channel_deletable(channel)) {
            return;
        }

        const database = await discord_bot.Client.DB.connect();

        let results = await database.query(`DELETE FROM channels WHERE channel_id = '${channel.id}'`);
        database.release();

        await channel.delete();
    }

    static async is_owner(member: GuildMember, channel: VoiceChannel) {
        const database = await discord_bot.Client.DB.connect();
        const result = await database.query(`SELECT * FROM channels WHERE channel_id = '${channel.id}'`);
        database.release();

        if (!result || result.rowCount <= 0) return false;

        let item = result.rows[0];
        if (!item) return false;

        return item.owner_id == member.id;
    }
}