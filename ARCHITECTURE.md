# 租金補貼計算機 — 完整架構規劃

> 給 Claude Code 的專案規格書 (Spec Document)
> 版本：v1.1
> 適用：MVP 階段 (Week 1-2)

## 🏷️ 產品基本資訊

| 項目 | 決策 |
|---|---|
| 產品名稱 | **租金補貼計算機** |
| 推薦網域 | **rentsub.tw** (備案：rent-subsidy.tw) |
| 註冊登入 | ❌ 不做 |
| 部署平台 | Vercel (Hobby plan) |
| 網域註冊 | Cloudflare Registrar |
| 分析 | Vercel Analytics + Google Analytics 4 |
| 錯誤監控 | Sentry (free tier) |
| Repo | GitHub |

---

## 📌 專案概覽

### 一句話定義
一個讓台灣租屋族 30 秒內算出「我能領多少租金補貼」的免費工具。

### 解決什麼問題
1. 政府 300 億租金補貼專案規則複雜 (中央分 3 級 + 6 都加碼 + 青年婚育加碼)
2. 官方網站難讀，使用者不知道自己符不符合資格
3. 沒有單一工具能「填表 → 直接看結果」

### 目標使用者
- 主要：18-40 歲租屋族，尤其新婚 / 有未成年子女家庭
- 次要：協助長輩 / 子女申請的家屬

### 成功指標 (3 個月內)
- 月活 5,000 UV
- 自然搜尋流量佔 50% 以上
- 至少一篇媒體報導或社群爆文 (>1000 互動)

### 不做什麼 (Scope Out)
- ❌ 註冊登入系統
- ❌ 儲存使用者資料
- ❌ 自動申請功能 (僅提供官方申請連結)
- ❌ 育兒津貼 / 創業補助 / 其他垂直 (留到 v2)
- ❌ App (純網頁)
- ❌ 多國語言 (繁中 only)

---

## 🛠️ 技術選型

### 核心 Stack
| 技術 | 選擇 | 理由 |
|---|---|---|
| 框架 | **Next.js 16 (App Router)** | 熟悉、SSG 對 SEO 最佳 |
| 語言 | TypeScript (strict) | 規則計算錯不得 |
| UI | Tailwind CSS v4 + ShadCN UI | 熟悉、開發快 |
| 狀態管理 | React useState (純前端) | MVP 不需 Zustand |
| 表單 | React Hook Form + Zod | 驗證強、user-friendly |
| 動畫 | Framer Motion (極簡使用) | 結果頁出現動畫加質感 |
| 圖示 | Lucide React | ShadCN 預設 |
| 部署 | Vercel | 免費、Next.js 親兒子 |
| 分析 | Vercel Analytics + Google Analytics 4 | 都免費，互補 |
| 錯誤監控 | Sentry (free tier) | 規則錯誤要立刻知道 |

### 暫時不需要的
- ❌ 資料庫 (規則用靜態 JSON / TS object)
- ❌ Prisma (沒有 DB)
- ❌ NextAuth (沒有登入)
- ❌ Cloudflare R2 (沒有檔案上傳)
- ❌ 任何 LLM API (純規則計算)

### 何時加入這些
- **Email 訂閱**：v1.1 時加 Resend + 一個簡單的 Neon 表
- **使用者回報資料錯誤**：v1.1 加 一個 form + Discord webhook
- **政策變動通知**：v2 時做

---

## 📂 專案結構

