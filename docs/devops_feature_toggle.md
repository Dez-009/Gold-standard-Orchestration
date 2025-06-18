# DevOps Feature Toggle

This utility allows ops engineers to enable or disable platform features without redeploying the backend.

## CLI Usage

Run the helper script from the repository root:

```bash
python scripts/toggle_feature.py --key=pdf_export --role=pro --enable=true
```

Available options:
- `--key` – feature key defined in `utils/feature_keys.ts`
- `--role` – minimum access tier (`free`, `plus`, `pro`, `admin`)
- `--enable` – `true` or `false`
- `--list` – show all current flags

## Safety Warnings

Changing a feature flag immediately affects all live users. Verify the role level and toggle value before running in production.

## Testing Toggles Locally

1. Start the backend with a local database.
2. Use the CLI to enable or disable a flag.
3. Use the frontend admin panel (`/admin/features/quick-toggle`) to confirm the change.

Feature flags are stored in the database and take effect instantly in dev mode.
