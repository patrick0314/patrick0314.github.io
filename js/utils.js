// 這個檔案用來存放可以在專案中重複使用的共用函數

/**
 * 根據 URL 參數過濾劇本列表
 * @param {Array} scripts - 要被過濾的完整劇本陣列
 * @param {URLSearchParams} params - 從 URL 讀取到的參數物件
 * @returns {Array} - 過濾後的劇本陣列
 */
export function filterScriptsByUrlParams(scripts, params) {
    const activeFilters = {
        players: params.get('players'),
        dm: params.get('dm'),
        genre: params.get('genre'),
        type: params.get('type'),
        done: params.get('done'),
    };
    const hasFilters = Array.from(params.keys()).length > 0;
    
    // 在 details.html 中，URL 也會包含 id，我們在篩選時要忽略它
    const hasActualFilters = Array.from(params.keys()).some(k => k !== 'id');

    if (!hasActualFilters) {
        return scripts; // 如果沒有篩選條件 (或只有 id)，返回所有劇本
    }

    return scripts.filter(script => {
        const playersMatch = !activeFilters.players || script.players.toString() === activeFilters.players;
        const dmMatch = !activeFilters.dm || script.dm === activeFilters.dm;
        const genreMatch = !activeFilters.genre || script.genre === activeFilters.genre;
        const doneMatch = !activeFilters.done || (script.done !== undefined && script.done !== null && script.done.toString() === activeFilters.done);
        const typeMatch = !activeFilters.type || script.type.includes(activeFilters.type);
        return playersMatch && dmMatch && genreMatch && doneMatch && typeMatch;
    });
}

/**
 * 根據指定的鍵值對劇本列表進行排序
 * @param {Array} scripts - 要被排序的劇本陣列
 * @param {string} sortBy - 排序的鍵值 (e.g., 'date', 'rating', 'players')
 * @returns {Array} - 排序後的劇本陣列
 */
export function sortScripts(scripts, sortBy) {
    const scriptsToSort = [...scripts]; // 創建一個副本以避免修改原始陣列

    if (sortBy === 'date') {
        scriptsToSort.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date.localeCompare(a.date);
        });
    } else if (sortBy === 'rating') {
        scriptsToSort.sort((a, b) => (b.rating.total || 0) - (a.rating.total || 0));
    } else if (sortBy === 'players') {
        scriptsToSort.sort((a, b) => (a.players || 0) - (b.players || 0));
    }
    // 如果是 'default' 或其他值，則不排序，返回原始順序的副本
    return scriptsToSort;
}