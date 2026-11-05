# Weather AOD

An always-on-display weather screen: pure-black background (OLED friendly), big clock, current conditions, and the next 6 hours.

- Single file, no build step, no API key (data from [Open-Meteo](https://open-meteo.com)).
- Open `index.html` (or serve the folder, e.g. `npx serve weather-aod`) on a phone/tablet/old monitor.
- **Double-click/double-tap** for fullscreen. The screen wake lock is requested so the display stays on.
- **Tap the small location text** (bottom right) to change city, toggle °C/°F, or re-detect location.
- Burn-in protection: the layout drifts a few pixels every minute and dims between 22:00 and 06:00.
- Refreshes every 15 minutes; shows the last data if offline.
