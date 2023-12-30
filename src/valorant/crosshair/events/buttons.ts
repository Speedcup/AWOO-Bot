import {
    ActionRowBuilder, ButtonBuilder,
    ButtonInteraction,
    ButtonStyle, Colors,
    EmbedBuilder,
    Events,
    GuildMember, messageLink,
    StringSelectMenuInteraction, TextChannel
} from 'discord.js';
import Emojis from "../../../utils/emoji";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: ButtonInteraction) {
        if (interaction.customId && interaction.customId.startsWith("crosshair")) {
            if (interaction.member && interaction.guild) {
                switch (interaction.customId) {
                    case "crosshair_save":
                        await interaction.reply({
                            content: "Work in Progress.",
                            ephemeral: true
                        })

                        break;
                    case "crosshair_copy":
                        await interaction.reply({
                            content: interaction.message.embeds[0].footer?.text ?? "",
                            ephemeral: true
                        })

                        break;
                    case "crosshair_share":
                        const emoji_files = Emojis.get_emoji("files");
                        const channel: any = interaction.guild.channels.cache.get("1164603968807243806")!;
                        const crosshair_code = interaction.message.embeds[0].footer?.text!;

                        await channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Crosshair Code")
                                    .setDescription(`${interaction.member} hat einen Crosshair Code geteilt!`)
                                    .setImage(`https://api.henrikdev.xyz/valorant/v1/crosshair/generate?id=${crosshair_code}`)
                                    .setFooter({
                                        text: crosshair_code
                                    })
                            ],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setLabel("Kopieren")
                                            .setStyle(ButtonStyle.Secondary)
                                            .setEmoji(emoji_files.id)
                                            .setCustomId("crosshair_copy")
                                    )
                            ]
                        })

                        await interaction.message.edit({
                            components: [] // TODO, remove share button and done.
                        })

                        await interaction.reply({
                            content: "Erfolgreich geteilt!",
                            ephemeral: true
                        })

                        break;
                    default:
                        await interaction.reply({
                            content: `Es ist ein unbekannter Fehler aufgetreten.`,
                            ephemeral: true
                        })

                        break
                }
            }
        }
    },
};