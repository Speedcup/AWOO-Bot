/* Send Premiere Embed */

import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder, ActionRowBuilder, Embed, time, TimestampStyles, ButtonStyle, StringSelectMenuOptionBuilder
} from "discord.js";
import {EMBED_COMMAND} from "../shared";
import {VALORANT_Premiere} from "../../valorant/premiere/premiere";
import {agent_cache} from "../../valorant/content";

module.exports = {
    data: EMBED_COMMAND.addSubcommand(subcommand => subcommand
        .setName('premiere')
        .setDescription('Sende das Premiere Embed')),
    async execute(interaction: CommandInteraction) {
        const premiere = await new VALORANT_Premiere().fetch_data();
        const events = await premiere.get_events();
        if (!events) return;

        let embeds: EmbedBuilder[] = [];
        for (const event of events) {
            const eventMap = await event.get_map();
            embeds.push(
                new EmbedBuilder()
                    .setTitle(`Premiere ➞ ${eventMap?.DisplayName}`)
                    .setColor(0x3498DB)
                    .setDescription(
                        `Premiere auf ${eventMap?.DisplayName} ${time(Math.round(event.starts_at / 1000), TimestampStyles.RelativeTime)}
                        
                        ❌ ┃ ${interaction.client.emojis.cache.get("1036580071076540486")} ┃ ${interaction.client.emojis.cache.get("1070230894855606362")} ┃ ${interaction.client.users.cache.get("406420078549270539")}
                        ❌ ┃ ${interaction.client.emojis.cache.get("1036580071076540486")} ┃ ${interaction.client.emojis.cache.get("1070230894855606362")} ┃ ${interaction.client.users.cache.get("861992984441782343")}
                        ❌ ┃ ${interaction.client.emojis.cache.get("1036580071076540486")} ┃ ${interaction.client.emojis.cache.get("1070230894855606362")} ┃ ${interaction.client.users.cache.get("205077419139399682")}
                        ❌ ┃ ${interaction.client.emojis.cache.get("1036580071076540486")} ┃ ${interaction.client.emojis.cache.get("1070230894855606362")} ┃ ${interaction.client.users.cache.get("353211541178548226")}
                        ❌ ┃ ${interaction.client.emojis.cache.get("1036580071076540486")} ┃ ${interaction.client.emojis.cache.get("1070230894855606362")} ┃ ${interaction.client.users.cache.get("660816130721579021")}
                        \n> BENCH
                        ❌ ┃ ${interaction.client.emojis.cache.get("1036580071076540486")} ┃ ${interaction.client.emojis.cache.get("1070230894855606362")} ┃ ${interaction.client.users.cache.get("202243988806303744")}
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
                        // .setEmoji(agent.get_emoji())
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
                new ActionRowBuilder<StringSelectMenuBuilder>({
                    components: [agent_select]
                }),
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("premiere_accept")
                            .setLabel("Zusagen")
                            .setStyle(ButtonStyle.Primary),

                        new ButtonBuilder()
                            .setCustomId("premiere_deny")
                            .setLabel("Absagen")
                            .setStyle(ButtonStyle.Secondary)
                    ]
                })
            ]
        })
    },
};