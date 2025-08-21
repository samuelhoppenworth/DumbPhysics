type EventCallback = (data?: any) => void;

/**
 * Singleton event bus for application-wide communication.
 */
class EventBus {
    private listeners: Map<string, EventCallback[]> = new Map();

    /**
     * Subscribes a callback function to a specific event.
     * @param eventName The name of the event to listen for.
     * @param callback The function to execute when the event is dispatched.
     */
    public on(eventName: string, callback: EventCallback): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(callback);
    }

    /**
     * Dispatches an event, calling all subscribed callbacks with the provided data.
     * @param eventName The name of the event to dispatch.
     * @param data Optional data to pass to the event listeners.
     */
    public dispatch(eventName: string, data?: any): void {
        if (!this.listeners.has(eventName)) {
            return;
        }
        this.listeners.get(eventName)!.forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`Error in event handler for ${eventName}:`, e);
            }
        });
    }
}

export const eventBus = new EventBus();