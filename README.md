# SIH Harness

This document explains where and how teammates should add new tools to the Sage fork of Codex CLI.

## Tool Location

The main Codex CLI Rust code is located inside:

```text
codex-rs/
```

The tool system is located at:

```text
codex-rs/core/src/tools/
```

Existing Codex tool handlers are located inside:

```text
codex-rs/core/src/tools/handlers/
```

For our SIH Harness, all custom farming-related tools should be kept inside:

```text
codex-rs/core/src/tools/handlers/kisansathi
/
```

Expected structure:

```text
codex-rs/
└── core/
    └── src/
        └── tools/
            ├── handlers/
            │   ├── kisansathi
            /
            │   │   ├── mod.rs
            │   │   ├── soil_moisture.rs
            │   │   ├── soil_ph.rs
            │   │   ├── temperature.rs
            │   │   ├── weather.rs
            │   │   ├── irrigation.rs
            │   │   ├── crop_recommendation.rs
            │   │   └── ...
            │   │
            │   └── existing Codex handlers...
            │
            ├── registry.rs
            └── ...
```

## Adding a New Tool

Each independent capability should normally have its own Rust file.

For example:

```text
soil_moisture.rs
soil_ph.rs
weather.rs
irrigation.rs
crop_recommendation.rs
```

The basic structure is:

```text
One major capability
        ↓
One Rust file
        ↓
codex-rs/core/src/tools/handlers/kisansathi
/
```

## What Teammates Need to Build

You do not need to understand or modify the entire Codex CLI.

Focus on implementing the functionality assigned to you.

For example:

```text
INPUT
sensor_id

   ↓

YOUR IMPLEMENTATION

   ↓

OUTPUT
soil moisture value
```

Example input:

```json
{
  "sensor_id": "soil_sensor_01"
}
```

Example output:

```json
{
  "sensor_id": "soil_sensor_01",
  "moisture_percent": 28.5
}
```

Keep inputs and outputs clear and predictable.

## Initial Implementations

If complete Rust integration is difficult initially, first create a simple standalone implementation.

This may include:

* sensor-reading logic
* API calls
* ML models
* database queries
* hardware communication
* calculations

Once the functionality works, it can be converted or wrapped into the required Rust tool format.

Focus first on:

```text
Correct Input
    ↓
Correct Functionality
    ↓
Correct Output
```

## Integration

After implementation, the tool will be placed inside:

```text
codex-rs/core/src/tools/handlers/kisansathi
/
```

and connected to the Codex tool system.

Overall flow:

```text
Your Tool
    ↓
Sage Handler
    ↓
Codex Tool Registry
    ↓
SIH Harness Agent
```

The tool registry and agent integration will be handled centrally.

## Important Rule

All custom SIH Harness farming tools should remain inside:

```text
codex-rs/core/src/tools/handlers/kisansathi
/
```

Do not place farming functions randomly throughout the Codex codebase.

This keeps the project modular and makes it easier to merge, debug, update, and maintain.

## Summary

The most important path is:

```text
codex-rs/core/src/tools/handlers/kisansathi
/
```

Each teammate should develop their assigned capability as an independent module inside this directory, with clearly defined inputs and outputs.
