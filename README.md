<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

<span align="center">

# Withings Sleep Homebridge Plugin

</span>

This is a simple HomeBridge plugin to expose a switch and an occupancy sensor thourhg a series of webhooks.

### Query the following endpoints to toggle on/off

| Endpoint              | Description                             |
|-----------------------|-----------------------------------------|
| `/withings/on`        | Turn on the switch and occupancy sensor |
| `/withings/off`       | Turn off the switch and occupancy sensor |
| `/withings/switch/on` | Turn on the switch |
| `/withings/switch/off`| Turn off the switch |
| `/withings/occupancy/on` | Turn on the occupancy sensor |
| `/withings/occupancy/off`| Turn off the occupancy sensor |

### Optional configs

| Config                | Description                             |
|-----------------------|-----------------------------------------|
| `port`                | Port to run the server on (default 3000) |
| `name`                | Name of the accessory (default Withings Sleep) |
| `hosts`              | List of hosts to allow (default all) |