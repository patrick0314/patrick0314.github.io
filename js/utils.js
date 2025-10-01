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