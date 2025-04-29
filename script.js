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
    function turnPageForward(e) { // 移除 pageIndex 参数
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
                // 不再直接设置opacity为0，保留当前页面可见性
                currentFront.style.transition = 'opacity 0.8s ease';
                // 降低不透明度但不完全隐藏
                currentFront.style.opacity = '0.99';
            }
        }

        // 翻转目标页面
        const pageToFlip = pages[nextPageIndex];
        pageToFlip.classList.add('flipped');
        pageToFlip.style.zIndex = '100'; // Temporarily raise z-index when flipped
        pageToFlip.classList.remove('return-flipped'); 
        currentPage = nextPageIndex;
        
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
                    prevFront.style.opacity = '1';
                }
            }
        }, 1000);
    }
    
    // 页面翻转逻辑 - 向后翻页
    function turnPageBackward(e) { // 移除 pageIndex 参数
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

    // --- New Elements for Dream Search ---
    const dreamInput = document.getElementById('dream-input');
    const searchButton = document.getElementById('search-btn');
    const searchContainer = document.querySelector('.search-container');
    const resultContainer = document.getElementById('result-container');
    const themeCardP = document.getElementById('card-theme')?.querySelector('p');
    const emotionCardP = document.getElementById('card-emotion')?.querySelector('p');
    const adviceCardP = document.getElementById('card-advice')?.querySelector('p');

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
    const DEEPSEEK_API_KEY = 'sk-db09379b2da749ac80747244ba3e127c'; // DeepSeek API 密钥
    const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'; // DeepSeek API URL
    
    const MIDJOURNEY_API_KEY = 'sk-SzQWup7igqysKa0h796664F0D978409eAf34225b82050940'; // Midjourney API 密钥
    const MIDJOURNEY_API_URL = 'https://api.aiyiapi.com/mj-relax'; // 不包含模式后缀
    
    // 存储梦境内容和分析结果
    let currentDreamText = '';
    let dreamAnalysisResult = null;
    let currentDreamNature = 'bad'; // 存储梦境性质 ("good" or "bad"), 默认为 bad

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
        dreamAnalysisResult = null;
        currentDreamNature = 'bad';

        // --- Show Loading State Immediately --- 
        searchButton.disabled = true; // Disable button during request
        searchButton.style.opacity = '0.7';
        searchContainer.classList.add('search-container-shifted'); // Move search up now
        resultContainer.classList.add('result-cards-visible'); // Show container now

        themeCardP.textContent = '正在解读中...'; // Show loading in first card
        emotionCardP.textContent = '...'; // Indicate loading in other cards
        adviceCardP.textContent = '...'; // Indicate loading in other cards

        // --- 再次确认 Prompt，确保清晰要求 dream_nature --- 
        const prompt = `
        请帮我解梦，我的梦境是："${dreamText}"
        请根据梦境内容，分析并生成以下四项信息，并严格按照JSON格式返回，key分别为 theme_summary, emotion_analysis, healing_advice, dream_nature:
        1.  潜意识主题 (theme_summary): 对梦境映射的潜意识主题进行分析，并用一句话精准总结梦境摘要。
        2.  情绪分析 (emotion_analysis): 分析梦境中可能蕴含的主要情绪（例如：焦虑、孤独、压抑、开心等）。
        3.  疗愈建议 (healing_advice): 给出简单的建议和疗愈方向（例如：一句安慰或温柔提醒）。
        4.  梦境性质 (dream_nature): 根据心理学角度，判断这个梦是积极/治愈类的"好梦"，还是消极/有压力的"噩梦"。请严格只返回单词 "good" 或 "bad"。

        返回的JSON格式示例：
        {
          "theme_summary": "梦境暗示了对考试的焦虑，核心内容是在考场迷路。",
          "emotion_analysis": "梦境中可能体现的主要情绪是焦虑和迷茫。",
          "healing_advice": "尝试考前放松，给自己积极的心理暗示。",
          "dream_nature": "bad"
        }
        `;

        try {
            console.log("发送解梦及性质分析请求给 DeepSeek");
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
                    // 移除 max_tokens 限制，确保完整 JSON 返回
                })
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 console.error("DeepSeek 解梦 API 错误响应文本:", errorText);
                throw new Error(`DeepSeek解梦API错误 (${response.status}): ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            console.log("DeepSeek 解梦响应数据:", JSON.stringify(data, null, 2));

            let analysisResult = null;
            if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                let content = data.choices[0].message.content.trim();
                // --- JSON 清理 --- 
                if (content.startsWith("```json")) { content = content.substring(7); }
                if (content.endsWith("```")) { content = content.substring(0, content.length - 3); }
                content = content.trim();
                
                try {
                    analysisResult = JSON.parse(content);
                    dreamAnalysisResult = analysisResult; // 保存完整分析结果
                    
                    // --- 严格检查并存储 dream_nature --- 
                    if (analysisResult.dream_nature && typeof analysisResult.dream_nature === 'string') {
                        const nature = analysisResult.dream_nature.trim().toLowerCase();
                        if (nature === 'good') {
                            currentDreamNature = 'good';
                        } else if (nature === 'bad') {
                            currentDreamNature = 'bad';
                        } else {
                            console.warn(`DeepSeek 返回的 dream_nature 值 "${nature}" 不是 'good' 或 'bad'，默认为 bad`);
                            currentDreamNature = 'bad';
                        }
                    } else {
                        console.warn("DeepSeek 返回结果中 dream_nature 字段无效或缺失，默认为 bad");
                        currentDreamNature = 'bad'; // 缺失也默认为 bad
                    }
                    console.log("存储的梦境性质:", currentDreamNature);
                    // --- 结束检查 --- 

                } catch (parseError) {
                    console.error("解析 DeepSeek 解梦 JSON 失败:", parseError);
                    console.error("原始 content:", content);
                    themeCardP.textContent = '解析失败';
                    emotionCardP.textContent = '无法读取模型返回结果。';
                    adviceCardP.textContent = '';
                    currentDreamNature = 'bad'; // 解析失败也默认为 bad
                }
            } else {
                console.error('DeepSeek 响应格式不正确，缺少 choices 或 content。');
                 themeCardP.textContent = '无有效回复';
                 emotionCardP.textContent = ''; adviceCardP.textContent = '';
                 currentDreamNature = 'bad'; // 响应格式错误也默认为 bad
            }

            // --- Update UI (只更新解梦文本) --- 
            if (dreamAnalysisResult && dreamAnalysisResult.theme_summary && dreamAnalysisResult.emotion_analysis && dreamAnalysisResult.healing_advice) {
                themeCardP.textContent = dreamAnalysisResult.theme_summary;
                emotionCardP.textContent = dreamAnalysisResult.emotion_analysis;
                adviceCardP.textContent = dreamAnalysisResult.healing_advice;
            } else {
                 // 如果上面已经处理过错误，这里可能不需要再次设置
                 if (!themeCardP.textContent) themeCardP.textContent = '信息不完整';
                 if (!emotionCardP.textContent) emotionCardP.textContent = '';
                 if (!adviceCardP.textContent) adviceCardP.textContent = '';
            }
            resultContainer.classList.add('result-cards-visible');
            searchContainer.classList.add('search-container-shifted');

        } catch (error) {
            console.error('请求 DeepSeek 解梦出错:', error);
            themeCardP.textContent = '解梦失败';
            emotionCardP.textContent = `错误: ${error.message}`; 
            adviceCardP.textContent = '请检查网络或API密钥。';
            resultContainer.classList.add('result-cards-visible');
            searchContainer.classList.add('search-container-shifted');
            currentDreamNature = 'bad'; // 出错也默认为 bad
        } finally {
             searchButton.disabled = false;
            searchButton.style.opacity = '1';
        }
    }

    // --- Midjourney API 调用函数 ---
    let imaginePollingInterval = null;
    let upscalePollingInterval = null;

    async function generateDreamImage() {
        // 清除可能存在的旧轮询
        clearInterval(imaginePollingInterval);
        clearInterval(upscalePollingInterval);

        // 检查是否有梦境内容和分析结果
        if (!currentDreamText || !dreamAnalysisResult) {
            alert('请先在第三页输入梦境并获取解析结果。');
            // 滚动到第三页
            document.getElementById('third-page').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // --- 更新：显示加载状态并重置进度条 --- 
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        const errorCountEl = document.querySelector('.error-count');
        
        imageLoading.classList.add('active');
        generatedImage.classList.remove('active');
        generatedImage.innerHTML = ''; // 清空之前的内容
        if(progressBar) progressBar.style.width = '0%';
        if(progressText) progressText.textContent = '正在提交生成任务...';
        if(errorCountEl) errorCountEl.textContent = ''; // 清空错误计数
        // --- 结束更新 --- 

        // 构建基于梦境内容和分析结果的 prompt
        const emotionKeywords = extractEmotionKeywords(dreamAnalysisResult?.emotion_analysis); // Use optional chaining

        // --- 再次修改 Prompt 结构 --- 
        // 结构：[原始梦境文本]。 视觉风格提示：梦幻，超现实。 情绪基调：[提取的情绪关键词]。
        const mjPrompt = `${currentDreamText}. Visual style: dreamy, surreal. Emotional tone: ${emotionKeywords}. --ar 1:1 --v 6.0`;
        // 移除了 themeKeywords 和笼统的 "Dreamlike atmosphere, magical surreal world"
        // --- 结束 Prompt 修改 ---
        
        console.log("Revised Midjourney Prompt:", mjPrompt);
        
        try {
            // --- 修改：提交 /imagine 请求 --- 
            const imagineApiUrl = `${MIDJOURNEY_API_URL}/mj/submit/imagine`;
            const imagineRequestData = { prompt: mjPrompt }; // 不再需要 grid: false
            
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
                // --- 修改：开始自动轮询 Imagine 任务 --- 
                updateProgressUI('正在生成图片网格 (0%)...', 0);
                pollImagineTask(imagineTaskId); 
            } else {
                throw new Error(`Imagine API 错误: ${imagineResult.description || '未知错误'}`);
            }
            // --- 结束修改 --- 
            
        } catch (error) {
            console.error('提交 Imagine 任务时出错:', error);
            imageLoading.classList.remove('active');
            generatedImage.innerHTML = `<div class="error-message">图像生成任务提交失败: ${error.message}</div>`;
            generatedImage.classList.add('active');
        }
    }

    // --- 新增：轮询 Imagine 任务状态 --- 
    async function pollImagineTask(taskId, attempt = 1) {
        const maxAttempts = 30; // 最多轮询 30 次 (约 2.5 分钟)
        const interval = 5000; // 每 5 秒轮询一次

        if (attempt > maxAttempts) {
            console.error("Imagine 任务轮询超时:", taskId);
            displayError("生成图片网格超时，请稍后重试。", taskId);
            clearInterval(imaginePollingInterval); // 确保清除定时器
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
                     // 如果遇到404或其他错误，可能任务还没准备好，稍后重试
                    console.warn(`轮询 Imagine 任务 ${taskId} 遇到错误 ${response.status}，将重试`);
                    pollImagineTask(taskId, attempt + 1); 
                    return;
                }
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error("解析 Imagine 轮询结果 JSON 失败:", responseText);
                    pollImagineTask(taskId, attempt + 1); // 解析失败也重试
                    return;
                }

                console.log("Imagine 轮询结果:", result);

                const progress = result.progress ? parseInt(result.progress.replace('%', '')) : 0;
                const estimatedTotalTime = 75; // 假设 Imagine 平均需要 75 秒
                const remainingTime = Math.max(0, Math.round(estimatedTotalTime * (1 - progress / 100)));
                updateProgressUI(`正在生成图片网格 (${result.progress || '0%'})... 预计剩余 ${remainingTime} 秒`, progress);

                if (result.status === "SUCCESS") {
                    console.log("Imagine 任务成功:", taskId);
                    // --- 修改：提取 U1 的 customId --- 
                    let u1CustomId = null;
                    // 尝试从常见的字段中查找 customId，您可能需要根据 API 的实际返回调整
                    if (result.buttons && Array.isArray(result.buttons) && result.buttons.length > 0 && result.buttons[0].customId) {
                        // 假设 U1 是第一个按钮
                        u1CustomId = result.buttons[0].customId;
                        console.log("从 result.buttons[0].customId 提取到 U1 customId:", u1CustomId);
                    } else if (result.actions && Array.isArray(result.actions)) {
                        // 或者在 actions 数组中查找 label 为 U1 或类似的
                        const u1Action = result.actions.find(action => action.label === 'U1');
                        if (u1Action && u1Action.customId) {
                            u1CustomId = u1Action.customId;
                            console.log("从 result.actions 中提取到 U1 customId:", u1CustomId);
                        }
                    } // 可以根据需要添加更多查找逻辑
                    
                    if (u1CustomId) {
                        updateProgressUI('图片网格生成完毕，准备放大...', 100);
                        // --- 修改：传递 customId 给 submitUpscaleTask ---
                        submitUpscaleTask(taskId, u1CustomId); 
                    } else {
                         console.error("Imagine 成功结果中未找到 U1 的 customId:", result);
                         displayError("无法获取放大图片所需的操作ID。", taskId, JSON.stringify(result));
                    }
                    // --- 结束修改 ---
                } else if (result.status === "FAILURE") {
                    console.error("Imagine 任务失败:", result.failReason);
                    displayError(`生成图片网格失败: ${result.failReason || '未知原因'}`, taskId);
                } else if (result.status === "IN_PROGRESS" || result.status === "SUBMITTED") {
                    // 继续轮询
                    pollImagineTask(taskId, attempt + 1);
                } else {
                     console.warn("未知的 Imagine 任务状态:", result.status);
                     pollImagineTask(taskId, attempt + 1); // 未知状态也继续尝试
                }
            } catch (error) {
                console.error('轮询 Imagine 任务时出错:', error);
                // 网络错误等也重试
                pollImagineTask(taskId, attempt + 1);
            }
        }, interval);
    }

    // --- 新增：提交 Upscale 任务 --- 
    // --- 修改：参数改为 taskId 和 customId ---
    async function submitUpscaleTask(originalImagineTaskId, customId) { 
        console.log("准备提交 Upscale U1 任务, originalImagineTaskId:", originalImagineTaskId, "customId:", customId);
        try {
            const upscaleApiUrl = `${MIDJOURNEY_API_URL}/mj/submit/action`; 
            const upscaleRequestData = {
                customId: customId, // --- 修改：使用 customId --- 
                taskId: originalImagineTaskId // 保留 taskId 以防万一
                // 不再需要 action, index, messageId, messageHash，因为 customId 通常包含了这些信息
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
                updateProgressUI('正在放大图片 (0%)...', 0);
                pollUpscaleTask(upscaleTaskId);
            } else {
                throw new Error(`Upscale API 错误: ${upscaleResult.description || '未知错误'}`);
            }

        } catch (error) {
            console.error('提交 Upscale 任务时出错:', error);
            displayError(`提交图片放大任务失败: ${error.message}`);
        }
    }

     // --- 新增：轮询 Upscale 任务状态 --- 
    async function pollUpscaleTask(taskId, attempt = 1) {
        const maxAttempts = 24; // 最多轮询 24 次 (约 2 分钟)
        const interval = 5000; // 每 5 秒轮询一次
        
        // 清除 Imagine 轮询（如果还在运行）
        clearInterval(imaginePollingInterval);

        if (attempt > maxAttempts) {
            console.error("Upscale 任务轮询超时:", taskId);
            displayError("放大图片超时，请稍后重试。", taskId);
             clearInterval(upscalePollingInterval); // 确保清除定时器
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
                const estimatedTotalTime = 45; // 假设 Upscale 平均需要 45 秒
                const remainingTime = Math.max(0, Math.round(estimatedTotalTime * (1 - progress / 100)));
                updateProgressUI(`正在放大图片 (${result.progress || '0%'})... 预计剩余 ${remainingTime} 秒`, progress);

                if (result.status === "SUCCESS") {
                    console.log("Upscale 任务成功，完整结果:", JSON.stringify(result, null, 2)); // 详细打印成功结果
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
    
    // --- 修改：移除手动检查逻辑 --- 
    // async function checkTaskResult(taskId) { ... } 
    
    // --- 新增：统一更新进度UI --- 
    function updateProgressUI(text, percentage) {
         const progressBar = document.querySelector('.progress-bar');
         const progressText = document.querySelector('.progress-text');
         if (progressText) progressText.textContent = text;
         if (progressBar) progressBar.style.width = `${percentage}%`;
    }
    
    // --- 新增：统一显示错误信息 --- 
    function displayError(message, taskId = null, rawResponse = null) {
        clearInterval(imaginePollingInterval); // 停止所有轮询
        clearInterval(upscalePollingInterval);
        
        imageLoading.classList.remove('active');
        let errorHtml = `<div class="error-message">${message}`;
        if (taskId) {
            errorHtml += `<br><button onclick="retryTask('${taskId}')" class="check-task-btn">重试任务</button>`; // 添加重试按钮
        }
        if (rawResponse) {
             errorHtml += `<button onclick="showDebugInfo('${taskId}', '${btoa(rawResponse)}')" class="check-task-btn debug-btn">调试信息</button>`; // 添加调试按钮
        }
         errorHtml += `</div>`;
        generatedImage.innerHTML = errorHtml;
        generatedImage.classList.add('active');
    }
    
    // --- 新增：重试任务函数 (暴露到全局供按钮调用) --- 
    window.retryTask = function(taskId) {
        console.log("尝试重试任务:", taskId);
        // 简单的处理：假设重试按钮总是针对最后失败的 Upscale 任务
        // 更完善的方案需要存储任务类型或从 taskId 解析
         updateProgressUI('正在重试任务...', 0);
         imageLoading.classList.add('active');
         generatedImage.classList.remove('active');
         pollUpscaleTask(taskId); // 简化处理，直接重试 Upscale 轮询
    }
    
     // --- 新增：显示调试信息函数 (暴露到全局供按钮调用) --- 
     window.showDebugInfo = function(taskId, base64Response) {
         try {
             const decodedResponse = atob(base64Response);
             alert(`任务ID: ${taskId}\n原始响应: ${decodedResponse}`);
         } catch (e) {
              alert(`任务ID: ${taskId}\n无法解码响应内容。`);
         }
     }

    // 封装图片加载成功逻辑 (基本不变，由 pollUpscaleTask 调用)
function handleSuccess(originalUrl) {
        console.log("handleSuccess 接收到 originalUrl:", originalUrl); // 打印原始 URL
        clearInterval(imaginePollingInterval);
        clearInterval(upscalePollingInterval);
        imageLoading.classList.remove('active');
        
        const proxyUrl = originalUrl.replace('https://cdn.discordapp.com/', 'https://mjcdn.znrpa.com/'); // 假设代理仍然需要
        console.log("处理后的 proxyUrl:", proxyUrl); // 打印代理 URL
        
    const imgElement = createImageElement(proxyUrl, originalUrl);
    generatedImage.innerHTML = '';
    generatedImage.appendChild(imgElement);
        
        // 添加"身临其境地入梦吧"按钮
        const immersiveBtn = document.createElement('button');
        immersiveBtn.className = 'immersive-btn';
        immersiveBtn.textContent = '身临其境地入梦吧';
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
            // 直接使用存储的 currentDreamNature
            console.log("[按钮点击] 读取存储的梦境性质:", currentDreamNature);
            let videoFileName = '';
            if (currentDreamNature === 'good') {
                videoFileName = 'good_h264.mp4';
            } else { // 默认为 bad 或明确为 bad
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

// 封装图片元素创建逻辑
function createImageElement(proxyUrl, originalUrl) {
    const imgElement = document.createElement('img');
    imgElement.alt = "AI 生成的梦境图像";
        // 优先尝试加载代理 URL
        imgElement.src = proxyUrl; 

    imgElement.onload = () => {
            console.log("图片加载成功:", imgElement.src); 
            // 成功加载后不需要做额外操作，因为已添加到 DOM
        };

        imgElement.onerror = (event) => {
            // 代理 URL 加载失败
            console.error("图片加载失败 (代理 URL):", proxyUrl, "错误事件:", event);
            // 尝试加载原始 URL
            console.log("尝试加载原始 URL:", originalUrl);
            imgElement.src = originalUrl;
            imgElement.onerror = (event2) => {
                // 原始 URL 也加载失败
                console.error("图片加载失败 (原始 URL):", originalUrl, "错误事件:", event2);
        generatedImage.innerHTML = `
            <div class="error-message">
                图片加载失败<br>
                        请检查网络连接或稍后再试。<br>
                        <span style="font-size: 12px;">代理链接 (尝试过): <a href="${proxyUrl}" target="_blank">${proxyUrl}</a></span><br>
                        <span style="font-size: 12px;">原始链接 (尝试过): <a href="${originalUrl}" target="_blank">${originalUrl}</a></span>
            </div>
        `;
                generatedImage.classList.add('active'); // 确保错误消息可见
            };
    };

    return imgElement;
}

    // ... (analyzeDreamAndRedirect, redirectTo360Video, handleProgress, createImageElement, extractEmotionKeywords, extractThemeKeywords 等函数保持不变) ...
    // --- 修改：移除 handleProgress 中的手动按钮添加逻辑 --- 
    function handleProgress(taskId, progress) { // taskId 可能不再需要，因为现在是自动轮询
        const estimatedTotalTimeImagine = 75; // 假设 Imagine 平均需要 75 秒
        const estimatedTotalTimeUpscale = 45; // 假设 Upscale 平均需要 45 秒
        // 需要判断当前是哪个阶段来选择总时间，或者只显示百分比
        updateProgressUI(`图片生成中 (${progress}%)...`, progress);
        // 不再添加 "再次检查" 按钮
    }
    
    // ... (其他代码保持不变) ...

    // --- 修改：优化情绪关键词提取 ---
    function extractEmotionKeywords(emotionText) {
        // 尝试加入更视觉化的词语
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
        if (emotionText && typeof emotionText === 'string') { // 增加检查
        for (const [emotion, words] of Object.entries(emotionMap)) {
            if (emotionText.includes(emotion)) {
                keywords.push(words);
            }
        }
        }
        
        // 如果没有匹配到，返回通用描述
        return keywords.length > 0 ? keywords.join(', ') : 'dreamlike, emotional atmosphere';
    }
    
    // --- 修改：移除 themeKeywords 的提取，因为它之前直接返回全文 --- 
    // function extractThemeKeywords(themeText) {
    //     return themeText; 
    // }

    // 监听 .sec_page 下的动画元素
    const secPage = document.querySelector('.sec_page');
    if (secPage) {
        const animatedEls = secPage.querySelectorAll('.sec-slogan, .sec-title, .sec-txt, .sec-hudie, .sec-img');
        animatedEls.forEach(el => {
            el.classList.add('scroll-animate'); // 初始隐藏
            observer.observe(el);
        });
    }

    // 绑定搜索按钮点击事件
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const dreamText = dreamInput.value.trim();
            if (dreamText) {
                fetchDreamAnalysis(dreamText);
            } else {
                // Maybe provide feedback if input is empty?
                alert('请输入你的梦境内容。');
            }
        });
    }

    // 允许在输入框中按 Enter 键触发搜索
    if (dreamInput) {
        dreamInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // 防止可能的表单提交
                searchButton.click(); // 触发按钮点击
            }
        });
    }
    
    // 绑定"可视梦境"按钮点击事件
    if (visualDreamBtn) {
        visualDreamBtn.addEventListener('click', () => {
            generateDreamImage();
        });
    }

    // --- 第二页滑动提示在鼠标滑过时消失 ---
    const newSecondPage = document.getElementById('new-second-page');
    const scrollPrompt = document.querySelector('.scroll-prompt');

    if (newSecondPage && scrollPrompt) {
        newSecondPage.addEventListener('mouseenter', () => {
            scrollPrompt.style.opacity = '0'; // 隐藏滑动提示
        });

        newSecondPage.addEventListener('mouseleave', () => {
            scrollPrompt.style.opacity = '1'; // 显示滑动提示
        });
    }

    // --- 小游戏入口处理 ---
    const game1Entry = document.getElementById('game1-entry');
    const game2Entry = document.getElementById('game2-entry');
    const game3Entry = document.getElementById('game3-entry');

    // 游戏1入口点击事件
    if (game1Entry) {
        game1Entry.addEventListener('click', () => {
            console.log("跳转到游戏1：小女孩的房间");
            window.location.href = 'game1.html';
        });
        // 添加鼠标悬停效果
        game1Entry.addEventListener('mouseenter', () => {
            game1Entry.style.transform = 'scale(1.1)';
        });
        game1Entry.addEventListener('mouseleave', () => {
            game1Entry.style.transform = 'scale(1)';
        });
    }

    // 游戏2入口点击事件 (预留)
    if (game2Entry) {
        game2Entry.addEventListener('click', () => {
            console.log("跳转到游戏2：樱花的世界");
            window.location.href = 'game2.html';
        });
        // 添加鼠标悬停效果
        game2Entry.addEventListener('mouseenter', () => {
            game2Entry.style.transform = 'scale(1.1)';
        });
        game2Entry.addEventListener('mouseleave', () => {
            game2Entry.style.transform = 'scale(1)';
        });
    }

    // 游戏3入口点击事件 (预留)
    if (game3Entry) {
        game3Entry.addEventListener('click', () => {
            console.log("跳转到游戏3：糖果的天地");
            window.location.href = 'game3.html';
        });
        // 添加鼠标悬停效果
        game3Entry.addEventListener('mouseenter', () => {
            game3Entry.style.transform = 'scale(1.1)';
        });
        game3Entry.addEventListener('mouseleave', () => {
            game3Entry.style.transform = 'scale(1)';
        });
    }

    // --- 新增/恢复：跳转到360°视频 --- 
    function redirectTo360Video(videoFileName) {
        const targetUrl = `http://localhost:8080/360video.html?video=${encodeURIComponent(videoFileName)}`;
        console.log("准备跳转到:", targetUrl);
        window.location.href = targetUrl;
    }
});
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