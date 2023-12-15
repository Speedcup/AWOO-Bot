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
import {GenerateEventEmbeds} from "../shared";
import PageSelection from "../../../utils/pagination";

module.exports = {
    data: EMBED_COMMAND.addSubcommand(subcommand => subcommand
        .setName('premiere')
        .setDescription('Sende das Premiere Embed')),
    async execute(interaction: CommandInteraction) {
        const emoji_correct = interaction.client.emojis.cache.get("1184888948091256932");
        const emoji_wrong = interaction.client.emojis.cache.get("1184888956479873127");
        const emoji_trash = interaction.client.emojis.cache.get("1184888993259724810");
        const emoji_reminder = interaction.client.emojis.cache.get("1184892183900332072");

        let embeds: EmbedBuilder[] | undefined = await GenerateEventEmbeds(3);
        if (!embeds) return;

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

        const pageSelection = new PageSelection(
            embeds,
            [
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
            ],
            0 // Remain infinite
        );
        await pageSelection.send(interaction);
    },
};