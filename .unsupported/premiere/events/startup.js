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
const shared_1 = require("../shared");
const index_1 = require("../../../index");
module.exports = {
    name: "ready",
    once: true,
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO, make own file.
            index_1.discord_bot.Client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
                if (interaction.customId && interaction.customId.includes("|")) {
                    index_1.discord_bot.Client.emit(`${interaction.customId.split("|")[0]}|paginator`, interaction);
                }
            }));
            yield (0, shared_1.UpdatePremiereEmbed)();
        });
    },
};