```
rent-subsidy-tw/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # 首頁
│   │   ├── about/page.tsx              # 關於我們
│   │   ├── faq/page.tsx                # FAQ
│   │   └── changelog/page.tsx          # 政策更新紀錄
│   ├── calculator/
│   │   ├── page.tsx                    # 計算機主頁 (表單)
│   │   └── result/page.tsx             # 結果頁 (可分享連結)
│   ├── guide/
│   │   ├── page.tsx                    # 申請指南總覽
│   │   └── [city]/page.tsx             # 各縣市指南 (SEO 用)
│   ├── api/
│   │   └── og/route.tsx                # 動態 OG image
│   ├── layout.tsx
│   ├── globals.css
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                             # ShadCN 元件
│   ├── calculator/
│   │   ├── StepProgress.tsx
│   │   ├── PersonalInfoStep.tsx
│   │   ├── HouseholdStep.tsx
│   │   ├── RentalStep.tsx
│   │   ├── ResultCard.tsx
│   │   └── ShareButtons.tsx
│   ├── marketing/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── FAQ.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── DisclaimerBanner.tsx
│       └── NavBar.tsx
├── lib/
│   ├── rules/
│   │   ├── central.ts                  # 中央規則
│   │   ├── cities/
│   │   │   ├── taipei.ts
│   │   │   ├── new-taipei.ts
│   │   │   ├── taoyuan.ts
│   │   │   ├── taichung.ts
│   │   │   ├── tainan.ts
│   │   │   └── kaohsiung.ts
│   │   └── index.ts                    # 統一匯出
│   ├── calculator/
│   │   ├── engine.ts                   # 計算核心
│   │   ├── types.ts                    # 共用型別
│   │   └── validators.ts               # Zod schemas
│   ├── constants/
│   │   ├── cities.ts
│   │   └── policy-version.ts           # 政策版本號
│   └── utils/
│       ├── format.ts                   # 數字格式化
│       └── share.ts                    # 分享連結產生
├── data/
│   ├── faq.json
│   ├── changelog.json
│   └── seo/                            # 各縣市 SEO 內容
├── public/
│   ├── og-default.png
│   └── favicon.ico
├── tests/
│   └── calculator/
│       ├── engine.test.ts              # 計算邏輯單元測試
│       └── rules/
│           ├── central.test.ts
│           └── cities.test.ts
├── CLAUDE.md                           # Claude Code 規範
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## 🗂️ 資料模型 (純 TypeScript，無資料庫)

### 使用者輸入型別

```typescript
// lib/calculator/types.ts

export type City =
  | 'taipei' | 'new_taipei' | 'taoyuan'
  | 'taichung' | 'tainan' | 'kaohsiung'
  | 'keelung' | 'hsinchu_city' | 'hsinchu_county'
  // ... 22 縣市
  ;

export type HousingType =
  | 'legal'           // 合法住宅
  | 'rooftop'         // 頂樓加蓋
  | 'illegal';        // 違章建築

export type MaritalStatus =
  | 'single'
  | 'married'
  | 'divorced_widowed';

export interface CalculatorInput {
  // 基本資料
  age: number;
  maritalStatus: MaritalStatus;
  hasMinorChildren: boolean;
  minorChildrenCount: number;
  isPregnant: boolean;          // 懷孕也算
  isNewlywed: boolean;           // 結婚 2 年內

  // 戶籍與居住
  householdCity: City;           // 戶籍地
  rentalCity: City;              // 租屋地
  rentalArea?: string;           // 鄉鎮市區 (用於縣市加碼判定)

  // 家庭與經濟
  householdSize: number;         // 申請戶人數
  annualIncome: number;          // 申請戶年所得 (萬元)
  hasLowIncomeStatus: boolean;
  hasMidLowIncomeStatus: boolean;
  hasDisability: boolean;
  isIndigenous: boolean;          // 原住民
  isSpecialFamily: boolean;       // 特殊境遇家庭

  // 租屋資訊
  monthlyRent: number;            // 月租金 (元)
  housingType: HousingType;
}
```

### 計算結果型別

```typescript
export interface CalculatorResult {
  eligible: boolean;
  reason?: string;                       // 不符合的原因

  // 中央補貼
  central: {
    tier: 1 | 2 | 3 | null;              // 分級
    baseAmount: number;                  // 基礎金額
    multiplier: number;                  // 加成倍數 (1.0 / 1.4 / 1.8)
    finalAmount: number;                 // 最終金額
    breakdown: string[];                 // 計算過程說明
  };

  // 地方加碼
  local: {
    cityName: string;
    eligible: boolean;
    amount: number;
    notes: string[];
  };

  // 總金額
  totalMonthly: number;
  totalYearly: number;                   // ×12

  // 警示與建議
  warnings: string[];                    // 例如「頂加 2027 起不能申請」
  nextSteps: {
    title: string;
    description: string;
    url?: string;
  }[];

  // 元資料
  policyVersion: string;                 // "2026-01"
  calculatedAt: string;                  // ISO timestamp
}
```

### 補助規則資料結構 (範例)

```typescript
// lib/rules/central.ts

