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
import {EMBED_COMMAND} from "../../../commands/shared";
import {VALORANT_Premiere} from "../premiere";
import {agent_cache} from "../../content";
import {discord_bot} from "../../../index";

module.exports = {
    data: EMBED_COMMAND.addSubcommand(subcommand => subcommand
        .setName('premiere')
        .setDescription('Sende das Premiere Embed')),
    async execute(interaction: CommandInteraction) {
        const premiere = await new VALORANT_Premiere().fetch_data();
        const events = await premiere.get_events();
        if (!events) return;
        // await this.generate_description()
        const tPrimaryAgent = agent_cache.get("a3bfb853-43b2-7238-a4f1-ad90e9e46bcc");
        const tSecondaryAgent = agent_cache.get("569fdd95-4d10-43ab-ca70-79becc718b46");

        // Emojis
        const emoji_correct = interaction.client.emojis.cache.get("1184888948091256932");
        const emoji_wrong = interaction.client.emojis.cache.get("1184888956479873127");
        const emoji_trash = interaction.client.emojis.cache.get("1184888993259724810");
        const emoji_download = interaction.client.emojis.cache.get("1184892192037277816");
        const emoji_reminder = interaction.client.emojis.cache.get("1184892183900332072");
        const emoji_user = interaction.client.emojis.cache.get("1184888983998697534");
        const emoji_clock = interaction.client.emojis.cache.get("1184903913036595262");

        let embeds: EmbedBuilder[] = [];
        for (const event of events) {
            const eventMap = await event.get_map();
            embeds.push(
                new EmbedBuilder()
                    .setTitle(`Premiere ➞ ${eventMap?.DisplayName}`)
                    .setColor(0x3498DB)
                    .setDescription(
                        `Premiere auf **${eventMap?.DisplayName}** ${time(Math.round(event.starts_at / 1000), TimestampStyles.RelativeTime)}
                        
                        **S** ┃ **1. Agent** ┃ **2. Agent** ┃ **Name**
                        ${emoji_clock}┃${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()}┃${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()}┃ 1
                        ${emoji_clock}┃${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()}┃${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()}┃ 2
                        ${emoji_clock}┃${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()}┃${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()}┃ 3
                        ${emoji_clock}┃${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()}┃${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()}┃ 4
                        ${emoji_clock}┃${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()}┃${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()}┃ 5
                        \n> BENCH
                        ${emoji_clock}┃${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()}┃${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()}┃ 6
                    `)
                    .setImage(eventMap ? eventMap.ListViewIcon : "")
            )

            // Just to test things, we only add one event.
            break
        }

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
    async generate_description() {
        const tPrimaryAgent = agent_cache.get("a3bfb853-43b2-7238-a4f1-ad90e9e46bcc");
        const tSecondaryAgent = agent_cache.get("569fdd95-4d10-43ab-ca70-79becc718b46");

        // Emojis
        const emoji_correct = discord_bot.Client.emojis.cache.get("1184888948091256932");
        const emoji_wrong = discord_bot.Client.emojis.cache.get("1184888956479873127");
        const emoji_clock = discord_bot.Client.emojis.cache.get("1184903913036595262");
    },
};

/*
                    .setDescription(
                        `Premiere auf **${eventMap?.DisplayName}** ${time(Math.round(event.starts_at / 1000), TimestampStyles.RelativeTime)}

                        Status ┃ Primary Agent ┃ Secondary Agent ┃ Name
                        ❌ ┃ ${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()} ┃ ${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()} ┃ ${interaction.client.users.cache.get("406420078549270539")}
                        ❌ ┃ ${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()} ┃ ${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()} ┃ ${interaction.client.users.cache.get("861992984441782343")}
                        ❌ ┃ ${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()} ┃ ${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()} ┃ ${interaction.client.users.cache.get("205077419139399682")}
                        ❌ ┃ ${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()} ┃ ${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()} ┃ ${interaction.client.users.cache.get("353211541178548226")}
                        ❌ ┃ ${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()} ┃ ${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()} ┃ ${interaction.client.users.cache.get("660816130721579021")}
                        \n> BENCH
                        ❌ ┃ ${tPrimaryAgent?.get_emoji()} ${tPrimaryAgent?.get_role_emoji()} ┃ ${tSecondaryAgent?.get_emoji()} ${tSecondaryAgent?.get_role_emoji()} ┃ ${interaction.client.users.cache.get("202243988806303744")}
                    `)
 */