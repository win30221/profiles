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
- `app.js` 的 `renderWelcome()`：歡迎視窗的介紹與年資。
- `index.html`：桌面捷徑、系統列與 SEO metadata。
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
- 動畫後進入固定桌布、桌面捷徑、工作列與 Welcome 視窗。桌面不捲動，各 app 內容獨立捲動。
- 每個 app 為独立單一實例；在桌面開啟另一 app 不會覆蓋前一個。點擊視窗置頂，最小化／關閉後重開保留同次頁面內的選擇、閱讀位置與輸入草稿。重新整理會建立新工作階段。
- 桌面（≥1100px）可拖動標題列、最大化／還原，右上「···」提供左右並排與置中；右下角可拖曳或用方向鍵調整大小。
- 工作列顯示開啟中／作用中／最小化狀態。點作用中 app 可最小化；Desktop 切換隱藏／恢復全部視窗。Apps 開啟完整應用程式清單。
- 小於 1100px 改為單一作用中視窗；手機提供返回桌面控制和滿版 app，切換不遺失狀態。Welcome 留在捷徑下方。
- Projects 採檔案總管清單，可切換 Backend／Portfolio 分類、選取預覽、開啟案例；四個概念案例仍清楚標示。
- Architecture 使用可點擊的參考架構節點，與作品、終端機分別保留內容。
- 所有 application 都可用鍵盤開啟；Escape 優先關閉啟動器或視窗排列選單，再關閉作用中視窗。一般視窗沒有 modal 遮罩，也不鎖住整頁焦點。
- `#projects`、`#architecture`、`#resume`、`#welcome` 可直達；明確 app 導覽支援瀏覽器上一頁／下一頁。
- 終端機導航會開啟／聚焦目的 app，原終端機繼續保留。
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

工作室保留低多邊形構圖，使用有倒角的桌面、螢幕外殼、鍵帽、筆電與書本；杯子以旋轉截面建出杯底、內壁與圓潤杯口。設備補上支架底座、筆電轉軸與觸控板、分層書頁、桌墊縫線、線材、機架把手與散熱孔。材質區分深木、霧面塑膠、陶瓷、陽極金屬、烤漆金屬與玻璃；微表面貼圖及柔光反射環境都在本機程式化生成，無新增外部下載。環境光改為中性石墨色調，綠光僅由主螢幕局部照向桌面。重複細節以 InstancedMesh 合併，共 212 個網格批次、約 13 萬三角形（不含陰影額外繪製），共享資源於離開開場時釋放。

## 2026-09-14 桌面改版驗證

- `node --check app.js`：JavaScript 語法。
- `node tests/intro-animation.cjs`：既有 62,460 個鏡頭位置與 BIOS 狀態回歸通過；3D 場景檔案維持現況。
- `tests/desktop.cjs`：以 jsdom 執行正式 HTML／JavaScript，覆蓋所有 app、多視窗共存、最小化與重開、草稿／閱讀狀態、終端機文字轉義、焦點、拖曳邊界、並排、大小調整、窄版單 app、歷史返回與重播恢復。jsdom 沒有排版引擎，這項測試不代表瀏覽器視覺或實機觸控驗證。
- 測試工具僅安裝在暫存目錄，網站沒有新增執行依賴。可另行安裝 jsdom 後以 `NODE_PATH=<含 jsdom 的 node_modules 目錄> node tests/desktop.cjs` 執行。
- 本機 HTTP 預覽回傳 200；本地資源引用與配送檔案完整性檢查。
- 本次未進行瀏覽器截圖或實機視覺驗證。

桌布：`assets/desktop-wallpaper.png`，以內建 imagegen 生成。提示方向為 16:10 抽象霧面摺面、石墨黑與低彩度森林綠，左側留深色空間，右側柔和斜向光線，無文字、圖示、物件或介面。

## 先前開場驗證

- JavaScript 語法與本地資源路徑檢查。
- 材質升級：1280×720、375×667 與 667×375 瀏覽器視覺檢查；測試限制網格／三角形預算，並確認共用材質、貼圖、幾何與 instance buffer 在離開時釋放。
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

`.openai/hosting.json` 經確認指向另一個「履歷工坊」網站，這份作品集不可沿用該 ID 發佈，以免覆蓋既有網站。

舊專案原有的 `.openai`、`.next`、`.vinext`、`.wrangler` 等目錄不參與本網站執行，也不會包含在 Actions 發佈內容中。原先已刪除的框架檔案未恢復。
