## Poon-UI

Poon UI is so native, it feels indecent! Why settle for a vanilla web app? Poon UI is the most golfed UI library that
attempts a native look and feel in the history of the web. It's immeasurable poon is due to the reuse of code internally
across components.

<img src="https://img.shields.io/badge/bundle_size-57.6%20kB-blue">
<img src="https://img.shields.io/badge/minified_size-30.4%20kB-blue">

## Quick Start Guide

```bash
npm install poon-ui
npm install poon-router
```

#### `Head Tag` Adopt this template:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0, viewport-fit=cover"/>
<link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
<meta name="description" content="Streaming service with a more sexual name"/>
<meta name="theme-color" content="THEME_COLOR">
<link rel="manifest" href="/manifest.json">
```

#### `JavaScript` Import the CSS:

```javascript
import 'poon-ui/poon.css';
```

#### `index.js/main.js` Add PoonOverlays:

```javascript
import { PoonOverlays } from 'poon-ui';

const App = () => (
    <Fragment>
        <Stack/>
        <PoonOverlays/>
    </Fragment>
);
```
PoonOverlays currently includes a Modal, Toast, and Alert

## Integration with Poon Router

Poon Router passes some very important props (isVisible and animateIn) to the component being routed to. You must prop-drill both to the `<Card/>`, `<Window/>` and `<Reveal/>` components wherever you use them.

## Custom Gestures

Personally I struggle to call them "custom" gestures. That would imply that when you use the Poon UI internal Gesture
system, you are doing something different than I while coding the components that are built in to this library. When in
fact, we be using the same gesture system.

Poon UI contains a juicy react hook called `useGesture`. Please simply take a look at ScrollView, Card,
Window, etc, and the API for such a historically difficult task will become clear as day, and soon you will admit being
unable to create gestures any other way.

## Text Selection

The web is historically document based. However it seemed more sexy to disable text selection everywhere except for `<p/>`
elements. Do you think it's too naughty? On iOS the guy who decided the text selection algorithm clearly had a lil concussy, so it is what it is.

## Scrolling

An important note on scrolling. I've committed the X rated act of a custom scroller and I'm very sorry. Unfortunately the creators of iOS Safari are into sadism because they disable e.preventDefault() so you can't cancel a vertical scroll while another gesture is happening, say, for instance a swipe back gesture. This causes the most atrocious faux pas of UI interaction where you can be scrolling a scroller and swiping back at the same time. There is no fix for it. There is no way to cancel a scroll once the finger moves. So I had to make my own scroller. I'm sorry. I'm so sorry. This is something I am working on tirelessly to resolve.