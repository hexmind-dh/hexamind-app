import { Language } from "./translations";

export interface YaoExplanation {
  levelName: string;
  levelConcept: string;
  representation: string;
  gameAnalysis: string;
}

const EXPLANATIONS: Record<Language, Record<number, YaoExplanation>> = {
  "zh-CN": {
    1: {
      levelName: "第 1 爻（初始萌芽层）",
      levelConcept: "基层细节与微观执行起点",
      representation: "基层团队、最细碎项目杂支预算、起始技术协议、草拟版合同草案、早期开发Bug及小疏忽。",
      gameAnalysis: "当前变数发生在事务发起阶段的【最基层设施与微观底座】。局势的彻底转变或问题导火索，往往起始于某个极容易忽视的细琐处。在商业上，不要在这个阶段急于发起大规模宣誓性重资行动。应仔细自下而上进行防错筛查（例如：仔细审计财务底层单据、检查基础代码、或修正边缘销售要约），防止千里之堤毁于蚁穴。"
    },
    2: {
      levelName: "第 2 爻（前线作业层）",
      levelConcept: "项目直接骨干与核心推进要项",
      representation: "核心执行PM/工程师、专属项目履约组、已经签署的关键付款/交割条款、直属承销商与中介执行方。",
      gameAnalysis: "当前变数发生在具体的【前线干系人与推进要项控制层】。局势的催化来自于项目具体落地的骨干成员（如：项目的核心实施经理、或核心产品线的具体生产排程）。如果变卦状态不佳，表明当前的具体实现方案或中坚干系人正处于方向偏离状态；如果状态极佳，代表直接前线成员能够产生重大突破。策略上应重点调整直接承接团队或交付条款，以微调手段化解冲突。"
    },
    3: {
      levelName: "第 3 爻（中阶跨界层）",
      levelConcept: "结构摩擦、流程瓶颈与阻力拉扯区",
      representation: "中层管理墙、跨部门协作接口、合规审计前期摩擦、双方交涉代表的直接谈判角力、执行中的阻碍难关。",
      gameAnalysis: "当前变数处于【执行到决策过渡的最高摩擦区】。在此层级，博弈双方正处于激烈的拉扯阶段，代表跨部门内耗、沟通瓶颈（如：中层相互推诿、法务合规初期反弹、或谈判代表在某些敏感点上互不退让）。因此处在承上启下的高压临界点，最容易出现由于多方拉扯导致的决策疲惫或预算延宕。你需要有条理地化解沟通障碍，给予中间环节更多弹性对冲，防止陷入死锁状态。"
    },
    4: {
      levelName: "第 4 爻（决策预备层）",
      levelConcept: "高阶智囊、风控审计与外部合规枢纽",
      representation: "公司专职法务、财务专家、独立风控总监、外部授权审批监管、正式会签前的最终审计关口。",
      gameAnalysis: "当前变数发生在决策前置处的【风控、法律合规与高级审计辅助层】。本层不直接进行业务运营，而是充当“安全刹车”和“资源准入”职责。局势的突变往往由高阶审计结果、合规政策调整或权威行业报告披露点燃。若此爻动荡，说明必须启动严格的风控自查、或邀请第三方高级法务/财务顾问提前校准，在进入最后决策会商前排空潜在风险隐患。"
    },
    5: {
      levelName: "第 5 爻（核心主权层）",
      levelConcept: "最高决策、主体资本与底线控制权",
      representation: "最高管理层（CEO/Board）、创始大股东票决权、底线资金定价、企业基本持股架构、主体核心储备金。",
      gameAnalysis: "当前变数直接锁定项目最具支配力的【最高主权与主体命脉层】。大局之演变直接来自于C-Suite（首席执行官等）的根本战术干预、或是核心资产池/主力定价权的重要重组。五爻是全局毫无疑问的“主宰”和“心脏”。此层发生变动，意味着大股东表态、重大融资金额进退、或总包控制权底牌正在重调。应做好核心资产的主导权守护，严防控制权旁落，抓住核心决策节点提质增效。"
    },
    6: {
      levelName: "第 6 爻（边际周期层）",
      levelConcept: "全局清盘、大盘边际与安全退出边界",
      representation: "长线退出协议（Exit）、项目生命周期终点、宏观大盘时效红利到期、资深退职智囊意见、清算条款。",
      gameAnalysis: "当前变数已上升至博弈圈子的【大盘边际、顶端约束与本阶段消散点】。局势催化来自于宏观大势转变、红利期的尽头或预定的项目退出结算点。此时往往代表本轮动作力量已发展至极点，难有更大的上行空间，面临边际效益递减（亢极而衰）。在资本上，当前变动代表应当开始实施备用的“安全退路/退出机制”（例如：行使退出选择权、落实善后清盘、或转移阵线），而非在原有战线上继续追高下注。"
    }
  },
  "zh-TW": {
    1: {
      levelName: "第 1 爻（初始萌芽層）",
      levelConcept: "基層細節與微觀執行起點",
      representation: "基層團隊、最細碎項目雜支預算、起始技術協議、草擬版合同草案、早期開發Bug及小疏忽。",
      gameAnalysis: "當前變數發生在事務發起階段的【最基層設施與微觀底座】。局勢的徹底轉變或問題導火索，往往起始於某個極容易忽視的細瑣處。在商業上，不要在這個階段急於發起大規模宣誓性重資行動。應仔細自下而上進行防錯篩查（例如：仔細審計財務底層單據、檢查基礎代碼、或修正邊緣銷售要約），防止千里之堤毀於蟻穴。"
    },
    2: {
      levelName: "第 2 爻（前線作業層）",
      levelConcept: "項目直接骨幹與核心推進要項",
      representation: "核心執行PM/工程師、專屬項目履約組、已經簽署的關鍵付款/交割條款、直屬承銷商與中介執行方。",
      gameAnalysis: "當前變數發生在具體的【前線幹系人與推進要項控制層】。局勢的催化來自於項目具體落地的骨幹成員（如：項目角色的實施經理、或核心產品線的具體生產排程）。如果變卦狀態不佳，表明當前的具體實現方案或中堅幹系人正處於方向偏離狀態；如果狀態極佳，代表直接前線成員能夠產生重大突破。策略上應重點調整直接承接團隊或交付條款，以微調手段化解衝突。"
    },
    3: {
      levelName: "第 3 爻（中階跨界層）",
      levelConcept: "結構摩擦、流程瓶頸與阻力拉扯區",
      representation: "中層管理牆、跨部門協作接口、合規審計前期摩擦、雙方交涉代表的直接談判角力、執行中的阻礙難關。",
      gameAnalysis: "當前變數處於【執行到決策過渡的最高摩擦區】。在此層級，博弈雙方正處於激烈的拉扯階段，代表跨部門內耗、溝通瓶頸（如：中層相互推諉、法務合規初期反彈、或談判代表在某些敏感點上互不退讓）。因此處在承上啟下的高壓臨界點，最容易出現由於多方拉扯導致的決策疲憊或預算延宕。你需要有條理地化解溝通障礙，給予中間環節更多彈性對衝，防止陷入死鎖狀態。"
    },
    4: {
      levelName: "第 4 爻（決策預備層）",
      levelConcept: "高階智囊、風控審計與外部合規樞紐",
      representation: "公司專職法務、財務專家、獨立風控總監、外部授權審批監管、正式會簽前的最終審計關口。",
      gameAnalysis: "當前變數發生在決策前置處的【風控、法律合規與高級審計輔助層】。本層不直接進行業務運營，而是充當“安全煞車”和“資源准入”職責。局勢的突變往往由高階審計結果、合規政策調整或權威行業報告披露點燃。若此爻動盪，說明必須啓動嚴格的風控自查、或邀請第三方高級法務/財務顧問提前校準，在進入最後決策會商前排空潛在風險隱患。"
    },
    5: {
      levelName: "第 5 爻（核心主權層）",
      levelConcept: "最高決策、主體資本與底線控制權",
      representation: "最高管理層（CEO/Board）、創始大股東票決權、底線資金定價、企業基本持股架構、主體核心儲備金。",
      gameAnalysis: "當前變數直接鎖定項目最具支配力的【最高主權與主體命脈層】。大局之演變直接來自於C-Suite（首席執行官等）的根本戰術干預、或是核心資產池/主力定價權的重要重組。五爻是全局毫無疑問的“主宰”和“心臟”。此層發生變動，意味著大股東表態、重大融資金額進退、或總包控制權底牌正在重調。應做好核心資產的主導權守護，嚴防控制權旁落，抓住核心決策節點提質增效。"
    },
    6: {
      levelName: "第 6 爻（邊際週期層）",
      levelConcept: "全局清盤、大盤邊際與安全退出邊界",
      representation: "長線退出協議（Exit）、項目生命週期終點、宏觀大盤時效紅利到期、資深退職智囊意見、清算條款。",
      gameAnalysis: "當前變數已上升至博弈圈子的【大盤邊際、頂端約束與本階段消散點】。局勢催化來自於宏觀大勢轉變、紅利期的盡頭或預定的項目退出結算點。此時往往代表本輪動作力量已發展至極点，難有更大的上行空間，面臨邊際效益遞減（亢極而衰）。在資本上，當前變動代表應當開始實施備用的“安全退路/退出機制”（例如：行使退出選擇權、落實善後清盤、或轉移陣線），而非在原有戰線上繼續追高下註。"
    }
  },
  "en": {
    1: {
      levelName: "Line 1 (Micro Sprouting Layer)",
      levelConcept: "Foundation & Execution Roots",
      representation: "Base operations, micro-budgets, preliminary tech specs, draft proposals, early-stage testing logs.",
      gameAnalysis: "The critical variables have triggered at the absolute foundation. Any escalation originates from minor oversights. In strategy, abstain from massive structural pushes. Carefully audit baseline parameters (e.g., verifying database schemas, checking contract clauses, or inspecting ground budget lines) to prevent systemic damage."
    },
    2: {
      levelName: "Line 2 (Ground Action Layer)",
      levelConcept: "Localized Execution & Project Team Leads",
      representation: "Key PMs, implementation squads, specific localized deliverables, primary payment clauses.",
      gameAnalysis: "The catalyst originates from active ground execution. This line governs project owners or active operational details. When this changes, it signals a localized drift or tactical pivots in implementation. Recalibrate operational incentives or intermediate schedules to realign alignment with the overall goal."
    },
    3: {
      levelName: "Line 3 (Structural Pivot Layer)",
      levelConcept: "Process Bottlenecks & Friction Stress Points",
      representation: "Middle managers, cross-departmental bottlenecks, early policy clashes, initial trade negotiations.",
      gameAnalysis: "You are navigating the peak friction zone as things step from ground team to executives. This level represents department walls, active negotiation friction, and structural stress. Expect high energy consumption and localized pushbacks. Provide strategic flexibility to middle layers to bypass bottlenecks."
    },
    4: {
      levelName: "Line 4 (Regulatory Auditing Layer)",
      levelConcept: "Risk Management, Compliance & Guidance",
      representation: "Corporate legal advisors, internal auditing teams, risk advisory, regulatory clearances.",
      gameAnalysis: "The variables reside in your safeguarding layer. This level does not operate the business but validates safety, legal compliance, and structural integrity. A change here indicates regulatory intervention, safety alerts, or auditors requesting deep vetting. Rectify structural risks before seeking board-level triggers."
    },
    5: {
      levelName: "Line 5 (Sovereign Authority Layer)",
      levelConcept: "Core Board, Major Funding & Decision Makers",
      representation: "Executive board (CEO, founders), core capital pool, master pricing power, ultimate veto controls.",
      gameAnalysis: "The trigger directly hits the sovereign nexus of your enterprise. The shift stems from key board movements, major capital allocations, or fundamental pricing changes. This is the heart of the system. Maintain strict control of your primary assets, ensure founder alignment, and optimize executive power."
    },
    6: {
      levelName: "Line 6 (Boundary Boundary Layer)",
      levelConcept: "Lifecycle Climax & Exit Trajectories",
      representation: "Exit criteria, terminal lifecycle caps, market valuation exhaustion, senior consultants' legacy advice.",
      gameAnalysis: "The variable represents the limit threshold of the active cycle. The active momentum has reached a climax, meaning diminishing marginal utility. On capital, focus on exit options, liquidation preparation, or transition plans. Avoid expanding aggressive capital commitments in this sunset phase."
    }
  },
  "ja": {
    1: {
      levelName: "第1爻（初期萌芽層）",
      levelConcept: "初期段階の微細な実行とインフラ",
      representation: "現場チーム、微小な予算枠、ドラフト契約書、初期開発バグ、些細な見落とし。",
      gameAnalysis: "事態を動かす要因が最も基礎的な部分にあります。すべての大局的変化は、些細な現場のミスやバグから引き起こされます。現在の作戦段階では急激な投資や拡大を避け、足元を徹底的に固めることが賢明です。"
    },
    2: {
      levelName: "第2爻（現場実行層）",
      levelConcept: "推進リーダーと直接実行チーム",
      representation: "中核PM、実行リーダー、部分的な支払条件契約、直接進めているプロジェクト。",
      gameAnalysis: "変数の核心は現場で動くメンバーや推進要素にあります。実行方案や要件の方向性に調整が入る予兆であるため、現場メンバーの動機付けや部分スケジュールの管理に集中すべきです。"
    },
    3: {
      levelName: "第3爻（中間架け橋層）",
      levelConcept: "部門間の摩擦と推進プロセスのボトルネック",
      representation: "ミドル管理、部門間ギャップ、業務的な対立、交渉担当者の直接駆け引き。",
      gameAnalysis: "現場の実行から経営陣の意思決定へと移行する、ストレスの最も高い「摩擦地域」です。中間交渉のすれ違いやプロセス停止といった摩擦を緩めるため、柔軟なアプローチで中間パイプラインを解きほぐす必要があります。"
    },
    4: {
      levelName: "第4爻（決裁前監査層）",
      levelConcept: "法務コンプライアンス・内部監査とリスク防御",
      representation: "専属弁護士、リスク管理責任者、第3者アドバイザー、公式審査の前段階。",
      gameAnalysis: "リスク管理、法務検証、社内規正の段階に変数の引き金があります。最終決定（第5爻）の直前に監査をかけることで、法的トラブルが潜んでいないかを点検。事前の徹底レビューが必要です。"
    },
    5: {
      levelName: "第5爻（核心意思決定層）",
      levelConcept: "最高経営陣・主体キャピタルと最終主導権",
      representation: "最高経営責任者（CEO）、大株主、主要キャピタル枠、支配権、コア定価価格。",
      gameAnalysis: "経営陣による最高権力の直接介入、もしくは核心フィナンシャル条件の再編成が引き金です。大局を動かす中核かつ「支配力」のシンボルです。経営基盤や核心主導権を固守し、意思決定の足並みを揃えてください。"
    },
    6: {
      levelName: "第6爻（終極限界層）",
      levelConcept: "ライフサイクルの終点とエグジット戦略",
      representation: "エグジット条項、監査役の助言、市場収益性の上限、清算終了手続き。",
      gameAnalysis: "この局面や市場における最上限、または撤退ラインまで到達した状態を指します。上行推進力は枯渇傾向（亢極して衰え）にあり、これ以上の攻勢は非効率です。次のサイクルに進む戦略的「出口回収」を計画する時期です。"
    }
  },
  "ko": {
    1: {
      levelName: "제 1 효 (초기 맹아층)",
      levelConcept: "기초 세부 항목 및 미시적 실행 기점",
      representation: "실무진, 소액 잡비 예산안, 임시 기획서, 초기 버그, 사소한 단서.",
      gameAnalysis: "사업 수행의 기초가 되는 조직 맨밑의 인프라에서 병목이 발생하는 단계입니다. 거시적인 투자나 확장보다는 기초 문서나 시스템의 미세한 보완에 임해야 할 시기입니다."
    },
    2: {
      levelName: "제 2 효 (실무 진행층)",
      levelConcept: "실무 책임자 및 본격적 현장 과제",
      representation: "프로젝트 매니저, 담당 실행 부서, 기합의된 개별 납품 내역, 주요 지출 단가.",
      gameAnalysis: "현장을 추진하는 핵심 인력이나 구체적 실행 지점이 핵심 변수입니다. 실무자의 상태나 세부 실행 프로그램의 방향 조정을 집중 검토할 것을 권장합니다."
    },
    3: {
      levelName: "제 3 효 (중간 갈등층)",
      levelConcept: "부서 장벽, 프로세스 병목 및 마찰 부하",
      representation: "중간 관리자, 타부서 요구 불일치, 마찰 스트레스, 협상 파트너간 교착.",
      gameAnalysis: "하위 실행에서 상층 전략으로 전환되는 구간으로, 부서 장벽이나 이해 장벽에 부딪히기 쉬운 ‘마찰 지대’입니다. 유연한 태도로 대화를 리드하고 부서간 조율을 이뤄내야 하는 변수입니다."
    },
    4: {
      levelName: "제 4 효 (승인 대기층)",
      levelConcept: "리스크 지표, 사전 심의 및 파트너십",
      representation: "법무 감사관, 재무 회계 자문, 대외 리스크 분석, 공식 품의 전 최종 검수.",
      gameAnalysis: "리스크 심사 및 합법성 검토를 수행해 안정성을 확보하는 단계입니다. 최종 위정자의 재가 전에 필수적으로 통과해야 하는 체크포인트이기에 내부 자체 진단에 충실해야 합니다."
    },
    5: {
      levelName: "제 5 효 (지배 권한층)",
      levelConcept: "최고 임원진, 실질 지배권 및 핵심 자금",
      representation: "최고경영자(CEO)/이사회, 주주총회 가결권, 가격 통제력, 사업의 핵심 지배 자산.",
      gameAnalysis: "가장 주도적인 ‘통제층’의 개입이나 자금의 근본적 향방이 대세를 주도하는 상황입니다. 경영 지배권과 파이낸싱 우선순위를 확실히 단속해야 할 중요한 순간입니다."
    },
    6: {
      levelName: "제 6 효 (주기 마감층)",
      levelConcept: "비즈니스 한계 극점 및 엑시트 타이밍",
      representation: "엑시트(Exit) 계약서, 사업 마감 일정, 자문역의 후속 조치, 정산 청산 규칙.",
      gameAnalysis: "현재의 사업 사이كل이 도달할 수 있는 극점에 다다라 에너지가 변하는 소멸·전환 분기점입니다. 무리한 현 전선 유지 대신, 안정적인 퇴로 마련 및 후속 단계를 위한 출구 전략을 짤 시점입니다."
    }
  },
  "es": {
    1: {
      levelName: "Línea 1 (Capa Embrionaria)",
      levelConcept: "Procesos Base y Microdetalles de Inicio",
      representation: "Operaciones básicas, micropresupuestos, bosquejos iniciales, errores marginales de desarrollo.",
      gameAnalysis: "La variable surge en los cimientos del proyecto. Cualquier anomalía menor puede desestabilizar la base. Evite movilizaciones masivas de recursos; realice una auditoría preventiva de los componentes de base primero."
    },
    2: {
      levelName: "Línea 2 (Capa de Ejecución de Campo)",
      levelConcept: "Gestores de Proyecto y Avances de Campo",
      representation: "Gerente de proyecto, equipo ejecutor, entregables locales del mes, términos contractuales específicos.",
      gameAnalysis: "La variable incide directamente en el equipo ejecutor y los entregables de campo activos. Si se encuentra bajo tensión, indica una desviación en la ruta táctica; optimice mecanismos locales para encauzar el avance."
    },
    3: {
      levelName: "Línea 3 (Capa de Pivote y Fricción)",
      levelConcept: "Cuellos de Botella y Desafíos de Negociación",
      representation: "Mandos medios, interfaz entre departamentos, trabas burocráticas negociables, fricciones de comunicación.",
      gameAnalysis: "Transición crítica entre la ejecución base y las directrices ejecutivas. Se presentan roces de mando y burocracias internas. Debe inyectar flexibilidad para disolver obstáculos antes de que el avance se congele."
    },
    4: {
      levelName: "Línea 4 (Capa de Regulación y Auditoría)",
      levelConcept: "Legal, Cumplimiento y Control de Riesgos",
      representation: "Auditores fiscales, panel legal corporativo, directores de cumplimiento, marcos regulatorios oficiales.",
      gameAnalysis: "La variable reside en la validación estructural del proyecto (auditoría legal y tributaria). No altera la producción física directa, sino que evalúa la estabilidad reglamentaria. Ajuste el control interno antes de reportar a la junta directiva."
    },
    5: {
      levelName: "Línea 5 (Capa de Soberanía Principal)",
      levelConcept: "Junta Directiva, C-Level y Financiamiento Maestro",
      representation: "Junta ejecutiva, fundadores, capital financiero mayoritario, políticas de precios base, poder de veto.",
      gameAnalysis: "Representa el centro absoluto de soberanía de la organización. El movimiento proviene de la dirección general directiva o reestructuraciones de deuda o capital principal. Mantenga firme el timón y el control primario."
    },
    6: {
      levelName: "Línea 6 (Capa de Margen y Conclusión)",
      levelConcept: "Traectorias de Salida y Ciclo Límite",
      representation: "Estrategias de salida (Exit), fin del proyecto, agotamiento de recursos del plan, pautas de cierre.",
      gameAnalysis: "La trayectoria actual entra en fase de retornos marginales decrecientes. El potencial de crecimiento se agota en este ciclo. Prepárese para transicionar, proteger la ganadería acumulada e implementar vías de salida idóneas."
    }
  },
  "id": {
    1: {
      levelName: "Garis 1 (Lapisan Kuncup/Awal)",
      levelConcept: "Detail Dasar & Akar Operasi",
      representation: "Staf operasional bawah, anggaran operasional mikro, draf kasar, kesalahan awal.",
      gameAnalysis: "Katalis berada di fondasi paling dasar. Solusi terbaik adalah berfokus menyisir detail-detail administratif terbawah guna menghindari kebocoran sistem sebelum meluncurkan inisiatif skala besar."
    },
    2: {
      levelName: "Garis 2 (Lapisan Pelaksana Lapangan)",
      levelConcept: "Pemimpin Proyek & Target Deliverable Lapangan",
      representation: "Manajer proyek lapangan, tim inti bulanan, poin-poin klausul bayar minor.",
      gameAnalysis: "Fokus bergeser ke tim taktis pembuat kemajuan di lapangan. Selaraskan personil pelaksana agar target operasional tidak meleset dari visi utama organisasi."
    },
    3: {
      levelName: "Garis 3 (Lapisan Transisi/Friction)",
      levelConcept: "Komunikasi Lintas Divisi & Hambatan Struktural",
      representation: "Manajer menengah, hambatan birokrasi, benturan kepentingan antar tim, negosiasi alot.",
      gameAnalysis: "Ini adalah zona benturan tatkala rencana operasional naik ke persetujuan eksekutif. Redakan sengketa antar divisi dengan memberikan fleksibilitas kebijakan darurat."
    },
    4: {
      levelName: "Garis 4 (Lapisan Audit/Kepatuhan)",
      levelConcept: "Penasihat Hukum, Auditor Pajak, & Manajemen Risiko",
      representation: "Internal audit, konsultan hukum, regulator independen, pemeriksaan kesiapan sistem.",
      gameAnalysis: "Prioritas beralih ke mitigasi risiko legal dan fungsional. Pastikan kepatuhan regulasi teruji matang sebelum mengajukan keputusan di ruang rapat direksi utama."
    },
    5: {
      levelName: "Garis 5 (Lapisan Kedaulatan Kuasa)",
      levelConcept: "Direksi Utama, Pendanaan Inti, & Pemegang Saham Pengendali",
      representation: "Komite eksekutif (CEO/Board), modal pengendali utama, otoritas penetapan harga mutlak.",
      gameAnalysis: "Variabel berada pada kendali sentral perusahaan. Langkah penyelamatan fokus pada penjagaan kepemilikan aset berharga dan penyelarasan strategi pimpinan puncak."
    },
    6: {
      levelName: "Garis 6 (Lapisan Batas Siklus)",
      levelConcept: "Strategi Exit, Sunset Bisnis, & Masa Transisi",
      representation: "Rencana divestasi, masa kedaluwarsa proyek, konsensus penutupan tim, evaluasi akhir.",
      gameAnalysis: "Momentum mencapai batas tertingginya. Alih-alih memaksakan ekspansi agresif baru, saatnya merencanakan skenario penutupan rapi atau jalur keluar investasi yang mengamankan profit."
    }
  },
  "ms": {
    1: {
      levelName: "Garis 1 (Lapisan Kuncup/Awal)",
      levelConcept: "Detail Dasar & Akar Operasi",
      representation: "Staf operasi bawah, peruntukan mikro, draf kontrak draf awal, ralat pepijat pembangunan.",
      gameAnalysis: "Katalis berada di landasan paling struktur dasar. Jangan mulakan kempen besar-besaran lagi. Sila audit terma-terma ringkas kontrak untuk mengelakkan ralat awal."
    },
    2: {
      levelName: "Garis 2 (Lapisan Pelaksana Medan)",
      levelConcept: "Pengurus Projek & Deliverable Tempatan",
      representation: "Pengurus projek harian, pasukan pelaksana aktif, deliverables lapangan semasa.",
      gameAnalysis: "Faktor did推动 oleh pengurus utama yang menjalankan tugas pelaksanaan. Selaraskan tenaga kerja di lapangan demi kelancaran penyampaian fungsional."
    },
    3: {
      levelName: "Garis 3 (Lapisan Peralihan/Friction)",
      levelConcept: "Halangan Birokrasi & Komunikasi Antara Jabatan",
      representation: "Pengurus pertengahan, dinding jabatan, pertikaian kontrak lokal, perbincangan buntu.",
      gameAnalysis: "Merupakan zon geseran paling sengit antara pelaksana dan pengurusan atasan. Hadapi bottleneck ini dengan komunikasi terbuka dan rundingan fleksibel."
    },
    4: {
      levelName: "Garis 4 (Lapisan Audit/Kepatuhan)",
      levelConcept: "Kawalan Risiko, Peguam Korporat & Birokrasi",
      representation: "Audit dalaman, penasihat undang-undang, audit luar, pematuhan kawalan kualiti.",
      gameAnalysis: "Bertindak sebagai gerbang audit keselamatan sistem. Sahkan keselarasan undang-undang and pengurusan risiko sebelum menghantar laporan ke bilik mesyuarat utama."
    },
    5: {
      levelName: "Garis 5 (Lapisan Kedaulatan Kuasa)",
      levelConcept: "Lembaga Pengarah, C-Level & Pembiayaan Utama",
      representation: "Jawatankuasa eksekutif, CEO, struktur modal, pegangan saham pemilikan utama.",
      gameAnalysis: "Variabel bertumpu pada kuasa kawal selia pusat entiti. Jaga kepentingan saksama pemegang taruh tertinggi dan pastikan kapital utama terkawal."
    },
    6: {
      levelName: "Garis 6 (Lapisan Sempadan Kitaran)",
      levelConcept: "Skenario Exit, Penutupan Projek & Konsultasi Konsultan Atasan",
      representation: "Pelan penutupan (Exit plan), tamat kitaran hayat projek, penstrukturan warisan akhir.",
      gameAnalysis: "Kitaran semasa menghampiri titik penghujung. Sila ambil langkah perlindungan aset terkedalam dan rancang kaedah pemindahan dana atau penutupan operasi yang teratur."
    }
  },
  "th": {
    1: {
      levelName: "เส้นที่ 1 (ระดับเริ่มต้นเพาะกล้า)",
      levelConcept: "งานปฏิบัติการพื้นฐาน และรายละเอียดระดับย่อย",
      representation: "พนักงานระดับเริ่มปฏิบัติการ, งบประมาณจิปาถะส่วนย่อย, รหัสฐานระบบ, สัญญาร่างแรกสุด",
      gameAnalysis: "การเปลี่ยนแปลงเกิดขึ้นที่ฐานรากที่ลึกที่สุดขององค์กร ซึ่งอาจสั่นคลอนระบบโดยไม่รู้ตัว ควรตรวจสอบรายลเอียดเอกสาร งบประมาณย่อย และทางวิศวกรรมให้สมบูรณ์แบบก่อนเร่งรุดขยายงานชิ้นโต"
    },
    2: {
      levelName: "เส้นที่ 2 (ระดับกลุ่มงานตรง)",
      levelConcept: "หัวหน้าทีมจัดการ และตัวแปรปฏิบัติการโดยตรง",
      representation: "ผู้จัดการโครงการหลัก, ทีมงานแนวหน้าขับเคลื่อนงาน, เงื่อนไขสัญญารับรองรายเดือน",
      gameAnalysis: "จุดปฏิสัมพันธ์เล็งผลไปที่ส่วนขับเคลื่อนหลักแถวหน้าของงาน ควรรักษามิตรภาพและขวัญกำลังใจของผู้ประสานงานหลักทางแท็กติก เพื่อความราบรื่นของสัญญาระยะแรก"
    },
    3: {
      levelName: "เส้นที่ 3 (ระดับคอขวดสะพานปะทะ)",
      levelConcept: "ปัญหาการเมืองในแผนก และข้อตกลงที่ต้องสะสาง",
      representation: "ผู้จัดการระดับกลาง, กำแพงระหว่างแผนกที่ทำงานร่วมกันยาก, ข้อสัญญาขัดแย้งของสองฝ่าย",
      gameAnalysis: "เป็นโซนแรงดันปะทะสูงสุดในระหว่างปรับงานปฏิบัติการระดับล่าง ขึ้นพิจารณาระดับบน ควรใช้น้ำเย็นและมีความยืดหยุ่นสูง เพื่อแปรเปลี่ยนคอขวดโครงสร้างให้ลื่นไหลราบรื่น"
    },
    4: {
      levelName: "เส้นที่ 4 (ระดับคัดกรองควบคุมความปลอดภัย)",
      levelConcept: "ทีมกฎหมาย, ผู้ตรวจสอบบัญชี และการปิดช่องเสี่ยง",
      representation: "ฝ่ายตรวจสอบภายใน, ที่ปรึกษากฎหมายภายนอก, คณะทดสอบมาตรการควบคุมความเสี่ยง",
      gameAnalysis: "เข้าสู่ระดับตรวจสอบความถูกต้องตามกรอบกฎหมาย นโยบายสถาบัน และความโปร่งใสทางการดำเนินการ สรุปรายละเอียดและอุดช่องโหว่ความเสี่ยงทั้งหมด ก่อนนำส่งผู้มีอำนาจตัดสินใจสุดท้าย"
    },
    5: {
      levelName: "เส้นที่ 5 (ระดับศูนย์รวมอำนาจการปกครอง)",
      levelConcept: "กองบัญชาการสูงสุด, แหล่งป้อนทุน และแกนอำนาจหลัก",
      representation: "ประธานบริหาร/คณะกรรมการบริหารใหญ่ (CEO/Board), ถือครองสิทธิ์ควบคุมทิศทางแบรนด์, งบเงินทุนหลัก",
      gameAnalysis: "สิทธิ์และการเปลี่ยนแปลงเกิดขึ้นโดยผู้ใช้อำนาจสูงสุดฝ่ายปกครอง หรือจากกลไกเงินงบก้อนใหญ่สุดของแผนงาน ถือเป็นเสาหลักประคองสถานการณ์ ควรคุ้มครองปกป้องแกนนำเสถียรหลักให้ดีที่สุด"
    },
    6: {
      levelName: "เส้นที่ 6 (ระดับสุดขอบวงพลังงาน)",
      levelConcept: "แผนปิดถอนการลงทุน, ตลาดขาสิ้นสุดรอบ และแผนสำรองส่งมอบ",
      representation: "มาตรการเพื่อการถอนทุน (Exit Plan), การครบวาระส่งต่อ, ข้อตกลงทางเสร็จสิ้นโครงการ",
      gameAnalysis: "พลังขับเคลื่อนการทำงานเดินมาถึงขีดสุดขอบความสามารถในวัฏจักรนี้ การดันทุรังขยายตัวต่อจะไร้ประสิทธิภาพเชิงสัมบูรณ์ ควรประคองตัว คัดเกลาความเรียบร้อย 和เตรียมมาตรการเก็บเกี่ยวผลประโยชน์ และแนวทางยุติโครงการสำรองไว้รอจังหวะ"
    }
  }
};

/**
 * Returns the beautiful, humanized detailed explanation for the triggered changing line.
 */
export function getDetailedYaoExplanation(line: number, lang: Language): YaoExplanation {
  const normalizedLine = Math.min(6, Math.max(1, line));
  const langKey = lang.startsWith("zh") ? (lang === "zh-TW" ? "zh-TW" : "zh-CN") : lang;
  
  const dict = EXPLANATIONS[langKey] || EXPLANATIONS["en"];
  return dict[normalizedLine] || dict[1];
}
