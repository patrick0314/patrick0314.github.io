// 異步函數來載入 HTML 元件
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Could not load ${filePath}: ${response.statusText}`);
        }
        const text = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = text;
        }
    } catch (error) {
        console.error('Failed to load component:', error);
    }
}

// 初始化所有元件的函數
async function initComponents() {
    // 載入 header 和 footer
    await loadComponent('header-placeholder', '_header.html');
    await loadComponent('footer-placeholder', '_footer.html');

    // 等待 header 載入完成後，再初始化下拉選單功能
    initializeDropdowns();
}

function initializeDropdowns() {
    // 找到所有主要的下拉選單容器
    const dropdownContainers = document.querySelectorAll('.dropdown-container');

    dropdownContainers.forEach(container => {
        const level1Menu = container.querySelector('.level-1');
        container.addEventListener('mouseenter', () => {
            if (level1Menu) level1Menu.classList.add('visible');
        });
        container.addEventListener('mouseleave', () => {
            if (level1Menu) level1Menu.classList.remove('visible');
            container.querySelectorAll('.level-2').forEach(level2 => {
                level2.classList.remove('visible');
            });
        });
    });

    // 找到所有包含子選單的項目 (無主持人/需主持人)
    const submenus = document.querySelectorAll('.has-submenu');

    submenus.forEach(submenu => {
        const level2Menu = submenu.querySelector('.level-2');
        submenu.addEventListener('mouseenter', () => {
            if (level2Menu) level2Menu.classList.add('visible');
        });
        submenu.addEventListener('mouseleave', () => {
            if (level2Menu) level2.classList.remove('visible');
        });
    });
}

// 監聽 TOC 平滑捲動的功能
function initializeTocScroll() {
    const tocLinks = document.querySelectorAll('.toc-nav a');
    tocLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 初始化「回到頂部」按鈕的函數
function initializeBackToTop() {
    const backToTopButton = document.getElementById('back-to-top-btn');

    if (backToTopButton) {
        // 監聽頁面滾動事件
        window.onscroll = function() {
            // 當使用者向下滑動超過 300px 時，顯示按鈕
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        };

        // 監聽按鈕點擊事件
        backToTopButton.addEventListener('click', function(event) {
            event.preventDefault(); // 防止連結的預設跳轉行為
            // 平滑滾動到頁面頂部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// --- 頁面載入時的執行順序 ---
document.addEventListener('DOMContentLoaded', async function() {
    // 1. 載入共用元件 (Header/Footer)
    await initComponents();
    
    // 2. 初始化 TOC 滾動 (只在 index.html 上需要)
    //    我們透過檢查頁面上有沒有 .toc-nav 元素來決定是否執行
    if (document.querySelector('.toc-nav')) {
        initializeTocScroll();
    }

    // 3. 【新增】初始化「回到頂部」按鈕功能
    initializeBackToTop();
});