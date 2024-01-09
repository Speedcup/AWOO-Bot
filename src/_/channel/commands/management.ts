/* Send Channel Management Embed */

import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuOptionBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder, User, GuildMember
} from "discord.js";
import RoleSystem from "../../../discord/roles/shared";
import {IsSPEEDCUP} from "../../../discord/shared";
import Emojis from "../../../utils/emoji";

module.exports = {
    command: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Channel Commands'),
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("embed")
        .setDescription("Sende das Kanalverwaltungsembed."),
    can_execute: (user: User | GuildMember) => {
        return IsSPEEDCUP(user);
    },
    async execute(interaction: CommandInteraction) {
        const message = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Kanaleinstellungen")
                    .setColor(0x3498DB)
                    .setDescription(
                        `> **Was ist die Kanalverwaltung, und wie benutze ich sie?**
                        ↬ Das System gibt dir die Möglichkeit deinen eigenen Channel zu erstellen und zu verwalten.
                        ↬ Joine hierfür einfach dem Kanal <#1184217594710995097> und automatisch wird für dich ein Kanal erstellt.
                        ↬ Wenn du einen Kanal besitzt, kannst du hier verschiedene Einstellungen vornehmen.`)
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("channel_open")
                            .setLabel("Öffnen")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("unlock").id),
                        new ButtonBuilder()
                            .setCustomId("channel_close")
                            .setLabel("Schließen")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("lock").id),
                        new ButtonBuilder()
                            .setCustomId("channel_edit")
                            .setLabel("Bearbeiten")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("edit").id)
                    ]
                }),
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("channel_block")
                            .setLabel("User Blockieren")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("ban_members").id),
                        new ButtonBuilder()
                            .setCustomId("channel_unblock")
                            .setLabel("User Entblockieren")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("unban_members").id),
                        new ButtonBuilder()
                            .setCustomId("channel_kick")
                            .setLabel("User Kicken")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("ban").id)
                    ]
                }),
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("channel_claim")
                            .setLabel("Channel Claimen")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("arrow_add").id),
                        new ButtonBuilder()
                            .setCustomId("channel_switch")
                            .setLabel("Channel Weitergeben")
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(Emojis.get_emoji("arrow_remove").id),
                    ]
                }),
            ]
        })
    },
};