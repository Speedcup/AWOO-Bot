import axios from 'axios';
import { AgentClass, MapClass, agent_cache, map_cache } from "../content";
export { VALORANT_Premiere };

/*
TODO List
* Fetch Premiere Data upon every startup and every 24hours (or some other logical time period)
* Update the embed on every data fetch.
* Save player selections based on the premiere data or id (if applied) to the database and reselect them once the embed has changed.
* The API saves every previous season as well, so we should only fetch the last data item to get the current ongoing season.
*/

interface IScheduled_Event {
    event: IEvent,
    event_id: string,
    conference: string,
    starts_at: number,
    ends_at: number
}

interface IEvent { // Events are typically Games, Scrims and Tournaments of the whole premiere season.
    id: string,
    type: string, // TODO - ENUM (LEAGUE, SCRIM, TOURNAMENT)
    starts_at: number, // Remove -1 hour (dateString)
    ends_at: number, // Remove -1 hour (dateString)
    // conference_schedules: string[] /** I would rather not implement this, as this contains every schedule for every region which we do not need. Just recalculate the start and end time to EU-West Timezone. GMT + 1**/
    map_selection: object[],
    points_required_to_participate: number
}

// @ts-ignore
class Premiere_ScheduledEvent implements IScheduled_Event {
    constructor(
        public event: Premiere_Event | undefined,
        public event_id: string,
        public conference: string,
        public starts_at: number,
        public ends_at: number
    ) {}

    /* Returns the map the event is playing on.
    * Returns multiple maps for tournament type.
    * TODO: Return Map Object (from valorant-api.com)
    */
    async get_map(): Promise<MapClass | undefined> {
        return await this.event?.get_map()
    }
}

class Premiere_Event implements IEvent {
    constructor(
        public id: string,
        public type: string,
        public starts_at: number,
        public ends_at: number,
        public map_selection: object[],
        public points_required_to_participate: number
    ) {}

    /* Returns the map the event is playing on.
    * Returns multiple maps for tournament type.
    * TODO: Return Map Object (from valorant-api.com)
    */
    async get_map(): Promise<MapClass | undefined> {
        // We do not care about the type, only about the maps.
        //@ts-ignore
        if (this.map_selection["type"] === "PICKBAN") return;

        //@ts-ignore
        console.log(this.map_selection["maps"][0]["id"]);

        //@ts-ignore
        return await MapClass.fetchMap(this.map_selection["maps"][0]["id"]);
    }
}

class VALORANT_Premiere {
    protected id?: string
    protected championship_event_id?: string
    protected championship_points_required?: number
    protected starts_at?: number
    protected ends_at?: number
    protected enrollment_starts_at?: number
    protected enrollment_ends_at?: number
    protected events?: Premiere_Event[]
    protected scheduled_events?: Premiere_ScheduledEvent[]

    constructor(
        private region = "eu"
    ) {}

    /* Fetch and initialize the latest premiere season data.
    * The data is not being cached.
    */
    async fetch_data() {
        const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/premier/seasons/${this.region}`);

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
        this.events = data.events.map((event: any) => new Premiere_Event(
            event.id,
            event.type,
            Date.parse(event.starts_at),
            Date.parse(event.ends_at),
            event.map_selection,
            event.points_required_to_participate
        ));
        this.scheduled_events = data.scheduled_events
            /* Check whether
            * The Event plays in our region.
            * It is an upcoming event that has not yet been played.
            */
            .filter(((event: any) => event.conference === "EU_CENTRAL_EAST" && (Date.parse(event.starts_at)) > (Date.now())))
            .map((scheduledEvent: any) => new Premiere_ScheduledEvent(
                // Save the whole event class so we have a reference
                this.events ? this.events.find(((event: any) => event.id === scheduledEvent.event_id)) : undefined,
                scheduledEvent.event_id,
                scheduledEvent.conference,
                Date.parse(scheduledEvent.starts_at),
                Date.parse(scheduledEvent.ends_at)
            )
        );

        // console.log(this);
        // console.log(new Date(this.scheduled_events ? this.scheduled_events[0].starts_at : 0).toDateString())
        // console.log(this.scheduled_events?.length)

        return this;
    }

    /* Returns every scheduled event. */
    async get_events(): Promise<Premiere_ScheduledEvent[] | undefined> {
        // let events: IScheduled_Event[] = [];

        return this.scheduled_events;
    }
}

(async() => {
    const data = new VALORANT_Premiere().fetch_data();
})();