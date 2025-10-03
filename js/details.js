import { filterScriptsByUrlParams, sortScripts } from './utils.js';

document.addEventListener('DOMContentLoaded', async function() {
    const mainContent = document.getElementById('details-main-content');
    const errorMessage = document.getElementById('error-message');

    try {
        const params = new URLSearchParams(window.location.search);
        const scriptId = params.get('id');

        if (!scriptId) {
            showError("找不到劇本 ID。");
            return;
        }

        // --- 1. 非同步獲取所有需要的資料 ---
        const indexResponse = await fetch('./data/scripts-index.json');
        const scriptIndex = await indexResponse.json();
        const allScriptsPromises = scriptIndex.map(item => fetch(`./data/scripts/${item.id}.json`).then(res => res.json()));
        const allScriptsData = await Promise.all(allScriptsPromises);

        // --- 2. 找到當前劇本與篩選後的上下文列表 ---
        const script = allScriptsData.find(s => s.id === scriptId);
        if (!script) throw new Error('找不到對應的劇本資料。');
        
        // 步驟 A: 根據 URL 參數進行篩選
        let contextScripts = filterScriptsByUrlParams(allScriptsData, params);
        
        // 步驟 B: 讀取並應用儲存的排序狀態
        const savedSort = sessionStorage.getItem('sortBy');
        contextScripts = sortScripts(contextScripts, savedSort);
        
        // --- 3. 在「已排序和篩選的列表」中尋找上/下一個劇本 ---
        const currentIndex = contextScripts.findIndex(s => s.id === scriptId);
        const prevScript = currentIndex > 0 ? contextScripts[currentIndex - 1] : null;
        const nextScript = currentIndex < contextScripts.length - 1 ? contextScripts[currentIndex + 1] : null;

        // --- 4. 動態生成所有卡片的 HTML ---
        document.title = `${script.title} - 劇本詳情`;

        // 卡片一：主要資訊
        const mainInfoCard = `
            <div class="details-card main-info-grid">
                <img id="script-image" src="${script.image}" alt="《${script.title}》的劇本封面圖">
                <div class="script-info">
                    <h2 id="script-title">${script.title}</h2>
                    <div id="script-tags">
                        <span>${script.players} 人</span>
                        <span>${script.dm}</span>
                        <span>${script.genre}</span>
                        ${script.type.map(t => `<span>${t}</span>`).join('')}
                        ${script.date ? `
                            <span class="played-date-tag">
                                <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/></svg>
                                ${script.date} done
                            </span>
                        ` : ''}
                    </div>
                    <div class="rating-section">
                        ${generateRatingItem('綜合評分：', script.rating.total)}
                        ${generateRatingItem('推理評分：', script.rating.difficulty)}
                        ${generateRatingItem('劇情評分：', script.rating.story)}
                    </div>
                </div>
            </div>
        `;

        // 卡片二：官方介紹
        const descriptionCard = `
            <div class="details-card details-card-description">
                <h2>官方劇本介紹</h2>
                <p>${script.description}</p>
            </div>
        `;

        // 卡片三：角色簡介
        let rolesCard = '';
        if (script.role && Object.keys(script.role).length > 0) {
            const rolesHTML = Object.entries(script.role).map(([name, intro]) => `
                <div class="role-cell">
                    <h4 class="role-name">${name}</h4>
                    <p class="role-intro">${intro || '<i>暫無簡介</i>'}</p>
                </div>
            `).join('');
            rolesCard = `
                <div class="details-card details-card-roles">
                    <h2>角色簡介</h2>
                    <div class="roles-grid">${rolesHTML}</div>
                </div>
            `;
        }

        // 卡片四：遊玩心得
        let experienceCard = '';
        const experienceContent = script.experience && Object.keys(script.experience).length > 0
            ? Object.entries(script.experience).map(([reviewer, text]) => `
                <div class="experience-item">
                    <h4 class="experience-reviewer">${reviewer}：</h4>
                    <p class="experience-text">${text}</p>
                </div>
            `).join('')
            : '<p><i>暫無遊玩心得</i></p>';
        experienceCard = `
            <div class="details-card details-card-experience">
                <h2>遊玩心得</h2>
                ${experienceContent}
            </div>
        `;

        // 卡片五：導覽連結
        const currentParamsString = window.location.search.substring(1).replace(/&?id=[^&]*/g, '');
        let navigationCard = '';
        if (prevScript || nextScript) {
            const prevLink = prevScript 
                ? `<a href="details.html?id=${prevScript.id}${currentParamsString ? '&' + currentParamsString : ''}" class="nav-link prev">
                     <span>&larr; 上一篇</span>
                     <h4>${prevScript.title}</h4>
                   </a>`
                : '<div></div>';

            const nextLink = nextScript
                ? `<a href="details.html?id=${nextScript.id}${currentParamsString ? '&' + currentParamsString : ''}" class="nav-link next">
                     <span>下一篇 &rarr;</span>
                     <h4>${nextScript.title}</h4>
                   </a>`
                : '<div></div>';

            navigationCard = `
                <div class="details-card details-navigation">
                    ${prevLink}
                    ${nextLink}
                </div>
            `;
        }

        // --- 5. 將所有卡片插入頁面 ---
        mainContent.innerHTML = mainInfoCard + descriptionCard + rolesCard + experienceCard + navigationCard;
        
        // --- 動態設定返回按鈕的連結 ---
        const backLink = document.getElementById('back-to-list-link');
        if (backLink) {
            const backHref = `scripts.html${currentParamsString ? '?' + currentParamsString : ''}`;
            backLink.href = backHref;
        }

        // --- 初始化圖片燈箱的功能 ---
        initializeImageModal();

    } catch (error) {
        console.error("載入劇本詳情失敗:", error);
        showError(error.message || "無法載入劇本資料。");
    }

    // --- 輔助函數 ---
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // 根據評分生成星星 SVG 的函數
    function generateRatingItem(label, score) {
        let starsHTML = '';
        const fullStars = Math.floor(score);
        const halfStar = score % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 10 - fullStars - halfStar;

        for (let i = 0; i < fullStars; i++) starsHTML += getStarSVG('full');
        if (halfStar) starsHTML += getStarSVG('half');
        for (let i = 0; i < emptyStars; i++) starsHTML += getStarSVG('empty');
        
        // 不再用 .rating-item 包裝，直接返回兩個元素
        return `
            <span class="rating-label">${label}</span>
            <div class="rating-stars">${starsHTML}</div>
        `;
    }

    // 返回不同狀態星星 SVG 的函數
    function getStarSVG(type) {
        const paths = {
            full: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
            half: '<path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>',
            empty: '<path d="M19.65 9.04l-4.84-.42-1.89-4.45c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.73 3.67-3.18c.67-.58.32-1.68-.56-1.75zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>'
        };
        return `<svg class="star-icon" viewBox="0 0 24 24">${paths[type]}</svg>`;
    }

    function initializeImageModal() {
        const modal = document.getElementById("image-modal");
        const modalImg = document.getElementById("enlarged-img");
        const scriptImg = document.getElementById("script-image");
        const closeBtn = document.querySelector(".close-button");

        // 當劇本圖片存在時，才加上點擊事件
        if (scriptImg) {
            scriptImg.onclick = function() {
                modal.style.display = "block";
                modalImg.src = this.src;
            }
        }

        // 點擊關閉按鈕時，隱藏燈箱
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
        }

        // 點擊燈箱背景時，也隱藏燈箱
        if (modal) {
            modal.onclick = function(event) {
                // 確保點擊的是背景而不是圖片本身
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            }
        }
    }
});