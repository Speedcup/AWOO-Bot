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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALORANT_Premiere = void 0;
var axios_1 = require("axios");
var content_1 = require("../content");
// @ts-ignore
var Premiere_ScheduledEvent = /** @class */ (function () {
    function Premiere_ScheduledEvent(event, event_id, conference, starts_at, ends_at) {
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
    Premiere_ScheduledEvent.prototype.get_map = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ((_a = this.event) === null || _a === void 0 ? void 0 : _a.get_map())];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return Premiere_ScheduledEvent;
}());
var Premiere_Event = /** @class */ (function () {
    function Premiere_Event(id, type, starts_at, ends_at, map_selection, points_required_to_participate) {
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
    Premiere_Event.prototype.get_map = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // We do not care about the type, only about the maps.
                        if (this.map_selection["type"] === "PICKBAN")
                            return [2 /*return*/];
                        console.log(this.map_selection["maps"][0]["id"]);
                        return [4 /*yield*/, content_1.MapClass.fetchMap(this.map_selection["maps"][0]["id"])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Premiere_Event;
}());
var VALORANT_Premiere = /** @class */ (function () {
    function VALORANT_Premiere(region) {
        if (region === void 0) { region = "eu"; }
        this.region = region;
    }
    /* Fetch and initialize the latest premiere season data.
    * The data is not being cached.
    */
    VALORANT_Premiere.prototype.fetch_data = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var response, data, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get("https://api.henrikdev.xyz/valorant/v1/premier/seasons/".concat(this.region))];
                    case 1:
                        response = _d.sent();
                        if (response.status !== 200) {
                            throw new Error("Could not fetch the premiere data.");
                        }
                        data = response.data.data[response.data.data.length - 1];
                        this.id = data.id;
                        this.championship_event_id = data.championship_event_id;
                        this.championship_points_required = data.championship_points_required;
                        this.starts_at = Date.parse(data.starts_at);
                        this.ends_at = Date.parse(data.ends_at);
                        this.enrollment_starts_at = Date.parse(data.enrollment_starts_at);
                        this.enrollment_ends_at = Date.parse(data.enrollment_ends_at);
                        this.events = data.events.map(function (event) { return new Premiere_Event(event.id, event.type, event.starts_at, event.ends_at, event.map_selection, event.points_required_to_participate); });
                        this.scheduled_events = data.scheduled_events
                            /* Check whether
                            * The Event plays in our region.
                            * It is an upcoming event that has not yet been played.
                            */
                            .filter((function (event) { return event.conference === "EU_CENTRAL_EAST" && (Date.parse(event.starts_at)) > (Date.now()); }))
                            .map(function (scheduledEvent) { return new Premiere_ScheduledEvent(
                        // Save the whole event class so we have a reference
                        _this.events ? _this.events.find((function (event) { return event.id === scheduledEvent.event_id; })) : undefined, scheduledEvent.event_id, scheduledEvent.conference, scheduledEvent.starts_at, scheduledEvent.ends_at); });
                        // console.log(this);
                        // console.log(new Date(this.scheduled_events ? this.scheduled_events[0].starts_at : 0).toDateString())
                        // console.log(this.scheduled_events?.length)
                        _c = (_b = console).log;
                        return [4 /*yield*/, ((_a = this.scheduled_events) === null || _a === void 0 ? void 0 : _a[1].get_map())];
                    case 2:
                        // console.log(this);
                        // console.log(new Date(this.scheduled_events ? this.scheduled_events[0].starts_at : 0).toDateString())
                        // console.log(this.scheduled_events?.length)
                        _c.apply(_b, [_d.sent()]);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /* Returns every scheduled event. */
    VALORANT_Premiere.prototype.get_events = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // let events: IScheduled_Event[] = [];
                return [2 /*return*/, this.scheduled_events];
            });
        });
    };
    return VALORANT_Premiere;
}());
exports.VALORANT_Premiere = VALORANT_Premiere;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        data = new VALORANT_Premiere().fetch_data();
        return [2 /*return*/];
    });
}); })();
