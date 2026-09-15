# 開場模型來源與使用紀錄

整理日期：2026-09-15。本次依使用者要求供本地個人遊玩，沒有購買模型或公開發布。

## 唯一採用的模型：Gaming room

- 作者：**induwarabh**。
- [商品頁](https://www.cgtrader.com/free-3d-models/interior/other/gaming-room-47f2be48-f704-4a01-841d-9677f175bb02)。
- [使用者提供的下載頁](https://www.cgtrader.com/items/4606915/download-page)，商品 ID **4606915**。
- 2026-09-14 查閱商品頁：標示 **Free**、**Royalty Free License (no AI)**。免費並非 CC0，仍適用原作者與平台素材授權。
- 原始檔：[sources/gaming-room/](sources/gaming-room/)。三個模型來源檔及 47 個原始解壓貼圖保存；電視用的 `OIP (5).jpg` 已依使用者要求換成 2026-09-15 提供的遊戲截圖。SHA-256 見 `source-checksums.json`；內容重複且未被建置使用的貼圖 ZIP 已清除。

## 採用內容與精度

使用整套原房間：牆面、地板、門窗、床與床頭櫃、海報、地毯、桌椅、雙螢幕、主機及內部零件、鍵鼠、麥克風、遊戲機、控制器及其他配件。没有混用上一套 Gaming furniture set。

原尺寸無損貼圖版已保存於 commit `7f3a7ee`。目前版本針對固定攝影機路徑逐物件減面，使用法線與 UV 屬性誤差約束保護輪廓、光影與貼圖接縫；2026-09-15 另依要求移除整台筆電的 21 個零件（15,156 個三角形）。幾何以 Deflate 壓縮二進位資料。貼圖最長邊限制為 1024 像素、不放大小圖，WebP 一般品質 84、法線品質 90；這部分是有損處理，近看細紋可能較原版柔和。除電視顯示圖片外，重建所需的模型來源檔與原尺寸貼圖均保持完整。

- 正確三角化後：來源 **1,668,122** 個三角形。
- 排除場外散落零件與門窗輔助方塊，加上筆電共 **57,552** 個三角形；物件名稱列於模型包的 `excludedObjects`。
- 減面前保留房間幾何 **1,610,570** 個三角形；減面後加上 BIOS 平面共 **645,895** 個三角形、**118** 個網格批次、**32** 張貼圖。
- 線上資產約為 **0.31 MB manifest、11.59 MB 二進位幾何與 3.31 MB 獨立 WebP**，合計約 **15.21 MB**，並可分別快取，不再承擔 base64 膨脹與超大 JavaScript 解析成本；精確數據見 `model-stats.json`。
- 五盞來源燈光、LTC 資料及運鏡未修改；電視顯示／自發光圖片換成使用者提供的遊戲截圖。檔案縮小不等於載入時間等比例下降；仍需解壓、圖片解碼、GPU 上傳與首次著色器編譯。

## 匯入與互動修改

1. 主要來源為配對的 `uploads_files_4086574_icesometric+gaming+roomlegacy.obj`／`.mtl`；BLEND 原檔一併保存。
2. OBJ 的凹多邊形以平面三角化處理，修正一般 triangle fan 會填滿門窗開口的問題；完成匯入修正後，再依物件複雜度以 Meshoptimizer 減面。共線／退化邊的三角化數量可能不同。
3. 只排除明顯在房間外的匯出殘件、留下的門窗輔助方塊，以及懸空的 `Cube.376_Cube.396`（房間中央小零件）、`Cube.359_Cube.361`（窗戶上方細長零件）。另依要求移除整台筆電（`excludedObjects` 中 `reason: laptop`）；其他原始物件位置與比例保留；整個場景統一旋轉、平移到主螢幕座標。起始鏡頭移到房間內，原剖面牆材質改為雙面顯示，避免從室內看向背面時露出房外空白。
4. 主螢幕 `Circle.001` 的原始曲面與外框保留，在弦面前新增約 **0.6409 × 0.3054 公尺**的平面，供既有 HTML BIOS 投影及全畫面銜接使用。副螢幕與手機顯示面保持關機狀態；電視 `Plane.004` 的 `Material.005` 使用使用者提供的遊戲截圖作為顏色及自發光圖片，並將朝內的顯示面設為雙面可見以符合 Blender 的顯示。筆電已移除。
5. MTL 材質轉成 Three.js PBR；還原已有的顏色、法線、凹凸及自發光圖片，玻璃近似為透明材質。OBJ／MTL 沒有完整 Blender 節點、燈光與後製資訊。2026-09-15 改由 `tools/extract-room-lighting.py` 唯讀解析原始 BLEND 的 SDNA，取回五盞面光源（四紅、一藍）的顏色、功率、尺寸與世界矩陣，記錄於 `lighting-source.json`。轉成 Three.js RectAreaLight，並大幅降低上一版白色補光；曝光與少量環境補光仍為即時渲染校準，沒有宣稱完全重現 Cycles 的間接光或後製。
6. 來源 MTL 引用了六張下載包未附的圖片：`Untitled-354.jpg`、`4K-ps5_controller_texture_normal.png`、`BOTAO1 - Copia.jpg`、`Untitled-3.jpg`、`WoodFloor041_2K_NormalDX.png`、`Fabric019_4K_NormalGL.png`。對應表面使用既有材質色或省略缺失的法線；不向外部網址請求，也不以其他作者模型替代。PS5 的 `emission_blue.003` 節點自發光則因 OBJ／MTL 將 `Ke` 匯出為黑色而在建置時依保留的材質名稱恢復為冷藍色；不另加點光源，避免在白色外殼形成不自然的鏡面亮點。

## 保存與清理

三個模型來源檔與解壓後的原尺寸貼圖保存在 `assets/models/sources/gaming-room/`，並逐一記錄 SHA-256。網站不依賴該資料夾；重建工具直接讀取其中的 OBJ、MTL、BLEND 與解壓貼圖。

已清除前一套 Gaming furniture set 的模型包、FBX／MAX／OBJ／貼圖與壓縮檔，以及其轉換程式。更早的 Flos／Xiaomi 檯燈、Gaming Setup、Poly Haven 書本、舊程式化道具、過時候選清單與替換規劃也已移除。

## 重建與執行

建置依賴：`three@0.160.1`、`sharp@0.35.4`、`meshoptimizer@1.0.1` 與 Python 3 標準函式庫，不執行 BLEND 中的腳本。面光源 LTC 查找表取自同版本 Three.js 的 `RectAreaLightUniformsLib`，一併封裝進本地模型包，授權同 Three.js。

```sh
node tools/build-room-scene.mjs /absolute/build-tools/node_modules
```

所有输入均來自本專案的 `assets/models/sources/gaming-room/`。線上執行端讀取小型 `room-scene.json`、獨立 Deflate 幾何與 WebP 貼圖；雙擊 `index.html` 時改讀自包含的 `room-scene.js`。部署流程會排除離線包、原始 OBJ／BLEND 與來源貼圖。瀏覽器使用原生 `DecompressionStream('deflate')` 解壓，HTTP 模式另以串流 `fetch` 下載；需要支援這些 API 的瀏覽器。重播共用已解壓的 CPU 幾何緩衝區，但每次建立獨立 GPU 資源，離開開場時釋放；API 不支援或載入失敗則進入既有精簡 BIOS。Three.js r160 授權見 `../vendor/THREE-LICENSE.txt`。