export const CENTRAL_RULES_2026 = {
  version: '2026-01',
  effectiveDate: '2026-01-01',

  // 資格門檻
  eligibility: {
    minAge: 18,
    maxIncomeMultiplier: 3.5,            // 最低生活費的 3.5 倍
    excludedHousingTypes: ['illegal'],   // 違建不可申請
    rooftopGracePeriod: '2027-12-31',    // 頂加緩衝期
  },

  // 分級規則
  tiers: {
    tier1: {
      condition: (input: CalculatorInput) => {
        return (
          (input.householdSize >= 2 && input.hasLowIncomeStatus) ||
          (input.householdSize >= 3 && input.hasMidLowIncomeStatus)
        );
      },
      description: '第一級：低收 (2人以上) 或中低收 (3人以上)',
    },
    tier2: {
      condition: (input: CalculatorInput) => {
        // 不屬於第一級和第三級
        return true; // 預設值
      },
      description: '第二級：一般家庭',
    },
    tier3: {
      condition: (input: CalculatorInput) => {
        return (
          input.householdSize === 1 &&
          input.age < 40 &&
          !input.hasLowIncomeStatus &&
          !input.hasMidLowIncomeStatus &&
          !input.hasDisability
        );
      },
      description: '第三級：單身未滿40歲，無經濟弱勢身分',
    },
  },

  // 基礎金額 (依縣市區位)
  baseAmounts: {
    // 第一級
    tier1: {
      area_a: 8000,   // 台北市
      area_b: 6000,   // 新北、桃園、台中、台南、高雄、新竹
      area_c: 4000,   // 其他縣市
    },
    tier2: {
      area_a: 5000,
      area_b: 4000,
      area_c: 3000,
    },
    tier3: {
      area_a: 3000,
      area_b: 2500,
      area_c: 2000,
    },
  },

  // 加碼倍數
  multipliers: {
    base: 1.0,
    newlywedOrChild: 1.4,           // 新婚 2 年內 或 有未成年子女
    multipleChildren: 1.8,          // 有 2 名以上未成年子女
  },

  // 上限
  maxMonthlyAmount: 14400,
};
```

```typescript
// lib/rules/cities/taipei.ts

export const TAIPEI_LOCAL_RULES_2026 = {
  cityName: '臺北市',
  hasLocalSubsidy: true,

  // 範例：青年婚育加碼
  rules: [
    {
      name: '青年婚育租屋加碼',
      condition: (input: CalculatorInput) =>
        input.age <= 40 &&
        (input.isNewlywed || input.hasMinorChildren) &&
        input.rentalCity === 'taipei',
      amount: 2000,
      description: '40歲以下新婚或育兒家庭，每月加碼 NT$2,000',
      sourceUrl: 'https://...',
    },
    // ... 其他規則
  ],

  lastUpdated: '2026-05-01',
};
```

---

## 🧮 計算引擎流程

```typescript
// lib/calculator/engine.ts

