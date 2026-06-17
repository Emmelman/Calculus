#!/usr/bin/env bash
#
# Install the AI-helper TLS trust config into the Capacitor-generated android/
# project. The android/ folder is created by `npx cap add android` on the build
# device (tablet) and is .gitignored, so this step reapplies the override after
# every fresh `cap add`. Idempotent: safe to run repeatedly.
#
# What it does:
#   1. copies android-config/network_security_config.xml -> res/xml/
#   2. copies android-config/helper_ca.crt               -> res/raw/
#   3. adds android:networkSecurityConfig to <application> in the manifest
#
# Run from the repo root AFTER `npx cap add android` and BEFORE `gradlew`:
#   bash scripts/android-apply-config.sh
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cfg_dir="$repo_root/android-config"
res_dir="$repo_root/android/app/src/main/res"
manifest="$repo_root/android/app/src/main/AndroidManifest.xml"

if [[ ! -d "$repo_root/android" ]]; then
  echo "error: android/ not found — run 'npx cap add android' first" >&2
  exit 1
fi

mkdir -p "$res_dir/xml" "$res_dir/raw"
cp "$cfg_dir/network_security_config.xml" "$res_dir/xml/network_security_config.xml"
cp "$cfg_dir/helper_ca.crt" "$res_dir/raw/helper_ca.crt"
echo "copied network_security_config.xml + helper_ca.crt into res/"

if grep -q 'android:networkSecurityConfig' "$manifest"; then
  echo "manifest already references networkSecurityConfig — skipping patch"
else
  # Add the attribute to the opening <application> tag (the only one).
  sed -i 's#<application#<application android:networkSecurityConfig="@xml/network_security_config"#' "$manifest"
  echo "patched AndroidManifest.xml <application> with networkSecurityConfig"
fi

echo "done — APK will trust the helper cert for 127.0.0.1/localhost"
