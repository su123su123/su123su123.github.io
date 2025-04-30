document.addEventListener('DOMContentLoaded', () => {
    // --- 书本翻页动画处理 ---
    const introContainer = document.getElementById('intro-container');
    const introOverlay = document.getElementById('intro-overlay');
    const pageScrollContainer = document.querySelector('.page-scroll-container');
    
    // 获取书本元素
    const bookContainer = document.getElementById('book-container');
    const book = document.querySelector('.book'); // Get reference to the book element
    const cover = document.getElementById('cover');
    const introduction = document.getElementById('introduction');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const page4 = document.getElementById('page4');
    const page5 = document.getElementById('page5');
    const pages = [cover, introduction, page1, page2, page3, page4, page5]; // page wrappers
    const initialZIndexes = {}; // Store initial z-indexes
    pages.forEach((page, index) => {
        initialZIndexes[page.id] = window.getComputedStyle(page).zIndex;
    });
    let currentPage = -1; // -1 表示书本封面还未打开
    
    // 初始时隐藏主内容容器
    if (pageScrollContainer) {
        pageScrollContainer.style.display = 'none';
    }
    
    // 封面鼠标悬停效果 (保持)
    cover.addEventListener('mouseenter', () => {
        if (currentPage === -1) {
            cover.classList.add('cover-hover');
        }
    });

    cover.addEventListener('mouseleave', () => {
        if (currentPage === -1) {
            cover.classList.remove('cover-hover');
        }
    });

    // 添加封面的单独点击事件
    cover.addEventListener('click', (e) => {
        if (currentPage === -1) { // 仅在初始状态（封面未翻开）时处理
            turnPageForward(e);
            e.stopPropagation(); // 阻止事件冒泡到 introContainer
        }
    });

    // 页面翻转逻辑 - 向前翻页
    function turnPageForward(e) {
        const nextPageIndex = currentPage + 1;
        // 只能翻到下一页, 且不能超过总页数
        if (nextPageIndex >= pages.length) return;
        
        // 创建翻页视觉效果 (如果事件存在)
        if (e) {
            createPageTurnEffect(e);
        }

        // 添加渐变消失效果到当前页
        if (currentPage >= 0) {
            const currentPageElement = pages[currentPage];
            const currentFront = currentPageElement.querySelector('.page-front');
            if (currentFront) {
                currentFront.style.transition = 'opacity 0.8s ease';
                currentFront.style.opacity = '0.99';
            }
        }

        // 翻转目标页面
        const pageToFlip = pages[nextPageIndex];
        pageToFlip.classList.add('flipped');
        pageToFlip.style.zIndex = '100'; // Temporarily raise z-index when flipped
        pageToFlip.classList.remove('return-flipped'); 
        currentPage = nextPageIndex;
        
        // 显示提示信息
        const dreamHint = document.getElementById('dream-hint');
        if (currentPage > 0) {
            dreamHint.style.opacity = '1'; // 显示提示
        } else {
            dreamHint.style.opacity = '0'; // 隐藏提示
        }
        
        // --- Add centering class when book opens ---
        if (currentPage >= 0 && book) { 
            book.classList.add('book-centered-open');
        }
        // --- End centering class logic ---
        
        // 检查是否已经到最后一页
        if (currentPage === pages.length - 1) {
            setTimeout(() => {
                introContainer.classList.add('book-ended');
            }, 800); 
        }
        
        if (currentPage === 0) { // 翻开封面
            cover.classList.remove('cover-hover');
        }

        // 重置前一页的透明度，为返回时做准备
        setTimeout(() => {
            if (currentPage > 0) {
                const prevPage = pages[currentPage - 1];
                const prevFront = prevPage.querySelector('.page-front');
                if (prevFront) {
                    prevFront.style.opacity = '0';
                }
            }
        }, 1000);

        // 修改后的透明度变化逻辑
        updatePageOpacity('forward'); // 调用更新透明度的函数
    }
    
    // 页面翻转逻辑 - 向后翻页
    function turnPageBackward(e) { // 移除 pageIndex 参数
        location.reload();
        // 只能回翻当前页
        if (currentPage < 0) return;
        
        // 创建翻页视觉效果
        if (e) {
            createPageTurnEffect(e);
        }

        // 添加渐变消失效果到当前页的背面
        const pageToUnflip = pages[currentPage];
        const currentBack = pageToUnflip.querySelector('.page-back');
        if (currentBack) {
            // 不再直接设置opacity为0，保留可见性
            currentBack.style.transition = 'opacity 0.8s ease';
            // 降低不透明度但不完全隐藏
            currentBack.style.opacity = '0.99';
        }

        // 移除当前页面的翻转
        pageToUnflip.classList.remove('flipped');
        pageToUnflip.style.zIndex = initialZIndexes[pageToUnflip.id]; // Restore initial z-index
        
        currentPage = currentPage - 1;
        
        // 隐藏提示信息
        const dreamHint = document.getElementById('dream-hint');
        if (currentPage <= 0) {
            dreamHint.style.opacity = '0'; // 隐藏提示
        }
        
        // --- Remove centering class when back to cover ---
        if (currentPage === -1 && book) { 
            book.classList.remove('book-centered-open');
        }
        // --- End centering class logic ---
        
        // 如果已经有"点击继续"提示，需要隐藏
        introContainer.classList.remove('book-ended');
        
        // 如果翻回封面，重新添加悬停效果类（如果鼠标还在上面）
        if (currentPage === -1 && cover.matches(':hover')) {
             cover.classList.add('cover-hover');
        }

        // 重置当前页的透明度
        setTimeout(() => {
            if (currentPage >= 0) {
                const currentPageEl = pages[currentPage];
                const nextPage = pages[currentPage + 1];
                const nextBack = nextPage.querySelector('.page-back');
                if (nextBack) {
                    nextBack.style.opacity = '1';
                }
            }
        }, 1000);

        // 修改后的透明度变化逻辑
        updatePageOpacity('backward'); // 调用更新透明度的函数
    }
    
    // 创建翻页效果 (保持)
    function createPageTurnEffect(e) {
        const pageTurnEffect = document.createElement('div');
        pageTurnEffect.className = 'page-turn-effect';
        pageTurnEffect.style.left = e.clientX + 'px';
        pageTurnEffect.style.top = e.clientY + 'px';
        document.body.appendChild(pageTurnEffect);
        
        setTimeout(() => {
            if (pageTurnEffect.parentNode) {
                pageTurnEffect.parentNode.removeChild(pageTurnEffect);
            }
        }, 600);
    }

    // 移除给每个页面添加的点击事件
    // pages.forEach((page, index) => { ... });

    // --- 修改：在 introContainer 上监听点击事件 --- 
    introContainer.addEventListener('click', (e) => {
        // 防止点击书本内部元素（如图片）时也触发翻页
        // 同时允许点击提示文字
        if (e.target.closest('.book') && !e.target.classList.contains('click-hint')) {
           // 如果需要点击书本区域翻页，可以取消这个判断
           // return; 
        }
        
        // 如果点击的是"点击继续"提示区域，并且书已翻完，则走继续流程
        if (e.target.classList.contains('click-hint') && currentPage === pages.length - 1) {
            handleContinueClick(e);
            return;
        }

        // 特殊处理 introduction 页面
        if (currentPage === 0) { // 当前在 introduction 页面
            // 获取 introduction 页面元素
            const introductionPage = pages[currentPage];
            const introductionRect = introductionPage.getBoundingClientRect();
            
            // 计算红框区域的大致位置（根据图片估算）
            const pageWidth = introductionRect.width;
            const pageHeight = introductionRect.height;
            
            // 左侧红框区域（探索梦境大卡）
            const leftBoxX1 = introductionRect.left + pageWidth * 0.5;
            const leftBoxX2 = introductionRect.left + pageWidth * 0.9;
            const leftBoxY1 = introductionRect.top + pageHeight * 1.5;
            const leftBoxY2 = introductionRect.top + pageHeight * 2.2;
            
            // 右侧红框区域（聆听你的梦语）
            const rightBoxX1 = introductionRect.left + pageWidth * 1.1;   
            const rightBoxX2 = introductionRect.left + pageWidth * 1.9;   
            const rightBoxY1 = introductionRect.top + pageHeight * 1.1;   
            const rightBoxY2 = introductionRect.top + pageHeight * 2.5; 
            
            // 判断点击区域
            if (e.clientX >= leftBoxX1 && e.clientX <= leftBoxX2 && 
                e.clientY >= leftBoxY1 && e.clientY <= leftBoxY2) {
                // 点击左侧红框区域（探索梦境大卡）
                turnPageForward(e);
            } else if (e.clientX >= rightBoxX1 && e.clientX <= rightBoxX2 && 
                       e.clientY >= rightBoxY1 && e.clientY <= rightBoxY2) {
                // 点击右侧红框区域（聆听你的梦语）
                handleContinueClick(e);
            } else {
                // 点击其他区域
                showSelectionPrompt(e);
            }
            return;
        }

        // 其他页面正常处理翻页逻辑
        if (currentPage < pages.length - 1) {
            const viewportWidth = window.innerWidth;
            const middleX = viewportWidth / 2;

            if (e.clientX < middleX) {
                // 点击屏幕左侧 -> 向后翻
                turnPageBackward(e);
            } else {
                // 点击屏幕右侧 -> 向前翻
                turnPageForward(e);
            }
        } 
        // 如果书翻完了，点击非提示区域可能不做任何事，或者也触发继续？
        // 当前逻辑是只有点击提示区才继续
    });

    // 跳转到第一页的函数
    function navigateToMiniGame(e) {
        console.log("跳转到第一页");
        // 创建翻页特效，提供视觉反馈
        createPageTurnEffect(e);
        
        // 直接跳转到第一页
        window.location.hash = '#first-page'; // 或者使用其他方法跳转到第一页
    }
    
    // 显示提示信息的函数
    function showSelectionPrompt(e) {
        console.log("提示用户选择功能");
        // 创建翻页特效，提供视觉反馈
        createPageTurnEffect(e);
        
        // 创建提示信息元素
        const promptEl = document.createElement('div');
        promptEl.className = 'selection-prompt';
        promptEl.textContent = '请选择你要探索的梦境功能';
        promptEl.style.position = 'fixed';
        promptEl.style.top = '50%';
        promptEl.style.left = '50%';
        promptEl.style.transform = 'translate(-50%, -50%)';
        promptEl.style.padding = '15px 25px';
        promptEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        promptEl.style.color = '#fff';
        promptEl.style.borderRadius = '15px';
        promptEl.style.fontSize = '18px';
        promptEl.style.zIndex = '10000';
        promptEl.style.opacity = '0';
        promptEl.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(promptEl);
        
        // 淡入效果
        setTimeout(() => {
            promptEl.style.opacity = '1';
        }, 10);
        
        // 3秒后自动移除
        setTimeout(() => {
            promptEl.style.opacity = '0';
            setTimeout(() => {
                if (promptEl.parentNode) {
                    promptEl.parentNode.removeChild(promptEl);
                }
            }, 300);
        }, 3000);
    }

    // --- 处理点击继续的逻辑封装 --- 
    function handleContinueClick(e) {
        createPageTurnEffect(e);
        
        // 获取book元素并添加淡出动画
        const bookElement = document.querySelector('.book');
        const introContainer = document.getElementById('intro-container');
        
        // 让整个intro-container优雅淡出
        if (introContainer) {
            // 先让book淡出
            if (bookElement) {
                bookElement.style.transition = 'opacity 1.2s ease-out, transform 1.2s ease-out';
                bookElement.style.opacity = '0';
                bookElement.style.transform = 'translateY(-50px)';
            }
            
            // 然后让整个intro-container淡出
            setTimeout(() => {
                // 添加过渡样式
                introContainer.style.transition = 'opacity 1.2s ease-out';
                introContainer.style.opacity = '0';
                
                // 显示页面滚动容器但初始透明
        if (pageScrollContainer) {
            pageScrollContainer.style.display = 'block';
                    pageScrollContainer.style.opacity = '0';
                    pageScrollContainer.style.transition = 'opacity 1.5s ease-in';
        
                    // 滚动容器淡入
        setTimeout(() => {
                        pageScrollContainer.style.opacity = '1';
                    }, 300);
            }
                
                // 完全移除intro容器
            setTimeout(() => {
                if (introContainer.parentNode) {
                    introContainer.parentNode.removeChild(introContainer);
                }
                }, 1200);
            }, 800); // 等待book淡出开始后再淡出整个容器
        } else {
            // 兜底：如果没有找到容器元素，直接显示下一页
            if (pageScrollContainer) {
                pageScrollContainer.style.display = 'block';
            }
        }
    }
    
    // 移除 introOverlay 的独立点击事件监听器，统一由 introContainer 处理
    // introOverlay.addEventListener('click', ...);

    // --- Lenis Smooth Scroll Initialization ---
    let lenis;
    if (!window._lenisInitialized) {
        lenis = new Lenis({
            smooth: true,
            lerp: 0.1,
            syncTouch: true,
            gestureOrientation: 'vertical',
            wheelMultiplier: 1,
            touchMultiplier: 1.2,
            normalizeWheel: true
        });
        window._lenisInitialized = true;
        window.lenisInstance = lenis;
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } else {
        lenis = window.lenisInstance;
    }
    // 禁止原生 scroll-behavior 干扰
    document.documentElement.style.scrollBehavior = 'auto';
    // --- End Lenis ---

    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 0.15 // 提高阈值，减少频繁触发
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible'); // 修正为动画对应类
                observer.unobserve(entry.target); // 只触发一次动画，提升性能
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Select all elements intended for fade-in animation on scroll
    // Make sure these elements exist in your HTML and have the base styles in CSS
    // You might need to add the class 'fade-in-on-scroll' to elements in index.html
    const elementsToAnimate = document.querySelectorAll('.fade-in-on-scroll'); 
    elementsToAnimate.forEach(el => observer.observe(el));

    // 让所有 .page 元素（包括第一页）也拥有入场动画
    const pagesToAnimate = document.querySelectorAll('.page');
    pagesToAnimate.forEach(page => observer.observe(page));
    // --- End Intersection Observer ---

    // --- 第一页动画处理 ---
    const firstPage = document.getElementById('first-page');
    const dreamJourneyBtn = document.querySelector('.dream-journey-btn');
    const centeredButton = document.querySelector('.centered-button');
    
    if (dreamJourneyBtn) {
        dreamJourneyBtn.addEventListener('click', () => {
            // 1. 背景图片从黑色过渡到彩色
            firstPage.classList.add('colored');
            
            // 2. 按钮淡出
            centeredButton.classList.add('fade-out');

        });
    }

    const bubbleContainer = document.getElementById('bubble-container');
    const navItems = document.querySelectorAll('.nav-item');
    let hoverTimeout = null; // To manage delays for hover effects

    // --- 新增：模态框相关元素 (移到此处声明) ---
    const detailModal = document.getElementById('dream-detail-modal');
    const detailModalTitle = document.getElementById('modal-title');
    const detailModalText = document.getElementById('modal-detail-text');
    const detailModalCloseBtn = document.getElementById('modal-close-btn');

    const radarModal = document.getElementById('emotion-radar-modal');
    const radarModalCloseBtn = document.getElementById('radar-modal-close-btn');
    const radarCanvas = document.getElementById('emotionRadarChart');
    const radarModalMessage = document.getElementById('radar-modal-message');
    let emotionChartInstance = null; // 用于存储 Chart 实例

    // --- New Elements for Dream Search ---
    const dreamInput = document.getElementById('dream-input');
    const searchButton = document.getElementById('search-btn');
    const searchContainer = document.querySelector('.search-container');
    const resultContainer = document.getElementById('result-container');
    const themeCard = document.getElementById('card-theme');
    const emotionCard = document.getElementById('card-emotion');
    const adviceCard = document.getElementById('card-advice');
    const themeCardP = themeCard?.querySelector('p'); // Optional chaining
    const emotionCardP = emotionCard?.querySelector('p'); // Optional chaining
    const adviceCardP = adviceCard?.querySelector('p'); // Optional chaining
    // 新增：情绪图谱卡片引用
    const emotionRadarCard = document.getElementById('card-emotion-radar');
    const emotionRadarContent = emotionRadarCard?.querySelector('.radar-content p'); // Optional chaining

    // --- Midjourney API 相关元素 ---
    const visualDreamBtn = document.querySelector('.visual-dream-btn');
    const dreamImageContainer = document.querySelector('.dream-image-container');
    const fifthPage = document.getElementById('fifth-page');
    const visualizationOverlay = document.getElementById('visualization-overlay');
    const loadVideo = document.getElementById('load-video');
    const closeVisualizationBtn = document.getElementById('close-visualization-btn');
    const embeddedUiPlaceholder = document.getElementById('embedded-ui-placeholder');
    let dreamImageContainerOriginalParent = null; // 存储原始父元素
    
    // 重新获取生图相关元素，防止移动后丢失引用
    const imageLoading = document.querySelector('.image-loading');
    const generatedImage = document.querySelector('.generated-image');
    const errorMessage = document.querySelector('.error-message');
    const infoMessage = document.querySelector('.info-message');

    // --- API 密钥和 URL ---
    const DEEPSEEK_API_KEY = 'sk-db09379b2da749ac80747244ba3e127c'; // 请替换为您的 API Key
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'; // DeepSeek API URL
    
    const MIDJOURNEY_API_KEY = 'sk-DMMaqcJ09MJKf9F34e95Fe0e853c438993F539Fc1eEeB840'; // Midjourney API 密钥
    const MIDJOURNEY_API_URL = 'https://api.aiyiapi.com/mj-relax'; // 不包含模式后缀
    
    // --- State Variables ---
    let currentDreamText = ''; // To store the current dream text for other functions
    let dreamAnalysisResult = null; // Store the full analysis result
    let currentDreamNature = 'bad'; // Default to 'bad'

    // --- 可视化覆盖层逻辑 ---
    if (visualDreamBtn && visualizationOverlay && dreamImageContainer && embeddedUiPlaceholder && closeVisualizationBtn && loadVideo && fifthPage) {
        // 存储原始父元素
        dreamImageContainerOriginalParent = dreamImageContainer.parentNode;

        visualDreamBtn.addEventListener('click', () => {
            // 1. 将生图 UI 移动到覆盖层的占位符中
            embeddedUiPlaceholder.appendChild(dreamImageContainer);

            // 2. 显示覆盖层 (添加激活类)
            fifthPage.classList.add('visualization-active');

            // 3. 替换视频源确保正确加载
            if (loadVideo) {
                // 首先移除旧的源
                while (loadVideo.firstChild) {
                    loadVideo.removeChild(loadVideo.firstChild);
                }
                
                // 添加新的视频源
                const source1 = document.createElement('source');
                source1.src = 'images/six_page/load.mov';
                source1.type = 'video/quicktime';
                loadVideo.appendChild(source1);
                
                const source2 = document.createElement('source');
                source2.src = 'images/six_page/load.mp4';
                source2.type = 'video/mp4';
                loadVideo.appendChild(source2);
                
                // 重置视频并播放
                loadVideo.load(); // 重要：重新加载视频元素
                loadVideo.currentTime = 0;
                loadVideo.muted = false;
                
                console.log("准备播放视频：", loadVideo.firstChild ? "视频源已加载" : "视频源未加载");
                
                // 在确保DOM更新后播放视频
                setTimeout(() => {
                    const playPromise = loadVideo.play();
                    if (playPromise) {
                        playPromise.then(() => {
                            console.log("视频成功播放");
                        }).catch(error => {
                            console.error("视频播放失败:", error);
                            
                            // 尝试静音播放（绕过部分浏览器的自动播放限制）
                            loadVideo.muted = true;
                            loadVideo.play().then(() => {
                                console.log("静音模式下视频成功播放");
                                setTimeout(() => {
                                    loadVideo.muted = false; // 稍后取消静音
                                }, 1000);
                            }).catch(e => console.error("静音播放也失败:", e));
                        });
                    }
                }, 500);
            }
            
            // 4. 调用模拟生图函数
            //setTimeout(() => generateDreamImage(), 1000);
        });

        closeVisualizationBtn.addEventListener('click', () => {
            // 1. 暂停并重置视频
            loadVideo.pause();
            loadVideo.currentTime = 0;

            // 2. 隐藏覆盖层 (移除激活类)
            fifthPage.classList.remove('visualization-active');

            // 3. 将生图 UI 移回原始父元素
            if (dreamImageContainerOriginalParent) {
                dreamImageContainerOriginalParent.appendChild(dreamImageContainer);
            }
        });
    }
    // --- 结束 可视化覆盖层逻辑 ---

    // --- Bubble Generation ---
    function createBubble() {
        if (!bubbleContainer) return;

        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        const size = Math.random() * 60 + 20; // Bubble size between 20px and 80px
        const duration = Math.random() * 10 + 8; // Duration between 8s and 18s
        const delay = Math.random() * 5; // Start delay up to 5s
        const horizontalStart = Math.random() * 100; // Start position across width (%)
        // Add a custom property for slight horizontal drift in animation
        const driftAngle = Math.random() * 360; // Random angle for sin wave drift

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${horizontalStart}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;
        // Apply the custom property for CSS animation
        bubble.style.setProperty('--drift-angle', `${driftAngle}deg`);


        bubbleContainer.appendChild(bubble);

        // Remove bubble after animation completes to prevent DOM clutter
        setTimeout(() => {
            bubble.remove();
        }, (duration + delay) * 1000);
    }

    // Generate bubbles periodically
    setInterval(createBubble, 400); // Create a new bubble every 400ms

    // --- Navigation Hover Panels ---

    function showPanel(panelId, navItem) {
        // Hide any currently visible panels first
        hideAllPanels();

        const panel = document.getElementById(panelId);
        if (!panel) return;

        // Position the panel below the nav item
        const navRect = navItem.getBoundingClientRect();
        const headerRect = navItem.closest('header').getBoundingClientRect();

        panel.style.top = `${headerRect.bottom}px`; // Position below the header bottom edge
         // Center the panel roughly under the nav item
        panel.style.left = `${navRect.left + (navRect.width / 2) - (panel.offsetWidth / 2)}px`;

        // Make sure it doesn't go off screen left/right (basic check)
        const panelRect = panel.getBoundingClientRect(); // Need to get size *after* setting display potentially
        if(panel.offsetLeft < 10) {
             panel.style.left = '10px';
        } else if (panel.offsetLeft + panel.offsetWidth > window.innerWidth - 10) {
             panel.style.left = `${window.innerWidth - panel.offsetWidth - 10}px`;
        }


        panel.classList.add('visible');
    }

    function hidePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.classList.remove('visible');
            // Optional: Reset position if needed, though CSS transition handles hiding
        }
    }

    function hideAllPanels() {
         document.querySelectorAll('.hover-panel.visible').forEach(p => p.classList.remove('visible'));
    }

    navItems.forEach(item => {
        const targetPanelId = item.getAttribute('data-target');
        const panel = document.getElementById(targetPanelId);

        // Mouse entering the nav item
        item.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout); // Clear any pending hide actions
            // Slight delay before showing to prevent accidental triggers
            hoverTimeout = setTimeout(() => {
                showPanel(targetPanelId, item);
            }, 150); // 150ms delay before showing
        });

        // Mouse leaving the nav item
        item.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout); // Clear show timeout if mouse leaves quickly
            // Start timer to hide the panel, allows moving mouse onto the panel
            hoverTimeout = setTimeout(() => {
                // Check if mouse is NOT over the panel before hiding
                if (panel && !panel.matches(':hover')) {
                    hidePanel(targetPanelId);
                }
            }, 200); // 200ms delay before hiding
        });

        // 点击"梦织"时平滑滚动到第一页
        if (targetPanelId === 'panel-mengzhi') {
            item.addEventListener('click', () => {
                document.getElementById('first-page').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Keep panel open if mouse enters the panel itself
        if (panel) {
            panel.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout); // Cancel any pending hide action
            });

            // Hide panel when mouse leaves the panel area
            panel.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    hidePanel(targetPanelId);
                }, 200);
            });
        }
    });

     // Optional: Click outside to close panels
     document.addEventListener('click', (event) => {
         // Check if the click was outside the nav items and the panels
         if (!event.target.closest('.nav-item') && !event.target.closest('.hover-panel')) {
            clearTimeout(hoverTimeout);
             hideAllPanels();
         }
     });

     // --- DeepSeek API Call and Result Handling ---
    async function fetchDreamAnalysis(dreamText) {
        // --- 保存当前梦境文本以便后续使用 ---
        currentDreamText = dreamText;
        dreamAnalysisResult = null; // Reset previous result
        currentDreamNature = 'bad'; // Reset nature

        // --- Show Loading State Immediately --- 
        searchButton.disabled = true; // Disable button during request
        searchButton.style.opacity = '0.7';
        searchContainer.classList.add('search-container-shifted'); // Move search up now
        resultContainer.classList.add('result-cards-visible'); // Show container now

        if (themeCardP) themeCardP.textContent = '正在解读中...'; // Show loading in first card
        if (emotionCardP) emotionCardP.textContent = '...'; // Indicate loading in other cards
        if (adviceCardP) adviceCardP.textContent = '...'; // Indicate loading in other cards
        if (emotionRadarContent) emotionRadarContent.textContent = '请先完成解梦'; // Reset radar card text

        // --- 清除旧的 data 属性和图表 ---
        if(themeCard) delete themeCard.dataset.detail;
        if(emotionCard) delete emotionCard.dataset.detail;
        if(adviceCard) delete adviceCard.dataset.detail;
        if (emotionChartInstance) {
            emotionChartInstance.destroy();
            emotionChartInstance = null;
        }
        if (radarModalMessage) radarModalMessage.textContent = '';


        // --- 修改 Prompt: 要求情绪分数 ---
        const prompt = `
        请帮我解梦，我的梦境是："${dreamText}"
        请根据梦境内容，分析并生成以下信息，并严格按照JSON格式返回。
        对于 theme, emotion, healing_advice 这三项，请分别提供 summary (简短总结，用于卡片显示) 和 detail (详细解读，用于点击展开)。
        对于 dream_nature，请根据心理学角度判断这个梦是积极/治愈类的"好梦"，还是消极/有压力的"噩梦"，并只返回单词 "good" 或 "bad"。
        对于 emotion_scores，请为以下六种情绪打分（0到10分，0代表完全没有，10代表极其强烈）：喜悦(joy), 平静(calm), 焦虑(anxiety), 恐惧(fear), 悲伤(sadness), 愤怒(anger)。

        key 如下:
        - theme_summary
        - theme_detail
        - emotion_summary
        - emotion_detail
        - healing_advice_summary
        - healing_advice_detail
        - dream_nature
        - emotion_scores (一个包含 joy, calm, anxiety, fear, sadness, anger 六个 key 及其对应分数的对象)

        返回的JSON格式示例：
        {
          "theme_summary": "梦境暗示了对考试的焦虑，核心内容是在考场迷路。",
          "theme_detail": "（这里是更详细的潜意识主题分析...）",
          "emotion_summary": "主要情绪是焦虑和迷茫。",
          "emotion_detail": "（这里是更详细的情绪分析...）",
          "healing_advice_summary": "尝试考前放松，给自己积极暗示。",
          "healing_advice_detail": "（这里是更详细的疗愈建议...）",
          "dream_nature": "bad",
          "emotion_scores": {
            "joy": 1,
            "calm": 3,
            "anxiety": 8,
            "fear": 6,
            "sadness": 2,
            "anger": 1
          }
        }
        `;

        try {
            console.log("发送解梦、性质及情绪分数分析请求给 DeepSeek");
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: prompt }],
                    stream: false
                })
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 console.error("DeepSeek API 错误响应文本:", errorText);
                throw new Error(`DeepSeek API错误 (${response.status}): ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            console.log("DeepSeek 响应数据:", JSON.stringify(data, null, 2));

            let analysisResult = null;
            if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                let content = data.choices[0].message.content.trim();
                if (content.startsWith("```json")) { content = content.substring(7); }
                if (content.endsWith("```")) { content = content.substring(0, content.length - 3); }
                content = content.trim();
                
                try {
                    analysisResult = JSON.parse(content);
                    dreamAnalysisResult = analysisResult; // 保存完整分析结果
                    console.log("Parsed Analysis Result:", dreamAnalysisResult); // 调试：打印完整解析结果
                    // *** 调试：明确打印情绪分数 ***
                    console.log("Emotion Scores from API:", analysisResult.emotion_scores);
                    
                    // --- 存储 dream_nature ---
                    if (analysisResult.dream_nature && typeof analysisResult.dream_nature === 'string') {
                        const nature = analysisResult.dream_nature.trim().toLowerCase();
                        currentDreamNature = (nature === 'good') ? 'good' : 'bad';
                        } else {
                        console.warn("DeepSeek 返回结果中 dream_nature 字段无效或缺失，默认为 bad");
                            currentDreamNature = 'bad';
                    }
                    console.log("存储的梦境性质:", currentDreamNature);

                    // --- 存储详细信息到 data 属性 ---
                    if (themeCard && analysisResult.theme_detail) {
                        themeCard.dataset.detail = analysisResult.theme_detail;
                        themeCard.dataset.title = "潜意识主题解读";
                    }
                    if (emotionCard && analysisResult.emotion_detail) {
                        emotionCard.dataset.detail = analysisResult.emotion_detail;
                        emotionCard.dataset.title = "情绪分析详情";
                    }
                    if (adviceCard && analysisResult.healing_advice_detail) {
                        adviceCard.dataset.detail = analysisResult.healing_advice_detail;
                        adviceCard.dataset.title = "疗愈建议详解";
                    }
                    // --- 更新图谱卡片状态 ---
                     if (emotionRadarContent) {
                        emotionRadarContent.textContent = (analysisResult.emotion_scores) ? '点击生成图谱' : '无法生成图谱';
                     }


                } catch (parseError) {
                    console.error("解析 DeepSeek JSON 失败:", parseError);
                    console.error("原始 content:", content);
                    if(themeCardP) themeCardP.textContent = '解析失败';
                    if(emotionCardP) emotionCardP.textContent = '无法读取结果';
                    if(adviceCardP) adviceCardP.textContent = '';
                    if(emotionRadarContent) emotionRadarContent.textContent = '解析错误';
                    currentDreamNature = 'bad';
                    dreamAnalysisResult = null; // 清除可能部分解析的结果
                }
            } else {
                console.error('DeepSeek 响应格式不正确。');
                 if(themeCardP) themeCardP.textContent = '无有效回复';
                 if(emotionCardP) emotionCardP.textContent = '';
                 if(adviceCardP) adviceCardP.textContent = '';
                 if(emotionRadarContent) emotionRadarContent.textContent = '无有效回复';
                 currentDreamNature = 'bad';
                 dreamAnalysisResult = null;
            }

            // --- 更新 UI (summary 部分) ---
            if (dreamAnalysisResult) {
                if(themeCardP) themeCardP.textContent = dreamAnalysisResult.theme_summary || '信息不完整';
                // *** 修正：使用 emotion_summary ***
                if(emotionCardP) emotionCardP.textContent = dreamAnalysisResult.emotion_summary || '信息不完整';
                if(adviceCardP) adviceCardP.textContent = dreamAnalysisResult.healing_advice_summary || '';
            } else {
                 // Handle cases where analysis failed earlier
                 if (themeCardP && (!themeCardP.textContent || themeCardP.textContent === '正在解读中...')) themeCardP.textContent = '获取失败';
                 if (emotionCardP && (!emotionCardP.textContent || emotionCardP.textContent === '...')) emotionCardP.textContent = '获取失败';
                 if (adviceCardP && (!adviceCardP.textContent || adviceCardP.textContent === '...')) adviceCardP.textContent = '';
                 if (emotionRadarContent && (!emotionRadarContent.textContent || emotionRadarContent.textContent === '请先完成解梦')) emotionRadarContent.textContent = '获取失败';
            }

        } catch (error) {
            console.error('请求 DeepSeek 出错:', error);
            if(themeCardP) themeCardP.textContent = '解梦失败';
            if(emotionCardP) emotionCardP.textContent = `错误: ${error.message.substring(0, 50)}...`;
            if(adviceCardP) adviceCardP.textContent = '请检查网络或API。';
            if(emotionRadarContent) emotionRadarContent.textContent = '请求错误';
            currentDreamNature = 'bad';
            dreamAnalysisResult = null; // 清除结果
        } finally {
             searchButton.disabled = false;
            searchButton.style.opacity = '1';
        }
    }

    // --- Event Listener for Search Button ---
    searchButton.addEventListener('click', () => {
        const dreamText = dreamInput.value.trim();
        if (dreamText) {
            fetchDreamAnalysis(dreamText);
            } else {
            // Optionally provide feedback if input is empty
            // e.g., shake the input box or show a small message
            console.log("请输入梦境内容");
        }
    });

    // --- Event Listener for Enter Key in Input ---
    dreamInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission if applicable
            searchButton.click(); // Trigger the search button click
        }
    });


    // --- 新增：事件监听器 - 打开详细信息模态框 ---
    function openDetailModal(event) {
        console.log("Card clicked:", event.currentTarget.id); // 调试信息
        const card = event.currentTarget;
        const title = card.dataset.title || '详细信息';
        const detail = card.dataset.detail;

        console.log("Retrieved Title:", title);
        console.log("Retrieved Detail:", detail); // 调试信息

        if (!detail) {
            console.warn("No detail found for card:", card.id);
            // 可以选择弹出一个提示或轻微晃动卡片
            alert('暂无详细信息。');
            return; // 没有详情则不打开模态框
        }

        if (detailModal && detailModalTitle && detailModalText) {
            detailModalTitle.textContent = title;
            detailModalText.textContent = detail;
            // 修改：使用 classList 控制可见性
            // detailModal.style.display = 'flex';
            detailModal.classList.add('visible');
            console.log("Detail modal opened for:", card.id);
        } else {
            console.error("Detail modal elements not found!");
        }
    }

    // --- 新增：事件监听器 - 关闭详细信息模态框 ---
    function closeDetailModal() {
        if (detailModal) {
            // 修改：使用 classList 控制可见性
            // detailModal.style.display = 'none';
            detailModal.classList.remove('visible');
            console.log("Detail modal closed.");
        }
    }

    // --- 新增：事件监听器 - 打开情绪雷达图模态框 ---
    function openRadarModal() {
        console.log("Radar card clicked.");
        if (!dreamAnalysisResult || !dreamAnalysisResult.emotion_scores) {
            console.warn(`Cannot open radar modal: dreamAnalysisResult: ${!!dreamAnalysisResult}, emotion_scores: ${dreamAnalysisResult ? !!dreamAnalysisResult.emotion_scores : 'N/A'}`);
            if(radarModalMessage) radarModalMessage.textContent = '请先成功进行解梦分析以获取情绪数据。';
            if(radarModal) {
                radarModal.classList.add('visible');
                if(radarCanvas) radarCanvas.style.display = 'none';
                // 确保自定义图例是隐藏的
                const customLegend = radarModal.querySelector('.custom-chart-legend');
                if (customLegend) customLegend.style.display = 'none';
            }
            return;
        }
        if (!radarCanvas || !radarModal) {
             console.error("雷达图 Canvas 或模态框未找到！");
             return;
        }

         if (radarModalMessage) radarModalMessage.textContent = '';
         if(radarCanvas) radarCanvas.style.display = 'block';
          // 显示自定义图例
          const customLegend = radarModal.querySelector('.custom-chart-legend');
          if (customLegend) customLegend.style.display = 'flex';


        const scores = dreamAnalysisResult.emotion_scores;
        console.log("Using scores for chart:", scores);
        // 确认标签顺序与参考图一致 (Top: 喜悦, Top-Right: 平静, Bottom-Right: 焦虑, Bottom: 恐惧, Bottom-Left: 悲伤, Top-Left: 愤怒)
        const labels = ['喜悦', '平静', '焦虑', '恐惧', '悲伤', '愤怒'];
        const dataPoints = [
            scores.joy ?? 0,
            scores.calm ?? 0,
            scores.anxiety ?? 0,
            scores.fear ?? 0,
            scores.sadness ?? 0,
            scores.anger ?? 0
        ];
        console.log("Chart Labels:", labels);
        console.log("Chart Data Points:", dataPoints);

        // --- 销毁旧图表 ---
        if (emotionChartInstance) {
            console.log("Destroying previous chart instance.");
            emotionChartInstance.destroy();
            emotionChartInstance = null;
        }

        try {
            console.log("Attempting to create new Chart...");
            const ctx = radarCanvas.getContext('2d');
            emotionChartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        // label: '梦境情绪强度', // 使用自定义图例，这里不再需要
                        data: dataPoints,
                        fill: true,
                        backgroundColor: 'rgba(137, 207, 240, 0.4)', // 浅蓝色填充 (LightSkyBlue with alpha)
                        borderColor: 'rgb(70, 130, 180)',      // 较深的蓝色边框 (SteelBlue)
                        pointBackgroundColor: 'rgb(70, 130, 180)', // 数据点颜色 (SteelBlue)
                        pointBorderColor: '#fff',          // 数据点白色边框
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(70, 130, 180)',
                        pointRadius: 4, // 数据点半径
                        pointBorderWidth: 1, // 数据点边框宽度
                        borderWidth: 1.5 // 雷达图区域边框宽度
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // 修改：解除宽高比限制
                    elements: {
                        line: {
                            // borderWidth: 1.5 // 已在 dataset 中设置
                        }
                    },
                    scales: {
                        r: { // Radial Axis
                            angleLines: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)' // 浅灰色角度线
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)' // 浅灰色网格线
                            },
                            suggestedMin: 0,
                            suggestedMax: 8, // 坐标轴最大值为 8
                             ticks: {
                                 stepSize: 2,
                                 display: true, // 显示刻度数字
                                 backdropColor: 'rgba(255, 255, 255, 0)', // 刻度数字背景透明
                                 color: '#666', // 刻度数字颜色
                                 font: {
                                     size: 10 // 刻度数字大小
                                 },
                                 // 自定义回调函数，只显示 2, 4, 6, 8
                                 callback: function(value, index, values) {
                                     if (value !== 0) { // 不显示 0
                                         return value;
                                     }
                                     return ''; // 返回空字符串隐藏标签
                                 }
                             },
                             pointLabels: { // 轴标签 (喜悦, 平静等)
                                font: {
                                    size: 15, // 增大轴标签字体
                                    weight: 'normal' // 可选 'bold'
                                 },
                                 color: '#333'
                             }
                        }
                    },
                     plugins: {
                        legend: {
                            display: false // 禁用默认图例
                        },
                        tooltip: { // 可选：自定义提示框
                            enabled: true // 启用/禁用鼠标悬停提示
                        }
                     }
                }
            });
             console.log("New Chart instance created successfully:", emotionChartInstance);
        } catch (chartError) {
             console.error("Error creating Chart.js instance:", chartError);
             if(radarModalMessage) radarModalMessage.textContent = '生成图表时出错，请检查控制台日志。';
             if(radarCanvas) radarCanvas.style.display = 'none';
             // 隐藏自定义图例
             const customLegend = radarModal.querySelector('.custom-chart-legend');
             if (customLegend) customLegend.style.display = 'none';
             if(radarModal && !radarModal.classList.contains('visible')) {
                 radarModal.classList.add('visible');
             }
             return;
        }

        // 如果图表创建成功，确保模态框可见
        if(radarModal && !radarModal.classList.contains('visible')) {
            radarModal.classList.add('visible');
        }
        console.log("Radar modal should be visible now with chart.");

        // 新增：强制图表重绘尺寸
        setTimeout(() => {
            if (emotionChartInstance) {
                emotionChartInstance.resize();
                console.log('Chart resize forced.');
            }
        }, 100); // 延迟执行确保模态框已渲染
    }

    // --- 新增：事件监听器 - 关闭雷达图模态框 ---
    function closeRadarModal() {
        if (radarModal) {
            // 修改：使用 classList 控制可见性
            // radarModal.style.display = 'none';
            radarModal.classList.remove('visible');
            console.log("Radar modal closed.");
        }
    }


    // --- 新增：绑定事件监听器 ---
    if (themeCard) themeCard.addEventListener('click', openDetailModal);
    if (emotionCard) emotionCard.addEventListener('click', openDetailModal);
    if (adviceCard) adviceCard.addEventListener('click', openDetailModal);
    if (detailModalCloseBtn) detailModalCloseBtn.addEventListener('click', closeDetailModal);
    // Close detail modal if clicking outside the content
    if (detailModal) {
        detailModal.addEventListener('click', (event) => {
            if (event.target === detailModal) { // Clicked on the overlay itself
                closeDetailModal();
            }
        });
    }

    if (emotionRadarCard) emotionRadarCard.addEventListener('click', openRadarModal);
    if (radarModalCloseBtn) radarModalCloseBtn.addEventListener('click', closeRadarModal);
    // Close radar modal if clicking outside the content
     if (radarModal) {
        radarModal.addEventListener('click', (event) => {
             if (event.target === radarModal) { // Clicked on the overlay itself
                 closeRadarModal();
            }
        });
    }