export function calculateSubsidy(input: CalculatorInput): CalculatorResult {
  // Step 1: 基本資格檢查
  const eligibilityCheck = checkEligibility(input);
  if (!eligibilityCheck.eligible) {
    return buildIneligibleResult(eligibilityCheck.reason);
  }

  // Step 2: 收入檢查
  const incomeCheck = checkIncome(input);
  if (!incomeCheck.passed) {
    return buildIneligibleResult(`年所得超過上限 (${incomeCheck.limit} 萬)`);
  }

  // Step 3: 判定中央分級
  const tier = determineTier(input);

  // Step 4: 取得基礎金額
  const baseAmount = getBaseAmount(tier, input.rentalCity);

  // Step 5: 計算加成倍數
  const multiplier = calculateMultiplier(input);

  // Step 6: 中央補貼金額 (上限 14,400)
  const centralAmount = Math.min(
    Math.round(baseAmount * multiplier),
    CENTRAL_RULES_2026.maxMonthlyAmount
  );

  // Step 7: 地方加碼
  const localAmount = calculateLocalSubsidy(input);

  // Step 8: 組合結果
  return {
    eligible: true,
    central: { tier, baseAmount, multiplier, finalAmount: centralAmount, breakdown: [...] },
    local: localAmount,
    totalMonthly: centralAmount + localAmount.amount,
    totalYearly: (centralAmount + localAmount.amount) * 12,
    warnings: buildWarnings(input),
    nextSteps: buildNextSteps(input),
    policyVersion: '2026-01',
    calculatedAt: new Date().toISOString(),
  };
}
```

### 重要：每個步驟都要單元測試
```typescript
// tests/calculator/engine.test.ts
describe('calculateSubsidy', () => {
  it('40歲以下單身在台北租屋，第三級', () => {
    const result = calculateSubsidy(testCases.singleYoungTaipei);
    expect(result.central.tier).toBe(3);
    expect(result.central.finalAmount).toBe(3000);
  });

  it('新婚有1個小孩在新北，第二級+加成', () => {
    const result = calculateSubsidy(testCases.newlywedWithChild);
    expect(result.central.multiplier).toBe(1.4);
  });

  // 至少 20 個 test cases 涵蓋邊界條件
});
```

---

## 🛣️ 路由與頁面

### 主要頁面

| 路由 | 用途 | SEO 優先級 |
|---|---|---|
| `/` | 首頁 + Hero + CTA | ⭐⭐⭐⭐⭐ |
| `/calculator` | 多步驟表單 | ⭐⭐⭐⭐⭐ |
| `/calculator/result` | 結果頁 (URL 帶參數可分享) | ⭐⭐⭐ |
| `/guide` | 申請指南總覽 | ⭐⭐⭐⭐ |
| `/guide/[city]` | 各縣市指南 (22 篇 SEO 文) | ⭐⭐⭐⭐⭐ |
| `/faq` | 常見問題 | ⭐⭐⭐ |
| `/about` | 關於我們 + 為什麼做 | ⭐⭐ |
| `/changelog` | 政策變動紀錄 | ⭐⭐ |

### 結果頁 URL 設計 (可分享)
```
/calculator/result?
  age=30&
  marital=married&
  city=taipei&
  rent=18000&
  ...
```
- 全部用 URL params (短期可接受)
- 進結果頁時前端解析 → 重新計算 → 顯示
- **好處**：截圖貼 Threads/Dcard，別人點連結可直接看你的試算
- **壞處**：URL 變長 (但這年代沒人在意)

---

## 🎨 UI/UX 設計重點

### 首頁
- **Hero**：「30 秒算出你能領多少租屋補助」
- **CTA 按鈕極大**：「立即試算 →」
- **信任元素**：「依據 2026 年最新政策 (XX 月更新)」
- **社會證明**：「已幫 XX 人試算」(初期可不放)

### 計算機 (Multi-step Form)
**重點：不要一次塞所有欄位**

```
Step 1/4: 你是誰？      → 年齡、婚姻、有無小孩
Step 2/4: 你住哪？      → 戶籍地、租屋地
Step 3/4: 經濟狀況      → 家庭人數、年收入、特殊身分
Step 4/4: 租屋資訊      → 房租、房屋類型
       ↓
        結果頁
