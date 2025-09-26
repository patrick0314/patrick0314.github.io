document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('details-main-content');
    const errorMessage = document.getElementById('error-message');

    // --- 1. 查找劇本資料 (邏輯不變) ---
    const params = new URLSearchParams(window.location.search);
    const scriptId = params.get('id');

    if (!scriptId) {
        showError("找不到劇本 ID。");
        return;
    }
    const script = scriptsData.find(s => s.id === scriptId);

    if (!script) {
        showError("找不到對應的劇本資料。");
        return;
    }

    // --- 2. 動態生成卡片的 HTML ---
    document.title = `${script.title} - 劇本詳情`; // 更新網頁標題

    // 卡片：主要資訊
    const mainInfoCard = `
        <div class="details-card main-info-grid">
            <img id="script-image" src="${script.image}" alt="${script.title} 封面">
            <div class="script-info">
                <h2 id="script-title">${script.title}</h2>
                <div id="script-tags">
                    <span>${script.players} 人</span>
                    <span>${script.dm}</span>
                    <span>${script.genre}</span>
                    ${script.type.map(t => `<span>${t}</span>`).join('')}
                </div>
                <div class="rating-section">
                    ${generateRatingItem('綜合評分：', script.rating.total)}
                    ${generateRatingItem('推理評分：', script.rating.difficulty)}
                    ${generateRatingItem('劇情評分：', script.rating.story)}
                </div>
            </div>
        </div>
    `;

    // 卡片：官方介紹
    const descriptionCard = `
        <div class="details-card details-card-description">
            <h2>官方劇本介紹</h2>
            <p>${script.description}</p>
        </div>
    `;

    // 卡片：遊玩心得
    const experienceCard = `
        <div class="details-card details-card-experience">
            <h2>遊玩心得</h2>
            <p>${script.experience}</p>
        </div>
    `;

    // --- 3. 將所有卡片插入頁面 ---
    mainContent.innerHTML = mainInfoCard + descriptionCard + experienceCard;

    // --- 輔助函數 ---

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // 【新增】根據評分生成星星 SVG 的函數
    function generateRatingItem(label, score) {
        let starsHTML = '';
        const fullStars = Math.floor(score);
        const halfStar = score % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        for (let i = 0; i < fullStars; i++) starsHTML += getStarSVG('full');
        if (halfStar) starsHTML += getStarSVG('half');
        for (let i = 0; i < emptyStars; i++) starsHTML += getStarSVG('empty');
        
        return `
            <div class="rating-item">
                <span class="rating-label">${label}</span>
                <div class="rating-stars">${starsHTML}</div>
            </div>
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
});