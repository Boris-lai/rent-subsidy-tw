# CLAUDE.md

> 此檔案告訴 Claude Code 如何在這個專案中工作。每次新對話開頭都會被讀取。

## 專案是什麼

一個讓台灣租屋族 30 秒算出「我能領多少租金補貼」的免費網頁工具。
基於 2026 年最新的 300 億租金補貼政策。

## 技術棧

- **框架**：Next.js 16 (App Router)
- **語言**：TypeScript (strict mode)
- **樣式**：Tailwind CSS v4
- **元件庫**：ShadCN UI
- **表單**：React Hook Form + Zod
- **動畫**：Framer Motion (極簡使用)
- **圖示**：Lucide React
- **測試**：Vitest
- **部署**：Vercel

## 重要架構決策 (不要改)

1. **沒有資料庫** — 補助規則用 TypeScript 物件 (`lib/rules/`)，純前端計算
2. **沒有登入系統** — 不蒐集 PII，分享門檻最低
3. **結果頁用 URL params** — 可分享、可截圖、可被搜尋引擎索引
4. **政策版本化** — 每次規則變動更新 `NEXT_PUBLIC_POLICY_VERSION`

## 編碼規範

### TypeScript
- 永遠用 strict mode
- **禁止 `any`** — 用 `unknown` 然後 narrow type
- 所有金額用整數 (元為單位)，禁止浮點數
- Component props 用 `interface`，data shape 用 `type`

### React
- Component 用 named export，不用 default export (除了 page.tsx)
- 檔名 kebab-case (`step-progress.tsx`)
- Component 名 PascalCase (`StepProgress`)
- Hooks 用 `use-` 前綴 (`use-calculator-state.ts`)

### 樣式
- 用 Tailwind utility classes
- 共用樣式抽到 ShadCN component
- 不要寫 CSS module 或 styled-components

### 表單
- 永遠用 React Hook Form + Zod
- Schema 放在 `lib/calculator/validators.ts`
- 錯誤訊息用繁體中文

### 命名
- 函數動詞開頭：`calculateSubsidy`、`checkEligibility`
- 布林值用 `is/has/can` 前綴：`isEligible`、`hasMinorChildren`
- 常數用 `SCREAMING_SNAKE_CASE`：`CENTRAL_RULES_2026`

## 核心邏輯所在

### 規則檔 (`lib/rules/`)
- `central.ts` — 中央政府規則 (2026 年版)
- `cities/[city].ts` — 各縣市地方加碼
- **變更規則時必須**：
  1. 更新 `policyVersion`
  2. 跑所有單元測試
  3. 在 `data/changelog.json` 加一筆紀錄

### 計算引擎 (`lib/calculator/engine.ts`)
- 唯一公開函數：`calculateSubsidy(input: CalculatorInput): CalculatorResult`
- 內部步驟函數都用 named export 方便測試
- **每次修改都要跑 `pnpm test`**

## 測試要求

- 計算引擎涵蓋率必須 ≥ 90%
- 每新增一條規則，至少加 2 個 test case (一個符合、一個邊界)
- UI 元件不強制測試，但表單驗證邏輯要測

## SEO 要求

- 每個頁面都要有獨立 `metadata` (title + description + OG)
- 所有圖片要有 `alt`
- 結果頁的 OG image 要動態產生 (顯示金額)
- 不要用 client-side rendering on landing pages

## 法律與責任 (極重要)

- 每頁底部 **必須** 有：「本工具計算結果僅供參考，最終以政府公告為準」
- 結果頁 **必須** 顯示政策版本號 + 最後更新日期
- **不要** 蒐集任何 PII (姓名、身分證、電話、Email — 除非未來明確加訂閱功能)
- **不要** 把使用者輸入存入任何地方 (連 cookies 都不要存個人資料)

## 溝通規範

- 與我 (Boris) 對話時用繁體中文
- 程式碼註解可用英文 (慣例) 或繁中
- Git commit message 用英文 (慣例)
- 不確定的決策 **先問我**，不要自己亂決定

## 不要做的事

- ❌ 不要加任何分析以外的第三方 SDK
- ❌ 不要建議改用其他框架 (Astro, SvelteKit etc.)
- ❌ 不要在 MVP 階段加登入、訂閱、付費功能
- ❌ 不要直接從 LLM 生規則 — 一定要我提供原始政府文件
- ❌ 不要過度抽象 — MVP 階段，看得懂比優雅重要
- ❌ 不要一次寫超過 3 個檔案 — 一次寫一個、跑測試、commit

## 當前里程碑

**Week 1**：核心計算機可用 + 結果可分享 + 上線
**Week 2**：6 都 SEO 頁 + 推廣

詳細執行清單見 `ARCHITECTURE.md`。

---

@AGENTS.md
