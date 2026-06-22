## 认证

```ts
// 邮箱注册
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
});

// 邮箱登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// 登出
await supabase.auth.signOut();
```

## 监听登录状态

```ts
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 监听变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);
}
```

```sh
npm install supabase --save-dev
npx supabase init
npx supabase db pull
```

```sh
# 全局安装  安装后 不用 npx 前缀
brew install supabase/tap/supabase
# 创建迁移文件
  supabase migration new add_user_profile
# 更新文件后推送
  supabase db push
```

## 生成 TypeScript 类型

```sh
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

```sh
export SUPABASE_ACCESS_TOKEN=你的\_ACCESS_TOKEN
#
SUPABASE_ACCESS_TOKEN=sbp_248d43c3bed0b773d0d3c5175b93017d222fcaa3  supabase gen types typescript --project-id leykejtjjvonuvqtbdtw  --schema public  > db/database.types.ts --debug
```
