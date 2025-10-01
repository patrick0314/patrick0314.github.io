import { filterScriptsByUrlParams } from './utils.js';

document.addEventListener('DOMContentLoaded', async function() {
    // --- 1. 獲取頁面元素 ---
    const container = document.querySelector('.scripts-container');
    const filterTitle = document.querySelector('#filter-title');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');

    let scriptsData = [];
    let filteredScripts = [];

    // --- 2. 主執行函數 ---
    async function main() {
        try {
            const indexResponse = await fetch('./data/scripts-index.json');
            const scriptIndex = await indexResponse.json();
            const scriptPromises = scriptIndex.map(item => fetch(`./data/scripts/${item.id}.json`).then(res => res.json()));
            scriptsData = await Promise.all(scriptPromises);

            const params = new URLSearchParams(window.location.search);
            filteredScripts = filterScriptsByUrlParams(scriptsData, params);

            // 將篩選後的劇本 ID 列表存入 sessionStorage
            const filteredIds = filteredScripts.map(script => script.id);
            sessionStorage.setItem('filteredScriptIds', JSON.stringify(filteredIds));

            const savedSort = sessionStorage.getItem('sortBy');
            const savedSearch = sessionStorage.getItem('searchTerm');

            if (savedSort) sortSelect.value = savedSort;
            if (savedSearch) searchInput.value = savedSearch;

            updateTitle(params);
            updateDisplay();

            sortSelect.addEventListener('change', updateDisplay);
            let debounceTimer;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    updateDisplay();
                }, 300);
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

        // 在更新顯示時，將當前狀態存入 sessionStorage
        sessionStorage.setItem('sortBy', sortBy);
        sessionStorage.setItem('searchTerm', searchTerm);

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
    container.innerHTML = ''; 

    if (scripts.length === 0) {
        container.innerHTML = `...`; // 無結果的 HTML
        return;
    }
    
    // 獲取當前頁面的篩選參數字串
    const currentParamsString = window.location.search.substring(1);

    scripts.forEach((script, index) => {
        const typeTags = script.type.map(t => `<span>${t}</span>`).join('');
        
        // 為詳情頁連結加上當前的篩選參數
        const detailLink = `details.html?id=${script.id}${currentParamsString ? '&' + currentParamsString : ''}`;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <a href="${detailLink}" class="card-link">
                <div class="script-card">
                    ${script.date ? '<div class="played-ribbon">已玩過</div>' : ''}
                    <img src="${script.image}" alt="《${script.title}》的劇本封面圖" loading="lazy">
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
        
        const cardLink = wrapper.firstElementChild;
        const cardElement = cardLink.querySelector('.script-card');
        
        cardElement.style.transitionDelay = `${index * 100}ms`;
        
        container.appendChild(cardLink);

        setTimeout(() => {
            cardElement.classList.add('is-visible');
        }, 10);
    });
}