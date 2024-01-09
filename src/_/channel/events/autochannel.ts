import {
    Events,
    VoiceState,
    ChannelType, VoiceChannel, GuildMember, CategoryChannel,
} from 'discord.js';
import {channel_cache} from "../../../utils/globalcache";
import ChannelManager from "../shared";

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {
        // Check whether the user exists and left a channel and whether it is now empty or not.
        // TODO, wenn der Owner seines eigenen Channels leaved und noch Mitglieder im Channel sind, Channel Admin weitergeben.
        if (oldState && oldState.channel) {
            await ChannelManager.delete_channel(<VoiceChannel>oldState.channel);
        }

        // Check whether a new member exist, if not, we do not even need to do anything.
        const member = newState.member;
        if (member == null) return;

        await ChannelManager.create_channel(<GuildMember>newState.member, <VoiceChannel>newState.channel)
    },
};