import {
    EmbedBuilder,
    Events,
    GuildBasedChannel,
    GuildMember,
    GuildTextBasedChannel,
    TextChannel, time,
    TimestampStyles
} from 'discord.js';

module.exports = {
    name: Events.GuildMemberRemove,
    execute(member: GuildMember) {
        (async () => {
            const channel = await member.guild.channels.fetch("1162178589022761052") as TextChannel;
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Server ➞ Leave")
                        .setColor(0xE51400)
                        .setDescription(`${member.displayName} hat den Server verlassen.`)
                        .setFields(
                            {name: "Name", value: member.displayName, inline: true},
                            {name: "Mention", value: member.toString(), inline: true},
                            {
                                name: "Joined at",
                                value: time(member.joinedTimestamp !== null ? Math.round(member.joinedTimestamp / 1000) : 0, TimestampStyles.RelativeTime),
                                inline: true
                            },
                        )
                        .setThumbnail(member.displayAvatarURL())
                        .setTimestamp(),
                ]
            });
        })();
    },
};