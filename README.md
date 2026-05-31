# HimmelBlick 🌤

Professionelle Wetter-Webanwendung mit Ensemble-Meteogramm, Radar und DWD-Warnungen.

## Schnellstart

```bash
git clone <repo>
cd himmelblick
cp .env.example .env
docker-compose up -d
```

Nach dem Build:
```
HimmelBlick gestartet → http://localhost
```

## Architektur

```
nginx (Port 80)
├── frontend (React + Vite, Port 3000)
└── backend (FastAPI, Port 8000)
        └── cache (Redis)
```

## Features

| Bereich | Beschreibung |
|---|---|
| Aktuelles Wetter | Temperatur, Windkompass, UV-Index, Biowetter-Chips |
| Stündlich (48h) | Temperaturkurve + Niederschlagsbalken (Recharts) |
| 14-Tage | Klappbare Tageskarten mit Mondphasen |
| Ensemble-Meteogramm | Spaghetti-Plot aller 7 Modelle (ICON/ECMWF/GFS/UKMO/Météo-France/ARPAE/KNMI) |
| Radar | DWD RADOLAN-Animation via WMS, animiert über 60 Minuten |
| DWD-Warnungen | Farbcodiert nach Stufe 1–5, Push-Benachrichtigungen |
| Luftqualität | PM2.5/PM10/O₃/NO₂ mit AQI nach EU-CAQI |
| Astronomie | Sonne/Mond/Dämmerung, Mondphase animiert |
| Klima (30 Tage) | Historische Extremwerte + Temperatur/Niederschlag-Chart |
| Biowetter | Hitzeindex, Windchill, Humidex, PET + Alltags-Empfehlungen |

## Datenquellen

- **Open-Meteo** — Vorhersage, Ensemble, historische Daten, Luftqualität
- **DWD Open Data** — Unwetterwarnungen, Radar (RADOLAN)
- **Brightsky** — DWD-Daten als REST-API (Fallback)
- **OpenStreetMap Nominatim** — Ortssuche
- **OpenTopoData** — Höhendaten

## Einstellungen

- Einheiten: °C/°F, km/h/m/s/Beaufort/kn, hPa/inHg, mm/inch
- Themes: Auto / Hell / Dunkel / Sturmwolken
- Zeitformat: 24h / 12h
- Sprache: Deutsch / Englisch
- Animationen: An / Aus

## Entwicklung

### Backend lokal

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend lokal

```bash
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend
pytest tests/
```

## Docker

```bash
docker-compose up -d          # Starten
docker-compose logs -f        # Logs
docker-compose down           # Stoppen
docker-compose pull && docker-compose up -d  # Update
```

## Umgebungsvariablen

Siehe `.env.example` für alle verfügbaren Optionen. Alle genutzten APIs sind kostenlos und benötigen keinen API-Key.