// ... existing code ... (e.g., bubble generation, if any)
// Make sure the rest of the script is preserved.
// Example: Bubble generation might start here

// 气泡生成代码 (如果 script.js 中有这部分，确保它在事件监听器之后)
// ... (rest of the bubble generation code, if applicable) ...

    // --- Midjourney API 相关代码开始 ---

    // --- Midjourney 变量和 API 配置 ---
    // const visualDreamBtn = document.querySelector('.visual-dream-btn'); // 注释掉重复声明，使用已有的
    // const imageLoading = document.querySelector('.image-loading'); // 注释掉重复声明
    // const generatedImage = document.querySelector('.generated-image'); // 注释掉重复声明
    // const MIDJOURNEY_API_KEY = 'sk-SzQWup7igqysKa0h796664F0D978409eAf34225b82050940'; // 注释掉重复声明
    // const MIDJOURNEY_API_URL = 'https://api.aiyiapi.com/mj-relax'; // 注释掉重复声明
    let imaginePollingInterval = null; // 这个可能是新的，保留
    let upscalePollingInterval = null; // 这个可能是新的，保留

    // --- Midjourney API 调用函数 ---
    async function generateDreamImage() {
        // 清除可能存在的旧轮询
        clearInterval(imaginePollingInterval);
        clearInterval(upscalePollingInterval);

        // 检查是否有梦境内容和分析结果 (依赖之前的 dreamAnalysisResult 和 currentDreamText)
        if (!currentDreamText || !dreamAnalysisResult) {
            alert('请先在第三页输入梦境并获取解析结果。');
            // 滚动到第三页 (假设 third-page ID 存在)
            const thirdPage = document.getElementById('third-page');
            if (thirdPage) {
                 thirdPage.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        // 显示加载状态并重置进度条
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        const errorCountEl = document.querySelector('.error-count');
        
        if (imageLoading) imageLoading.classList.add('active');
        if (generatedImage) {
        generatedImage.classList.remove('active');
        generatedImage.innerHTML = ''; // 清空之前的内容
        }
        if(progressBar) progressBar.style.width = '0%';
        if(progressText) progressText.textContent = '正在提交生成任务...';
        if(errorCountEl) errorCountEl.textContent = ''; // 清空错误计数

        // 构建基于梦境内容和分析结果的 prompt
        const emotionKeywords = extractEmotionKeywords(dreamAnalysisResult?.emotion_analysis || dreamAnalysisResult?.emotion_summary); // 尝试兼容旧字段

        const mjPrompt = `${currentDreamText}. Visual style: dreamy, surreal. Emotional tone: ${emotionKeywords}. --ar 1:1 --v 6.0`;
        console.log("Revised Midjourney Prompt:", mjPrompt);
        
        try {
            // 提交 /imagine 请求
            const imagineApiUrl = `${MIDJOURNEY_API_URL}/mj/submit/imagine`;
            const imagineRequestData = { prompt: mjPrompt };
            
            console.log("发送 Imagine 请求数据:", JSON.stringify(imagineRequestData));
            console.log("请求 Imagine URL:", imagineApiUrl);
            
            const imagineResponse = await fetch(imagineApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MIDJOURNEY_API_KEY}`
                },
                body: JSON.stringify(imagineRequestData)
            });

            const imagineResponseText = await imagineResponse.text();
            console.log("Imagine API 响应原始文本:", imagineResponseText);
            
            if (!imagineResponse.ok) {
                throw new Error(`Imagine API 请求失败 (${imagineResponse.status}): ${imagineResponseText}`);
            }

            let imagineResult;
            try {
                imagineResult = JSON.parse(imagineResponseText);
            } catch (parseError) {
                console.error("无法解析 Imagine API 响应为 JSON:", parseError);
                throw new Error(`Imagine API 返回非 JSON 数据: ${imagineResponseText.substring(0, 100)}...`);
            }
            
            if (imagineResult.code === 1 && imagineResult.result) {
                const imagineTaskId = imagineResult.result;
                console.log("Imagine 任务提交成功，任务 ID:", imagineTaskId);
                // 修改：调用增强的 updateProgressUI
                updateProgressUI('SUBMITTED', '任务已提交，等待生成...', 0, 'imagine');
                pollImagineTask(imagineTaskId); 
            } else {
                throw new Error(`Imagine API 错误: ${imagineResult.description || '未知错误'}`);
            }
            
        } catch (error) {
            console.error('提交 Imagine 任务时出错:', error);
            if (imageLoading) imageLoading.classList.remove('active');
            if (generatedImage) {
            generatedImage.innerHTML = `<div class="error-message">图像生成任务提交失败: ${error.message}</div>`;
            generatedImage.classList.add('active');
            }
        }
    }

    // 轮询 Imagine 任务状态
    async function pollImagineTask(taskId, attempt = 1) {
        const maxAttempts = 30; // 最多轮询 30 次 (约 2.5 分钟)
        const interval = 5000; // 每 5 秒轮询一次

        if (attempt > maxAttempts) {
            console.error("Imagine 任务轮询超时:", taskId);
            displayError("生成图片网格超时，请稍后重试。", taskId);
            clearInterval(imaginePollingInterval);
            return;
        }

        console.log(`轮询 Imagine 任务 (${attempt}/${maxAttempts}):`, taskId);

        imaginePollingInterval = setTimeout(async () => {
            try {
                const fetchUrl = `${MIDJOURNEY_API_URL}/mj/task/${taskId}/fetch`;
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${MIDJOURNEY_API_KEY}` }
                });
                const responseText = await response.text();
                
                if (!response.ok) {
                    console.warn(`轮询 Imagine 任务 ${taskId} 遇到错误 ${response.status}，将重试`);
                    pollImagineTask(taskId, attempt + 1); 
                    return;
                }
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error("解析 Imagine 轮询结果 JSON 失败:", responseText);
                    pollImagineTask(taskId, attempt + 1);
                    return;
                }

                console.log("Imagine 轮询结果:", result);

                const progress = result.progress ? parseInt(result.progress.replace('%', '')) : 0;
                // 修改：调用增强的 updateProgressUI，传递状态信息
                updateProgressUI(result.status, result.description, result.progress, 'imagine');

                if (result.status === "SUCCESS") {
                    console.log("Imagine 任务成功:", taskId);
                    let u1CustomId = null;
                    if (result.buttons && Array.isArray(result.buttons) && result.buttons.length > 0 && result.buttons[0].customId) {
                        u1CustomId = result.buttons[0].customId;
                        console.log("从 result.buttons[0].customId 提取到 U1 customId:", u1CustomId);
                    } else if (result.actions && Array.isArray(result.actions)) {
                        const u1Action = result.actions.find(action => action.label === 'U1');
                        if (u1Action && u1Action.customId) {
                            u1CustomId = u1Action.customId;
                            console.log("从 result.actions 中提取到 U1 customId:", u1CustomId);
                        }
                    }
                    
                    if (u1CustomId) {
                        updateProgressUI('正在生成图片网格 (0%)...', 0);
                        submitUpscaleTask(taskId, u1CustomId); 
                    } else {
                         console.error("Imagine 成功结果中未找到 U1 的 customId:", result);
                         displayError("无法获取放大图片所需的操作ID。", taskId, JSON.stringify(result));
                    }
                } else if (result.status === "FAILURE") {
                    console.error("Imagine 任务失败:", result.failReason);
                    displayError(`生成图片网格失败: ${result.failReason || '未知原因'}`, taskId);
                } else if (result.status === "IN_PROGRESS" || result.status === "SUBMITTED") {
                    pollImagineTask(taskId, attempt + 1);
                } else {
                     console.warn("未知的 Imagine 任务状态:", result.status);
                     pollImagineTask(taskId, attempt + 1);
                }
            } catch (error) {
                console.error('轮询 Imagine 任务时出错:', error);
                pollImagineTask(taskId, attempt + 1);
            }
        }, interval);
    }

    // 提交 Upscale 任务
    async function submitUpscaleTask(originalImagineTaskId, customId) { 
        console.log("准备提交 Upscale U1 任务, originalImagineTaskId:", originalImagineTaskId, "customId:", customId);
        try {
            const upscaleApiUrl = `${MIDJOURNEY_API_URL}/mj/submit/action`; 
            const upscaleRequestData = {
                customId: customId,
                taskId: originalImagineTaskId
            };

            console.log("发送 Upscale 请求数据:", JSON.stringify(upscaleRequestData));

            const upscaleResponse = await fetch(upscaleApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MIDJOURNEY_API_KEY}`
                },
                body: JSON.stringify(upscaleRequestData)
            });

            const upscaleResponseText = await upscaleResponse.text();
            console.log("Upscale API 响应原始文本:", upscaleResponseText);

             if (!upscaleResponse.ok) {
                throw new Error(`Upscale API 请求失败 (${upscaleResponse.status}): ${upscaleResponseText}`);
            }

            let upscaleResult;
            try {
                upscaleResult = JSON.parse(upscaleResponseText);
            } catch (e) {
                 throw new Error(`Upscale API 返回非 JSON 数据: ${upscaleResponseText.substring(0, 100)}...`);
            }

            if (upscaleResult.code === 1 && upscaleResult.result) {
                const upscaleTaskId = upscaleResult.result;
                console.log("Upscale 任务提交成功，任务 ID:", upscaleTaskId);
                // 修改：调用增强的 updateProgressUI
                updateProgressUI('SUBMITTED', '任务已提交，等待放大...', 0, 'upscale');
                pollUpscaleTask(upscaleTaskId);
            } else {
                throw new Error(`Upscale API 错误: ${upscaleResult.description || '未知错误'}`);
            }

        } catch (error) {
            console.error('提交 Upscale 任务时出错:', error);
            displayError(`提交图片放大任务失败: ${error.message}`);
        }
    }

    // 轮询 Upscale 任务状态
    async function pollUpscaleTask(taskId, attempt = 1) {
        const maxAttempts = 24; // 最多轮询 24 次 (约 2 分钟)
        const interval = 5000; // 每 5 秒轮询一次
        
        clearInterval(imaginePollingInterval);

        if (attempt > maxAttempts) {
            console.error("Upscale 任务轮询超时:", taskId);
            displayError("放大图片超时，请稍后重试。", taskId);
             clearInterval(upscalePollingInterval);
            return;
        }

        console.log(`轮询 Upscale 任务 (${attempt}/${maxAttempts}):`, taskId);

       upscalePollingInterval = setTimeout(async () => {
            try {
                const fetchUrl = `${MIDJOURNEY_API_URL}/mj/task/${taskId}/fetch`;
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${MIDJOURNEY_API_KEY}` }
                });
                 const responseText = await response.text();
                
                 if (!response.ok) {
                     console.warn(`轮询 Upscale 任务 ${taskId} 遇到错误 ${response.status}，将重试`);
                     pollUpscaleTask(taskId, attempt + 1);
                     return;
        }

        let result;
        try {
            result = JSON.parse(responseText);
                } catch (e) {
                    console.error("解析 Upscale 轮询结果 JSON 失败:", responseText);
                    pollUpscaleTask(taskId, attempt + 1);
                    return;
                }

                console.log("Upscale 轮询结果:", result);

                const progress = result.progress ? parseInt(result.progress.replace('%', '')) : 0;
                 // 修改：调用增强的 updateProgressUI，传递状态信息
                 updateProgressUI(result.status, result.description, result.progress, 'upscale');

                if (result.status === "SUCCESS") {
                     console.log("Upscale 任务成功，完整结果:", JSON.stringify(result, null, 2));
                    if (result.imageUrl) {
            handleSuccess(result.imageUrl);
                    } else {
                        console.error("Upscale 成功结果缺少 imageUrl:", result);
                        displayError("获取放大图片链接失败。", taskId, JSON.stringify(result));
                    }
        } else if (result.status === "FAILURE") {
                    console.error("Upscale 任务失败:", result.failReason);
                    displayError(`放大图片失败: ${result.failReason || '未知原因'}`, taskId);
                } else if (result.status === "IN_PROGRESS" || result.status === "SUBMITTED") {
                    pollUpscaleTask(taskId, attempt + 1);
        } else {
                     console.warn("未知的 Upscale 任务状态:", result.status);
                     pollUpscaleTask(taskId, attempt + 1); 
        }
    } catch (error) {
                console.error('轮询 Upscale 任务时出错:', error);
                pollUpscaleTask(taskId, attempt + 1);
            }
        }, interval);
    }
    
    // 统一更新进度UI (增强版)
    function updateProgressUI(status, description, progress, phase) {
         const progressBar = document.querySelector('.progress-bar');
         const progressText = document.querySelector('.progress-text');
        if (!progressText || !progressBar) return;

        let text = '';
        let percentage = progress ? parseInt(String(progress).replace('%', '')) : 0;

        // 默认总时间 (秒)
        const totalTimeImagine = 75;
        const totalTimeUpscale = 45;
        let estimatedTotalTime = (phase === 'imagine') ? totalTimeImagine : totalTimeUpscale;

        // 根据状态决定显示文本
        switch (status) {
            case 'SUBMITTED':
            case 'NOT_START':
                text = description || (phase === 'imagine' ? '任务已提交，等待生成...' : '任务已提交，等待放大...');
                if (description && description.includes('排队')) {
                    text = `排队中... (${description})`; // 显示排队信息
                }
                percentage = 0; // 排队或未开始时进度为0
                break;
            case 'IN_PROGRESS':
                const remainingTime = Math.max(0, Math.round(estimatedTotalTime * (1 - percentage / 100)));
                text = phase === 'imagine'
                    ? `正在生成图片网格 (${percentage}%)... 预计剩余 ${remainingTime} 秒`
                    : `正在放大图片 (${percentage}%)... 预计剩余 ${remainingTime} 秒`;
                break;
            case 'FAILURE':
                text = `任务失败: ${description || '未知原因'}`;
                percentage = 0; // 失败时重置进度条
                break;
            case 'SUCCESS':
                text = phase === 'imagine' ? '图片网格生成完毕' : '图片放大成功！';
                percentage = 100;
                break;
            default:
                // 处理未知状态或仅有描述的情况
                text = description ? `状态: ${status} (${description})` : `处理中 (${status})...`;
                // 如果有进度，还是显示进度
                if (progress) {
                     const remainingTimeDefault = Math.max(0, Math.round(estimatedTotalTime * (1 - percentage / 100)));
                     text += ` (${percentage}%) 预计剩余 ${remainingTimeDefault} 秒`;
                } else {
                    percentage = 0; // 未知状态无进度则为0
                }
        }

        progressText.textContent = text;
        progressBar.style.width = `${percentage}%`;
    }
    
    // --- 新增：统一显示错误信息 --- 
    function displayError(message, taskId = null, rawResponse = null) {
        clearInterval(imaginePollingInterval);
        clearInterval(upscalePollingInterval);
        
        if(imageLoading) imageLoading.classList.remove('active');
        let errorHtml = `<div class="error-message">${message}`;
        if (taskId) {
            // 添加重试按钮 (需要全局暴露 retryTask)
             errorHtml += `<br><button onclick="window.retryTask('${taskId}')" class="check-task-btn">重试任务</button>`;
        }
        if (rawResponse) {
            // 添加调试按钮 (需要全局暴露 showDebugInfo)
             errorHtml += `<button onclick="window.showDebugInfo('${taskId}', '${btoa(unescape(encodeURIComponent(rawResponse)))}')" class="check-task-btn debug-btn">调试信息</button>`;
        }
         errorHtml += `</div>`;
         if (generatedImage) {
        generatedImage.innerHTML = errorHtml;
        generatedImage.classList.add('active');
         }
    }
    
    // 暴露重试和调试函数到全局作用域
    window.retryTask = function(taskId) {
        console.log("尝试重试任务:", taskId);
         updateProgressUI('正在重试任务...', 0);
        if (imageLoading) imageLoading.classList.add('active');
        if (generatedImage) generatedImage.classList.remove('active');
        pollUpscaleTask(taskId); // 简化处理，直接重试 Upscale
    }
     window.showDebugInfo = function(taskId, base64Response) {
         try {
            const decodedResponse = decodeURIComponent(escape(atob(base64Response)));
             alert(`任务ID: ${taskId}\n原始响应: ${decodedResponse}`);
         } catch (e) {
              alert(`任务ID: ${taskId}\n无法解码响应内容。`);
         }
     }

    // 图片加载成功逻辑
