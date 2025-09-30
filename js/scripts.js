document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.scripts-container');
    const filterTitle = document.querySelector('#filter-title');

    // 1. 獲取 URL 中的所有篩選參數
    const params = new URLSearchParams(window.location.search);
    const activeFilters = {
        players: params.get('players'),
        dm: params.get('dm'),
        genre: params.get('genre'),
        type: params.get('type'),
        done: params.get('done'),
    };

    // 2. 根據篩選條件過濾劇本資料
    //    只有當 URL 中有參數時，才進行過濾
    const hasFilters = Array.from(params.keys()).length > 0;
    const filteredScripts = hasFilters ? scriptsData.filter(script => {
        // 檢查每個條件，如果 URL 中沒有該參數，則視為符合條件
        const playersMatch = !activeFilters.players || script.players.toString() === activeFilters.players;
        const dmMatch = !activeFilters.dm || script.dm === activeFilters.dm;
        const genreMatch = !activeFilters.genre || script.genre === activeFilters.genre;
        const doneMatch = !activeFilters.done || script.done.toString() === activeFilters.done;
        // 對於 type，檢查陣列中是否包含指定的類型
        const typeMatch = !activeFilters.type || script.type.includes(activeFilters.type);

        return playersMatch && dmMatch && genreMatch && doneMatch && typeMatch;
    }) : scriptsData; // 如果沒有任何篩選參數，則顯示全部劇本

    // 3. 更新頁面標題
    if (hasFilters) {
        const titleParts = [];
        params.forEach((value, key) => {
            // 我們只將主要的篩選條件放入標題，可以自行增減
            if (key === 'players') {
                titleParts.push(`${value}人本`); // 特別處理人數，加上 "人本"
            } else if (key === 'type' || key === 'genre' || key === 'dm') {
                titleParts.push(value);
            } else if (key === 'done') {
                if (value === '0') {
                    titleParts.push(`未遊玩劇本`);
                } else if (value === '1') {
                    titleParts.push(`已遊玩劇本`);
                }
            }
        });

        if (titleParts.length > 0) {
            filterTitle.textContent = titleParts.join(' & ');
        } else {
            filterTitle.textContent = '劇本';
        }

    } else {
        filterTitle.textContent = '全部劇本';
    }
    
    // 4. 將最終結果渲染到頁面上
    renderCards(filteredScripts);

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