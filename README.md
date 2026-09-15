# HUGO OS

原生 HTML / CSS / JavaScript 個人作品集，包含 Three.js 3D 工程師工作室開場。

## 新電腦開發環境

需要 Git、Git LFS 與 Node.js 20 以上版本（建議使用 `.nvmrc` 指定的 Node 22）。clone 時必須下載 LFS 素材，不能只複製 Git pointer：

```sh
git lfs install
git clone <repository-url>
cd profile
git lfs pull
npm ci
npm run verify:model-sources
npm test
```

`package-lock.json` 固定 Three.js、Sharp 與測試工具版本；`npm run build:model` 可從 `assets/models/sources/gaming-room/` 的完整 OBJ／MTL、BLEND 與原始貼圖重建線上資產及雙擊用離線包。`npm run verify:model-sources` 會逐一核對所有來源檔案的 SHA-256，缺檔、多檔或內容不同都會失敗。

## 直接開啟

雙擊根目錄的 `index.html`。桌面與內建作品內容不需要 React、Node.js、npm、建置工具或網路；Browser 開啟外部網站需要網路。
請保留 `index.html`、`styles.css`、`os.css`、`os.js`、`app.js`、`scene.js` 與整個 `assets/` 資料夾的相對位置。
Three.js 和字型均已放在本地，桌面不依賴 CDN、後端 API 或 ES module。新增的個人檔案、書籤與桌布使用瀏覽器 IndexedDB，設定使用 localStorage；不可用時會提示僅限本次工作階段。為了穩定保存資料，建議使用 localhost 或 HTTPS 網址。

## GitHub Pages

使用已提供的 `.github/workflows/deploy.yml`：在 repository 的 **Settings → Pages** 將 Source 設為 **GitHub Actions**。workflow 只整理並發布靜態檔案，不執行 npm、Node.js、後端 API 或資料庫；同時排除開發用來源模型與雙擊用離線模型包。不要改用 **Deploy from a branch**，否則無法套用這份精簡與排除規則。

網站全數使用相對路徑，因此同時支援 `username.github.io` 和 `username.github.io/repository/`。應用程式採 `#projects`、`#architecture` 等 hash 導覽，不需要伺服器重寫規則。預設監聽 `main`；若使用其他分支，修改 workflow 的 branches。
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
- 起始鏡頭位於房間內，以桌椅和電腦為主，避免露出模型外的空白。向下捲動靠近主螢幕，向上捲動退回；捲軸停止後畫面立即停住，沒有固定速度上限或追趕動畫。使用瀏覽器原生捲動，支援滾輪、觸控板、平板滑動、方向鍵與 Page Down / Page Up，也可點擊底部箭頭前進。
- 鏡頭、工作室光線、主螢幕亮度、HUGO BIOS 文字與進度條都對應同一個捲軸位置。向上捲動會回到相應階段，文字列重用同一批 DOM，不另外啟動開機計時器。
- 抵達主螢幕時，同一 HTML 開機畫面解除已對齊視窗的透視變形；不重設文字、不重跑進度、不淡出黑幕。
- 約 60% 捲動位置抵達螢幕；完整啟動流程分成韌體 POST、boot manager／kernel、系統服務、workspace session 四個緊湊階段，階段間連續切換、不插入黑場。約 91% 顯示 HUGO OS，100% 進入桌面。進入桌面前可往回捲回工作室。
- `styles.css` 的 `.intro-scroll-distance` 控制總捲動距離；`app.js` 的 `OPENING` 定義各階段位置，實際進度為「捲軸比例 × OPENING.desktop」。快速拖曳捲軸會立即跳到對應畫面，不強迫補播中間動畫。
- Skip intro 可直接進入桌面；Revisit the workspace 可重播整段流程。
- 視窗縮放與手機橫直向旋轉會保留目前捲動比例，不因捲動距離改變而跳過開場。
- 動畫後進入可自訂桌布、桌面捷徑、工作列與 Welcome 視窗。桌面不捲動，各 app 內容獨立捲動。
- 每個 app 為独立單一實例；在桌面開啟另一 app 不會覆蓋前一個。點擊視窗置頂，最小化／關閉後重開保留同次頁面內的選擇、閱讀位置與輸入草稿。重新整理會建立新視窗工作階段；已儲存的虛擬檔案、書籤、桌布與設定仍保留，未儲存草稿不會持久保存。
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
- 主螢幕依模型實際顯示面約 0.6409 × 0.3054 公尺的橫向比例；同一份視窗尺寸的 BIOS 排版，從開始就投影到螢幕中央的固定顯示範圍。捲動途中不改變顯示範圍或內容縮放，僅由鏡頭持續靠近到全畫面，避免先放大過頭再縮回。內容只在視窗尺寸或開機狀態改變時重新計算排版，螢幕其餘區域底色與 HTML 畫面一致。
- 進入桌面僅淡入，不再從 1.025 倍縮回；啟動終端固定顯示最近七行，階段切換不會擠動版面。
- prefers-reduced-motion 跳過運鏡與開機逐行動畫，簡短顯示品牌啟動畫面後自動進桌面。
- 頁籤隱藏時暫停 3D，開場結束即釋放 GPU 資源。
- WebGL 或本地 3D 載入失敗時改用滑動開機精簡版，仍能使用完整作品集。途中失去繪圖環境時保留當下開機階段，不改成自動播放。

