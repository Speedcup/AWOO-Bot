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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Premiere_ScheduledEvent = exports.Premiere_Event = exports.VALORANT_Premiere = void 0;
const axios_1 = __importDefault(require("axios"));
const content_1 = require("../content");
const index_1 = require("../../index");
// @ts-ignore
class Premiere_ScheduledEvent {
    constructor(event, event_id, conference, starts_at, ends_at) {
        this.event = event;
        this.event_id = event_id;
        this.conference = conference;
        this.starts_at = starts_at;
        this.ends_at = ends_at;
    }
    /* Returns the map the event is playing on.
    * Returns multiple maps for tournament type.
    * TODO: Return Map Object (from valorant-api.com)
    */
    get_map() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = this.event) === null || _a === void 0 ? void 0 : _a.get_map();
        });
    }
    get_member_participation() {
        return __awaiter(this, void 0, void 0, function* () {
            const database = yield index_1.discord_bot.Client.DB.connect();
            const members = yield database.query(`SELECT * FROM members`);
            const participation = yield database.query(`SELECT * FROM events WHERE event_id = '${this.event_id}'`);
            database.release();
        });
    }
}
exports.Premiere_ScheduledEvent = Premiere_ScheduledEvent;
class Premiere_Event {
    constructor(id, type, starts_at, ends_at, map_selection, points_required_to_participate) {
        this.id = id;
        this.type = type;
        this.starts_at = starts_at;
        this.ends_at = ends_at;
        this.map_selection = map_selection;
        this.points_required_to_participate = points_required_to_participate;
    }
    /* Returns the map the event is playing on.
    * Returns multiple maps for tournament type.
    * TODO: Return Map Object (from valorant-api.com)
    */
    get_map() {
        return __awaiter(this, void 0, void 0, function* () {
            // We do not care about the type, only about the maps.
            if (this.map_selection.type === "PICKBAN")
                return yield content_1.MapClass.fetchMap("ee613ee9-28b7-4beb-9666-08db13bb2244"); // Use The Range for PickBans
            return yield content_1.MapClass.fetchMap(this.map_selection.maps[0].id);
        });
    }
}
exports.Premiere_Event = Premiere_Event;
class VALORANT_Premiere {
    constructor(region = "eu") {
        this.region = region;
    }
    /* Fetch and initialize the latest premiere season data.
    * The data is not being cached.
    */
    fetch_data() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(`https://api.henrikdev.xyz/valorant/v1/premier/seasons/${this.region}`);
            if (response.status !== 200) {
                throw new Error("Could not fetch the premiere data.");
            }
            const data = response.data.data[response.data.data.length - 1];
            this.id = data.id;
            this.championship_event_id = data.championship_event_id;
            this.championship_points_required = data.championship_points_required;
            this.starts_at = Date.parse(data.starts_at);
            this.ends_at = Date.parse(data.ends_at);
            this.enrollment_starts_at = Date.parse(data.enrollment_starts_at);
            this.enrollment_ends_at = Date.parse(data.enrollment_ends_at);
            this.events = data.events.map((event) => new Premiere_Event(event.id, event.type, Date.parse(event.starts_at), Date.parse(event.ends_at), event.map_selection, event.points_required_to_participate));
            this.scheduled_events = data.scheduled_events
                /* Check whether
                * The Event plays in our region.
                * It is an upcoming event that has not yet been played.
                */
                .filter(((event) => event.conference === "EU_DACH" && (Date.parse(event.starts_at)) > (Date.now())))
                .map((scheduledEvent) => new Premiere_ScheduledEvent(
            // Save the whole event class so we have a reference
            this.events ? this.events.find(((event) => event.id === scheduledEvent.event_id)) : undefined, scheduledEvent.event_id, scheduledEvent.conference, Date.parse(scheduledEvent.starts_at), Date.parse(scheduledEvent.ends_at)));
            // console.log(this);
            // console.log(new Date(this.scheduled_events ? this.scheduled_events[0].starts_at : 0).toDateString())
            // console.log(this.scheduled_events?.length)
            // console.log(this.events?.[this.events?.length - 1].map_selection.maps[0].name);
            return this;
        });
    }
    /* Returns every scheduled event. */
    get_events() {
        return __awaiter(this, void 0, void 0, function* () {
            // let events: IScheduled_Event[] = [];
            return this.scheduled_events;
        });
    }
}
exports.VALORANT_Premiere = VALORANT_Premiere;
