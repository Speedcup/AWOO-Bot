import {
    Events, Guild, GuildMember, PermissionsBitField, VoiceChannel
} from 'discord.js';
import ChannelManager from "../shared";
import EmbedBuilder from "../../../utils/embed";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {
        if (interaction.customId && interaction.customId.startsWith("channel_action_")) {
            const { success, error } = await ChannelManager.is_valid_request(interaction);
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

                        // Fetch the channel to support channel edits after bot restarts and use the cached variant afterwards.
                        await interaction.client.channels.fetch(channel.id);
                        interaction.client.channels.cache.get(channel.id).edit({
                            name: new_name,
                            userLimit: limit
                        }).then(async (edited_channel: VoiceChannel) => {
                            await interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("Channel")
                                        .setSubTitle("Bearbeitet")
                                        .setDescription(
                                            `➥ Du hast den Channel erfolgreich bearbeitet.\n` +
                                            `↬ Neuer Name - ${new_name}\n` +
                                            `↬ Neues Limit - ${limit}`
                                        )
                                ],
                                ephemeral: true
                            });
                        }).catch(console.error);
                    }

                    break;
                case "kick":
                    await ChannelManager.kick_user(interaction);

                    break;
                case "ban":
                    await ChannelManager.ban_user(interaction);

                    break;
                case "unban":
                    // Safety Check.
                    await ChannelManager.unban_user(interaction);

                    break;
                case "switch":
                    // Safety Check.
                    if (interaction.isUserSelectMenu()) {
                        const user: GuildMember = await interaction.guild?.members.fetch(interaction.values[0])
                            .catch(console.error);

                        if (user) {
                            if (user.id == member.id) {
                                return await interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("Channel")
                                            .setSubTitle("Fehler")
                                            .setDescription(
                                                `➥ Der Owner konnte nicht weitergegeben werden.\n` +
                                                `↬ Du bist bereits Owner.\n` +
                                                `↬ Du kannst dir nicht erneut selbst Owner geben.`
                                            )
                                    ],
                                    ephemeral: true
                                });
                            }

                            if (!user.voice || !user.voice.channel || user.voice.channel.id != channel.id) {
                                return await interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("Channel")
                                            .setSubTitle("Fehler")
                                            .setDescription(
                                                `➥ Der Owner konnte nicht weitergegeben werden.\n` +
                                                `↬ ${user} befindet sich nicht in deinem Channel.`
                                            )
                                    ],
                                    ephemeral: true
                                });
                            }

                            let {success, error} = await ChannelManager.switch_owner(member, user, channel);

                            if (success) {
                                await interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("Channel")
                                            .setSubTitle("Owner weitergegeben")
                                            .setDescription(`➥ Du hast den Channel erfolgreich an ${user} weitergegeben.`)
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
                                                `➥ Der Channel konnte nicht weitergegeben werden.\n` +
                                                `↬ ${error ? error : "Unbekannter Fehler"}.`)
                                    ],
                                    ephemeral: true
                                });
                            }

                            // Send a message to the new owner informing them of the change.
                            await user.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("Channel")
                                        .setSubTitle("Information")
                                        .setDescription(
                                            `➥ ${member} hat dir soeben von dem Channel ${channel} den Owner-Status übertragen.\n\n` +
                                            `↬ Du hast nun Zugriff auf alle Moderativen Optionen des Channels.\n` +
                                            `↬ Wenn du Einstellungen am Kanal vornehmen möchtest, klicke bitte [hier](https://discord.com/channels/1134978383336456323/1184217394332311652/1215704197706813453).`
                                        )
                                ],
                            }).catch(console.error);
                        } else {
                            await interaction.reply({
                                content: "Der Nutzer konnte nicht gefunden werden.",
                                ephemeral: true
                            })
                        }
                    }

                    break;
                default:
                    break;
            }
        }
    },
};