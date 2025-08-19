# Create a script to set an environment variable making sure the app runs in dev mode
# and then start the Electron app.
$env:DEV_MODE = "true"
tsc --project .\tsconfig.json
npx eslint .
electron .