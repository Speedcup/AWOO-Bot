import {EmbedBuilder, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, time, TimestampStyles} from "discord.js";
import {Premiere_ScheduledEvent, VALORANT_Premiere} from "./premiere";
import {discord_bot} from "../../index";
import {agent_cache} from "../content";
export { PREMIERE_COMMAND, PREMIERE_MEMBER_COMMAND, WHITELIST, GenerateEventEmbeds };

const WHITELIST = ["406420078549270539"];

const PREMIERE_MEMBER_COMMAND = new SlashCommandSubcommandGroupBuilder()
    .setName("member")
    .setDescription("Verwalte das derzeitige Premiere Roaster.")

const PREMIERE_COMMAND = new SlashCommandBuilder()
    .setName('premiere')
    .setDescription('Premiere-Befehle!')
    .setDefaultMemberPermissions(0)
    // .addSubcommandGroup(PREMIERE_MEMBER_COMMAND);

// const PREMIERE_MEMBER_COMMAND = PREMIERE_COMMAND.addSubcommandGroup(subcommandGroup => subcommandGroup
//     .setName("member")
//     .setDescription("Verwalte das derzeitige Premiere Roaster.")
// )

const GenerateEventEmbed = async (event: Premiere_ScheduledEvent): Promise<EmbedBuilder> => {
    const database = await discord_bot.Client.DB.connect();

    const members = await database.query(`SELECT * FROM members`);
    const participation = await database.query(`SELECT * FROM events WHERE event_id = '${event.event_id}'`);

    database.release();

    // Emojis
    const emoji_correct = discord_bot.Client.emojis.cache.get("1184888948091256932");
    const emoji_wrong = discord_bot.Client.emojis.cache.get("1184888956479873127");
    const emoji_clock = discord_bot.Client.emojis.cache.get("1184903913036595262");
    const emoji_switch = discord_bot.Client.emojis.cache.get("1184968671345520690");

    let description: string = "";
    for (const member of members.rows) {
        if (participation.rows.some((data: any) => data.discord_id == member.discord_id)) {
            const player = participation.rows.find((v: any) => v.discord_id == member.discord_id)

            const primaryAgent = agent_cache.get(player.primary_agent);
            const secondaryAgent = agent_cache.get(player.secondary_agent);

            description += `${player.participating ? emoji_correct : emoji_wrong}┃`;
            description += `${primaryAgent ? primaryAgent.get_emoji() : emoji_wrong}${primaryAgent ? primaryAgent.get_role_emoji() : ""}┃`;

            if (secondaryAgent) {
                description += `${secondaryAgent.get_emoji()}${secondaryAgent.get_role_emoji()}┃`;
            }

            description += `${member.bench ? emoji_switch : ""}<@${player.discord_id}>\n`
        } else {
            description += `${emoji_clock}┃${member.bench ? emoji_switch : ""} <@${member.discord_id}>\n`
        }
    }

    const eventMap = await event.get_map();
    let event_embed = new EmbedBuilder()
        .setTitle(`Premiere ➞ ${event.event?.type ?? "?"}`)
        .setColor(0x3498DB)
        .setDescription(
            `Premiere auf **${eventMap?.DisplayName}** ${time(Math.round(event.starts_at / 1000), TimestampStyles.RelativeTime)}\n\n`
            + description
        )
        .setThumbnail("https://cdn.henrikdev.xyz/valorant/v1/premier/team-icon/f6cdfd06-4a98-792a-3a37-a88805ba99ce?primary=0d0c0d&secondary=06347f&tertiary=d6cec0")
        .setImage(eventMap ? eventMap.ListViewIcon : "")
        .setFooter({
            text: event.event_id
        })

    return event_embed;
}

const GenerateEventEmbeds = async (limit: number = 2): Promise<EmbedBuilder[] | undefined> => {
    const premiere = await new VALORANT_Premiere().fetch_data();
    const scheduledEvents = await premiere.get_events();
    if (!scheduledEvents) return;

    let count: number = 0;
    const events: Premiere_ScheduledEvent[] = [];
    for (const event of scheduledEvents) {
        if (count == limit) {
            break;
        }

        events.push(event);
        count += 1;
    }

    let embeds: EmbedBuilder[] = [];
    for (const event of events) {
        embeds.push(await GenerateEventEmbed(event));
    }

    return embeds;
};