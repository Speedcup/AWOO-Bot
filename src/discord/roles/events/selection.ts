import {
    ButtonInteraction,
    ButtonStyle, Colors,
    EmbedBuilder,
    Events,
    GuildMember,
    StringSelectMenuInteraction
} from 'discord.js';
import RoleSystem from "../shared";
import {discord_bot} from "../../../index";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: StringSelectMenuInteraction | ButtonInteraction) {
        if (interaction.customId && interaction.customId.includes("role_")) {
            if (interaction.member && interaction.guild) {
                const member: GuildMember | undefined = interaction.guild.members.cache.get(interaction.member.user.id);

                if (member) {
                    let name: string = "";

                    const emoji_correct = discord_bot.Client.emojis.cache.get("1184888948091256932");
                    const emoji_wrong = discord_bot.Client.emojis.cache.get("1184888956479873127");

                    switch (interaction.customId) {
                        case "role_selection":
                            const role_id = interaction.isStringSelectMenu() ? interaction.values[0] : ""
                            const role = interaction.guild.roles.cache.get(role_id);
                            const emoji_arrow_add = discord_bot.Client.emojis.cache.get("1190387203285733546");
                            const emoji_arrow_remove = discord_bot.Client.emojis.cache.get("1190387590168334406");

                            if (role) {
                                const has_role: boolean = member.roles.cache.has(role.id)
                                name = has_role ?
                                    `${emoji_arrow_remove} | ${role} entfernt.` :
                                    `${emoji_arrow_add} | ${role} hinzugefügt.`;

                                if (has_role) {
                                    await member.roles.remove(role.id)
                                } else {
                                    await member.roles.add(["1184242513708589066", role.id])
                                }
                            }

                            await interaction.reply({
                                content: name,
                                ephemeral: true
                            })

                            if (interaction.isStringSelectMenu()) {
                                await interaction.message.edit({
                                    components: interaction.message.components
                                })
                            }
                            break;
                        case "role_selection_all":
                            await member.roles.add(["1184242513708589066", ...RoleSystem.get_cache().get_keys()]);

                            await interaction.reply({
                                content: `${emoji_correct} | Alle Rollen erhalten.`,
                                ephemeral: true
                            })

                            break;
                        case "role_selection_reset":
                            await member.roles.remove(RoleSystem.get_cache().get_keys());

                            await interaction.reply({
                                content: `${emoji_wrong} | Alle Rollen entfernt.`,
                                ephemeral: true
                            })

                            break;
                        case "role_information":
                            let roleInfo: string = "";

                            for (const [key, data] of RoleSystem.get_cache()) {
                                roleInfo += member.roles.cache.has(data.role.id) ? `${emoji_correct} ${data.role}\n` : `${emoji_wrong} ${data.role}\n`
                            }

                            await interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle("Deine Rollen")
                                        .setDescription(roleInfo)
                                        .setColor(Colors.Aqua)
                                ],
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
        }
    },
};