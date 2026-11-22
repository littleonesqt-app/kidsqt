#!/bin/bash
# Rebuilds the GitHub Pages page (index.html) from demo/devotion-app.html.
# The head adds what lets people put the link on their phone's home screen (manifest, icons).
cd "$(dirname "$0")/.."
{ printf '<!doctype html>\n<html lang="ko">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#F3F0EA">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-180.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="리틀원스묵상">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'; cat demo/devotion-app.html; } > index.html
