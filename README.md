# ServiceWorkerUpdateListener
The `ServiceWorkerUpdateListener` interface extends the Service Worker API by providing a convenient way to receive update events when `ServiceWorkerRegistration` acquires new service workers.

## Properties
_The `ServiceWorkerUpdateListener` interface inherits properties from its parent, [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)._

### Event handlers
_All of the events contain the detail property containing the [ServiceWorker](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker#event_handlers) (`event.detail.serviceWorker`) and the [ServiceWorkerRegistration](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration) (`event.detail.registration`) that caused the event to fire._

#### ServiceWorkerUpdateListener.onupdateinstalling
An [EventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventListener) property called whenever an event of type updateinstalling is fired; it is fired any time the `ServiceWorkerRegistration.installing` property acquires a new service worker.

#### ServiceWorkerUpdateListener.onupdatewaiting
An [EventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventListener) property called whenever an event of type updatewaiting is fired; it is fired any time the `ServiceWorkerRegistration.waiting` property acquires a new service worker.

#### ServiceWorkerUpdateListener.onupdateready
An [EventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventListener) property called whenever an event of type updateready is fired; it is fired any time the document's associated [ServiceWorkerRegistration](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration) acquires a new service worker.

## Methods
_The `ServiceWorkerUpdateListener` interface inherits methods from its parent, [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)._

#### ServiceWorkerUpdateListener.addRegistration( ServiceWorkerRegistration )
Adds a registration to start listening for update events

#### ServiceWorkerUpdateListener.removeRegistration( ServiceWorkerRegistration )
Removes a registration to stop listening for update events

#### ServiceWorkerUpdateListener.skipWaiting( ServiceWorker )
Forces a service worker to move from the `waiting` state to the `active` state. 

## Installation

1. Download `ServiceWorkerUpdateListener.js` or the minimized `ServiceWorkerUpdateListener.min.js` from this repository.
2. Include the script on your HTML page.

```javascript
<script type="text/javascript" src="ServiceWorkerUpdateListener.js"></script>
```
3. Open the script of your Service Worker, often called `sw.js` or `service-worker.js`.
4. Make sure the code below is added. This will allow us to skip waiting from the front-end, using the `listener.activate()` method.

```javascript
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') return skipWaiting();
});
```

## Example
This code snippet will listen for update events. Whenever an update becomes available the text `Service Worker update available, click here to update` is shown on screen. When the user clicks on it, the new service worker immediately becomes available to all clients by reloading the window.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>ServiceWorkerUpdateListener</title>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover">
	<meta name="description" content="A Javascript ES6 class for listening for Service Worker update events.">
</head>
<body>
<div id="status">No update found.</div>
<script type="text/javascript" src="ServiceWorkerUpdateListener.js"></script>
<script>
// Create a new ServiceWorkerUpdateListener.
var listener = new ServiceWorkerUpdateListener();

// Called whenever an event of type updateinstalling is fired; 
// It is fired any time the ServiceWorkerRegistration.installing property acquires a new installing worker.
listener.onupdateinstalling = installingevent => {
    document.getElementById('status').innerHTML = 'Service Worker update found and installing ...';
}

// Called whenever an event of type updatewaiting is fired; 
// It is fired any time the ServiceWorkerRegistration.waiting property acquires a new waiting worker.
listener.onupdatewaiting = waitingevent => {
    var statusElement = document.getElementById('status');
    statusElement.innerHTML = 'Service Worker update available, click here to update.';
    statusElement.style.cursor = 'pointer';
    statusElement.addEventListener('click', clickevent => listener.skipWaiting(waitingevent.detail.serviceWorker));
}

// Called whenever an event of type updateready is fired; 
// It is fired any time the document's associated ServiceWorkerRegistration acquires a new active worker;
// We need to update the window to run the new Service Worker.
listener.onupdateready = event => window.location.reload();

// Create a new ServiceWorkerRegistration and add it to the listener.
navigator.serviceWorker.register('/service-worker.js').then(registration => listener.addRegistration(registration));
</script>
</body>
</html>
```

## Donate

If you have been enjoying my free Javascript code, please consider showing your support by buying me a coffee through the link below. Thanks in advance!

<a href="https://www.buymeacoffee.com/markvanwijnen" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-yellow.png" height="60px" alt="Buy Me A Coffee"></a>
