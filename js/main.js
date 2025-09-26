// 等待 HTML 文件完全載入後再執行
document.addEventListener('DOMContentLoaded', function() {

    // 找到所有主要的下拉選單容器
    const dropdownContainers = document.querySelectorAll('.dropdown-container');

    dropdownContainers.forEach(container => {
        const level1Menu = container.querySelector('.level-1');

        // 當滑鼠移入「人數」按鈕時，顯示第一層選單
        container.addEventListener('mouseenter', () => {
            if (level1Menu) {
                level1Menu.classList.add('visible');
            }
        });

        // 當滑鼠移出整個「人數」區塊時，隱藏所有選單
        container.addEventListener('mouseleave', () => {
            // 隱藏第一層
            if (level1Menu) {
                level1Menu.classList.remove('visible');
            }
            // 同時也隱藏所有可能已打開的第二層
            container.querySelectorAll('.level-2').forEach(level2 => {
                level2.classList.remove('visible');
            });
        });
    });

    // 找到所有包含子選單的項目 (無主持人/需主持人)
    const submenus = document.querySelectorAll('.has-submenu');

    submenus.forEach(submenu => {
        const level2Menu = submenu.querySelector('.level-2');
        
        // 當滑鼠移入「無/需主持人」時，顯示對應的第二層選單
        submenu.addEventListener('mouseenter', () => {
            if (level2Menu) {
                level2Menu.classList.add('visible');
            }
        });
        
        // 當滑鼠移出「無/需主持人」時，隱藏第二層選單
        submenu.addEventListener('mouseleave', () => {
            if (level2Menu) {
                level2Menu.classList.remove('visible');
            }
        });
    });

});

document.addEventListener('DOMContentLoaded', function() {
    
    // 找到所有 TOC 的連結
    const tocLinks = document.querySelectorAll('.toc-nav a');

    tocLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // 1. 防止連結的預設跳轉行為
            event.preventDefault();

            // 2. 獲取連結的目標 id (例如 "#intro")
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // 3. 計算目標元素需要捲動到的位置
                const headerOffset = document.querySelector('header').offsetHeight; // 獲取 header 的高度
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // 減去 header 高度並增加一點緩衝

                // 4. 執行平滑捲動
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

});