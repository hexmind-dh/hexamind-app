import type { DetailScreenData } from '@/components/detail/types';

export const mockDetailData: DetailScreenData = {
  moduleOne: {
    title: '模块 1: 时空态势矢量及状态转移',
    subtitle: '初始状态（本）、过渡关联状态（互）与前瞻终局状态（变）的对比分析',
    sources: [
      {
        label: '时间随机源 (HEX)',
        value: '0x19DE0D5C800',
        tone: 'orange',
      },
      {
        label: '空间随机源 (LAT/LNG)',
        value: '31.23°N, 121.47°E',
        tone: 'blue',
      },
      {
        label: '触控动能源 (ACC)',
        value: '0.500 m/s²',
        tone: 'purple',
      },
    ],
    cards: [
      {
        label: '本卦',
        name: '坤为地',
        symbol: '(☷☷)',
        top: {
          name: '坤',
          element: '(土)',
        },
        bottom: {
          name: '坤',
          element: '(土)',
        },
        lines: [
          { solid: false },
          { solid: false },
          { solid: false },
          { solid: false },
          { solid: false, active: true },
          { solid: false },
        ],
      },
      {
        label: '互卦',
        name: '坤为地',
        symbol: '(☷☷)',
        top: {
          name: '坤',
          element: '(土)',
        },
        bottom: {
          name: '坤',
          element: '(土)',
        },
        lines: [
          { solid: false },
          { solid: false },
          { solid: false },
          { solid: false },
          { solid: false },
          { solid: false },
        ],
      },
      {
        label: '变卦',
        name: '地水师',
        symbol: '(☷☵)',
        top: {
          name: '坤',
          element: '(土)',
        },
        bottom: {
          name: '坎',
          element: '(水)',
        },
        lines: [
          { solid: false },
          { solid: false },
          { solid: false },
          { solid: false },
          { solid: true, active: true },
          { solid: false },
        ],
      },
    ],
  },
  moduleTwo: {
    title: '模块 2: 要素关联对冲矩阵',
    subtitle: '评估外部环境或相关利益方矢量（用，即目标物）对决策主体（体）的驱动或阻碍作用',
    body: {
      role: '体',
      roleDescription: '决策主体 / 自有资本',
      symbol: '坤',
      element: '土',
      factorLabel: '(基准因子 (Ti))',
    },
    application: {
      role: '用',
      roleDescription: '分析目标 / 外部事件',
      symbol: '坤',
      element: '土',
      factorLabel: '(关联因子 (Yong))',
    },
    formulaEyebrow: '要素多轴交互对冲公式',
    formulaTitle: '体用比和',
    formulaQuote: '“体用五行均为 土，代表同心协力、平稳和顺、谋事易成。”',
    catalyst: {
      label: '动态局势转换催化：',
      value: '从下往上数第 2 行决策变量（爻）发生转变，从而催化大局演变',
    },
    interpretation: [
      {
        title: '第 2 爻（前线作业层）',
        description: '项目直接骨干与核心推进要项',
      },
      {
        title: '现实中对应人物与要素代表',
        description: '核心执行PM/工程师、专属项目履约组、已经签署的关键付款/交割条款、直属承销商与中介执行方。',
      },
      {
        title: '现实场景决策影响推演',
        description:
          '当前变数发生在具体的【前线干系人与推进要项控制层】。局势的催化来自于项目具体落地的骨干成员（如：项目的核心实施经理、或核心产品线的具体生产排程）。如果变卦状态不佳，表明当前的具体实现方案或中坚干系人正处于方向偏离状态；如果状态极佳，代表直接前线成员能够产生重大突破。策略上应重点调整直接承接团队或交付条款，以微调手段化解冲突。',
      },
    ],
  },
  moduleThree: {
    title: '模块 3: 决策多能分析综述',
    subtitle: 'AI 决策算法融合物理边界信息提供定量风险提示及行动路径',
    verdictLabel: '大吉',
    verdictTone: 'rose',
    summaryQuote:
      '"外部环境全盘相生。外部力量与事物规律极度契合您的决策问答，百事大吉。"',
    macroAnalysis: {
      heading: '宏观战略局势判定与风险量化分析',
      content:
        '### 宏观资本平衡监测：同人卦气协调\n当前周期中，企业的金属性资本与火属性执行频率达到同步共振。跨境货运通道畅通无阻，现金流摊销计划整体稳健。\n\n### 战术应对方案：\n* 保持硬通货结算资产比例，巩固体卦（自身）。\n* 对主要物流合约实施套期保值，缓释用卦折旧摩擦。',
    },
    tacticsHeading: '战略微调及对冲纠偏战术步骤',
    tactics: [
      {
        index: '01',
        text: '💡 审计现有现金储备以防范下半年金属属性波动摩擦。',
        actionLabel: '模拟推演',
      },
      {
        index: '02',
        text: '💡 通过长期仓储合约对物流运力支出进行对冲锁定。',
        actionLabel: '模拟推演',
      },
    ],
    infoCards: [
      {
        title: '能量转换最佳执行窗口',
        body: '辰时 (07:00-09:00)',
        badge: '日历同步就绪',
      },
      {
        title: '环境微观物理信号指标',
        body: '西方交通枢纽发生高频共鸣，预示货运通道无阻。',
      },
      {
        title: '高价值执行节点',
        body:
          '主体资本属火，当前最佳协同能量为【木】。这意味着在执行期内，主动增加策略耐性、让利账期或追加技术研发投入（木属性行为），将产生\'木生火\'的良性催化链。',
      },
      {
        title: '高胜率执行周期节点',
        body:
          '系统精算显示，未来时间轴中【寅日（木旺）】与【卯日（木旺）】为最强外部地利共振点。建议将核心合同签署、资金划拨或关键谈判对攻，刚性排配在这两个时间窗口内执行，以获取最高的周期溢价与风险冲减。',
      },
    ],
  },
  moduleFour: {
    divinationId: 'mock-div-001',
    sessionId: '17821192',
    inputPlaceholder: '问问 HEXA AI...',
    welcomeMessages: ['已就位，随时可以仿真要素演化路径。'],
    initialMessages: [],
  },
};
