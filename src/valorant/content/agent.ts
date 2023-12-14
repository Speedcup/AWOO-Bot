import axios from "axios";
import { Cache } from "../../utils/globalcache";
import logger from "../../logger";
import {ComponentEmojiResolvable, Emoji, Guild, GuildEmoji} from "discord.js";
import { discord_bot } from "../../index";

export { AgentClass, AgentStructure, AgentCacheClass, agent_cache };

interface AgentRole {
    UUID: string,
    DisplayName: string,
    Description: string,
    DisplayIcon: string,
    AssetPath: string
}

class AgentRoleClass implements AgentRole {
    constructor(
        public UUID: string,
        public DisplayName: string,
        public Description: string,
        public DisplayIcon: string,
        public AssetPath: string
    ) {}
}

interface AgentAbility {
    Slot: string,
    DisplayName: string,
    Description: string,
    DisplayIcon: string
}

class AgentAbilityClass implements AgentAbility {
    constructor(
        public Slot: string,
        public DisplayName: string,
        public Description: string,
        public DisplayIcon: string
    ) {}
}

interface AgentStructure {
    UUID: string,
    DisplayName: string,
    Description: string,
    DeveloperName: string,
    CharacterTags: string[],
    DisplayIcon: string,
    DisplayIconSmall: string,
    BustPortrait: string,
    FullPortrait: string,
    FullPortraitV2: string,
    KillfeedPortrait: string,
    Background: string,
    BackgroundGradientColors: string[],
    AssetPath: string,
    IsFullPortraitRightFacing: boolean,
    IsPlayableCharacter: boolean,
    IsAvailableForTest: boolean,
    IsBaseContent: boolean,
    Role: AgentRole,
    Abilities: AgentAbility[],
    // VoiceLine (We do not use this)
}

class AgentClass implements AgentStructure {
    constructor(
        public UUID: string,
        public DisplayName: string,
        public Description: string,
        public DeveloperName: string,
        public CharacterTags: string[],
        public DisplayIcon: string,
        public DisplayIconSmall: string,
        public BustPortrait: string,
        public FullPortrait: string,
        public FullPortraitV2: string,
        public KillfeedPortrait: string,
        public Background: string,
        public BackgroundGradientColors: string[],
        public AssetPath: string,
        public IsFullPortraitRightFacing: boolean,
        public IsPlayableCharacter: boolean,
        public IsAvailableForTest: boolean,
        public IsBaseContent: boolean,
        public Role: AgentRole,
        public Abilities: AgentAbility[],
    ) {}

    static async fetchAgents(): Promise<{ [index: string]: AgentClass }> {
        logger.debug("Fetching Valorant Agents ...");

        const agentCache: { [key: string]: AgentClass } = {};
        const response = await axios.get("https://valorant-api.com/v1/agents", {
            params: { isPlayableCharacter: true }
        });

        if (response.status !== 200) {
            throw new Error("Could not get riots latest build id.");
        }

        response.data.data.forEach((agent: { [index: string]: any }) => {
            const agentInstance = new AgentClass(
                agent.uuid,
                agent.displayName,
                agent.description,
                agent.developerName,
                agent.characterTags,
                agent.displayIcon,
                agent.displayIconSmall,
                agent.bustPortrait,
                agent.fullPortrait,
                agent.fullPortraitV2,
                agent.killfeedPortrait,
                agent.background,
                agent.backgroundGradientColors,
                agent.assetPath,
                agent.isFullPortraitRightFacing,
                agent.isPlayableCharacter,
                agent.isAvailableForTest,
                agent.isBaseContent,
                (
                    new AgentRoleClass(
                        agent.role.uuid,
                        agent.role.displayName,
                        agent.role.description,
                        agent.role.displayIcon,
                        agent.role.assetPath,
                    )
                ),
                agent.abilities.map((ability: { [index: string]: any }) => new AgentAbilityClass(
                    ability.slot,
                    ability.displayName,
                    ability.description,
                    ability.displayIcon
                ))
            )

            agentCache[agentInstance.UUID] = agentInstance;
        })

        logger.debug(`Successfully fetched ${agentCache.length} Agents!`);

        return agentCache;
    }

    static async fetchAgent(uuid: string): Promise<void> {
        const response = await axios.get(`https://valorant-api.com/v1/agents/${uuid}`, {
            params: { isPlayableCharacter: true }
        });
        if (response.status !== 200) {
            throw new Error("Could not get riots latest build id.");
        }
    }

    get_name(): string {
        return this.DisplayName
    }

    get_emoji(): GuildEmoji {
        //const  devGuild: Guild = await discord_bot.guilds.cache.get("1001550913556729996");
        const emoji_cache = discord_bot.Client.emojis.cache;
        const emojiMatch: GuildEmoji = emoji_cache.find(
            (emoji: GuildEmoji) => emoji.name?.toLowerCase().includes(this.DisplayName.toLowerCase().replace("/", ""))
        ) ?? emoji_cache.get("1025900281550090304")

        return emojiMatch;
    }
    get_ability_keybind(ability: AgentAbility): string {
        switch (ability.Slot) {
            case "Ability1":    return "Q"
            case "Ability2":    return "E"
            case "Grenade":     return "C"
            case "Ultimate":    return "X"
            default:            return ability.Slot
        }
    }
    get_role_emoji(): string {
        switch (this.Role.UUID) {
            case "dbe8757e-9e92-4ed4-b39f-9dfc589691d4": {
                return "<:Class_Duelist:1036580068262170736>"
            } // Duelist
            case "1b47567f-8f7b-444b-aae3-b0c634622d10": {
                return "<:Class_Initiator:1036580069663047732>"
            } // Initiator
            case "4ee40330-ecdd-4f2f-98a8-eb1243428373": {
                return "<:Class_Controller:1036580066987090020>"
            } // Controller
            case "5fc02f99-4091-4486-a531-98459a3e95e9": {
                return "<:Class_Sentinel:1036580071076540486>"
            } // Sentinel
            default: {
                return ""
            }
        }
    }
}

class AgentCacheClass extends Cache<AgentClass> {
    constructor() { super() }

    getByName(name: string): AgentClass | undefined {
        const agents = Object.values(this.cache);
        return agents.find(
            agent => agent.DisplayName === name
        )
    }
}

const agent_cache = new AgentCacheClass();