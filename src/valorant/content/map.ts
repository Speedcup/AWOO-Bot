import axios from "axios";
import logger from "../../logger";
import { Cache } from "../../utils/globalcache";
export { MapClass, MapCacheClass, IMap, map_cache };

interface IMap {
    UUID: string,
    DisplayName: string,
    NarrativeDescription: string,
    TacticalDescription: string,
    Coordinates: string,
    DisplayIcon: string,
    ListViewIcon: string,
    Splash: string,
    AssetPath: string,
    MapUrl: string,
    xMultiplier: number,
    yMultiplier: number,
    xScalarToAdd: number,
    yScalarToAdd: number,
    callouts: any[],
}

class MapClass implements IMap {
    constructor(
        public UUID: string,
        public DisplayName: string,
        public NarrativeDescription: string,
        public TacticalDescription: string,
        public Coordinates: string,
        public DisplayIcon: string,
        public ListViewIcon: string,
        public Splash: string,
        public AssetPath: string,
        public MapUrl: string,
        public xMultiplier: number,
        public yMultiplier: number,
        public xScalarToAdd: number,
        public yScalarToAdd: number,
        public callouts: any[],
    ) {}

    static async fetchMaps(): Promise<{ [index: string]: MapClass }> {
        logger.debug("Fetching Valorant Maps ...");

        const mapCache: { [key: string]: MapClass } = {};
        const response = await axios.get("https://valorant-api.com/v1/maps");

        if (response.status !== 200) {
            throw new Error("Could not get maps.");
        }

        response.data.data.forEach((valorant_map: { [index: string]: any }) => {
            const mapInstance = new MapClass(
                valorant_map.uuid,
                valorant_map.displayName,
                valorant_map.narrativeDescription,
                valorant_map.tacticalDescription,
                valorant_map.coordinates,
                valorant_map.displayIcon,
                valorant_map.listViewIcon,
                valorant_map.splash,
                valorant_map.assetPath,
                valorant_map.mapUrl,
                valorant_map.xMultiplier,
                valorant_map.yMultiplier,
                valorant_map.xScalarToAdd,
                valorant_map.yScalarToAdd,
                valorant_map.callouts
            )

            mapCache[mapInstance.UUID] = mapInstance;
        })

        logger.debug(`Successfully fetched ${mapCache.length} Maps!`);

        return mapCache;
    }

    static async fetchMap(uuid: string, force: boolean = false, preventCaching: boolean = false): Promise<MapClass> {
        //if (let valorant_map = map_cache.get(uuid)) {
        if (map_cache.get(uuid) && !force) {
            // @ts-ignore, TS is dumb, we are checking whether the map exists.
            return map_cache.get(uuid)
        }

        const response = await axios.get(`https://valorant-api.com/v1/maps/${uuid}`);
        if (response.status !== 200) {
            throw new Error("Could not get the map.");
        }

        const valorant_map = response.data.data;
        const mapInstance = new MapClass(
            valorant_map.uuid,
            valorant_map.displayName,
            valorant_map.narrativeDescription,
            valorant_map.tacticalDescription,
            valorant_map.coordinates,
            valorant_map.displayIcon,
            valorant_map.listViewIcon,
            valorant_map.splash,
            valorant_map.assetPath,
            valorant_map.mapUrl,
            valorant_map.xMultiplier,
            valorant_map.yMultiplier,
            valorant_map.xScalarToAdd,
            valorant_map.yScalarToAdd,
            valorant_map.callouts
        )

        if (!preventCaching) {
            map_cache.set(mapInstance.UUID, mapInstance);
        }

        return mapInstance;
    }
}

class MapCacheClass extends Cache<MapClass> {
    constructor() { super() }
}

const map_cache = new MapCacheClass();