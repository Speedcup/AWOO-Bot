import {
    Events,
    VoiceState,
    ChannelType, VoiceChannel,
} from 'discord.js';
import ChannelManager from "../shared";

module.exports = {
    name: Events.VoiceStateUpdate,
    execute(oldState: VoiceState, newState: VoiceState) {
        const old_member = oldState.member;

        // TODO: Check whether this channel is in our cache.
        // - We do not need to validate the category etc, because the cache only contains valid created channels.
        if (old_member && oldState.channel) {
            (async () => {
                await ChannelManager.delete_channel(<VoiceChannel>oldState.channel);
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