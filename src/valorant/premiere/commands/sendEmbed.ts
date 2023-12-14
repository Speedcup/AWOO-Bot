/* Send Premiere Embed */

import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    time,
    TimestampStyles,
    ButtonStyle,
    StringSelectMenuOptionBuilder,
    GuildEmoji
} from "discord.js";
import { EMBED_COMMAND } from "../../../commands/shared";
import { VALORANT_Premiere, Premiere_ScheduledEvent } from "../premiere";
import { agent_cache } from "../../content";
import { discord_bot } from "../../../index";

module.exports = {
    data: EMBED_COMMAND.addSubcommand(subcommand => subcommand
        .setName('premiere')
        .setDescription('Sende das Premiere Embed')),
    async execute(interaction: CommandInteraction) {
        const premiere = await new VALORANT_Premiere().fetch_data();
        const events = await premiere.get_events();
        if (!events) return;

        const current_event = events[0];
        const upcoming_event = events[1];

        const emoji_correct = interaction.client.emojis.cache.get("1184888948091256932");
        const emoji_wrong = interaction.client.emojis.cache.get("1184888956479873127");
        const emoji_trash = interaction.client.emojis.cache.get("1184888993259724810");
        const emoji_reminder = interaction.client.emojis.cache.get("1184892183900332072");

        let embeds: EmbedBuilder[] = [
            await this.generate_event(interaction, current_event),
            // await this.generate_event(interaction, upcoming_event),
        ];

        let select_options: StringSelectMenuOptionBuilder[] = [];
        for (let uuid in agent_cache.getAll()) {
            const agent = agent_cache.get(uuid);

            if (agent) {
                select_options.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(String(agent.DisplayName))
                        .setValue(String(agent.UUID))
                        .setEmoji(agent.get_emoji().id)
                )
            }
        }

        const agent_select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("premiere_agent_select")
            .setPlaceholder("Wähle deinen Agent ...")
            .addOptions(select_options);

        await interaction.reply({
            embeds: [...embeds],
            components: [
                new ActionRowBuilder<ButtonBuilder>({
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
                }),
                new ActionRowBuilder<StringSelectMenuBuilder>({
                    components: [agent_select]
                }),
            ]
        })
    },

    // async generate_team_overview(interaction: CommandInteraction): Promise<EmbedBuilder | undefined> {},
    async generate_event(interaction: CommandInteraction, event: Premiere_ScheduledEvent): Promise<EmbedBuilder | undefined> {
        const database = await discord_bot.Client.DB.connect();

        const members = await database.query(`SELECT * FROM members`);
        const participation = await database.query(`SELECT * FROM events WHERE event_id = '${event.event_id}'`);

        // Emojis
        const emoji_correct = interaction.client.emojis.cache.get("1184888948091256932");
        const emoji_wrong = interaction.client.emojis.cache.get("1184888956479873127");
        const emoji_user = interaction.client.emojis.cache.get("1184888983998697534");
        const emoji_clock = interaction.client.emojis.cache.get("1184903913036595262");
        const emoji_switch = interaction.client.emojis.cache.get("1184968671345520690");

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
        let event_embed = new EmbedBuilder()
            .setTitle(`Premiere ➞ ${eventMap?.DisplayName}`)
            .setColor(0x3498DB)
            .setDescription(
                `Premiere auf **${eventMap?.DisplayName}** ${time(Math.round(event.starts_at / 1000), TimestampStyles.RelativeTime)}\n\n`
                + description
            )
            .setThumbnail("https://cdn.henrikdev.xyz/valorant/v1/premier/team-icon/f6cdfd06-4a98-792a-3a37-a88805ba99ce?primary=0d0c0d&secondary=06347f&tertiary=d6cec0")
            .setImage(eventMap ? eventMap.ListViewIcon : "")

        return event_embed;
    },
};