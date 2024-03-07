import {
    ActionRowBuilder, EmbedBuilder,
    Events, GuildMember, ModalBuilder, PermissionsBitField, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder
} from 'discord.js';
import {channel_cache} from "../../../utils/globalcache";
import ChannelManager from "../shared";
import {Channel} from "diagnostics_channel";
import Emojis from "../../../utils/emoji";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {
        if (interaction.customId && interaction.customId.startsWith("channel_action_")) {
            const member = await interaction.guild?.members.fetch(interaction.user.id);
            if (!member) return;

            let channel = member.voice.channel;
            if (!channel) {
                await interaction.reply({
                    content: "Du bist derzeit in keinem Channel.",
                    ephemeral: true
                });

                return;
            }

            if (!await ChannelManager.is_owner(member, channel)) {
                await interaction.reply({
                    content: "Du bist nicht der Owner des Channels.",
                    ephemeral: true
                });

                return;
            }

            let event = interaction.customId.split("channel_action_")[1]
            switch (event) {
                case "edit":
                    // Safety Check.
                    if (interaction.isModalSubmit()) {
                        const new_name: string = interaction.fields.getTextInputValue('modal_channel_name_entry');
                        const new_limit: string = interaction.fields.getTextInputValue('modal_channel_limit_entry');

                        let limit = parseInt(new_limit);
                        if (isNaN(limit)) limit = 0;
                        if (limit < 0) limit = 0;
                        if (limit > 99) limit = 99;

                        channel.setName(new_name)
                            .catch(console.error);

                        channel.setUserLimit(limit)
                            .catch(console.error);

                        await interaction.reply({
                            content: `Du hast den Channel erfolgreich bearbeitet!`,
                            ephemeral: true
                        });
                    }

                    break;
                case "kick":
                    // Safety Check.
                    if (interaction.isUserSelectMenu()) {
                        const user: GuildMember = await interaction.guild?.members.fetch(interaction.values[0])
                            .catch(console.error);

                        if (user) {
                            // TODO: Check Admin Perms and deny kicking admins.

                            if (user.id == member.id) {
                               return await interaction.reply({
                                    content:
                                        `**${Emojis.get_emoji("wrong")} - User konnte nicht gekickt werden.**\n` +
                                        `↬ Du kannst dich nicht selbst aus deinem Channel kicken.\n` +
                                        `↬ Bitte nutze die Discord eigene Leave Funktion um den Channel zu verlassen.`,
                                    ephemeral: true
                                });
                            }

                            if (!user.voice || !user.voice.channel || user.voice.channel.id != channel.id) {
                                return await interaction.reply({
                                    content:
                                        `**${Emojis.get_emoji("wrong")} - User konnte nicht gekickt werden.**\n` +
                                        `↬ ${user} befindet sich nicht in deinem Channel.\n` +
                                        `↬ Solltest du präziser einen User kicken wollen, befolge bitte dieses Tutorial.`,      // TODO: Implement Tutorial Link.
                                    ephemeral: true
                                });
                            }

                            await user.voice.disconnect()
                                .then(async (value: GuildMember) => {
                                    return await interaction.reply({
                                        content:
                                            `**${Emojis.get_emoji("correct")} - User erfolgreich gekickt.**\n` +
                                            `↬ ${user} wurde erfolgreich vom Channel gekickt.\n` +
                                            `↬ Wenn du möchtest, dass ${user} deinen Channel weiterhin nicht mehr betreten kann, kannst du dafür die Ban-Funktion nutzen.`,      // TODO: Implement Tutorial Link.
                                        ephemeral: true
                                    });
                                })
                                .catch(async (reason: any) => {
                                    return await interaction.reply({
                                        content:
                                            `**${Emojis.get_emoji("wrong")} - User konnte nicht gekickt werden.**\n` +
                                            `↬ ${user} konnte nicht vom Channel gekickt werden.\n` +
                                            `↬ Folgende Möglichkeiten könnten das Problem verursacht haben:\n` +
                                            `- Der Bot hat nicht genügend Rechte, was bedeutet, dass ${user} über dem Bot steht.\n` +
                                            `- Ein Unbekannter Fehler ist aufgetreten.`,
                                        ephemeral: true
                                    });
                                })
                        } else {
                            await interaction.reply({
                                content: "Der Nutzer konnte nicht gefunden werden.",
                                ephemeral: true
                            })
                        }
                    }

                    break;
                case "ban":
                    break;
                case "unban":
                    break;
                case "switch":
                    break;
                default:
                    break;
            }
        }
    },
};