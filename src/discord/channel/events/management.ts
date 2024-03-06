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
        if (interaction.isButton() && interaction.customId.startsWith("channel_manage_")) {
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

            let event = interaction.customId.split("channel_manage_")[1]
            switch (event) {
                case "unlock":
                    await channel.permissionOverwrites.set([
                        {
                            id: interaction.guild.id,
                            allow: [PermissionsBitField.Flags.Connect],
                        }
                    ]);

                    await interaction.reply({
                        content: "Channel erfolgreich geöffnet.",
                        ephemeral: true
                    });

                    break;
                case "lock":
                    await channel.permissionOverwrites.set([
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.Connect],
                        }
                    ]);

                    await interaction.reply({
                        content: "Channel erfolgreich geschlosen.",
                        ephemeral: true
                    });

                    break;
                case "edit":
                    break;
                case "kick":
                    break;
                case "ban":
                    break;
                case "unban":
                    break;
                case "owner":
                    let owner = await ChannelManager.get_owner(channel);

                    if (owner) {
                        await interaction.reply({
                            content:
                                `**${Emojis.get_emoji("user")} - Channel Owner.**\n` +
                                `↬ Der derzeitige Channel-Owner ist ${owner}`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content:
                                `**${Emojis.get_emoji("info")} - Kein Channel Owner.**\n` +
                                `↬ Der Channel hat derzeitig keinen Channel Owner.` +
                                `↬ Nutze die Claim Funktion um diesen Channel zu beanspruchen.`,
                            ephemeral: true
                        });
                    }

                    break;
                case "claim":
                    let {success, error} = await ChannelManager.claim_channel(member, channel);

                    if (success) {
                        await interaction.reply({
                            content:
                                `**${Emojis.get_emoji("correct")} - Channel Geclaimed.**\n` +
                                `↬ Du hast den Channel erfolgreich geclaimed.`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content:
                                `**${Emojis.get_emoji("wrong")} - Channel konnte nicht geclaimed werden.**\n` +
                                `↬ ${error ? error : "Unbekannter Fehler."}`,
                            ephemeral: true
                        });
                    }

                    break;
                case "switch":
                    if (channel.members.length <= 1) {
                        await interaction.reply({
                            content:
                                `**${Emojis.get_emoji("wrong")} - Zu wenig Mitglieder.**\n` +
                                `↬ Der Channel benötigt mindestens 2 Mitglieder um den Channel Owner weitergeben zu können.`,
                            ephemeral: true
                        });
                    } else {
                        // TODO! We stopped here.
                        const userSelect = new UserSelectMenuBuilder()
                            .setCustomId('channel_switch')
                            .setPlaceholder('Wähle einen neuen Owner ...')
                            .setDefaultUsers(["406420078549270539"]); // ...channel.members.map((member: GuildMember) => { return member.id })

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel - Owner weitergeben")
                                    .setDescription("Bitte wähle aus dem unteren Dropdown Menü den neuen Channel-Owner.")
                            ],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(userSelect)
                            ],
                            ephemeral: true
                        });
                    }

                    break;
                default:
                    break;
            }
        }
    },
};