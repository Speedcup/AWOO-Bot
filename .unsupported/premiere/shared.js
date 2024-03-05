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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateEventEmbeds = exports.GenerateEventPageSelection = exports.UpdatePremiereEmbed = exports.WHITELIST = void 0;
const discord_js_1 = require("discord.js");
const premiere_1 = require("./premiere");
const index_1 = require("../../index");
const content_1 = require("../content");
const pagination_1 = __importDefault(require("../../utils/pagination"));
const emoji_1 = __importDefault(require("../../utils/emoji"));
const PREMIERE_CHANNEL_ID = "1165795580858077195";
const PREMIERE_MESSAGE_ID = "1185402327801274378";
const WHITELIST = ["406420078549270539"];
exports.WHITELIST = WHITELIST;
const GenerateEventEmbed = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const database = yield index_1.discord_bot.Client.DB.connect();
    const members = yield database.query(`SELECT * FROM members`);
    const participation = yield database.query(`SELECT * FROM events WHERE event_id = '${event.event_id}'`);
    database.release();
    // Emojis
    const emoji_correct = emoji_1.default.get_emoji("correct");
    const emoji_wrong = emoji_1.default.get_emoji("wrong");
    const emoji_clock = emoji_1.default.get_emoji("reminder");
    const emoji_switch = emoji_1.default.get_emoji("switch");
    let description = "";
    for (const member of members.rows) {
        if (participation.rows.some((data) => data.discord_id == member.discord_id)) {
            const player = participation.rows.find((v) => v.discord_id == member.discord_id);
            const primaryAgent = content_1.agent_cache.get(player.primary_agent);
            const secondaryAgent = content_1.agent_cache.get(player.secondary_agent);
            description += `${player.participating ? emoji_correct : emoji_wrong}┃`;
            description += `${primaryAgent ? primaryAgent.get_emoji() : emoji_wrong}${primaryAgent ? primaryAgent.get_role_emoji() : ""}┃`;
            if (secondaryAgent) {
                description += `${secondaryAgent.get_emoji()}${secondaryAgent.get_role_emoji()}┃`;
            }
            description += `${member.bench ? emoji_switch : ""}<@${player.discord_id}>\n`;
        }
        else {
            description += `${emoji_clock}┃${member.bench ? emoji_switch : ""} <@${member.discord_id}>\n`;
        }
    }
    const eventMap = yield event.get_map();
    return new discord_js_1.EmbedBuilder()
        .setTitle(`Premiere ➞ ${(_b = (_a = event.event) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : "?"}`)
        .setColor(0x3498DB)
        .setDescription(`Premiere auf **${eventMap === null || eventMap === void 0 ? void 0 : eventMap.DisplayName}** ${(0, discord_js_1.time)(Math.round(event.starts_at / 1000), discord_js_1.TimestampStyles.RelativeTime)}\n\n`
        + description)
        .setThumbnail("https://cdn.henrikdev.xyz/valorant/v1/premier/team-icon/f6cdfd06-4a98-792a-3a37-a88805ba99ce?primary=0d0c0d&secondary=06347f&tertiary=d6cec0")
        .setImage(eventMap ? eventMap.ListViewIcon : "")
        .setFooter({
        text: event.event_id
    });
});
const GenerateEventEmbeds = (limit = 2) => __awaiter(void 0, void 0, void 0, function* () {
    const premiere = yield new premiere_1.VALORANT_Premiere().fetch_data();
    const scheduledEvents = yield premiere.get_events();
    if (!scheduledEvents)
        return [];
    let count = 0;
    const events = [];
    for (const event of scheduledEvents) {
        if (count == limit) {
            break;
        }
        events.push(event);
        count += 1;
    }
    let embeds = [];
    for (const event of events) {
        const embed = yield GenerateEventEmbed(event);
        embeds.push(embed);
    }
    return embeds;
});
exports.GenerateEventEmbeds = GenerateEventEmbeds;
const GenerateEventComponents = () => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    // Emojis
    const emoji_correct = emoji_1.default.get_emoji("correct");
    const emoji_wrong = emoji_1.default.get_emoji("wrong");
    const emoji_trash = emoji_1.default.get_emoji("trash");
    const emoji_reminder = emoji_1.default.get_emoji("reminder");
    const button_components = new discord_js_1.ActionRowBuilder({
        components: [
            new discord_js_1.ButtonBuilder()
                .setCustomId("premiere_accept")
                .setEmoji(emoji_correct ? emoji_correct.id : "✅")
                .setStyle(discord_js_1.ButtonStyle.Primary),
            new discord_js_1.ButtonBuilder()
                .setCustomId("premiere_deny")
                .setEmoji(emoji_wrong ? emoji_wrong.id : "❌")
                .setStyle(discord_js_1.ButtonStyle.Secondary),
            new discord_js_1.ButtonBuilder()
                .setCustomId("premiere_reminder")
                .setLabel("Erinnern")
                .setEmoji(emoji_reminder ? emoji_reminder.id : "⏰")
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setDisabled(true),
            new discord_js_1.ButtonBuilder()
                .setCustomId("premiere_reset")
                .setLabel("Zurücksetzen")
                .setEmoji(emoji_trash ? emoji_trash.id : "♻")
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setDisabled(true),
        ]
    });
    let select_options = [];
    for (let uuid in content_1.agent_cache.getAll()) {
        const agent = content_1.agent_cache.get(uuid);
        if (agent) {
            select_options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel(String(agent.DisplayName))
                .setValue(String(agent.UUID))
                .setEmoji((_c = agent.get_emoji().id) !== null && _c !== void 0 ? _c : "⚠"));
        }
    }
    const stringselect_component = new discord_js_1.ActionRowBuilder({
        components: [
            new discord_js_1.StringSelectMenuBuilder()
                .setCustomId("premiere_agent_select")
                .setPlaceholder("Wähle deinen Agent ...")
                .addOptions(select_options)
        ]
    });
    return [button_components, stringselect_component];
});
const GenerateEventArray = (limit = 2) => __awaiter(void 0, void 0, void 0, function* () {
    const embeds = yield GenerateEventEmbeds(limit);
    const components = yield GenerateEventComponents();
    return Array({
        embeds: embeds,
        components: components
    });
});
const GenerateEventPageSelection = (limit = 2, uuid = undefined) => __awaiter(void 0, void 0, void 0, function* () {
    // const data = await GenerateEventArray(limit);
    const embeds = yield GenerateEventEmbeds(limit);
    const components = yield GenerateEventComponents();
    return new pagination_1.default(embeds, components, 0, uuid);
});
exports.GenerateEventPageSelection = GenerateEventPageSelection;
const UpdatePremiereEmbed = (limit = 2) => __awaiter(void 0, void 0, void 0, function* () {
    const premiere = yield new premiere_1.VALORANT_Premiere().fetch_data();
    const scheduledEvents = yield premiere.get_events();
    const message = yield index_1.discord_bot.Client.channels.fetch(PREMIERE_CHANNEL_ID).then((channel) => {
        return channel.messages.fetch(PREMIERE_MESSAGE_ID);
    });
    if (scheduledEvents ? (scheduledEvents.length <= 0) : true) {
        yield message.edit({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setTitle(`Premiere ➞ Keine Matches`)
                    .setColor(0xE81123)
                    .setDescription(`Derzeit finden keine Events statt.`)
                    .setThumbnail("https://cdn.henrikdev.xyz/valorant/v1/premier/team-icon/f6cdfd06-4a98-792a-3a37-a88805ba99ce?primary=0d0c0d&secondary=06347f&tertiary=d6cec0")
                    .setImage("https://media.valorant-api.com/playercards/c8c31580-4315-967b-998b-dfa377bb8843/wideart.png")
            ],
            components: []
        });
    }
    else {
        const pageSelection = yield GenerateEventPageSelection(limit, message.id);
        yield pageSelection.edit(message);
    }
});
exports.UpdatePremiereEmbed = UpdatePremiereEmbed;
