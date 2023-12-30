/* Send Premiere Embed */

import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    CommandInteraction,
    CommandInteractionOptionResolver, EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import axios from "axios";
import Emojis from "../../../utils/emoji";

module.exports = {
    command: new SlashCommandBuilder()
        .setName('crosshair')
        .setDescription('Visualisiert einen Crosshair Code.')
        .addStringOption(option =>
            option
                .setName('code')
                .setDescription('Der (exportierte) Crosshair Code.')
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        const option = interaction.options as CommandInteractionOptionResolver;
        const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/crosshair/generate`, {
            params: { id: option.getString("code") }
        });

        if (response.status !== 200 || !(response.config && response.config.url)) {
            return await interaction.reply({
                content: "Etwas ist schief gelaufen! Bitte überprüfe den Crosshair Code.",
                ephemeral: true
            })
        }

        // const image = new AttachmentBuilder(`${response.config.url}?id=${response.config.params.id}`,{
        //     name: "image.png"
        // });

        const crosshair_url = `${response.config.url}?id=${response.config.params.id}`;
        const emoji_download = Emojis.get_emoji("download");
        const emoji_files = Emojis.get_emoji("files");
        const emoji_share = Emojis.get_emoji("share");

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Crosshair Code")
                    .setImage(crosshair_url)
                    .setFooter({
                        text: option.getString("code") ?? ""
                    })
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Speichern")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(emoji_download.id)
                            .setCustomId("crosshair_save")
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setLabel("Kopieren")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(emoji_files.id)
                            .setCustomId("crosshair_copy")
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setLabel("Teilen")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(emoji_share.id)
                            .setCustomId("crosshair_share"),
                    ),
            ],
            ephemeral: true
            //files: [image]
        })
    },
};