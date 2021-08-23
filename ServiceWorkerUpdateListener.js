/**
 * Listens for update events on ServerWorkerRegistrations
 * @version 1.1
 */
class ServiceWorkerUpdateListener extends EventTarget {

    /**
     * Add a registration to start listening for update events
     * @param {ServiceWorkerRegistration} registration
     */
    addRegistration(registration) {
        // Make sure we have an array to hold the registrations
        if (!this._registrations) this._registrations = [];

        // Abort if we are already listening for this registration
        if (this._registrations.includes(registration)) return;

        // Add the registration to the array of registrations
        this._registrations.push(registration);

        // Add a reference to the event listener and attach it to a registration so we can remove it when needed
        var addEventListenerForRegistration = (registration, target, type, listener) => {
            if (!this._eventListeners) this._eventListeners = [];
            this._eventListeners.push({ 'registration': registration, 'target': target, 'type': type, 'listener': listener });
            target.addEventListener(type, listener);
        }

        // Convenience method to both dispatch the update event and call the relating method
        var dispatchUpdateStateChange = (state, serviceWorker, registration) => {
            var type    = 'update' + state;
            var method  = 'on' + type;
            var event   = new CustomEvent(type, { detail: { 'serviceWorker': serviceWorker, 'registration': registration } });
    
            this.dispatchEvent(event);
    
            if (this[method] && typeof this[method] === 'function') this[method].call(this, event);
        };

        // Fire the `onupdatewaiting` event if there is already a Service Worker waiting
        if (registration.waiting) dispatchUpdateStateChange('waiting', registration.waiting, registration);

        // Listen for a new service worker at ServiceWorkerRegistration.installing
        addEventListenerForRegistration(registration, registration, 'updatefound', updatefoundevent => {
            // Abort if we have no active service worker already, that would mean that this is a new service worker and not an update
            // There should be a service worker installing else this event would not have fired, but double check to be sure
            if (!registration.active || !registration.installing) return;
            
            // Listen for state changes on the installing service worker
            addEventListenerForRegistration(registration, registration.installing, 'statechange', statechangeevent => {
                // The state should be installed, but double check to make sure
                if (statechangeevent.target.state !== 'installed') return;

                // Fire the `onupdatewaiting` event as we have moved from installing to the installed state
                dispatchUpdateStateChange('waiting', registration.waiting, registration);
            });

            // Fire the `onupdateinstalling` event 
            dispatchUpdateStateChange('installing', registration.installing, registration);
        });

        // Listen for the document's associated ServiceWorkerRegistration to acquire a new active worker
        addEventListenerForRegistration(registration, navigator.serviceWorker, 'controllerchange', controllerchangeevent => {
            // Postpone the `onupdateready` event until the new active service worker is fully activated
            controllerchangeevent.target.ready.then(registration => {
                // Fire the `onupdateready` event
                dispatchUpdateStateChange('ready', registration.active, registration);
            });
        });
    }

    /**
     * Remove a registration to stop listening for update events
     * @param {ServiceWorkerRegistration} registration
     */
    removeRegistration(registration) {
        // Abort if we don't have any registrations
        if (!this._registrations || this._registrations.length <= 0) return;

        // Remove all event listeners attached to a certain registration
        var removeEventListenersForRegistration = (registration) => {
            if (!this._eventListeners) this._eventListeners = [];
            this._eventListeners = this._eventListeners.filter(eventListener => {
                if (eventListener.registration === registration) {
                    eventListener.target.removeEventListener(eventListener.type, eventListener.listener);
                    return false;
                } else {
                    return true;
                }
            });
        }

        // Remove the registration from the array
        this._registrations = this._registrations.filter(current => {
            if (current === registration) {
                removeEventListenersForRegistration(registration);
                return false;
            } else {
                return true;
            }
        });
    }

    /**
     * Force the service worker to move from waited to activating state.
     * 
     * Note: This requires the service worker script file to listen for this message, for example:
     * self.addEventListener('message', event => { if (event.data === 'skipWaiting') return skipWaiting() });
     * @param {ServiceWorker} serviceWorker 
     */
    skipWaiting(serviceWorker) {
        serviceWorker.postMessage('skipWaiting');
    }
}