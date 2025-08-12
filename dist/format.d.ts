export interface GhEvent {
    created_at: string;
    type: string;
    repo: {
        name: string;
    };
    payload: any;
}
export declare function formatEvents(events: GhEvent[]): string[][];
