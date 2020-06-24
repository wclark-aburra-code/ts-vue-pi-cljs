

export module sse {

    enum ReadyState {CONNECTING = 0, OPEN = 1, CLOSED = 2}

    export interface IEventSourceStatic extends EventTarget {
        new (url: string, eventSourceInitDict?: IEventSourceInit): IEventSourceStatic;
        url: string;
        withCredentials: boolean;
        CONNECTING: ReadyState; // constant, always 0
        OPEN: ReadyState; // constant, always 1
        CLOSED: ReadyState; // constant, always 2
        readyState: ReadyState;
        onopen: Function;
        onmessage: (event: IOnMessageEvent) => void;
        onerror: Function;
        close: () => void;
    }

    interface IEventSourceInit {
        withCredentials?: boolean;
    }

    export interface IOnMessageEvent {
        data: string;
    }
}
export var EventSource : sse.IEventSourceStatic;
export type IOnMessageEvent = sse.IOnMessageEvent;
export interface EstimateItem {
    text: string,
    cnt: number
}

export interface Display {
    leibnizOverflow: boolean,
    eulerOverflow: boolean,
    leibnizItems: EstimateItem[],
    eulerItems: EstimateItem[],
    leibnizBestEstimate: number,
    eulerBestEstimate: number,
    loading: boolean,
    eulerLoading: boolean,
    leibnizLoading: boolean
    evtSourceLeibniz: EventSource,
    evtSourceEuler: EventSource,
}

