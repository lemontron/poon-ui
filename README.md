## Poon-UI

Poon UI is so native, it feels indecent! Why settle for a vanilla web app?

<img src="https://img.shields.io/badge/bundle_size-57.6%20kB-blue">
<img src="https://img.shields.io/badge/minified_size-30.4%20kB-blue">

## Integration steps:

#### 1. Install package

```bash
npm install poon-ui
```

#### 2. In head, adopt this viewport meta...

```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0, viewport-fit=cover"/>
```

#### 3. In JavaScript import the css...

```javascript
import 'poon-ui/poon.css';
```

#### 4. Within your app component, add the Modal, Toast, Alert, etc by just adding PoonOverlays...

```javascript
import { PoonOverlays } from 'poon-ui';

...<PoonOverlays/>
```