function handleSuccess(originalUrl) {
        console.log("handleSuccess 接收到 originalUrl:", originalUrl);
        clearInterval(imaginePollingInterval);
        clearInterval(upscalePollingInterval);
        if (imageLoading) imageLoading.classList.remove('active');
        
        const proxyUrl = originalUrl.replace('https://cdn.discordapp.com/', 'https://mjcdn.znrpa.com/');
        console.log("处理后的 proxyUrl:", proxyUrl);
        
    const imgElement = createImageElement(proxyUrl, originalUrl);
        if (generatedImage) {
    generatedImage.innerHTML = '';
    generatedImage.appendChild(imgElement);
        // 添加"身临其境地入梦吧"按钮
        const immersiveBtn = document.createElement('button');
        immersiveBtn.className = 'immersive-btn';
        immersiveBtn.textContent = '身临其境地入梦吧';
            // ... (按钮样式和事件监听器)
        immersiveBtn.style.position = 'absolute';
        immersiveBtn.style.bottom = '20px';
        immersiveBtn.style.left = '50%';
        immersiveBtn.style.transform = 'translateX(-50%)';
        immersiveBtn.style.padding = '12px 24px';
        immersiveBtn.style.backgroundColor = '#ff4081';
        immersiveBtn.style.color = 'white';
        immersiveBtn.style.border = 'none';
        immersiveBtn.style.borderRadius = '30px';
        immersiveBtn.style.fontSize = '16px';
        immersiveBtn.style.fontWeight = 'bold';
        immersiveBtn.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        immersiveBtn.style.cursor = 'pointer';
        immersiveBtn.style.transition = 'all 0.3s ease';

        immersiveBtn.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#ff6699';
            this.style.transform = 'translateX(-50%) scale(1.05)';
        });
        immersiveBtn.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#ff4081';
            this.style.transform = 'translateX(-50%)';
        });
        immersiveBtn.addEventListener('click', function() {
            console.log("[按钮点击] 读取存储的梦境性质:", currentDreamNature);
            let videoFileName = '';
            if (currentDreamNature === 'good') {
                videoFileName = 'good_h264.mp4';
                } else {
                const badVideos = ['bad1_h264.mp4', 'bad2_h264.mp4', 'bad3_h264.mp4'];
                const randomIndex = Math.floor(Math.random() * badVideos.length);
                videoFileName = badVideos[randomIndex];
            }
            console.log("[按钮点击] 根据性质选择视频:", videoFileName);
            redirectTo360Video(videoFileName);
        });

        generatedImage.appendChild(immersiveBtn);
        generatedImage.classList.add('active'); 
        }
    }

    // 创建图片元素
