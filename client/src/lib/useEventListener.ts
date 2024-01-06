import { useEffect, useRef } from "react";

// Define a generic type for the callback function
type EventListenerCallback<T extends keyof WindowEventMap> = (event: WindowEventMap[T]) => void;

function useEventListener<T extends keyof WindowEventMap>(
  element: Window | Document | HTMLElement,
  eventType: T,
  listener: EventListenerCallback<T>
) {
  // Use useRef to store the listener
  const savedListener = useRef<EventListenerCallback<T>>();

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  useEffect(() => {
    const eventListener: EventListenerCallback<T> = (event) => savedListener.current?.(event);
    element.addEventListener(eventType, eventListener as EventListener);
    return () => {
      element.removeEventListener(eventType, eventListener as EventListener);
    };
  }, [eventType, element]);
}

export default useEventListener;
