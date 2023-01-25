# The Backend

This directory contains the Firebase Cloud Functions we use to support the application, in particular to sync the [MA Legislature API](https://malegislature.gov/api/swagger/index.html?url=/api/swagger/v1/swagger.json#/) to Firestore, our database.

# Development

> **Important**: `typescript` and `firebase-tools` versions must match the versions in the parent `package.json` exactly in order for the functions shell to work with the emulators.

There are two main development workflows you can use. Both run functions locally on your computer.

First, you can run the full backend using [Firebase Emulators](https://firebase.google.com/docs/emulator-suite) by running `yarn dev:up` from the root of the repository. This runs the database, cloud functions, and search server with docker compose. You can make edits to functions and they will be automatically reloaded. You can inspect the database in a convenient web UI at http://localhost:3010. The firebase database will persist until you stop the emulators. The search server's data will persist until you remove the docker volume with `yarn compose down -v`.

Second, you can use an [interactive Node.js shell](https://firebase.google.com/docs/functions/local-shell) and call your functions directly by running `yarn dev:functions` from the root of the repository. This is convenient when you want to focus on a single function, since it will not trigger other functions that might normally run in response to documents created by your function, for instance.

## Triggering Scheduled Functions

The emulators do not run functions scheduled to run periodically. You can trigger your function manaully with:

```bash
curl http://localhost:5001/demo-dtp/us-central1/triggerScheduledFunction?name=FUNCTION_NAME
```

# Deployment

Functions are deployed manually at this time. Run `yarn deploy:functions` from the root directory.
