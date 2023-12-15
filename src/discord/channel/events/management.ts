import {
    ActionRowBuilder,
    Events, ModalBuilder, TextInputBuilder, TextInputStyle
} from 'discord.js';
import {channel_cache} from "../../../utils/globalcache";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: any) {
        if (interaction.isStringSelectMenu() || interaction.isButton() || interaction.isModalSubmit() && channel_cache.get(interaction.user.id)) {
            if (["autochannel_user", "channel_name", "modal_channel_name"].includes(interaction.customId)) {
                const member = await interaction.guild?.members.fetch(interaction.user.id);
                if (member && channel_cache.get(interaction.user.id) === member.voice.channelId) {
                    switch(interaction.customId) {
                        case "autochannel_user":
                            const user_count = interaction.values[0];
                            await member.voice.channel?.edit({
                                userLimit: Number(user_count)
                            })

                            await interaction.reply({
                                content: `Du hast die User-Anzahl erfolgreich auf ${user_count} geändert!`,
                                ephemeral: true
                            });
                            break;
                        case "channel_name":
                            const modal = new ModalBuilder()
                                .setCustomId('modal_channel_name')
                                .setTitle('Kanalname bearbeiten')
                                .addComponents(
                                    new ActionRowBuilder<TextInputBuilder>({
                                        components: [
                                            new TextInputBuilder()
                                                .setCustomId("modal_channel_name_entry")
                                                .setLabel("Neuer Kanalname")
                                                .setPlaceholder(member.voice.channel.name)
                                                .setStyle(TextInputStyle.Short)
                                                .setMinLength(3)
                                                .setMaxLength(20)
                                                .setRequired(true)
                                        ]
                                    })
                                );

                            await interaction.showModal(modal);
                            break;
                        case "modal_channel_name":
                            const new_name: string = interaction.fields.getTextInputValue('modal_channel_name_entry');
                            await member.voice.channel?.edit({
                                name: new_name
                            })
                            await interaction.reply({
                                content: `Du hast den Channel erfolgreich zu ${new_name} geändert!`,
                                ephemeral: true
                            });

                            break;
                        default:
                            await interaction.reply({
                                content: "Du bist derzeit in keinem Channel oder der Channel in welchem du dich befindest gehört nicht dir..",
                                ephemeral: true
                            });

                            break;
                    }
                }
                else
                {
                    await interaction.reply({
                        content: "Du bist derzeit in keinem Channel oder der Channel in welchem du dich befindest gehört nicht dir..",
                        ephemeral: true
                    });
                }
            }
        }
    },
};