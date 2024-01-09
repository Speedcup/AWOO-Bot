import { Cache } from "../../utils/globalcache";
import {CategoryChannel, ChannelType, GuildMember, VoiceChannel} from "discord.js";
import logger from "../../logger";
import { discord_bot } from "../../index";

type channel_config = {
    id: string,
    owner_id: string,
    blocked_users: string[]
}

const channel_cache = new Cache<channel_config>();

const CATEGORY_WHITELIST: string[] = ["1162179062538715148"];
// A List with every channel Id used to create channels. (Currently the easiest solution, should later rework this into a more modular system)
const CHANNEL_WHITELIST: string[] = ["1184217594710995097"];

export default class ChannelManager {
    static async load_all() {}

    // Validates the creation of a channel based of the user and creation channel he has joined.
    static can_create_channel(member: GuildMember, creation_channel: VoiceChannel) {
        return creation_channel && CHANNEL_WHITELIST.includes(<string>creation_channel.id);
    }

    static async create_channel(member: GuildMember, creation_channel: VoiceChannel) {
        logger.info(`Creating new channel for ${member.displayName}`);

        if (!this.can_create_channel(member, creation_channel)) {
            logger.warn("Could not create a new channel.")
            return
        }

        const database = await discord_bot.Client.DB.connect();
        await member.guild.channels.create({
            name: `${member ? member.displayName : 'Unknown'}'s Channel`,
            type: ChannelType.GuildVoice,
            parent: creation_channel.parent?.parentId
        }).then(async channel => {
            // Move the user to their new channel
            await member.voice.setChannel(channel);

            await database.query(
                `INSERT INTO channels (channel_id, owner_id, blocked_users) VALUES ('${channel.id}', '${member.id}', '[]')`
            )

            channel_cache.set(channel.id, {
                id: channel.id,
                owner_id: member.id,
                blocked_users: []
            })
        });

        await database.release();
    };

    static async edit_channel(member: GuildMember) {};

    static is_deletable(channel: VoiceChannel) {
        // Check if channel is valid.
        if (!channel) {
            return false;
        }

        // Do not delete creation channels.
        if (CHANNEL_WHITELIST.includes(<string>channel.id)) {
            return false;
        }

        // Do not delete channels which are not part of the temp voice system.
        if (!CATEGORY_WHITELIST.includes(<string>channel.parentId)) {
            return false;
        }

        // Do not delete channels containing members.
        if (channel.members.size > 0) {
            return false;
        }

        return true;
    }

    static async delete_channel(channel: VoiceChannel) {
        logger.info(`Deleting Channel ...`);

        if (!this.is_deletable(channel)) {
            logger.warn("Channel is not deletable.")
            return;
        }

        const cached_channel = channel_cache.get(channel?.id);

        if (!cached_channel) {
            logger.warn("Channel could not be found.")
            return false
        }

        channel_cache.pop(cached_channel.id);
        const database = await discord_bot.Client.DB.connect();
        await database.query(
            `DELETE FROM channels WHERE channel_id = '${channel.id}'`
        )
        await database.release();

        if (channel.deletable) {
            await channel.delete();
        }
    };

    static async change_owner(from: GuildMember, to: GuildMember, channel: VoiceChannel) {};

    static async kick_user(member: GuildMember, channel: VoiceChannel) {};

    static async block_user(member: GuildMember, channel: VoiceChannel) {};

    static async unblock_user(member: GuildMember, channel: VoiceChannel) {};

    static async is_owner(member: GuildMember, channel: VoiceChannel) {}

    static async can_edit(member: GuildMember, channel: VoiceChannel) {}

    static async is_blocked(member: GuildMember, channel: VoiceChannel) {}

    static async get_blocked(channel: VoiceChannel) {}
}