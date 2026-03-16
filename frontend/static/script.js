// Wait for DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    initializeApp();
});

function initializeApp() {
    // Elements
    const chatContainer = document.getElementById("chat-container");
    const chatMessages = document.getElementById("chat-messages");
    const heroSection = document.getElementById("hero-section");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const sidebar = document.getElementById("sidebar");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");
    const inputAreaContainer = document.getElementById("input-area-container");

    // Check if elements are found
    console.log("Elements found:", {
        chatContainer: !!chatContainer,
        chatMessages: !!chatMessages,
        heroSection: !!heroSection,
        userInput: !!userInput,
        sendBtn: !!sendBtn,
        sidebar: !!sidebar,
        sidebarBackdrop: !!sidebarBackdrop,
        inputAreaContainer: !!inputAreaContainer
    });

    // Exit if critical elements are missing
    if (!userInput || !sendBtn || !chatMessages || !heroSection) {
        console.error("Critical elements missing!");
        return;
    }

    // Views
    const views = {
        chat: { container: document.getElementById("view-chat"), hasInput: true },
        about: { container: document.getElementById("view-about"), hasInput: false },
        figures: { container: document.getElementById("view-figures"), hasInput: false },
        timeline: { container: document.getElementById("view-timeline"), hasInput: false },
        quiz: { container: document.getElementById("view-quiz"), hasInput: false },
    };

    // Log views to check if they exist
    console.log("Views found:", {
        chat: !!views.chat.container,
        about: !!views.about.container,
        figures: !!views.figures.container,
        timeline: !!views.timeline.container,
        quiz: !!views.quiz.container
    });

    const API_BASE_URL = ""; // Empty for same origin, or "http://localhost:8080"
    let isFirstMessage = true;

    // --- View Toggling ---
    function switchView(viewName) {
        console.log("Switching to view:", viewName);
        
        // Hide all view containers
        Object.values(views).forEach((v) => {
            if (v.container) {
                v.container.classList.add("hidden");
            }
        });
        
        // Hide input area if applicable
        if (inputAreaContainer) {
            if (views[viewName] && views[viewName].hasInput) {
                inputAreaContainer.classList.remove("hidden");
            } else {
                inputAreaContainer.classList.add("hidden");
            }
        }

        // Show specific view
        if (views[viewName] && views[viewName].container) {
            views[viewName].container.classList.remove("hidden");
        }

        // Update active nav link visual state
        document.querySelectorAll(".nav-link").forEach((link) => {
            if (link.dataset.view === viewName) {
                link.classList.add("bg-white/10");
                link.classList.remove("bg-white/5");
            } else {
                link.classList.remove("bg-white/10");
                link.classList.add("bg-white/5");
            }
        });

        if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains("-translate-x-full")) {
            toggleSidebar();
        }
    }

    // --- Sidebar Toggle Logic ---
    function toggleSidebar() {
        if (!sidebar || !sidebarBackdrop) return;
        
        const isSidebarOpen = !sidebar.classList.contains("-translate-x-full");

        if (isSidebarOpen) {
            sidebar.classList.add("-translate-x-full");
            sidebarBackdrop.classList.add("opacity-0");
            setTimeout(() => sidebarBackdrop.classList.add("hidden"), 300);
        } else {
            sidebar.classList.remove("-translate-x-full");
            sidebarBackdrop.classList.remove("hidden");
            setTimeout(() => sidebarBackdrop.classList.remove("opacity-0"), 10);
        }
    }

    // Make functions globally available
    window.switchView = switchView;
    window.toggleSidebar = toggleSidebar;

    // --- Textarea auto-resize logic ---
    userInput.addEventListener("input", function () {
        this.style.height = "auto";
        const newHeight = Math.min(this.scrollHeight, 128);
        this.style.height = newHeight + "px";

        if (this.value.trim().length > 0) {
            sendBtn.classList.remove("bg-gray-600/20", "text-gray-400");
            sendBtn.classList.add("bg-ethiogreen", "text-white");
        } else {
            sendBtn.classList.add("bg-gray-600/20", "text-gray-400");
            sendBtn.classList.remove("bg-ethiogreen", "text-white");
        }
    });

    // --- UI / Messaging Logic ---
    function hideHeroState() {
        if (!isFirstMessage) return;
        heroSection.classList.add("opacity-0", "transition-opacity", "duration-300");
        setTimeout(() => {
            heroSection.classList.add("hidden");
            chatMessages.classList.remove("hidden");
        }, 300);
        isFirstMessage = false;
    }

    function resetChat() {
        chatMessages.innerHTML = "";
        chatMessages.classList.add("hidden");
        heroSection.classList.remove("hidden");
        setTimeout(() => heroSection.classList.remove("opacity-0"), 50);
        isFirstMessage = true;
        switchView("chat");
    }

    function appendMessage(text, isUser) {
        hideHeroState();
        
        // Get references to the elements inside the function
        const chatMessages = document.getElementById("chat-messages");
        
        // Safety check - exit if elements don't exist
        if (!chatMessages) {
            console.error("chat-messages element not found!");
            return;
        }
        
        const msgDiv = document.createElement("div");
        msgDiv.className = `flex gap-4 fade-in ${isUser ? "justify-end" : "justify-start"}`;

        if (isUser) {
            msgDiv.innerHTML = `
                <div class="max-w-[85%] md:max-w-[75%] bg-dark-800 text-gray-100 rounded-3xl rounded-tr-md px-6 py-4 border border-white/5 leading-relaxed font-medium whitespace-pre-wrap shadow-lg">${text}</div>
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 mt-2 shadow-inner border border-white/5"><i class="fas fa-user text-xs"></i></div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="flex-shrink-0 w-9 h-9 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center mt-1 shadow-lg relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-br from-ethiogreen/20 via-ethioyellow/20 to-ethiored/20 opacity-50"></div>
                    <i class="fas fa-robot text-sm text-transparent bg-clip-text bg-gradient-to-br from-gray-200 to-gray-500 relative z-10"></i>
                </div>
                <div class="message-content max-w-[85%] md:max-w-[85%] text-gray-300 leading-relaxed font-medium py-2 px-2"></div>
            `;
        }

        chatMessages.appendChild(msgDiv);
        
        // Scroll to the new message
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 10);

        if (!isUser) {
            const contentDiv = msgDiv.querySelector(".message-content");
            const formattedText = text.replace(/\n/g, "<br>");
            contentDiv.innerHTML = formattedText;
        }
    }

    function showTypingIndicator() {
        hideHeroState();
        switchView("chat");

        const chatMessages = document.getElementById("chat-messages");

        const id = "typing-" + Date.now();
        const msgDiv = document.createElement("div");
        msgDiv.className = "flex gap-4 fade-in justify-start";
        msgDiv.id = id;

        msgDiv.innerHTML = `
            <div class="flex-shrink-0 w-9 h-9 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(252,209,22,0.15)] relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-ethiogreen/20 via-ethioyellow/20 to-ethiored/20 animate-pulse"></div>
                <i class="fas fa-robot text-sm text-ethioyellow drop-shadow-md relative z-10"></i>
            </div>
            <div class="max-w-[85%] py-2 flex flex-col gap-3 w-full ml-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Analyzing Historical Data</span>
                    <div class="ai-thinking-indicator text-ethioyellow opacity-80 scale-75">
                        <div class="ai-pulse-bar"></div>
                        <div class="ai-pulse-bar"></div>
                        <div class="ai-pulse-bar"></div>
                    </div>
                </div>
                <div class="w-3/4 h-3 bg-white/5 rounded-full animate-skeleton"></div>
                <div class="w-full h-3 bg-white/5 rounded-full animate-skeleton" style="animation-delay: 0.2s"></div>
                <div class="w-2/3 h-3 bg-white/5 rounded-full animate-skeleton" style="animation-delay: 0.4s"></div>
            </div>
        `;

        if (chatMessages) {
            chatMessages.appendChild(msgDiv);
            // Scroll to the new message
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 10);
        }
        
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        userInput.value = "";
        userInput.style.height = "auto";
        sendBtn.classList.add("bg-gray-600/20", "text-gray-400");
        sendBtn.classList.remove("bg-ethiogreen", "text-white");

        appendMessage(text, true);
        const typingId = showTypingIndicator();

        try {
            const formData = new FormData();
            formData.append("msg", text);

            const response = await fetch(`/get`, {
                method: "POST",
                body: formData,
            });

            const responseText = await response.text();
            removeTypingIndicator(typingId);
            appendMessage(responseText, false);
        } catch (error) {
            console.error("Error asking question:", error);
            removeTypingIndicator(typingId);
            appendMessage(
                "Sorry, I'm having trouble connecting. Please try again.",
                false
            );
        }
    }

    // Global scope for functions
    window.askQuestion = function (question) {
        userInput.value = question;
        sendMessage();
    };

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // --- Quiz Mode Logic ---
    const quizData = [
        {
            q: "Who was the paramount commander of the Ethiopian forces during the Battle of Adwa?",
            options: [
                "Ras Alula Engida",
                "Emperor Menelik II",
                "Empress Taytu",
                "Emperor Tewodros II",
            ],
            ans: 1,
        },
        {
            q: "In what year did the Battle of Adwa take place?",
            options: ["1889", "1894", "1896", "1913"],
            ans: 2,
        },
        {
            q: "Which Italian commander infamously underestimated the Ethiopian army?",
            options: [
                "General Oreste Baratieri",
                "General Matteo Albertone",
                "Mussolini",
                "General Vittorio Dabormida",
            ],
            ans: 0,
        },
        {
            q: "Which treaty was the primary catalyst for the conflict?",
            options: [
                "Treaty of Addis Ababa",
                "Treaty of Wuchale",
                "Treaty of Versailles",
                "Treaty of Rome",
            ],
            ans: 1,
        },
        {
            q: "What role did Empress Taytu primarily play?",
            options: [
                "Only organizing medical supplies",
                "Remained in the capital",
                "Diplomatic advisor and commanded her own battalion",
                "Fled to France",
            ],
            ans: 2,
        },
    ];

    let currentQuestion = 0;
    let score = 0;

    const elQuizStart = document.getElementById("quiz-start");
    const elQuizActive = document.getElementById("quiz-active");
    const elQuizResult = document.getElementById("quiz-result");
    const elQuestion = document.getElementById("quiz-question");
    const elOptions = document.getElementById("quiz-options");
    const elScore = document.getElementById("q-score");
    const elCurrent = document.getElementById("q-current");
    const elTotal = document.getElementById("q-total");
    const elFinalScore = document.getElementById("final-score");

    function startQuiz() {
        currentQuestion = 0;
        score = 0;
        elScore.innerText = score;
        elTotal.innerText = quizData.length;

        elQuizStart.classList.add("hidden");
        elQuizResult.classList.add("hidden");
        elQuizActive.classList.remove("hidden");

        loadNextQuestion();
    }

    function loadNextQuestion() {
        if (currentQuestion >= quizData.length) {
            endQuiz();
            return;
        }

        const q = quizData[currentQuestion];
        elCurrent.innerText = currentQuestion + 1;
        elQuestion.innerText = q.q;

        elOptions.innerHTML = "";
        q.options.forEach((opt, index) => {
            const btn = document.createElement("button");
            btn.className =
                "quiz-option text-left w-full p-4 rounded-xl border border-gray-700 bg-dark-900 text-gray-300 font-medium hover:bg-dark-800 transition-all";
            btn.innerText = opt;
            btn.onclick = () => handleAnswer(index, btn);
            elOptions.appendChild(btn);
        });
    }

    function handleAnswer(selectedIndex, buttonEl) {
        const q = quizData[currentQuestion];

        const allBtns = elOptions.querySelectorAll("button");
        allBtns.forEach((btn) => (btn.disabled = true));

        if (selectedIndex === q.ans) {
            buttonEl.classList.add("quiz-correct");
            score++;
            elScore.innerText = score;
            elScore.parentElement.classList.add("text-ethiogreen", "scale-110");
            setTimeout(
                () =>
                    elScore.parentElement.classList.remove("text-ethiogreen", "scale-110"),
                300
            );
        } else {
            buttonEl.classList.add("quiz-wrong");
            allBtns[q.ans].classList.add("quiz-correct");
        }

        setTimeout(() => {
            currentQuestion++;
            loadNextQuestion();
        }, 1200);
    }

    function endQuiz() {
        elQuizActive.classList.add("hidden");
        elFinalScore.innerText = score;
        elQuizResult.classList.remove("hidden");
    }

    function resetQuizUI() {
        elQuizResult.classList.add("hidden");
        elQuizStart.classList.remove("hidden");
    }

    // Make quiz functions global
    window.startQuiz = startQuiz;
    window.resetQuizUI = resetQuizUI;

    // --- Splash Screen ---
    setTimeout(() => {
        const splashScreen = document.getElementById("splash-screen");
        if (splashScreen) {
            splashScreen.classList.add("opacity-0", "pointer-events-none");
            splashScreen.style.transform = "scale(1.05)";
            setTimeout(() => {
                splashScreen.remove();
            }, 1000);
        }
    }, 2500);

    // Initialize with chat view
    switchView("chat");
}