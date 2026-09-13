# HUGO OS

原生 HTML / CSS / JavaScript 個人作品集，包含 Three.js 3D 工程師工作室開場。

## 直接開啟

雙擊根目錄的 `index.html`。不需要 React、Node.js、npm、建置工具或網路。
請保留 `index.html`、`styles.css`、`app.js`、`scene.js` 與整個 `assets/` 資料夾的相對位置。
Three.js 和字型均已放在本地，不使用 CDN、API、ES module、fetch 或資料庫。

## GitHub Pages

### 最簡單：從分支發佈

1. 將根目錄的四個網站檔案及 `assets/` 上傳到 GitHub repository。
2. 開啟 repository 的 **Settings → Pages**。
3. Source 選 **Deploy from a branch**，選擇你的分支及 **/(root)**，然後儲存。
4. 等待 GitHub 提供網站網址。

根目錄的 `.nojekyll` 可一併上傳。網站全數使用相對路徑，因此同時支援 `username.github.io` 和 `username.github.io/repository/`。
應用程式採 `#projects`、`#architecture` 等 hash 導覽，不需要伺服器重寫規則。

### 可選：GitHub Actions

已提供 `.github/workflows/deploy.yml`，僅複製静態檔案並發佈，沒有 npm install 或 build。
在 Settings → Pages 中將 Source 設為 **GitHub Actions** 即可。預設監聽 `main`；若使用其他分支，修改 workflow 的 branches。
請在「分支發佈」與「Actions」之間擇一。
本次沒有替你 push repository 或公開發佈。

## 個人資料

- `app.js` 頂端的 `PROFILE`：姓名、職稱、Email、GitHub、LinkedIn。
- `app.js` 的 `YEARS`：工作時間軸。現有年份對照為示範內容，須改成真實公司、職稱、日期。
- `app.js` 的 `PROJECTS`：專案問題、架構、角色、技術、挑戰、解法與結果。
- `app.js` 的 `SKILLS`：技術領域。
- `index.html`：桌面首頁的介紹、年資、精選專案與 SEO metadata。
- `assets/hugo-profile-summary.pdf`：目前為僅包含已提供資訊的摘要草稿。換成完整履歷時，也請更新 `app.js` 的 `renderResume()` 預覽內容及說明。

前四個專案為明確標記的架構示範，不宣稱是真實客戶專案；第五個是本網站。公司、績效數字及聯絡地址均未捏造。GitHub / LinkedIn 未填寫時會開啟聯絡面板，避免導向無關帳號。

## 互動

- 桌面開場從第一幀到進入桌面都由捲軸位置直接控制。初始停在近黑工作室，不自動揭示、不自動前進；全程無人物、NPC、工程師 avatar 或人體動畫。
- 副螢幕與筆電全程保持黑屏，不預先顯示 dashboard、程式碼或開機畫面；只有主螢幕逐步啟動。
- 向下捲動靠近主螢幕，向上捲動退回；捲軸停止後畫面立即停住，沒有固定速度上限或追趕動畫。使用瀏覽器原生捲動，支援滾輪、觸控板、平板滑動、方向鍵與 Page Down / Page Up，也可點擊底部箭頭前進。
- 鏡頭、工作室光線、主螢幕 LED、HUGO BIOS 文字與進度條都對應同一個捲軸位置。向上捲動會回到相應階段，文字列重用同一批 DOM，不另外啟動開機計時器。
- 抵達主螢幕時，同一 HTML 開機畫面解除已對齊視窗的透視變形；不重設文字、不重跑進度、不淡出黑幕。
- 約 70% 捲動位置抵達螢幕；之後繼續捲動載入模組、掛載專案封存並顯示 System ready。約 90% 顯示 HUGO OS，100% 進入桌面。進入桌面前可往回捲回工作室。
- `styles.css` 的 `.intro-scroll-distance` 控制總捲動距離；`app.js` 的 `OPENING` 定義各階段位置，實際進度為「捲軸比例 × OPENING.desktop」。快速拖曳捲軸會立即跳到對應畫面，不強迫補播中間動畫。
- Skip intro 可直接進入桌面；Revisit the workspace 可重播整段流程。
- 視窗縮放與手機橫直向旋轉會保留目前捲動比例，不因捲動距離改變而跳過開場。
- 所有 application 都可用鍵盤開啟，Escape 關閉；視窗可最大化、最小化，桌面可拖動標題列。
- 終端機：`help`、`whoami`、`about`、`experience`、`projects`、`skills`、`architecture`、`database`、`resume`、`contact`、`clear`。
- Ctrl / Command + K 開啟終端機；上下方向鍵查閱輸入歷史。
- 手機與窄視窗同樣播放完整 3D 工作室開場，不再以 700px 寬度跳過動畫。省流量 / 低記憶體裝置仍不下載 3D，改用滑動控制的 BIOS 精簡版本，滑到底才進桌面；也可點擊底部提示或跳過。
- 主螢幕維持固定 1.71 × 0.96 的橫向比例；同一份視窗尺寸的 BIOS 排版，從開始就投影到螢幕中央的固定顯示範圍。捲動途中不改變顯示範圍或內容縮放，僅由鏡頭持續靠近到全畫面，避免先放大過頭再縮回。內容只在視窗尺寸或開機狀態改變時重新計算排版，螢幕其餘區域底色與 HTML 畫面一致。
- 進入桌面僅淡入，不再從 1.025 倍縮回；BIOS 預留全部九行高度，避免新增最後一行時擠動版面。
- prefers-reduced-motion 跳過運鏡與開機逐行動畫，簡短顯示 System Ready 後自動進桌面。
- 頁籤隱藏時暫停 3D，開場結束即釋放 GPU 資源。
- WebGL 或本地 3D 載入失敗時改用滑動開機精簡版，仍能使用完整作品集。途中失去繪圖環境時保留當下開機階段，不改成自動播放。

