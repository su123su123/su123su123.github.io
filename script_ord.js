document.addEventListener('DOMContentLoaded', () => {
    // --- 开场动画处理 ---
    const introContainer = document.getElementById('intro-container');
    const introVideo = document.getElementById('intro-video');
    const introOverlay = document.getElementById('intro-overlay');
    const pageScrollContainer = document.querySelector('.page-scroll-container');
    
    // 初始时隐藏主内容容器
    if (pageScrollContainer) {
        pageScrollContainer.style.display = 'none';
    }
    
    // 视频结束时显示点击提示
    introVideo.addEventListener('ended', () => {
        introContainer.classList.add('video-ended');
    });
    
    // 处理点击事件
    introOverlay.addEventListener('click', (e) => {
        // 创建点击闪光效果
        const flashEffect = document.createElement('div');
        flashEffect.className = 'click-flash';
        flashEffect.style.left = e.clientX + 'px';
        flashEffect.style.top = e.clientY + 'px';
        document.body.appendChild(flashEffect);
        
        // 隐藏开场动画
        introContainer.classList.remove('intro-active');
        introContainer.classList.add('intro-hidden');
        
        // 显示主内容
        if (pageScrollContainer) {
            pageScrollContainer.style.display = 'block';
        }
        
        // 动画完成后移除闪光元素
        setTimeout(() => {
            if (flashEffect.parentNode) {
                flashEffect.parentNode.removeChild(flashEffect);
            }
            // 完全移除开场动画元素
            setTimeout(() => {
                if (introContainer.parentNode) {
                    introContainer.parentNode.removeChild(introContainer);
                }
            }, 1500);
        }, 800);
    });
    
    // 也允许点击视频本身以跳过开场动画
    introVideo.addEventListener('click', () => {
        if (!introContainer.classList.contains('video-ended')) {
            introVideo.currentTime = introVideo.duration;
        }
    });

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
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => observer.observe(page));
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

        // --- Show Loading State Immediately --- 
        searchButton.disabled = true; // Disable button during request
        searchButton.style.opacity = '0.7';
        searchContainer.classList.add('search-container-shifted'); // Move search up now
        resultContainer.classList.add('result-cards-visible'); // Show container now

        themeCardP.textContent = '正在解读中...'; // Show loading in first card
        emotionCardP.textContent = '...'; // Indicate loading in other cards
        adviceCardP.textContent = '...'; // Indicate loading in other cards

        // --- End Loading State ---

        // Construct the prompt for DeepSeek
        const prompt = `
        请帮我解梦，我的梦境是："${dreamText}"。
        请根据梦境内容，分析并生成以下三项信息，并严格按照JSON格式返回，key分别为 theme_summary, emotion_analysis, healing_advice:
        1.  **潜意识主题 (theme_summary)**: 指出梦境映射的潜意识主题，并用一句话精准总结梦境摘要。
        2.  **情绪分析 (emotion_analysis)**: 分析梦境中可能蕴含的主要情绪（例如：焦虑、孤独、压抑、开心等）。
        3.  **疗愈建议 (healing_advice)**: 给出简单的建议和疗愈方向（例如：一句安慰或温柔提醒）。

        返回的JSON格式示例：
        {
          "theme_summary": "梦境暗示了对[潜意识主题]的关注，核心内容是[一句话总结]",
          "emotion_analysis": "梦境中可能体现的主要情绪是[情绪]",
          "healing_advice": "[一句安慰或温柔提醒]"
        }
        `;

        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat', // Changed model back to recommended 'deepseek-chat'
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    stream: false // We want the full response, not streaming
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();

            // --- Safely extract the content ---
            let analysisResult = null;
            if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                let content = data.choices[0].message.content.trim();

                // --- Added: Clean the content to remove markdown fences --- 
                if (content.startsWith("```json")) {
                    content = content.substring(7); // Remove ```json
                }
                if (content.endsWith("```")) {
                    content = content.substring(0, content.length - 3); // Remove ```
                }
                content = content.trim(); // Trim again just in case
                // --- End of cleaning ---

                // Try to parse the cleaned content as JSON
                try {
                    analysisResult = JSON.parse(content);
                    // 保存分析结果，以便在生成图像时使用
                    dreamAnalysisResult = analysisResult;
                } catch (parseError) {
                    console.error("Failed to parse API response JSON:", parseError);
                    console.error("Raw content:", content);
                    // Fallback: Try to display raw content if JSON parsing fails
                    themeCardP.textContent = '解析失败';
                    emotionCardP.textContent = content.substring(0, 100) + '...'; // Show partial raw response
                    adviceCardP.textContent = '';
                    throw new Error('无法解析模型返回的JSON数据。');
                }
            } else {
                throw new Error('API response format is unexpected.');
            }

            // --- Update UI with results ---
            if (analysisResult && analysisResult.theme_summary && analysisResult.emotion_analysis && analysisResult.healing_advice) {
                themeCardP.textContent = analysisResult.theme_summary;
                emotionCardP.textContent = analysisResult.emotion_analysis;
                adviceCardP.textContent = analysisResult.healing_advice;
            } else {
                // Handle cases where the JSON structure is wrong even if parsed
                themeCardP.textContent = '解析错误'; // Keep it short
                emotionCardP.textContent = '返回格式不符';
                adviceCardP.textContent = ''; 
                throw new Error('模型返回的JSON缺少必要的字段。');
            }

            // resultContainer.classList.add('result-cards-visible'); // Already visible
            // searchContainer.classList.add('search-container-shifted'); // Already shifted

        } catch (error) {
            console.error('Error fetching dream analysis:', error);
            themeCardP.textContent = '解梦失败';
            emotionCardP.textContent = `错误: ${error.message}`; // Display error message
            adviceCardP.textContent = '请稍后再试。';
            // resultContainer.classList.add('result-cards-visible'); // Already visible
            // searchContainer.classList.add('search-container-shifted'); // Already shifted
        } finally {
            searchButton.disabled = false; // Re-enable button
            searchButton.style.opacity = '1';
        }
    }

    // --- Midjourney API 调用函数 ---
    async function generateDreamImage() {
        // 检查是否有梦境内容和分析结果
        if (!currentDreamText || !dreamAnalysisResult) {
            alert('请先在第三页输入梦境并获取解析结果。');
            // 滚动到第三页
            document.getElementById('third-page').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // 显示加载中状态
        imageLoading.classList.add('active');
        generatedImage.classList.remove('active');
        generatedImage.innerHTML = ''; // 清空之前的内容

        // 构建基于梦境内容和分析结果的 prompt
        const emotionKeywords = extractEmotionKeywords(dreamAnalysisResult.emotion_analysis);
        const themeKeywords = extractThemeKeywords(dreamAnalysisResult.theme_summary);
        
        // 构建完整的 prompt
        const mjPrompt = `${currentDreamText}. ${themeKeywords}. ${emotionKeywords}. Dreamlike atmosphere, magical surreal world --ar 1:1 --v 7.0`;
        
        console.log("Midjourney Prompt:", mjPrompt);
        
        try {
            // 使用正确的API端点
            const apiUrl = `${MIDJOURNEY_API_URL}/mj/submit/imagine`;
            
            // 简化请求数据
            const requestData = {
                prompt: mjPrompt
            };
            
            console.log("发送请求数据:", JSON.stringify(requestData));
            console.log("请求 URL:", apiUrl);
            
            // 调用 Midjourney API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MIDJOURNEY_API_KEY}`
                },
                body: JSON.stringify(requestData)
            });

            // 记录响应状态和头信息
            console.log("API 响应状态:", response.status, response.statusText);
            
            // 获取原始响应文本以便调试
            const responseText = await response.text();
            console.log("API 响应原始文本:", responseText);
            
            if (responseText.trim() === '' || responseText.includes('<!DOCTYPE html>')) {
                throw new Error('API 返回了空数据或 HTML 错误页面');
            }
            
            // 尝试解析为 JSON
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error("无法解析 API 响应为 JSON:", parseError);
                throw new Error(`API 返回非 JSON 数据: ${responseText.substring(0, 100)}...`);
            }

            // 隐藏加载状态
            imageLoading.classList.remove('active');
            
            // 根据新的响应格式，正确提取任务 ID
            if (result.code === 1 && result.result) {
                // 直接使用 result 字段作为任务 ID
                const taskId = result.result;
                
                console.log("提交成功，任务 ID:", taskId);
                
                // 显示任务已提交的消息
                generatedImage.innerHTML = `
                    <div class="info-message">
                        图片生成任务已提交，任务 ID: ${taskId}<br>
                        请稍候，图片生成中...<br><br>
                        <button id="check-task-btn" class="check-task-btn">查看结果</button>
                    </div>
                `;
                generatedImage.classList.add('active');
                
                // 直接在生成按钮后绑定事件，无需 setTimeout
                const checkTaskBtn = document.getElementById('check-task-btn');
                if (checkTaskBtn) {
                    checkTaskBtn.addEventListener('click', () => {
                        checkTaskResult(taskId);
                    });
                }

            } else if (result.code !== 1) {
                // 如果返回500错误，则直接抛出异常
                if (response.status === 500) {
                    throw new Error(`服务器繁忙，请稍后再试。`);
                }else
                // API 返回了错误代码
                throw new Error(`API 错误: ${result.description || '未知错误'}`);
            } else {
                throw new Error(`API 返回异常结果: ${JSON.stringify(result)}`);
            }
            
        } catch (error) {
            console.error('生成图像时出错:', error);
            
            // 隐藏加载状态，显示错误信息
            imageLoading.classList.remove('active');
            generatedImage.innerHTML = `<div class="error-message">图像生成失败: ${error.message}</div>`;
            generatedImage.classList.add('active');
        }
    }


    
    // 检查任务结果的函数
