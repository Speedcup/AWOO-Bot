import {
    Events,
    VoiceState,
    ChannelType,
} from 'discord.js';
import {channel_cache} from "../../utils/globalcache";

const CATEGORY_WHITELIST: string[] = ["1162179062538715148"];
// A List with every channel Id used to create channels. (Currently the easiest solution, should later rework this into a more modular system)
const CHANNEL_WHITELIST: string[] = ["1184217594710995097"];

module.exports = {
    name: Events.VoiceStateUpdate,
    execute(oldState: VoiceState, newState: VoiceState) {
        const old_member = oldState.member;

        // Check whether the user exists and left a channel and whether it is now empty or not.
        // TODO, wenn der Owner seines eigenen Channels leaved und noch Mitglieder im Channel sind, Channel Admin weitergeben.
        if (old_member && oldState.channel && !CHANNEL_WHITELIST.includes(<string>oldState.channelId) && oldState.channel.members.size <= 0) {
            channel_cache.pop(old_member.id);

            if (oldState.channel.parentId && CATEGORY_WHITELIST.includes(oldState.channel.parentId)) {
                (async () => {
                    oldState.channel?.delete();
                })();
            }
        }

        // Check whether a new member exist, if not, we do not even need to do anything.
        const member = newState.member;
        if (member == null) return;

        // Check whether the user has joined our creation channel.
        if (newState.channel && CHANNEL_WHITELIST.includes(<string>newState.channelId)) {
            // Create a new channel
            (async () => {
                await newState.guild.channels.create({
                    name: `${member ? member.displayName : 'Unknown'}'s Channel`,
                    type: ChannelType.GuildVoice,
                    parent: newState.channel?.parentId
                }).then(async channel => {
                    // Update our current channel cache
                    channel_cache.set(member.id, channel.id);

                    // Move the user to their new channel
                    await member.voice.setChannel(channel);
                });
            })();
        }
    },
};