function createImageElement(proxyUrl, originalUrl) {
    const imgElement = document.createElement('img');
    imgElement.alt = "AI 生成的梦境图像";
        imgElement.src = proxyUrl; 

    imgElement.onload = () => {
            console.log("图片加载成功:", imgElement.src); 
        };

        imgElement.onerror = (event) => {
            console.error("图片加载失败 (代理 URL):", proxyUrl, "错误事件:", event);
            console.log("尝试加载原始 URL:", originalUrl);
            imgElement.src = originalUrl;
            imgElement.onerror = (event2) => {
                console.error("图片加载失败 (原始 URL):", originalUrl, "错误事件:", event2);
                    if(generatedImage) {
                        generatedImage.innerHTML = `... [错误信息 HTML] ...`;
                        generatedImage.classList.add('active');
                    }
            };
    };
    return imgElement;
}

    // 提取情绪关键词
    function extractEmotionKeywords(emotionText) {
        const emotionMap = {
            '焦虑': 'anxiety, tension, worried, dark shadows', 
            '孤独': 'loneliness, isolation, solitude, empty space', 
            '压抑': 'depression, suppression, heaviness, muted colors', 
            '开心': 'happiness, joy, delight, bright light, vibrant colors', 
            '恐惧': 'fear, terror, dread, darkness, ominous figures', 
            '惊讶': 'surprise, amazement, wonder, wide eyes, glowing particles', 
            '平静': 'calm, serenity, peaceful, soft light, gentle breeze', 
            '愤怒': 'anger, rage, fury, storm clouds, intense red' 
        };
        let keywords = [];
        if (emotionText && typeof emotionText === 'string') {
        for (const [emotion, words] of Object.entries(emotionMap)) {
            if (emotionText.includes(emotion)) {
                keywords.push(words);
            }
        }
        }
        return keywords.length > 0 ? keywords.join(', ') : 'dreamlike, emotional atmosphere';
    }
    
    // 跳转到360视频 (确保此函数存在)
    function redirectTo360Video(videoFileName) {
        // 假设已存在或在此处定义
        const targetUrl = `http://localhost:8080/360video.html?video=${encodeURIComponent(videoFileName)}`;
        console.log("准备跳转到:", targetUrl);
        window.location.href = targetUrl;
    }

    // 绑定"可视梦境"按钮点击事件 (确保 visualDreamBtn 变量已在某处声明)
    const existingVisualDreamBtn = document.querySelector('.visual-dream-btn'); // 再次获取，确保存在
    if (existingVisualDreamBtn) {
        // 检查是否已有点击监听器，避免重复添加 (简单检查)
        if (!existingVisualDreamBtn.hasAttribute('data-mj-listener-added')) {
            existingVisualDreamBtn.addEventListener('click', () => {
                generateDreamImage(); // 点击按钮时调用生成函数
            });
            existingVisualDreamBtn.setAttribute('data-mj-listener-added', 'true'); // 标记已添加
            console.log('Midjourney listener added to visualDreamBtn.');
        } else {
             console.log('Midjourney listener already exists on visualDreamBtn.');
        }
    } else {
        console.error('Visual dream button (.visual-dream-btn) not found when trying to add Midjourney listener.');
            }

    // --- Midjourney API 相关代码结束 ---

    // 修改后的透明度变化逻辑
    function updatePageOpacity(direction) {
        if (direction === 'forward') {
            // 重置当前页的透明度
            setTimeout(() => {
                if (currentPage >= 0) {
                    const currentPageEl = pages[currentPage];
                    const nextPage = pages[currentPage + 1];
                    const nextBack = nextPage.querySelector('.page-back');
                    if (nextBack) {
                        nextBack.style.opacity = '1';
                    }
                }
                // 递归调用以保持透明度变化
                if (currentPage < pages.length - 1) {
                    updatePageOpacity('forward');
                }
            }, 1000);
        } else if (direction === 'backward') {
            // 重置前一页的透明度，为返回时做准备
            setTimeout(() => {
                if (currentPage > 0) {
                    const prevPage = pages[currentPage - 1];
                    const prevFront = prevPage.querySelector('.page-front');
                    if (prevFront) {
                        prevFront.style.opacity = '0';
                    }
                }
                // 递归调用以保持透明度变化
                if (currentPage > 0) {
                    updatePageOpacity('backward');
                }
            }, 1000);
        }
    }

}); // End of DOMContentLoaded listener

// 页面滚动动画：每个 .page 进入视口时添加 in-view 类，离开时移除
(function(){
  const pages = document.querySelectorAll('.page');
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      }else{
        entry.target.classList.remove('in-view');
      }
    });
  }, {
    threshold: 0.35
  });
  pages.forEach(page => observer.observe(page));
})();

window.onload = function() {
    const audio = document.getElementById('background-music');
    audio.muted = false; // 如果需要声音，确保取消静音
    audio.play().catch(error => {
        console.error("播放音乐失败:", error);
    });
};

