class ServiceWorkerUpdateListener extends EventTarget {
    addRegistration(registration) {
        if (!this._registrations) this._registrations = [];
        if (this._registrations.includes(registration)) return;

        this._registrations.push(registration);

        var addEventListenerForRegistration = (registration, target, type, listener) => {
            if (!this._eventListeners) this._eventListeners = [];
            this._eventListeners.push({ 'registration': registration, 'target': target, 'type': type, 'listener': listener });
            target.addEventListener(type, listener);
        }

        var dispatchUpdateStateChange = (state, serviceWorker, registration) => {
            var type    = 'update' + state;
            var method  = 'on' + type;
            var event   = new CustomEvent(type, { detail: { 'serviceWorker': serviceWorker, 'registration': registration } });
    
            this.dispatchEvent(event);
    
            if (this[method] && typeof this[method] === 'function') this[method].call(this, event);
        };

        if (registration.waiting) dispatchUpdateStateChange('waiting', registration.waiting, registration);

        addEventListenerForRegistration(registration, registration, 'updatefound', updatefoundevent => {
            if (!registration.active || !registration.installing) return;
            
            addEventListenerForRegistration(registration, registration.installing, 'statechange', statechangeevent => {
                if (statechangeevent.target.state !== 'installed') return;
                dispatchUpdateStateChange('waiting', registration.waiting, registration);
            });

            dispatchUpdateStateChange('installing', registration.installing, registration);
        });

        addEventListenerForRegistration(registration, navigator.serviceWorker, 'controllerchange', controllerchangeevent => {
            controllerchangeevent.target.ready.then(registration => {
                dispatchUpdateStateChange('ready', registration.active, registration);
            });
        });
    }

    removeRegistration(registration) {
        if (!this._registrations) this._registrations = [];

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

        this._registrations = this._registrations.filter(current => {
            if (current === registration) {
                removeEventListenersForRegistration(registration);
                return false;
            } else {
                return true;
            }
        });
    }

    activate(serviceWorker) {
        serviceWorker.postMessage('skipWaiting');
    }
}