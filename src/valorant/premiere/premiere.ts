import axios from 'axios';
export { VALORANT_Premiere };
/*
TODO List
* Fetch Premiere Data upon every startup and every 24hours (or some other logical time period)
* Update the embed on every data fetch.
* Save player selections based on the premiere data or id (if applied) to the database and reselect them once the embed has changed.
* The API saves every previous season as well, so we should only fetch the last data item to get the current ongoing season.
*/

interface Premiere_Map_Selection {
    type: string, // TODO - ENUM (RANDOM?)
    maps: string[]
}
interface IScheduled_Event {
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
    map_selection: Premiere_Map_Selection[],
    points_required_to_participate: number
}

class Premiere_Event {}

class VALORANT_Premiere {
    protected id?: string
    protected championship_event_id?: string
    protected championship_points_required?: number
    protected starts_at?: number
    protected ends_at?: number
    protected enrollment_starts_at?: number
    protected enrollment_ends_at?: number
    protected events?: IEvent[]
    protected scheduled_events?: IScheduled_Event[]

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
        this.events = data.events.map((event: any) => {
            return {
                id: event.id,
                type: event.type,
                starts_at: event.starts_at,
                ends_at: event.ends_at,
                map_selection: event.map_selection,
                points_required_to_participate: event.points_required_to_participate
            } as IEvent
        });
        this.scheduled_events = data.scheduled_events.map((event: any) => {
            // We only care about the region we are playing in.
            if (event.conference !== "EU_CENTRAL_EAST") return;

            return {
                event_id: event.event_id,
                conference: event.conference,
                starts_at: Date.parse(event.starts_at),
                ends_at: Date.parse(event.ends_at)
            } as IScheduled_Event
        });
        this.scheduled_events = data.scheduled_events
            /* Check whether
            * The Event plays in our region.
            * It is an upcoming event that has not yet been played.
            */
            .filter(((event: any) => event.conference === "EU_CENTRAL_EAST" && (Date.parse(event.starts_at)) > (Date.now())))
            .map((event: any) => {
                return {
                    event_id: event.event_id,
                    conference: event.conference,
                    starts_at: Date.parse(event.starts_at),
                    ends_at: Date.parse(event.ends_at)
                } as IScheduled_Event
        });

        console.log(this);
        console.log(new Date(this.scheduled_events ? this.scheduled_events[0].starts_at : 0).toDateString())
        console.log(this.scheduled_events?.length)

        return this;
    }

    /* Returns every scheduled event. */
    async get_events(): Promise<IScheduled_Event[] | undefined> {
        // let events: IScheduled_Event[] = [];

        return this.scheduled_events;
    }
}

(async() => {
    const data = new VALORANT_Premiere().fetch_data();
})();