```

每步驟：
- 上方進度條
- 大字體欄位 (mobile-first)
- 「為什麼問這個？」展開說明 (建立信任)
- 「下一步」按鈕固定底部

### 結果頁 (這是 viral 關鍵)

```
┌─────────────────────────────────┐
│  🎉 你每月可領 NT$ 8,400         │
│  (一年共 NT$ 100,800)            │
├─────────────────────────────────┤
│  📊 計算明細                     │
│  - 中央補貼：6,400 (第二級×1.4) │
│  - 台北加碼：2,000               │
├─────────────────────────────────┤
│  ⚠️ 注意事項                     │
│  - 你的租屋為頂加，2027 起不可申請│
├─────────────────────────────────┤
│  📋 下一步                       │
│  1. 準備文件 (清單)              │
│  2. 線上申請 [連結]              │
├─────────────────────────────────┤
│  [📸 截圖分享] [📤 複製連結]    │
└─────────────────────────────────┘
```

**截圖分享關鍵設計**：
- 結果卡片用獨立 component
- 設計成「截圖就好看」(品牌 watermark 在底部)
- 結果頁需要動態 OG image (Vercel `@vercel/og`)

---

## 🔍 SEO 策略

### 關鍵字佈局
| 關鍵字 | 月搜尋量估計 | 落地頁 |
|---|---|---|
| 租金補貼 | 高 | `/` |
| 租屋補助 2026 | 高 | `/` |
| 租金補貼計算 | 中 | `/calculator` |
| 租金補貼台北 | 中 | `/guide/taipei` |
| 租金補貼申請 | 中 | `/guide` |
| 青年租屋補助 | 中 | `/guide` |
| 租金補貼資格 | 中 | `/faq` |

### 必做的技術 SEO
- ✅ `sitemap.xml` 自動產生
- ✅ `robots.txt`
- ✅ 每頁獨立 `metadata` (title / description / OG)
- ✅ `JSON-LD` 結構化資料 (FAQPage / HowTo schema)
- ✅ Open Graph + Twitter Card
- ✅ 動態 OG image (結果頁顯示金額)
- ✅ Mobile-friendly (Lighthouse 90+)
- ✅ Core Web Vitals 全綠

### 內容 SEO (Week 2 寫)
6 都各一篇 + 北中南東各一篇通用文：
- 「2026 台北市租金補貼完整指南：資格、金額、申請流程」
- 「新北市租金補貼怎麼申請？2026 最新資格與青年加碼」
- ...

每篇 1500-2500 字，內嵌計算機 CTA。

---

## 🚨 重要：法律與責任設計

### 必加元素
1. **每頁底部**：「本工具計算結果僅供參考，最終以政府公告為準」
2. **結果頁顯著位置**：政策版本號 + 最後更新日期
3. **Footer**：免責聲明完整版連結
4. **About 頁**：說明你是誰、為什麼做、資料來源

### 隱私
- 不蒐集任何 PII (姓名、身分證、電話)
- 不存使用者輸入
- Analytics 用 Vercel Analytics (隱私友善) + GA4 (匿名化)
- Cookie consent banner (歐盟訪客也保護到)

---

## 📅 分週執行清單

### Week 1：核心功能

#### Day 1 (週一) — 環境與基礎建設
- [ ] `npx create-next-app@latest rent-subsidy-tw --typescript --tailwind --app`
- [ ] 安裝：`shadcn`, `react-hook-form`, `zod`, `lucide-react`, `framer-motion`
- [ ] 設定 ShadCN，安裝 button / input / card / select / progress
- [ ] 建立資料夾結構 (依上方)
- [ ] 設定 Vercel 部署，連 GitHub repo
- [ ] 設定 `CLAUDE.md`

#### Day 2 (週二) — 規則資料 + 計算引擎
- [ ] 撰寫 `lib/rules/central.ts` (2026 完整中央規則)
- [ ] 撰寫 `lib/rules/cities/taipei.ts` + 5 都 (北、新北、桃、中、南、高)
- [ ] 撰寫 `lib/calculator/types.ts`
- [ ] 撰寫 `lib/calculator/engine.ts` (核心邏輯)
- [ ] 至少 10 個單元測試 case
- [ ] **這天最重要 — 邏輯錯了後面都白做**

#### Day 3 (週三) — 表單 UI (Step 1-2)
- [ ] `/calculator` 頁面骨架
- [ ] `StepProgress` 元件
- [ ] `PersonalInfoStep` (年齡、婚姻、小孩)
- [ ] `HouseholdStep` (戶籍、租屋地)
- [ ] React Hook Form + Zod 驗證
- [ ] localStorage 暫存 (重整不掉資料)

#### Day 4 (週四) — 表單 UI (Step 3-4) + 結果頁
- [ ] `EconomicStep` (人數、收入、特殊身分)
- [ ] `RentalStep` (房租、類型)
- [ ] `/calculator/result` 頁面 + URL params 解析
- [ ] `ResultCard` 元件 (要漂亮，截圖會傳)
- [ ] 警示與下一步建議區塊

#### Day 5 (週五) — 首頁 + 完善體驗
- [ ] Hero section
- [ ] How it works (3 步驟)
- [ ] FAQ section (10 題)
- [ ] Footer + 免責聲明
- [ ] Navbar
- [ ] Loading states, error states

#### Day 6-7 (週末) — 打磨 + 部署
- [ ] 動態 OG image
- [ ] 分享按鈕 (FB / Threads / Line / 複製連結)
- [ ] Sentry / GA4 接入
- [ ] Lighthouse 跑 95+ 分
- [ ] 部署正式網域
- [ ] **發第一篇 Threads / Dcard 貼文**

### Week 2：SEO + 內容 + 推廣

#### Day 8-10
- [ ] `/guide` 總覽頁
- [ ] 6 都各寫 1 篇指南 (用 AI 草稿 + 人工修)
- [ ] sitemap.xml / robots.txt
- [ ] JSON-LD 結構化資料

#### Day 11-12
- [ ] FAQ 頁面完整 (20 題)
- [ ] About 頁 (你的故事)
- [ ] Changelog 頁

#### Day 13-14
- [ ] 寫一篇 Medium / 部落格文：「我為什麼做這個工具」
- [ ] Reddit r/Taiwan / Dcard / PTT 發文 (each 不同切角)
- [ ] 寄信給崔媽媽基金會、租屋相關 NGO 介紹
- [ ] 寄信給 ETtoday / 聯合新聞網 房產線記者

---

## ⚙️ 環境變數

```bash
# .env.local

