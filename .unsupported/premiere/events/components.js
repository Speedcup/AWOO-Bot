"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../../index");
const shared_1 = require("../shared");
module.exports = {
    name: discord_js_1.Events.InteractionCreate,
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.isStringSelectMenu() || interaction.isButton() &&
                (["premiere_accept", "premiere_deny", "premiere_reminder", "premiere_reset", "premiere_agent_select"].includes(interaction.customId))) {
                const event_id = (_a = interaction.message.embeds[0].footer) === null || _a === void 0 ? void 0 : _a.text;
                if (event_id) {
                    const database = yield index_1.discord_bot.Client.DB.connect();
                    const members = yield database.query(`SELECT * FROM members WHERE discord_id = '${interaction.user.id}'`);
                    const participation = yield database.query(`SELECT * FROM events WHERE event_id = '${event_id}' AND discord_id = '${interaction.user.id}'`);
                    // If the member does not exist in the database, they are not part of the team.
                    if (members.rows.length <= 0) {
                        return interaction.reply({
                            content: "Du gehörst nicht zum Team.",
                            ephemeral: true
                        });
                    }
                    if (participation.rows.length <= 0) {
                        yield database.query(`INSERT INTO events (event_id, discord_id) VALUES ('${event_id}', '${interaction.user.id}')`);
                    }
                    let queryStatement = "UPDATE events SET ";
                    switch (interaction.customId) {
                        case "premiere_accept":
                            queryStatement += `participating = true`;
                            break;
                        case "premiere_deny":
                            queryStatement += `participating = false`;
                            break;
                        case "premiere_reminder":
                            break;
                        case "premiere_reset":
                            break;
                        case "premiere_agent_select":
                            queryStatement += `primary_agent = '${interaction instanceof discord_js_1.StringSelectMenuInteraction ? interaction.values[0] : ""}'`;
                            break;
                        default:
                            database.release();
                            return;
                    }
                    yield database.query(queryStatement + ` WHERE event_id = '${event_id}' AND discord_id = '${interaction.user.id}'`);
                    database.release();
                    yield (0, shared_1.UpdatePremiereEmbed)();
                    return interaction.reply({
                        content: "Du hast erfolgreich Änderungen an deinem Premiere Status vorgenommen.",
                        ephemeral: true
                    });
                }
            }
        });
    },
};
