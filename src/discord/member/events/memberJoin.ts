import {
    EmbedBuilder,
    Events,
    GuildBasedChannel,
    GuildMember,
    GuildTextBasedChannel,
    TextChannel,
    TimestampStyles
} from 'discord.js';

module.exports = {
    name: Events.GuildMemberAdd,
    execute(member: GuildMember) {
        (async () => {
            const channel = await member.guild.channels.fetch("1162178589022761052") as TextChannel;

            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Server ➞ Join")
                        .setColor(0x3498DB)
                        .setDescription(`${member.displayName} hat den Server betreten.`)
                        .setFields(
                            { name: "Name", value: member.displayName, inline: true },
                            { name: "Mention", value: member.toString(), inline: true },
                        )
                        .setThumbnail(member.displayAvatarURL())
                        .setTimestamp(),
                ]
            });
        })()
    },
};