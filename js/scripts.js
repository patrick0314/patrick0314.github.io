import { filterScriptsByUrlParams } from './utils.js'; // 從 utils.js 匯入函數

document.addEventListener('DOMContentLoaded', async function() {
    const container = document.querySelector('.scripts-container');
    const filterTitle = document.querySelector('#filter-title');
    const searchInput = document.getElementById('search-input'); // 獲取搜尋框
    const sortSelect = document.getElementById('sort-select');

    let scriptsData = []; // 用來存放從 JSON 載入的完整劇本資料
    let filteredScripts = []; // 用來存放被 URL 篩選過的劇本資料
    
    // --- 主執行函數 ---
    async function main() {
        try {
            // 載入所有劇本資料
            const indexResponse = await fetch('./data/scripts-index.json');
            const scriptIndex = await indexResponse.json();
            const scriptPromises = scriptIndex.map(item => fetch(`./data/scripts/${item.id}.json`).then(res => res.json()));
            scriptsData = await Promise.all(scriptPromises);

            // 根據 URL 參數進行初始篩選
            const params = new URLSearchParams(window.location.search);
            filteredScripts = filterScriptsByUrlParams(scriptsData, params);

            // 將篩選後的劇本 ID 列表存入 sessionStorage
            const filteredIds = filteredScripts.map(script => script.id);
            sessionStorage.setItem('filteredScriptIds', JSON.stringify(filteredIds));

            // 更新頁面標題
            updateTitle(params);
            
            // 初始渲染
            updateDisplay();

            // 綁定事件監聽器
            sortSelect.addEventListener('change', updateDisplay);

            // 搜尋功能加入 Debounce
            let debounceTimer; // 建立一個計時器變數
            searchInput.addEventListener('input', () => {
                // 每當使用者輸入時，先清除上一個計時器
                clearTimeout(debounceTimer);
                // 然後設定一個新的計時器，延遲 300 毫秒後才真正執行更新
                debounceTimer = setTimeout(() => {
                    updateDisplay();
                }, 300); // 300 毫秒是一個不錯的延遲時間
            });

        } catch (error) {
            console.error("載入劇本資料失敗", error);
            container.innerHTML = '<p class="page-title">無法載入劇本資料。</p>';
        }
    }

    // 更新頁面標題
    function updateTitle(params) {
        const hasFilters = Array.from(params.keys()).length > 0;
        if (hasFilters) {
            const titleParts = [];
            params.forEach((value, key) => {
                if (key === 'players') titleParts.push(`${value}人本`);
                else if (key === 'type' || key === 'genre' || key === 'dm') titleParts.push(value);
                else if (key === 'done') titleParts.push(value === '1' ? '已遊玩' : '未遊玩');
            });
            filterTitle.textContent = titleParts.length > 0 ? titleParts.join(' & ') : '劇本';
        } else {
            filterTitle.textContent = '全部劇本';
        }
    }

    // 統一的更新顯示函數
    function updateDisplay() {
        // 獲取當前的排序和搜尋條件
        const sortBy = sortSelect.value;
        const searchTerm = searchInput.value.toLowerCase();

        // 從已被 URL 篩選過的結果開始
        let scriptsToShow = [...filteredScripts];

        // 步驟 A: 執行排序
        if (sortBy === 'date') {
            scriptsToShow.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        } else if (sortBy === 'rating') {
            scriptsToShow.sort((a, b) => (b.rating.total || 0) - (a.rating.total || 0));
        } else if (sortBy === 'players') {
            scriptsToShow.sort((a, b) => (a.players || 0) - (b.players || 0));
        }

        // 步驟 B: 執行搜尋
        if (searchTerm) {
            scriptsToShow = scriptsToShow.filter(script => 
                script.title.toLowerCase().includes(searchTerm)
            );
        }

        // 步驟 C: 重新渲染卡片
        renderCards(scriptsToShow);
    }

    // --- 啟動程式 ---
    main();
});

// 將卡片渲染的邏輯獨立成一個函數
function renderCards(scripts) {
    const container = document.querySelector('.scripts-container');
    container.innerHTML = ''; // 清空現有內容

    if (scripts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>找不到符合條件的劇本。</p>
            </div>
        `;
        return;
    }

    // 獲取當前頁面的篩選參數字串
    const currentParamsString = window.location.search.substring(1);

    scripts.forEach(script => {
        const typeTags = script.type.map(t => `<span>${t}</span>`).join('');
        
        // 為詳情頁連結加上當前的篩選參數
        const detailLink = `details.html?id=${script.id}${currentParamsString ? '&' + currentParamsString : ''}`;

        const cardHTML = `
            <a href="${detailLink}" class="card-link">
                <div class="script-card">
                    ${script.date ? '<div class="played-ribbon">已玩過</div>' : ''}
                    
                    <img src="${script.image}" alt="${script.title}" loading="lazy">
                    <div class="card-content">
                        <h3>${script.title}</h3>
                        <div class="card-tags">
                            <span>${script.players} 人</span>
                            <span>${script.dm}</span>
                            <span>${script.genre}</span>
                            ${typeTags}
                        </div>
                    </div>
                </div>
            </a>
        `;
        container.innerHTML += cardHTML;
    });
}