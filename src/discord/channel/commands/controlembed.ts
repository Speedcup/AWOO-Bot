/* Send Channel Management Embed */

import {
    CommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder, User, GuildMember
} from "discord.js";
import {IsSPEEDCUP} from "../../shared";
import Emojis from "../../../utils/emoji";
import { channel_command } from "../const";

module.exports = {
    command: channel_command,
    subCommand: new SlashCommandSubcommandBuilder()
        .setName("embed")
        .setDescription("Sende das Kanalverwaltungsembed."),
    can_execute: (user: User | GuildMember) => IsSPEEDCUP(user),
    async execute(interaction: CommandInteraction) {
        const emoji_unlock = Emojis.get_emoji("unlock");
        const emoji_lock = Emojis.get_emoji("lock");
        const emoji_edit = Emojis.get_emoji("edit");
        const emoji_kick = Emojis.get_emoji("arrow_remove");
        const emoji_ban = Emojis.get_emoji("ban");
        const emoji_unban = Emojis.get_emoji("arrow_add");
        const emoji_invite = Emojis.get_emoji("share");
        const emoji_owner = Emojis.get_emoji("user");
        const emoji_claim = Emojis.get_emoji("star");
        const emoji_switch = Emojis.get_emoji("switch");

        const message = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Kanaleinstellungen")
                    .setColor(0x3498DB)
                    .setDescription(
                        `**Hier kannst du Kanaleinstellungen vornehmen, und deinen Kanal modifizieren.**
                        
                        **${emoji_unlock} Channel Öffnen**
                        ↬ Öffnet den Channel.
                        ↬ Der Channel ist öffentlich und von jedem betretbar.
                        ↬ Ausgenommen hiervon sind von dir gebannte User.
                        
                        **${emoji_lock} Channel Schließen**
                        ↬ Schließt den Channel.
                        ↬ Der Channel ist von keinem mehr nachträglich betretbar.
                        
                        **${emoji_edit} Channel Bearbeiten**
                        ↬ Öffnet ein Menü zum Bearbeiten des Channels.
                        
                        **${emoji_kick} User Kicken**
                        ↬ Kickt einen Nutzer aus dem Channel.
                        ↬ Gekickte Nutzer können jederzeit den Channel neu betreten.
                        ↬ Tipp: [Hier findest du eine einfachere Methode](https://discord.com/channels/1134978383336456323/1215702069684600862/1215703987685171280)
                        
                        **${emoji_ban} User Bannen**
                        ↬ Bannt einen Nutzer aus dem Channel.
                        ↬ Gebannte Nutzer können den Channel nicht mehr betreten.
                        ↬ Tipp: [Hier findest du eine einfachere Methode](https://discord.com/channels/1134978383336456323/1215702069684600862/1215703987685171280)
                        
                        **${emoji_unban} User Entbannen**
                        ↬ Entbannt einen Nutzer, sodass er dem Channel wieder beitreten kann.
                        ↬ Tipp: [Hier findest du eine einfachere Methode](https://discord.com/channels/1134978383336456323/1215702069684600862/1215703987685171280)
                        
                        **${emoji_invite} Channel Invite Link**
                        ↬ Generiert einen Link um andere Nutzer zu diesem Channel einzuladen.
                        
                        **${emoji_owner} Channel-Owner anzeigen**
                        ↬ Zeigt dir den aktuellen Channel Owner an.
                        
                        **${emoji_claim} Channel-Owner claimen**
                        ↬ Wenn der vorherige Channel-Owner den Channel verlässt, kann hierüber der Channel geclaimed werden.
                        
                        **${emoji_switch} Channel-Owner weitergeben**
                        ↬ Hiermit kannst du deinen Channel-Owner an eine andere Person im Channel weitergeben.
                    `)
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("channel_button_unlock")
                            .setLabel("Channel Öffnen")
                            .setEmoji(emoji_unlock.id)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("channel_button_lock")
                            .setLabel("Channel Schließen")
                            .setEmoji(emoji_lock.id)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("channel_button_edit")
                            .setLabel("Channel Bearbeiten")
                            .setEmoji(emoji_edit.id)
                            .setStyle(ButtonStyle.Secondary)
                    ]
                }),
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("channel_button_kick")
                            .setLabel("User Kicken")
                            .setEmoji(emoji_kick.id)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("channel_button_ban")
                            .setLabel("User Bannen")
                            .setEmoji(emoji_ban.id)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("channel_button_unban")
                            .setLabel("User Entbannen")
                            .setEmoji(emoji_unban.id)
                            .setStyle(ButtonStyle.Secondary)
                    ]
                }),
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("channel_button_owner")
                            .setLabel("Owner anzeigen")
                            .setEmoji(emoji_owner.id)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("channel_button_claim")
                            .setLabel("Owner claimen")
                            .setEmoji(emoji_claim.id)
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId("channel_button_switch")
                            .setLabel("Owner weitergeben")
                            .setEmoji(emoji_switch.id)
                            .setStyle(ButtonStyle.Secondary)
                    ]
                })
            ]
        })
    },
};