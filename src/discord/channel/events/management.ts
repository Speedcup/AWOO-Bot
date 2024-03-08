import {
    ActionRowBuilder,
    Events,
    ModalBuilder,
    PermissionsBitField,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    TextInputBuilder,
    TextInputStyle,
    UserSelectMenuBuilder
} from 'discord.js';
import ChannelManager from "../shared";
import EmbedBuilder from "../../../utils/embed";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {
        if (interaction.isButton() && interaction.customId.startsWith("channel_button_")) {
            const {success, error} = await ChannelManager.is_valid_request(interaction);
            if (!success) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Channel")
                        .setSubTitle("Fehler")
                        .setDescription(error ? error : "➥ Unbekannter Fehler.")
                ],
                ephemeral: true
            })

            const member = await interaction.guild?.members.fetch(interaction.user.id);
            let channel = member.voice.channel;

            let event = interaction.customId.split("channel_button_")[1]
            switch (event) {
                case "unlock":
                    await channel.permissionOverwrites.set([
                        {
                            id: interaction.guild.id,
                            allow: [PermissionsBitField.Flags.Connect],
                        }
                    ]);

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("Geöffnet")
                                .setDescription(
                                    `➥ Dein Channel wurde erfolgreich geöffnet.\n` +
                                    `↬ Dein Channel ist nun öffentlich und jeder kann ihn betreten.\n` +
                                    `↬ Ausgenommen hiervon sind von dir gebannte User.`
                                )
                        ],
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
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("Geschlossen")
                                .setDescription(
                                    `➥ Dein Channel wurde erfolgreich geschlossen.\n` +
                                    `↬ Andere User können deinen Channel nicht mehr betreten.`
                                )
                        ],
                        ephemeral: true
                    });

                    break;
                case "edit":
                    let currentLimit = channel.maxUsers;
                    if (!currentLimit) currentLimit = 0;

                    const modal = new ModalBuilder()
                        .setCustomId('channel_action_edit')
                        .setTitle('Channel Bearbeiten')
                        .addComponents(
                            new ActionRowBuilder<TextInputBuilder>({
                                components: [
                                    new TextInputBuilder()
                                        .setCustomId("modal_channel_name_entry")
                                        .setLabel("Kanalname")
                                        .setValue(channel.name)
                                        .setStyle(TextInputStyle.Short)
                                        .setMinLength(3)
                                        .setMaxLength(20)
                                        .setRequired(false)
                                ]
                            }),
                            new ActionRowBuilder<TextInputBuilder>({
                                components: [
                                    new TextInputBuilder()
                                        .setCustomId("modal_channel_limit_entry")
                                        .setLabel("Limit")
                                        .setValue(String(currentLimit))
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(true)
                                ]
                            })
                        );

                    await interaction.showModal(modal);

                    break;
                case "kick":
                    if (channel.members.size <= 1) {
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Fehler")
                                    .setDescription(
                                        `➥ Dein Channel hat zu wenig Mitglieder.\n` +
                                        `↬ Der Channel benötigt mindestens 2 Mitglieder um jemanden kicken zu können.`
                                    )
                            ],
                            ephemeral: true
                        });
                    } else {
                        const userSelect = new UserSelectMenuBuilder()
                            .setCustomId('channel_action_kick')
                            .setPlaceholder('Wähle einen User ...')

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Kick")
                                    .setDescription(
                                        `➥ Bitte wähle aus dem unteren Dropdown Menü den User welchen du kicken möchtest.\n` +
                                        `↬ Bitte beachte, es kommt keine Bestätigungsabfrage, sobald du einen User ausgewählt hast wird dieser unwiderruflich gekickt.`
                                    )
                            ],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(userSelect)
                            ],
                            ephemeral: true
                        });
                    }

                    break;
                case "ban":
                    const userSelect = new UserSelectMenuBuilder()
                        .setCustomId('channel_action_ban')
                        .setPlaceholder('Wähle einen User ...')

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("Ban")
                                .setDescription(
                                    `➥ Bitte wähle aus dem unteren Dropdown Menü den User welchen du bannen möchtest.\n` +
                                    `↬ Bitte beachte, es kommt keine Bestätigungsabfrage, sobald du einen User ausgewählt hast wird dieser unwiderruflich gebannt.`
                                )
                        ],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(userSelect)
                        ],
                        ephemeral: true
                    });

                    break;
                case "unban":
                    let select_options: StringSelectMenuOptionBuilder[] = [];
                    const permissions = channel.permissionOverwrites.cache;

                    for (const [key, value] of permissions) {
                        // Check if we have the connect perm denied (which is I do when a user gets banned)
                        // Check as well if the referenced id is not @everyone, since when the channel is locked this would also have the deny perm.
                        if (value.deny.has(PermissionsBitField.Flags.Connect) && key != interaction.guild.id) {
                            let guildMember = await interaction.guild.members.fetch(key)
                                .catch((_: any) => guildMember = key)

                            select_options.push(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(guildMember.displayName)
                                    .setDescription(guildMember.user.username)
                                    .setValue(String(key))
                            )
                        }
                    }

                    const user_select: StringSelectMenuBuilder = new StringSelectMenuBuilder()
                        .setCustomId("channel_action_unban")
                        .setPlaceholder("Wähle einen User ...")
                        .addOptions(select_options);

                    if (select_options.length <= 0) {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Unban")
                                    .setDescription(
                                        `➥ Derzeit ist kein User gebannt.`
                                    )
                            ],
                            ephemeral: true
                        });
                    }

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Channel")
                                .setSubTitle("Unban")
                                .setDescription(
                                    `➥ Bitte wähle aus dem unteren Dropdown Menü den User welchen du entbannen möchtest.\n` +
                                    `↬ Bitte beachte, es kommt keine Bestätigungsabfrage, sobald du einen User ausgewählt hast wird dieser unwiderruflich gebannt.\n` +
                                    `↬ Bitte beachte, es werden nur maximal 25 User angezeigt.`
                                )
                        ],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(user_select)
                        ],
                        ephemeral: true
                    });

                    break;
                case "owner":
                    let owner = await ChannelManager.get_owner(channel);

                    if (owner) {
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Channel Owner")
                                    .setDescription(
                                        `➥ Der derzeitige Channel-Owner ist ${owner}\n`
                                    )
                            ],
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Kein Channel Owner")
                                    .setDescription(
                                        `➥ Der Channel hat derzeitig keinen Channel Owner.\n` +
                                        `↬ Nutze die Claim Funktion um diesen Channel zu beanspruchen.\n`
                                    )
                            ],
                            ephemeral: true
                        });
                    }

                    break;
                case "claim":
                    let {success, error} = await ChannelManager.claim_channel(member, channel);

                    if (success) {
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Channel Geclaimed")
                                    .setDescription(
                                        `➥ Du hast den Channel erfolgreich geclaimed.`
                                    )
                            ],
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Fehler")
                                    .setDescription(
                                        `➥ Channel konnte nicht geclaimed werden.\n` +
                                        `↬ ${error ? error : "Unbekannter Fehler."}`
                                    )
                            ],
                            ephemeral: true
                        });
                    }

                    break;
                case "switch":
                    if (channel.members.size <= 1) {
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Fehler")
                                    .setDescription(
                                        `➥ Dein Channel hat zu wenig Mitglieder.\n` +
                                        `↬ Der Channel benötigt mindestens 2 Mitglieder um jemanden Owner geben zu können.`
                                    )
                            ],
                            ephemeral: true
                        });
                    } else {
                        const userSelect = new UserSelectMenuBuilder()
                            .setCustomId('channel_action_switch')
                            .setPlaceholder('Wähle einen neuen Owner ...')
                            // So this seems useless since it is not working, I think discord does not support restricting the user selection.
                            // .setDefaultUsers(["406420078549270539"]); // ...channel.members.map((member: GuildMember) => { return member.id })

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Channel")
                                    .setSubTitle("Owner weitergeben")
                                    .setDescription(
                                        `➥ Bitte wähle aus dem unteren Dropdown Menü den neuen Channel-Owner.\n` +
                                        `↬ Bitte beachte, es kommt keine Bestätigungsabfrage, sobald du einen User ausgewählt hast wird der Owner-Status weitergegeben.`
                                    )
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