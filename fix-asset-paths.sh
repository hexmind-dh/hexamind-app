#!/usr/bin/env bash
set -euo pipefail

# fix-asset-paths.sh
# 将 assets/node_modules/.pnpm/ 下的资源移到短路径，并更新 JS 引用
# 解决 Vercel 上深路径 node_modules 资源 404 问题

echo "=== Fixing asset paths for Vercel deployment ==="

FONTS_SRC_DIR="assets/node_modules/.pnpm"
FONTS_DST_DIR="assets/fonts"
ICONS_DST_DIR="assets/icons"

# --- 1. 复制字体文件 ---
echo "[1/4] Copying font files..."
mkdir -p "$FONTS_DST_DIR"
find "$FONTS_SRC_DIR" -name "*.ttf" -exec cp -n {} "$FONTS_DST_DIR/" \;
FONT_COUNT=$(ls "$FONTS_DST_DIR"/*.ttf 2>/dev/null | wc -l)
echo "       Copied $FONT_COUNT font files to $FONTS_DST_DIR/"

# --- 2. 复制图标文件 ---
echo "[2/4] Copying icon (PNG) files..."
mkdir -p "$ICONS_DST_DIR"
# 扫描 JS 中所有引用的 .png 并复制
for jsfile in $(find _expo -name "*.js" -type f 2>/dev/null); do
    if grep -q 'assets/node_modules' "$jsfile" 2>/dev/null; then
        for pngref in $(grep -o '"[^"]*\.png"' "$jsfile" | grep 'assets/node_modules' | tr -d '"'); do
            basename=$(basename "$pngref")
            srcpath=$(find "$FONTS_SRC_DIR" -name "$basename" -type f 2>/dev/null | head -1)
            if [ -n "$srcpath" ] && [ ! -f "$ICONS_DST_DIR/$basename" ]; then
                cp "$srcpath" "$ICONS_DST_DIR/$basename"
            fi
        done
    fi
done
ICON_COUNT=$(ls "$ICONS_DST_DIR"/*.png 2>/dev/null | wc -l)
echo "       Copied $ICON_COUNT icon files to $ICONS_DST_DIR/"

# --- 3. 更新 JS 中的引用路径 ---
echo "[3/4] Updating JS bundle references..."

# 替换字体路径: /assets/node_modules/.../Fonts/X.ttf -> /fonts/X.ttf
for ttf_file in "$FONTS_DST_DIR"/*.ttf; do
    basename=$(basename "$ttf_file")
    for jsfile in $(find _expo -name "*.js" -type f 2>/dev/null); do
        if grep -q "/assets/node_modules/[^\"]*${basename}" "$jsfile" 2>/dev/null; then
            sed -i '' "s|/assets/node_modules/[^\"]*${basename}|/fonts/${basename}|g" "$jsfile"
            echo "       Patched: $basename -> /fonts/ in $jsfile"
        fi
    done
done

# 替换图标路径: /assets/node_modules/.../X.png -> /icons/X.png
for png_file in "$ICONS_DST_DIR"/*.png; do
    basename=$(basename "$png_file")
    for jsfile in $(find _expo -name "*.js" -type f 2>/dev/null); do
        if grep -q "/assets/node_modules/[^\"]*${basename}" "$jsfile" 2>/dev/null; then
            sed -i '' "s|/assets/node_modules/[^\"]*${basename}|/icons/${basename}|g" "$jsfile"
            echo "       Patched: $basename -> /icons/ in $jsfile"
        fi
    done
done

# --- 4. 验证 ---
echo "[4/4] Verifying..."
REMAINING=$(grep -r 'assets/node_modules' _expo 2>/dev/null | wc -l 2>/dev/null || echo 0)
REMAINING=${REMAINING// /}
if [ "$REMAINING" = "0" ]; then
    echo "       ✅ All references updated, no remaining node_modules paths."
else
    echo "       ⚠️  $REMAINING references still remain in _expo/"
fi

echo "=== Done ==="
