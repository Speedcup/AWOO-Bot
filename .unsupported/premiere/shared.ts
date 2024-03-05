import {
    ActionRow,
    ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, Component,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandGroupBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel,
    time,
    TimestampStyles
} from "discord.js";
import { Premiere_ScheduledEvent, VALORANT_Premiere } from "./premiere";
import {discord_bot} from "../../index";
import {agent_cache} from "../content";
import PageSelection from "../../utils/pagination";
import logger from "../../logger";
import Emojis from "../../utils/emoji";

export {
    WHITELIST,
    UpdatePremiereEmbed, GenerateEventPageSelection, GenerateEventEmbeds
};

const PREMIERE_CHANNEL_ID = "1165795580858077195";
const PREMIERE_MESSAGE_ID = "1185402327801274378";

const WHITELIST = ["406420078549270539"];


const GenerateEventEmbed = async (event: Premiere_ScheduledEvent): Promise<EmbedBuilder> => {
    const database = await discord_bot.Client.DB.connect();

    const members = await database.query(`SELECT * FROM members`);
    const participation = await database.query(`SELECT * FROM events WHERE event_id = '${event.event_id}'`);
    database.release();

    // Emojis
    const emoji_correct = Emojis.get_emoji("correct");
    const emoji_wrong = Emojis.get_emoji("wrong");
    const emoji_clock = Emojis.get_emoji("reminder");
    const emoji_switch = Emojis.get_emoji("switch");

    let description: string = "";
    for (const member of members.rows) {
        if (participation.rows.some((data: any) => data.discord_id == member.discord_id)) {
            const player = participation.rows.find((v: any) => v.discord_id == member.discord_id)

            const primaryAgent = agent_cache.get(player.primary_agent);
            const secondaryAgent = agent_cache.get(player.secondary_agent);

            description += `${player.participating ? emoji_correct : emoji_wrong}┃`;
            description += `${primaryAgent ? primaryAgent.get_emoji() : emoji_wrong}${primaryAgent ? primaryAgent.get_role_emoji() : ""}┃`;

            if (secondaryAgent) {
                description += `${secondaryAgent.get_emoji()}${secondaryAgent.get_role_emoji()}┃`;
            }

            description += `${member.bench ? emoji_switch : ""}<@${player.discord_id}>\n`
        } else {
            description += `${emoji_clock}┃${member.bench ? emoji_switch : ""} <@${member.discord_id}>\n`
        }
    }

    const eventMap = await event.get_map();

    return new EmbedBuilder()
        .setTitle(`Premiere ➞ ${event.event?.type ?? "?"}`)
        .setColor(0x3498DB)
        .setDescription(
            `Premiere auf **${eventMap?.DisplayName}** ${time(Math.round(event.starts_at / 1000), TimestampStyles.RelativeTime)}\n\n`
            + description
        )
        .setThumbnail("https://cdn.henrikdev.xyz/valorant/v1/premier/team-icon/f6cdfd06-4a98-792a-3a37-a88805ba99ce?primary=0d0c0d&secondary=06347f&tertiary=d6cec0")
        .setImage(eventMap ? eventMap.ListViewIcon : "")
        .setFooter({
            text: event.event_id
        })
}

const GenerateEventEmbeds = async (limit: number = 2): Promise<EmbedBuilder[]> => {
    const premiere = await new VALORANT_Premiere().fetch_data();
    const scheduledEvents = await premiere.get_events();
    if (!scheduledEvents) return [];

    let count: number = 0;
    const events: Premiere_ScheduledEvent[] = [];
    for (const event of scheduledEvents) {
        if (count == limit) {
            break;
        }

        events.push(event);
        count += 1;
    }

    let embeds: EmbedBuilder[] = [];
    for (const event of events) {
        const embed = await GenerateEventEmbed(event);
        embeds.push(embed);
    }

    return embeds;
};

const GenerateEventComponents = async (): Promise<(ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[]> => {
    // Emojis
    const emoji_correct = Emojis.get_emoji("correct");
    const emoji_wrong = Emojis.get_emoji("wrong");
    const emoji_trash = Emojis.get_emoji("trash");
    const emoji_reminder = Emojis.get_emoji("reminder");

    const button_components: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>({
        components: [
            new ButtonBuilder()
                .setCustomId("premiere_accept")
                .setEmoji(emoji_correct ? emoji_correct.id : "✅")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("premiere_deny")
                .setEmoji(emoji_wrong ? emoji_wrong.id : "❌")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("premiere_reminder")
                .setLabel("Erinnern")
                .setEmoji(emoji_reminder ? emoji_reminder.id : "⏰")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId("premiere_reset")
                .setLabel("Zurücksetzen")
                .setEmoji(emoji_trash ? emoji_trash.id : "♻")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
        ]
    })

    let select_options: StringSelectMenuOptionBuilder[] = [];
    for (let uuid in agent_cache.getAll()) {
        const agent = agent_cache.get(uuid);

        if (agent) {
            select_options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(String(agent.DisplayName))
                    .setValue(String(agent.UUID))
                    .setEmoji(agent.get_emoji().id ?? "⚠")
            )
        }
    }

    const stringselect_component: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>({
        components: [
            new StringSelectMenuBuilder()
                .setCustomId("premiere_agent_select")
                .setPlaceholder("Wähle deinen Agent ...")
                .addOptions(select_options)
        ]
    })

    return [button_components, stringselect_component];
}

const GenerateEventArray = async (limit: number = 2): Promise<{
    components: (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[];
    embeds: EmbedBuilder[]
}[]> => {
    const embeds: EmbedBuilder[] = await GenerateEventEmbeds(limit);
    const components: (ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>)[] = await GenerateEventComponents();

    return Array({
        embeds: embeds,
        components: components
    })
}

const GenerateEventPageSelection = async (limit: number = 2, uuid: string | undefined = undefined): Promise<PageSelection> => {
    // const data = await GenerateEventArray(limit);
    const embeds = await GenerateEventEmbeds(limit);
    const components = await GenerateEventComponents();

    return new PageSelection(
        embeds,
        components,
        0,
        uuid
    )
}

const UpdatePremiereEmbed = async (limit: number = 2) => {
    const premiere = await new VALORANT_Premiere().fetch_data();
    const scheduledEvents = await premiere.get_events();

    const message = await discord_bot.Client.channels.fetch(PREMIERE_CHANNEL_ID).then((channel: TextChannel) => {
        return channel.messages.fetch(PREMIERE_MESSAGE_ID)
    })

    if (scheduledEvents ? (scheduledEvents.length <= 0) : true) {
        await message.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Premiere ➞ Keine Matches`)
                    .setColor(0xE81123)
                    .setDescription(`Derzeit finden keine Events statt.`)
                    .setThumbnail("https://cdn.henrikdev.xyz/valorant/v1/premier/team-icon/f6cdfd06-4a98-792a-3a37-a88805ba99ce?primary=0d0c0d&secondary=06347f&tertiary=d6cec0")
                    .setImage("https://media.valorant-api.com/playercards/c8c31580-4315-967b-998b-dfa377bb8843/wideart.png")
            ],
            components: []
        })
    } else {
        const pageSelection = await GenerateEventPageSelection(limit, message.id);
        await pageSelection.edit(message);
    }
}