## 實作取捨

開場為 induwarabh 的完整本地 Gaming room，完全沒有角色。Three.js 繪製環境、光線、螢幕框與設備；同一個 HTML BIOS 元素以 CSS3D 透視投影貼合螢幕。鏡頭抵達時，投影矩陣為單位矩陣，再隱藏已被螢幕覆蓋的 WebGL 場景，保留場景以支援反向捲動，直到進入桌面才釋放。整段由 requestAnimationFrame 讀取捲軸位置，不按經過時間推進，沒有兩份開機畫面或重啟的計時器。標題與環境淡入淡出也由捲軸位置決定。螢幕文字使用 HTML 排版。所有幾何與字型均在本地。

使用支援傳統 script 的 Three.js r160，目的是支援 `file://` 直接開檔；其上游棄用提示不影響此版本的使用。直接開檔的網站不適用跨來源 API / OAuth 等功能，本網站也不依賴這些功能。

工作室整套來自 Gaming room，保留房間、桌椅、雙螢幕、主機、鍵鼠、遊戲機、床與門窗配件，並排除不在固定鏡頭敘事中使用的筆電組件。建置時逐物件減面，使用法線與 UV 誤差約束保留輪廓、光影和貼圖接縫；同時修正 OBJ 凹多邊形的三角化，排除場外匯出殘件與兩個脫離主體的懸空零件。從 BLEND 原檔恢復四紅、一藍的面光源，並補回 OBJ／MTL 遺失的 PS5 冷藍色節點自發光；不另加點光源，以免在外殼形成白色高光。副螢幕維持黑屏、電視使用降低 10% 亮度的來源 PlayStation 畫面，主螢幕接上既有 BIOS。前一套家具與其來源已移除。

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
- 完整房間：寬／窄瀏覽器視覺檢查；測試確認未減面、保留全部有效來源三角形，並檢查鏡頭避開椅背、BIOS 銜接及共用 GPU 資源釋放。20 種視窗尺寸的鏡頭投影另以數學測試驗證。
- 捲軸開場：初始靜止、快速跳到指定進度、反向跨越螢幕交接、跳過與重播歸零。
- 完整 3D 窄版：320×568、375×667、773×828 初始工作室、螢幕內 BIOS、全畫面交接與滑到底進桌面；375×667 → 667×375 旋轉與反向捲動確認進度保留。
- 透過僅提供網站公開檔案的本機 HTTP 預覽檢查 3D、開機、桌面、視窗與互動。
- 內建瀏覽器禁止 `file://` 導覽，因此未將直接開檔列為瀏覽器實測；原始碼採傳統 script 與相對本地資源，設計為支援直接開啟。
- 行動版排版與 PDF 摘要視覺檢查。
- `node tests/intro-animation.cjs`：20 組尺寸 × 3 個滑鼠位置 × 1,041 個時間點，共 62,460 個鏡頭位置；檢查內容中心與四周的縮放皆單調前進、不得超過終點大小、鏡頭不得後退、正反向與跳躍可重現、停止畫面不追趕、螢幕幾何固定，以及全畫面交接誤差低於 0.001 px；另覆蓋場景隱藏期間 resize 後倒捲，避免零尺寸投影。
- 同一測試直接執行正式版開機狀態程式，驗證 BIOS 階段、反向捲動、旋轉、停止、完成、跳過／重播、減少動態效果、省流量與 WebGL context loss 保留進度。GPU 及 DOM 在此測試中以替身隔離；實際瀏覽器另檢查畫面與互動。