async function checkTaskResult(taskId) {
    try {
        // 显示加载状态
        generatedImage.innerHTML = `<div class="info-message">正在获取图片结果...</div>`;

        console.log("准备查询任务，任务ID:", taskId);

        // 尝试三种可能的URL格式（注：当前仅实现一种）
        const url = `${MIDJOURNEY_API_URL}/mj/task/${taskId}/fetch`;

        let response = null;
        let responseText = "";

        // 发送请求
        try {
            console.log("尝试查询URL:", url);
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${MIDJOURNEY_API_KEY}`
                }
            });

            responseText = await response.text();
            console.log(`URL ${url} 响应:`, responseText);

            if (!response.ok) {
                throw new Error(`URL ${url} 请求失败: ${response.status} ${response.statusText}`);
            }
        } catch (urlError) {
            console.error(`URL ${url} 请求失败:`, urlError);
            throw urlError;
        }

        // 解析JSON前验证响应文本
        if (!responseText) {
            throw new Error("空响应内容");
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error("无法解析任务查询响应:", parseError);
            console.error("原始响应:", responseText);
            throw new Error(`无法解析任务查询响应: ${responseText}`);
        }

        console.log("解析后的任务查询结果:", result);

        // 统一处理响应逻辑
        if (result.status === "SUCCESS" && result.imageUrl) {
            handleSuccess(result.imageUrl);
        } else if (result.status === "IN_PROGRESS") {
            handleProgress(taskId,result.progress || 0);
        } else if (result.status === "FAILURE") {
            throw new Error(`任务执行失败: ${result.failReason || '未知原因'}`);
        } else {
            throw new Error(`处理中...`);
        }
    } catch (error) {
        console.error('检查任务结果出错:', error);
        generatedImage.innerHTML = `
            <div class="error-message">
                ${error.message}<br><br>
                <button id="retry-check-btn" class="check-task-btn">重试</button>
                <button id="debug-btn" class="check-task-btn debug-btn">调试信息</button>
            </div>
        `;

        // 直接添加事件监听器，无需setTimeout
        const retryBtn = document.getElementById('retry-check-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => checkTaskResult(taskId));
        }

        const debugBtn = document.getElementById('debug-btn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                alert(`任务ID: ${taskId}\n原始响应: ${responseText}\n请将此信息提供给开发人员排查`);
            });
        }
    }
}

// 封装图片加载成功逻辑
function handleSuccess(originalUrl) {
    const proxyUrl = originalUrl.replace('https://cdn.discordapp.com/', 'https://mjcdn.znrpa.com/');
    const imgElement = createImageElement(proxyUrl, originalUrl);
    generatedImage.innerHTML = '';
    generatedImage.appendChild(imgElement);
}

// 封装进度显示逻辑（新增 taskId 参数）
function handleProgress(taskId, progress) {
    generatedImage.innerHTML = `
        <div class="info-message">
            图片仍在生成中 (进度: ${progress})...<br>
            预计需要等待: 3分钟<br><br>
            <button id="check-task-btn" class="check-task-btn">再次检查</button>
        </div>
    `;

    // 直接添加事件监听器，确保 taskId 可用
    const checkTaskBtn = document.getElementById('check-task-btn');
    if (checkTaskBtn) {
        checkTaskBtn.addEventListener('click', () => {
            checkTaskResult(taskId);
        });
    }

    // 在 checkTaskResult 中调用 handleProgress 时传递 taskId：
    else if (result.status === "IN_PROGRESS") {
        const progress = result.progress || 0;
        handleProgress(taskId, progress); // 传递 taskId
    }
}


// 封装图片元素创建逻辑
function createImageElement(proxyUrl, originalUrl) {
    const imgElement = document.createElement('img');
    imgElement.src = proxyUrl;
    imgElement.alt = "AI 生成的梦境图像";

    imgElement.onload = () => {
        generatedImage.innerHTML = '';
        generatedImage.appendChild(imgElement);
    };

    imgElement.onerror = () => {
        console.error("图片加载失败:", proxyUrl);
        generatedImage.innerHTML = `
            <div class="error-message">
                图片加载失败<br>
                <a href="${proxyUrl}" target="_blank">点击打开图片链接</a>
                <br>
                <a href="${originalUrl}" target="_blank">点击打开原始链接</a>
            </div>
        `;
    };

    return imgElement;
}


    // 辅助函数，从情绪分析中提取关键词
    function extractEmotionKeywords(emotionText) {
        // 从情绪分析文本中提取情绪关键词
        const emotionMap = {
            '焦虑': 'anxiety, tension, worried',
            '孤独': 'loneliness, isolation, solitude',
            '压抑': 'depression, suppression, heaviness',
            '开心': 'happiness, joy, delight',
            '恐惧': 'fear, terror, dread',
            '惊讶': 'surprise, amazement, wonder',
            '平静': 'calm, serenity, peaceful',
            '愤怒': 'anger, rage, fury'
        };
        
        let keywords = [];
        for (const [emotion, words] of Object.entries(emotionMap)) {
            if (emotionText.includes(emotion)) {
                keywords.push(words);
            }
        }
        
        // 如果没有匹配到任何情绪，返回通用情绪描述
        return keywords.length > 0 ? keywords.join(', ') : 'dreamlike, emotional, evocative';
    }
    
    // 辅助函数，从主题分析中提取关键词
    function extractThemeKeywords(themeText) {
        // 简单地返回主题摘要，作为图像生成的额外上下文
        return themeText;
    }

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