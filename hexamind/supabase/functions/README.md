2.  stripe-portal — 用户管理订阅时调用

在 subscription-modal.tsx 的「管理订阅」按钮：

```
  用户是 Pro 会员 → 打开订阅弹窗 → 点击「管理订阅」
         │
         ▼
  supabase.functions.invoke('stripe-portal')
         │
         ▼
  Stripe Customer Portal 页面
    ├─ 查看/修改支付方式
    ├─ 取消订阅
    ├─ 查看发票
    └─ 返回 App
```

先上线:
① stripe-create-checkout ✅ 已部署（价格硬编码）
② stripe-verify-session ← 新建部署

可选（建议配）当前未使用:
③ stripe-webhook ← Stripe Dashboard 配 Webhook
④ stripe-portal ← 部署后 Pro 用户可管理订阅