## Browser、Files、Settings 與 Hugo Shell

- 桌面 Browser：網址列、已輸入網址的上一頁／下一頁、重新整理、首頁、書籤新增／移除，以及明確的外部分頁連結。內建 Workspace guide 可離線使用；外部網站使用 sandbox iframe，網站若限制嵌入、登入或跨站儲存，請使用 Open in new tab。跨站頁面內部的跳轉不會同步到 Hugo Browser 的網址列與歷史。
- Files：資料夾導覽、建立資料夾與文字檔、編輯與儲存、匯入／下載文字檔（單檔 1 MB）。關閉／最小化保留草稿，點擊同一檔案不會清掉草稿；有未儲存內容時會阻止切换到另一檔案，重新整理／離開會請瀏覽器提醒。Ctrl／Command + S 儲存。
- Settings：四款內建桌布、自訂 PNG／JPEG／WebP（5 MB／32 MP 上限）、填滿／符合／原尺寸、深色／淺色／跟隨系統、三種強調色、桌面捷徑、減少動畫、略過下次開場、記住視窗位置、12／24 小時、秒數與 Dock 固定 App。可從系統列、Apps 或桌面右鍵開啟。
- 設定即改即生效，可匯出／匯入帶版本的 JSON 與恢復預設。匯出不包含檔案、書籤、自訂圖片或視窗位置；圖片留在此瀏覽器，匯入到没有該圖片的瀏覽器會改用預設桌布。
- Hugo Shell 是瀏覽器工作區的指令介面，可以真正操作上述資料與設定；沒有連線到主機的 bash、npm 或 Go 環境。輸入 `help` 查看全部指令。指令名稱不分大小寫；檔名、路徑與文字保留大小寫，支援引號、相對路徑、`..`、歷史與 Tab 補全（Shift + Tab 保留鍵盤導覽）。

```sh
ls
cd projects
cat hugo-os.md
cd /
mkdir notes/demo
write notes/demo/idea.txt "Hello Hugo — 我的下一個專案"
open notes/demo/idea.txt
download notes/demo/idea.txt
theme light
wallpaper ocean
open https://example.com
```

資料按瀏覽器與網站來源保存，沒有跨裝置／帳號同步。清除網站資料也會清除檔案，請下載重要筆記。檔案儲存失敗會保留上次已提交的內容並顯示錯誤；IndexedDB 不可用時明確標示 Session only。第一版以單一 Hugo OS 頁籤使用為範圍，不提供多頁籤同時編輯的衝突合併。

實作分工：`os.js` 管理資料保存、虛擬檔案與新 App；`os.css` 管理其樣式和主題；`app.js` 沿用既有視窗與開場。Browser 與 Files 的內容只掛載一次，切換視窗不重建 iframe 或編輯器。GitHub Actions 已加入兩個新檔案的配送。

### 功能驗證