## 實作取捨

開場為程式化低多邊形工作室，完全沒有角色。Three.js 繪製環境、光線、螢幕框與設備；同一個 HTML BIOS 元素以 CSS3D 透視投影貼合螢幕。鏡頭抵達時，投影矩陣為單位矩陣，再隱藏已被螢幕覆蓋的 WebGL 場景，保留場景以支援反向捲動，直到進入桌面才釋放。整段由 requestAnimationFrame 讀取捲軸位置，不按經過時間推進，沒有兩份開機畫面或重啟的計時器。標題與環境淡入淡出也由捲軸位置決定。背景採輕量柔焦，螢幕文字維持清晰。所有幾何與字型均在本地。

使用支援傳統 script 的 Three.js r160，目的是支援 `file://` 直接開檔；其上游棄用提示不影響此版本的使用。直接開檔的網站不適用跨來源 API / OAuth 等功能，本網站也不依賴這些功能。

## 本次驗證

- JavaScript 語法與本地資源路徑檢查。
- 捲軸開場：初始靜止、快速跳到指定進度、反向跨越螢幕交接、跳過與重播歸零。
- 完整 3D 窄版：320×568、375×667、773×828 初始工作室、螢幕內 BIOS、全畫面交接與滑到底進桌面；375×667 → 667×375 旋轉與反向捲動確認進度保留。
- 透過僅提供網站公開檔案的本機 HTTP 預覽檢查 3D、開機、桌面、視窗與互動。
- 內建瀏覽器禁止 `file://` 導覽，因此未將直接開檔列為瀏覽器實測；原始碼採傳統 script 與相對本地資源，設計為支援直接開啟。
- 行動版排版與 PDF 摘要視覺檢查。
- `node tests/intro-animation.cjs`：20 組尺寸 × 3 個滑鼠位置 × 1,041 個時間點，共 62,460 個鏡頭位置；檢查內容中心與四周的縮放皆單調前進、不得超過終點大小、鏡頭不得後退、正反向與跳躍可重現、停止畫面不追趕、螢幕幾何固定，以及全畫面交接誤差低於 0.001 px；另覆蓋場景隱藏期間 resize 後倒捲，避免零尺寸投影。
- 同一測試直接執行正式版開機狀態程式，驗證 BIOS 階段、反向捲動、旋轉、停止、完成、跳過／重播、減少動態效果、省流量與 WebGL context loss 保留進度。GPU 及 DOM 在此測試中以替身隔離；實際瀏覽器另檢查畫面與互動。

## 開源授權

- Three.js r160：MIT，見 `assets/vendor/THREE-LICENSE.txt`。
- Manrope：SIL Open Font License，見 `assets/fonts/MANROPE-LICENSE.txt`。

## 目錄說明

舊專案原有的 `.openai`、`.next`、`.vinext`、`.wrangler` 等目錄不參與本網站執行，也不會包含在 Actions 發佈內容中。原先已刪除的框架檔案未恢復。
