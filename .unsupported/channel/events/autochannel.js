"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const globalcache_1 = require("../../../utils/globalcache");
const CATEGORY_WHITELIST = [
    "1214067221022900264"
];
// A List with every channel Id used to create channels. (Currently the easiest solution, should later rework this into a more modular system)
const CHANNEL_WHITELIST = [
    "1184217594710995097"
];
module.exports = {
    name: discord_js_1.Events.VoiceStateUpdate,
    execute(oldState, newState) {
        const old_member = oldState.member;
        // Check if we have a valid old member state and whether the channel is now empty or not.
        // TODO, wenn der Owner seines eigenen Channels leaved und noch Mitglieder im Channel sind, Channel Admin weitergeben.
        if (old_member && oldState.channel && !CHANNEL_WHITELIST.includes(oldState.channelId) && oldState.channel.members.size <= 0) {
            globalcache_1.channel_cache.pop(old_member.id);
            if (oldState.channel.parentId && CATEGORY_WHITELIST.includes(oldState.channel.parentId)) {
                (() => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    (_a = oldState.channel) === null || _a === void 0 ? void 0 : _a.delete();
                }))();
            }
        }
        // Check if we have a new member state, if not, we do not even need to do anything.
        const member = newState.member;
        if (member == null)
            return;
        // Check whether the user has joined our creation channel.
        if (newState.channel && CHANNEL_WHITELIST.includes(newState.channelId)) {
            // Create a new channel
            (() => __awaiter(this, void 0, void 0, function* () {
                var _b;
                yield newState.guild.channels.create({
                    name: `${member ? member.displayName : 'Unknown'}'s Channel`,
                    type: discord_js_1.ChannelType.GuildVoice,
                    parent: (_b = newState.channel) === null || _b === void 0 ? void 0 : _b.parentId
                }).then((channel) => __awaiter(this, void 0, void 0, function* () {
                    // Update our current channel cache
                    globalcache_1.channel_cache.set(member.id, channel.id);
                    // Move the user to their new channel
                    yield member.voice.setChannel(channel);
                }));
            }))();
        }
    },
};
