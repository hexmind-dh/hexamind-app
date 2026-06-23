#!/bin/bash
# ============================================================
# Stripe Edge Functions 部署脚本
# 使用: bash scripts/deploy-stripe-functions.sh
# ============================================================

set -e

echo "🚀 开始部署 Supabase Edge Functions..."

# 1. 设置 Stripe 密钥到 Supabase
echo ""
echo "📌 请先在 Supabase Dashboard 中设置以下 Secrets:"
echo "   设置路径: https://supabase.com/dashboard/project/leykejtjjvonuvqtbdtw/edge-functions/secrets"
echo ""
echo "   需要添加的 Secrets:"
echo "   ├── STRIPE_SECRET_KEY     = sk_live_xxx (你的 Stripe Secret Key)"
echo "   ├── STRIPE_WEBHOOK_SECRET = whsec_xxx (Webhook 签名密钥)"
echo "   └── PUBLIC_SITE_URL      = https://app.hexamind.com (你的网站地址)"
echo ""
read -p "⏳ 是否已设置好 Secrets? (y/n): " confirmed
if [[ "$confirmed" != "y" ]]; then
  echo "❌ 请先设置 Secrets 后再运行"
  exit 1
fi

# 2. 部署 Edge Functions（不需要 JWT 验证，因为 Webhook 没有用户 token）
echo ""
echo "📦 部署 stripe-create-checkout..."
supabase functions deploy stripe-create-checkout --no-verify-jwt

echo ""
echo "📦 部署 stripe-webhook..."
supabase functions deploy stripe-webhook --no-verify-jwt

echo ""
echo "📦 部署 stripe-portal..."
supabase functions deploy stripe-portal --no-verify-jwt

echo ""
echo "✅ 所有 Edge Functions 部署完成！"
echo ""

# 3. 显示 Webhook Endpoint 地址
PROJECT_REF="leykejtjjvonuvqtbdtw"
echo "🔗 Webhook URL: https://${PROJECT_REF}.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "📋 接下来请在 Stripe Dashboard 中配置 Webhook:"
echo "   1. 打开: https://dashboard.stripe.com/webhooks"
echo "   2. 点击「Add endpoint」"
echo "   3. Endpoint URL: https://${PROJECT_REF}.supabase.co/functions/v1/stripe-webhook"
echo "   4. 选择监听事件:"
echo "      - checkout.session.completed"
echo "      - customer.subscription.updated"
echo "      - customer.subscription.deleted"
echo "      - invoice.payment_succeeded"
echo "      - invoice.payment_failed"
echo "   5. 点击「Add endpoint」"
echo "   6. 复制 Signing secret (whsec_xxx) 到 Supabase Secrets 的 STRIPE_WEBHOOK_SECRET"
echo ""
echo "🎉 完成！"