- `node --check app.js`、`node --check os.js`。
- `tests/desktop.cjs` 以正式 `os.js`／`app.js` 驗證既有桌面互動。
- `tests/workspace.cjs` 使用 jsdom + fake-indexeddb，涵蓋重新載入後的檔案／書籤保存、指令引號與大小寫、輸入轉義、草稿、雙介面同步、儲存失敗不覆蓋、儲存不可用、網址協定驗證、iframe 實例保留、設定、下載與窄版切換。
- 執行：`NODE_PATH=<含 jsdom 與 fake-indexeddb 的 node_modules 目錄> node tests/workspace.cjs`。測試依賴只安裝在暫存目錄，不是網站執行依賴。
- `node tests/intro-animation.cjs`：既有開場、62,460 個鏡頭位置與資源釋放回歸。
- 真實瀏覽器檢查：桌面與 375px 手機介面、深淺主題、Terminal 建立中文檔案後在 Files 開啟、重新整理後保留、內建 iframe guide、自訂桌布上傳保存、外部分頁成功顯示 Example Domain。
- 此次預覽瀏覽器的外部 iframe（Example Domain／OpenStreetMap）仍顯示空白；未把外部內嵌列為通過。外部新分頁已驗證可用，仍需在部署來源與目標瀏覽器驗證各網站的嵌入限制。

## 開源授權

- Three.js r160：MIT，見 `assets/vendor/THREE-LICENSE.txt`。
- Manrope：SIL Open Font License，見 `assets/fonts/MANROPE-LICENSE.txt`。

## 目錄說明

`.openai/hosting.json` 經確認指向另一個「履歷工坊」網站，這份作品集不可沿用該 ID 發佈，以免覆蓋既有網站。

舊專案原有的 `.openai`、`.next`、`.vinext`、`.wrangler` 等目錄不參與本網站執行，也不會包含在 Actions 發佈內容中。原先已刪除的框架檔案未恢復。

## 完整場景替換（2026-09-14）

已整套採用 **induwarabh — Gaming room**。原檔、作者、來源、授權與修改說明見 [assets/models/CREDITS.md](assets/models/CREDITS.md)。原始 OBJ／MTL、BLEND、貼圖壓縮檔與解壓圖片保存在 `assets/models/sources/gaming-room/`，並附 SHA-256 清單。

線上場景使用 `assets/models/room-scene.json`、獨立 Deflate 幾何與 WebP 貼圖；雙擊 `index.html` 時則自動改用自包含的 `room-scene.js`，避開瀏覽器對 `file://` sibling fetch 的限制。離線包不會部署。原尺寸貼圖版已保存於 commit `7f3a7ee`；目前版本針對固定攝影機路徑逐物件減面，保留材質邊界、法線與 UV，移除筆電的 21 個零件，並將電視恢復為降低 10% 亮度的來源 PlayStation 畫面。場景從 161 萬降至約 64.6 萬三角形，線上資產從約 42.9 MB 降至約 15.2 MB；貼圖最長邊為 1K，WebP 一般品質 84、法線品質 90。載入期間會顯示進度，失敗或低階裝置會自動改用輕量 BIOS。精確大小、三角形數、減面誤差與缺失貼圖清單見 `assets/models/model-stats.json`。模型原檔只供保存／重建，部署流程會排除整個來源資料夾。

`scene.js` 同時解壓幾何及解碼本地圖片，再建立場景。執行端需要瀏覽器支援原生 `DecompressionStream('deflate')`；同頁重播可重用已解壓的 CPU 幾何。捲動、反向捲動、跳過、重播與桌面銜接沿用同一個開機流程。載入途中跳過會釋放稍後完成的場景；不支援解壓 API、模型缺檔、貼圖失敗與低效能模式均進入精簡開機畫面。檔案大小改善不代表載入時間等比例縮短，GPU 上傳與首次編譯仍需時間。

重建：`node tools/build-room-scene.mjs /absolute/build-tools/node_modules`。建置工具使用 `three@0.160.1`、`sharp@0.35.4` 及 Python 3 標準函式庫，不使用減面工具。
