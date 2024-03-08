import {GuildMember} from "discord.js";
import {ExperienceConfig} from "./config";
import {discord_bot} from "../../index";

export default class Experience {
    static async get_level(member: GuildMember): Promise<number> {
        const database = await discord_bot.Client.DB.connect();
        const result = await database.query(`SELECT level FROM experience WHERE discord_id = '${member.id}'`);
        database.release();

        if (result && result.rowCount > 0) {
            return result.rows[0].level
        }

        return 1
    }

    static async get_experience(member: GuildMember): Promise<number> {
        const database = await discord_bot.Client.DB.connect();
        const result = await database.query(`SELECT xp FROM experience WHERE discord_id = '${member.id}'`);
        database.release();

        if (result && result.rowCount > 0) {
            return result.rows[0].xp
        }

        return 0
    }

    static async get_needed_xp(level: number): Promise<number> {
        if (level == ExperienceConfig.MaxLevel) {
            return 0;
        }

        return Math.floor(ExperienceConfig.ExpPerLevel * Math.pow(ExperienceConfig.LevelExpMultiplier, level - 1))
    }

    static async is_max_level(member: GuildMember): Promise<boolean> {
        const level = await this.get_level(member);
        return (level == ExperienceConfig.MaxLevel)
    }

    static async add_experience(member: GuildMember, amount: number) {
        if (await this.is_max_level(member)) return;

        const database = await discord_bot.Client.DB.connect();
        await database.query(
            `
            INSERT INTO experience (discord_id, xp, level) VALUES ('${member.id}', ${amount}, 0)
            ON CONFLICT (discord_id) DO UPDATE
            SET xp = experience.xp + ${amount};
            `
        );
        database.release();

        await this.check_levelup(member);
    }

    static async check_levelup(member: GuildMember) {
        let level = await this.get_level(member);
        let xp = await this.get_experience(member);
        let required_xp = await this.get_needed_xp(level + 1);
        let has_level_up: boolean = false;

        while (xp >= required_xp && level < ExperienceConfig.MaxLevel) {
            has_level_up = true;
            level += 1;
            xp -= required_xp;
            required_xp = await this.get_needed_xp(level + 1);
        }

        if (level > ExperienceConfig.MaxLevel) {
            // We do not wanna destroy user's progress, so we are silently adding the xp but not updating the level.
            // xp = 0;
            has_level_up = false;
        }

        if (has_level_up) {
            const database = await discord_bot.Client.DB.connect();
            await database.query(
                `
            INSERT INTO experience (discord_id, xp, level) VALUES ('${member.id}', ${xp}, 0)
            ON CONFLICT (discord_id) DO UPDATE
            SET xp = '${xp}', level = '${level}';
            `
            );
            database.release();
        }
    }
}