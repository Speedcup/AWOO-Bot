import {
    Events,
    VoiceState,
    ChannelType, VoiceChannel,
} from 'discord.js';
import ChannelManager from "../shared";
import {channel} from "diagnostics_channel";
import {discord_bot} from "../../../index";

module.exports = {
    name: Events.VoiceStateUpdate,
    execute(oldState: VoiceState, newState: VoiceState) {
        const old_member = oldState.member;

        // TODO: Check whether this channel is in our cache.
        // - We do not need to validate the category etc, because the cache only contains valid created channels.
        if (old_member && oldState.channel) {
            (async () => {
                let success = await ChannelManager.delete_channel(<VoiceChannel>oldState.channel);

                // If this was unsuccessful, it means this channel did not get deleted because it wasn't deletable. So there could be a user in it so we free ownership so others can claim it.
                if (!success && oldState.channel) {
                    if (await ChannelManager.is_owner(old_member, <VoiceChannel>oldState.channel)) {
                        const database = await discord_bot.Client.DB.connect();
                        await database.query(`UPDATE channels SET owner_id = '' WHERE channel_id = '${oldState.channel.id}'`);
                        database.release();
                    }
                }
            })();
        }

        // Check if we have a new member state, if not, we do not even need to do anything.
        const member = newState.member;
        if (member == null) return;

        // Check whether the user has joined our creation channel.
        if (newState.channel) {
            // Create a new channel
            (async () => {
                await ChannelManager.create_channel(member, <VoiceChannel>newState.channel)
            })();
        }
    },
};