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