# Sentry (錯誤監控)
NEXT_PUBLIC_SENTRY_DSN=

# Google Analytics
NEXT_PUBLIC_GA_ID=

# 政策版本 (顯示在頁面上)
NEXT_PUBLIC_POLICY_VERSION=2026-01
NEXT_PUBLIC_LAST_UPDATED=2026-05-23

# 網域 (用於 OG image / 分享連結)
NEXT_PUBLIC_SITE_URL=https://your-domain.tw
```

---

## 🤖 Claude Code 使用建議

### 1. 把這份文件存成 `CLAUDE.md`
- 開新專案後第一件事：複製本文件為 `CLAUDE.md`
- Claude Code 會在每次對話開頭讀取

### 2. 建議的對話切分
| 對話 | 目標 |
|---|---|
| 對話 1 | 初始化專案 + 安裝依賴 + 設定 ShadCN |
| 對話 2 | 寫 `lib/rules/` 所有規則 + 單元測試 |
| 對話 3 | 寫 `lib/calculator/engine.ts` + 完整測試 |
| 對話 4 | 寫表單 UI (Step 1-4) |
| 對話 5 | 寫結果頁 + 動態 OG |
| 對話 6 | 寫首頁 + Footer + 導覽 |
| 對話 7 | SEO + sitemap + JSON-LD |
| 對話 8 | 縣市指南頁面 |

**每個對話開頭明確告訴 Claude Code 你要做哪一步**，不要一次叫他做完整個專案。

### 3. 關鍵原則
- 計算邏輯 (`lib/rules/` 和 `lib/calculator/`) **絕對不能放錯**，每個變更要跑 test
- UI 元件可以快速迭代，但**規則檔每改一個欄位要更新 `policyVersion`**
- 所有金額計算用整數 (元為單位)，不要用浮點數

### 4. 給 Claude Code 的編碼規範
寫在 `CLAUDE.md` 裡：
- 用 TypeScript strict mode
- 不用 `any`
- 元件用 named export
- 檔名 kebab-case，元件名 PascalCase
- 不要過度抽象，MVP 階段可重複的程式碼就先重複
- 回應用繁體中文
- 寫測試時用 vitest

---

## 📊 上線後監測

### 第一週要看
- UV (Vercel Analytics)
- 完成率 (從首頁 → 看到結果)
- 平均試算金額 (你的 user 大概是什麼樣子)
- 分享次數 (URL 帶 utm 來追)

### 一個月後要決定
根據數據判斷下一步：
- 流量穩定 → 加第二個垂直 (育兒津貼)
- 流量低 → 改 SEO 內容、加更多 SEO 文
- 完成率低 → 簡化表單流程

---

## 🎯 給 Boris 的最後提醒

1. **不要追求完美才上線** — Week 1 結束就 ship，醜也要 ship
2. **每天結束 push 一次到 GitHub** — 確保有進度可看
3. **規則一定要找原始資料源驗證** — 不要靠記憶或 LLM 生
4. **第一個 user 是你自己** — 用自己的狀況算一次，看結果對不對
5. **第二個 user 是你朋友** — 拉 3 個朋友當 alpha tester
6. **發文時故事大於功能** — 「我看我媽看不懂租屋補助公告，所以做了這個」比「介紹我做的工具」強 10 倍

---

**版本紀錄**
- v1.0 (2026-05-23)：初版
