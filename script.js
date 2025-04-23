document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const conversationHistory = document.getElementById('conversation-history');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const conversationContainer = document.getElementById('conversation-container');
    const emptyState = document.getElementById('empty-state');
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageViews = document.querySelectorAll('.page-view');
    
    // Candidate Profile Elements
    const policyTabs = document.querySelectorAll('.policy-tab');
    const candidateSearchForm = document.getElementById('candidate-search-form');
    const candidateSearchInput = document.getElementById('candidate-search-input');
    
    // Comparison Elements
    const topicButtons = document.querySelectorAll('.topic-button');
    
    // Issues Elements
    const issueCards = document.querySelectorAll('.issue-card');
    const issueSearchForm = document.getElementById('issue-search-form');
    const issueSearchInput = document.getElementById('issue-search-input');
    
    // State
    let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    let currentConversationId = localStorage.getItem('currentConversationId') || null;
    let currentPage = localStorage.getItem('currentPage') || 'home';
    
    // Initialize
    initializeApp();
    
    // Functions
    function initializeApp() {
        renderConversationHistory();
        setActivePage(currentPage);
        
        // Add event listeners
        mobileMenuBtn.addEventListener('click', toggleSidebar);
        newChatBtn.addEventListener('click', createNewConversation);
        searchForm.addEventListener('submit', handleSearch);
        
        // Add event listeners for example queries
        document.querySelectorAll('.example-query').forEach(button => {
            button.addEventListener('click', function() {
                const query = this.getAttribute('data-query');
                searchInput.value = query;
                handleSearch(new Event('submit'));
            });
        });
        
        // Add event listeners for navigation
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                setActivePage(page);
            });
        });
        
        // Add event listeners for candidate profile
        if (policyTabs) {
            policyTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const policy = this.getAttribute('data-policy');
                    setActivePolicy(policy);
                });
            });
        }
        
        if (candidateSearchForm) {
            candidateSearchForm.addEventListener('submit', handleCandidateSearch);
        }
        
        // Add event listeners for comparison
        if (topicButtons) {
            topicButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const topic = this.getAttribute('data-topic');
                    setActiveTopic(topic);
                });
            });
        }
        
        // Add event listeners for issues
        if (issueCards) {
            issueCards.forEach(card => {
                card.addEventListener('click', function() {
                    const issue = this.getAttribute('data-issue');
                    setActiveIssue(issue);
                });
            });
        }
        
        if (issueSearchForm) {
            issueSearchForm.addEventListener('submit', handleIssueSearch);
        }
        
        // Add event listeners for footer links
        document.querySelectorAll('.footer-links a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('data-page')) {
                    e.preventDefault();
                    const page = this.getAttribute('data-page');
                    setActivePage(page);
                }
            });
        });
    }
    
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }
    
    function createNewConversation() {
        const id = Date.now().toString();
        const newConversation = {
            id,
            title: 'New Conversation',
            messages: []
        };
        
        conversations.unshift(newConversation);
        currentConversationId = id;
        
        saveConversations();
        renderConversationHistory();
        
        // Switch to home view
        setActivePage('home');
        
        // Clear search input
        searchInput.value = '';
        
        // Show empty state
        emptyState.style.display = 'flex';
        conversationContainer.style.display = 'none';
    }
    
    function renderConversationHistory() {
        conversationHistory.innerHTML = '';
        
        conversations.forEach(conversation => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            if (conversation.id === currentConversationId) {
                historyItem.classList.add('active');
            }
            
            historyItem.textContent = conversation.title;
            historyItem.addEventListener('click', () => {
                loadConversation(conversation.id);
            });
            
            conversationHistory.appendChild(historyItem);
        });
    }
    
    function loadConversation(id) {
        currentConversationId = id;
        localStorage.setItem('currentConversationId', id);
        
        renderConversationHistory();
        renderCurrentConversation();
        
        // Switch to conversation view
        setActivePage('conversation');
    }
    
    function renderCurrentConversation() {
        const conversation = conversations.find(c => c.id === currentConversationId);
        
        if (!conversation || conversation.messages.length === 0) {
            emptyState.style.display = 'flex';
            conversationContainer.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        conversationContainer.style.display = 'block';
        conversationContainer.innerHTML = '';
        
        conversation.messages.forEach(message => {
            const messageElement = createMessageElement(message);
            conversationContainer.appendChild(messageElement);
        });
        
        // Add search form at the bottom for follow-up questions
        const followUpForm = document.createElement('form');
        followUpForm.className = 'search-form';
        followUpForm.innerHTML = `
            <input
                type="text"
                class="search-input"
                placeholder="Ask a follow-up question..."
                aria-label="Follow-up question"
            />
            <button type="submit" class="search-button" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        `;
        
        followUpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input');
            if (input.value.trim()) {
                handleSearch({ preventDefault: () => {}, target: this }, input.value);
            }
        });
        
        conversationContainer.appendChild(followUpForm);
        
        // Scroll to bottom
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }
    
    function createMessageElement(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`;
        
        const avatarElement = document.createElement('div');
        avatarElement.className = `message-avatar ${message.role === 'user' ? 'user-avatar' : 'assistant-avatar'}`;
        avatarElement.innerHTML = message.role === 'user' ? 'U' : 'A';
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        
        const textElement = document.createElement('div');
        textElement.className = 'message-text';
        textElement.innerHTML = message.content;
        
        contentElement.appendChild(textElement);
        
        if (message.sources) {
            const sourcesElement = document.createElement('div');
            sourcesElement.className = 'source-citation';
            sourcesElement.innerHTML = `Sources: ${message.sources}`;
            contentElement.appendChild(sourcesElement);
        }
        
        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);
        
        return messageElement;
    }
    
    function handleSearch(e, inputValue) {
        e.preventDefault();
        
        const query = inputValue || searchInput.value.trim();
        
        if (!query) return;
        
        // Create a new conversation if none exists
        if (!currentConversationId) {
            createNewConversation();
        }
        
        const conversation = conversations.find(c => c.id === currentConversationId);
        
        // Add user message
        conversation.messages.push({
            role: 'user',
            content: query
        });
        
        // Update conversation title if it's the first message
        if (conversation.messages.length === 1) {
            conversation.title = query.length > 30 ? query.substring(0, 30) + '...' : query;
        }
        
        saveConversations();
        renderConversationHistory();
        renderCurrentConversation();
        
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        `;
        conversationContainer.appendChild(loadingIndicator);
        
        // Scroll to bottom
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
        
        // Simulate API call
        setTimeout(() => {
            // Remove loading indicator
            conversationContainer.removeChild(loadingIndicator);
            
            // Add assistant response based on query
            let response = '';
            let sources = '';
            
            if (query.toLowerCase().includes('stalin') && query.toLowerCase().includes('language')) {
                response = "MK Stalin has consistently opposed the three-language policy, viewing it as an imposition of Hindi on Tamil Nadu. In a statement made during the DMK general council meeting in Chennai on March 15, 2025, Stalin said: \"The three-language formula is nothing but a disguised attempt to impose Hindi on Tamil Nadu. We will continue to resist any move that undermines Tamil language and identity.\"<br><br>He has advocated for a two-language policy (Tamil and English) and has criticized the central government's attempts to make Hindi mandatory in the state's education system.<br><br>The DMK's 2026 election manifesto explicitly mentions opposition to the three-language policy as a key agenda item.";
                sources = "DMK Official Website - Policy Statement (March 2025), The Hindu - 'Stalin reiterates opposition to three-language formula' (March 16, 2025)";
            } else if (query.toLowerCase().includes('palaniswami') && query.toLowerCase().includes('ai')) {
                response = "Edappadi K. Palaniswami has positioned himself as a proponent of AI-driven economic growth for Tamil Nadu. In his recent economic policy speech at the Chennai Trade Centre on February 10, 2025, he outlined a comprehensive plan for integrating AI technologies across various sectors.<br><br>Key points of his AI policy include:<br>1. Establishing an AI Innovation Hub in Chennai with a budget allocation of ₹500 crore<br>2. Introducing AI curriculum in all engineering colleges across Tamil Nadu<br>3. Tax incentives for AI startups and companies establishing AI research centers in the state<br>4. Public-private partnerships for AI implementation in healthcare, agriculture, and education<br><br>Palaniswami stated: \"Artificial Intelligence is the future, and Tamil Nadu must lead this revolution. Our government will ensure that we not only adopt AI technologies but also become a global hub for AI innovation.\"";
                sources = "AIADMK Economic Vision Document (February 2025), The Times of India - 'Palaniswami unveils AI roadmap for Tamil Nadu' (February 11, 2025)";
            } else if (query.toLowerCase().includes('panneerselvam') && query.toLowerCase().includes('unemployment')) {
                response = "O. Panneerselvam has proposed a multi-faceted approach to address unemployment in Tamil Nadu. During his address at the Tamil Nadu Chamber of Commerce on January 25, 2025, he outlined a comprehensive employment generation strategy.<br><br>His plan includes:<br>1. Establishing skill development centers in every district with industry-specific training programs<br>2. Creating a ₹1,000 crore startup fund to support young entrepreneurs<br>3. Offering tax incentives to companies that create a minimum of 500 new jobs<br>4. Developing specialized industrial corridors in southern and western Tamil Nadu<br>5. Implementing a rural employment guarantee scheme focused on infrastructure development<br><br>Panneerselvam emphasized: \"Our approach to unemployment will focus on both immediate job creation and long-term skill development. We will ensure that Tamil Nadu's workforce is prepared for the jobs of tomorrow while addressing the immediate employment needs of our people.\"";
                sources = "O. Panneerselvam's Economic Policy Document (January 2025), The Indian Express - 'OPS unveils employment roadmap for TN' (January 26, 2025)";
            } else if (query.toLowerCase().includes('education')) {
                response = "Education has emerged as a critical issue in the 2026 Tamil Nadu elections, with major parties presenting contrasting visions.<br><br>The DMK under MK Stalin has promised to allocate 6% of state GDP to education and provide free higher education for first-generation learners. They strongly oppose NEET, arguing it disadvantages rural students, and emphasize Tamil medium instruction while strengthening English language education.<br><br>The AIADMK led by Edappadi K. Palaniswami focuses on skill development and public-private partnerships to improve educational infrastructure. They support NEET with certain modifications and place greater emphasis on English proficiency programs.<br><br>Key points of contention include the NEET examination, medium of instruction, educational funding, and approaches to improving educational quality. Both parties acknowledge the need for digital skills training but differ in their implementation strategies.";
                sources = "DMK and AIADMK Election Manifestos (2025), The Hindu - 'Education emerges as battleground in TN politics' (March 5, 2025)";
            } else {
                response = "I don't have specific information about that query related to Tamil Nadu elections. The platform currently contains information about candidates' positions on language policy, AI initiatives, unemployment strategies, education reforms, water management, and infrastructure development.<br><br>You can try asking about specific candidates like MK Stalin, Edappadi K. Palaniswami, or O. Panneerselvam and their positions on key issues facing Tamil Nadu.";
                sources = "";
            }
            
            conversation.messages.push({
                role: 'assistant',
                content: response,
                sources: sources
            });
            
            saveConversations();
            renderCurrentConversation();
            
            // Switch to conversation view
            setActivePage('conversation');
        }, 2000);
    }
    
    function handleCandidateSearch(e) {
        e.preventDefault();
        const query = candidateSearchInput.value.trim();
        
        if (!query) return;
        
        // Create a new conversation
        const id = Date.now().toString();
        const newConversation = {
            id,
            title: query.length > 30 ? query.substring(0, 30) + '...' : query,
            messages: [
                {
                    role: 'user',
                    content: query
                }
            ]
        };
        
        conversations.unshift(newConversation);
        currentConversationId = id;
        
        saveConversations();
        renderConversationHistory();
        
        // Switch to conversation view
        setActivePage('conversation');
        
        // Simulate API call
        setTimeout(() => {
            const conversation = conversations.find(c => c.id === currentConversationId);
            
            conversation.messages.push({
                role: 'assistant',
                content: "Based on MK Stalin's public statements and the DMK's policy documents, he has been a strong advocate for educational reforms in Tamil Nadu. He has promised to allocate 6% of the state GDP to education and provide free higher education for first-generation learners.<br><br>On the specific issue you asked about, Stalin has emphasized the importance of modernizing the curriculum with digital skills training while preserving Tamil cultural values in education. He has also been vocal about opposing centralized educational policies that don't account for Tamil Nadu's unique educational needs and history.",
                sources: "DMK Election Manifesto (2025), The Hindu - 'Stalin outlines educational vision for Tamil Nadu' (February 28, 2025)"
            });
            
            saveConversations();
            renderCurrentConversation();
        }, 2000);
    }
    
    function handleIssueSearch(e) {
        e.preventDefault();
        const query = issueSearchInput.value.trim();
        
        if (!query) return;
        
        // Create a new conversation
        const id = Date.now().toString();
        const newConversation = {
            id,
            title: query.length > 30 ? query.substring(0, 30) + '...' : query,
            messages: [
                {
                    role: 'user',
                    content: query
                }
            ]
        };
        
        conversations.unshift(newConversation);
        currentConversationId = id;
        
        saveConversations();
        renderConversationHistory();
        
        // Switch to conversation view
        setActivePage('conversation');
        
        // Simulate API call
        setTimeout(() => {
            const conversation = conversations.find(c => c.id === currentConversationId);
            
            conversation.messages.push({
                role: 'assistant',
                content: "Regarding education policies in Tamil Nadu, there are significant differences between the major parties:<br><br>The DMK under MK Stalin has promised to:<br>- Allocate 6% of state GDP to education<br>- Provide free higher education for first-generation learners<br>- Abolish NEET examinations for medical admissions<br>- Strengthen Tamil medium instruction while also improving English language education<br><br>The AIADMK led by Edappadi K. Palaniswami focuses on:<br>- Skill development programs integrated with academic education<br>- Public-private partnerships to improve educational infrastructure<br>- Supporting NEET with certain modifications to make it more accessible<br>- Enhanced English language proficiency programs<br><br>Both parties acknowledge the need for digital skills training but differ in their implementation approaches and priorities.",
                sources: "DMK and AIADMK Election Manifestos (2025), The Hindu - 'Education emerges as battleground in TN politics' (March 5, 2025)"
            });
            
            saveConversations();
            renderCurrentConversation();
        }, 2000);
    }
    
    function setActivePage(page) {
        // Update current page
        currentPage = page;
        localStorage.setItem('currentPage', page);
        
        // Update navigation links
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Hide all page views
        pageViews.forEach(view => {
            view.classList.remove('active');
        });
        
        // Show conversation container if on conversation page
        if (page === 'conversation') {
            document.getElementById('home-view').classList.remove('active');
            conversationContainer.style.display = 'block';
            renderCurrentConversation();
        } else {
            conversationContainer.style.display = 'none';
        }
        
        // Show appropriate page view
        if (page === 'home') {
            document.getElementById('home-view').classList.add('active');
        } else if (page === 'candidates') {
            document.getElementById('candidate-profile-view').classList.add('active');
        } else if (page === 'comparison') {
            document.getElementById('comparison-view').classList.add('active');
        } else if (page === 'issues') {
            document.getElementById('issues-view').classList.add('active');
        } else if (page === 'about') {
            document.getElementById('about-view').classList.add('active');
        }
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }
    
    function setActivePolicy(policy) {
        // Update active tab
        policyTabs.forEach(tab => {
            if (tab.getAttribute('data-policy') === policy) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update content based on policy
        const policyContent = document.getElementById('policy-content');
        let content = '';
        
        if (policy === 'language') {
            content = `
                <h2>Language Policy</h2>
                <p>MK Stalin has consistently opposed the three-language policy, viewing it as an imposition of Hindi on Tamil Nadu. In a statement made during the DMK general council meeting in Chennai on March 15, 2025, Stalin said: "The three-language formula is nothing but a disguised attempt to impose Hindi on Tamil Nadu. We will continue to resist any move that undermines Tamil language and identity."</p>
                <p>He has advocated for a two-language policy (Tamil and English) and has criticized the central government's attempts to make Hindi mandatory in the state's education system.</p>
                <p>The DMK's 2026 election manifesto explicitly mentions opposition to the three-language policy as a key agenda item.</p>
                
                <h3>Key Statements</h3>
                <ul class="key-statements">
                    <li>"The three-language formula is nothing but a disguised attempt to impose Hindi on Tamil Nadu."</li>
                    <li>"We will continue to resist any move that undermines Tamil language and identity."</li>
                    <li>"Tamil and English are sufficient for the educational and employment needs of our people."</li>
                </ul>
            `;
        } else if (policy === 'education') {
            content = `
                <h2>Education Policy</h2>
                <p>MK Stalin has made education reform a cornerstone of his political platform. He has promised to allocate 6% of the state GDP to education and provide free higher education for first-generation learners.</p>
                <p>Stalin has been a vocal opponent of the National Eligibility cum Entrance Test (NEET) for medical admissions, arguing that it disadvantages students from rural backgrounds and state board education. He has advocated for state-based admissions to medical colleges.</p>
                <p>His education policy emphasizes modernizing curriculum with digital skills training while preserving Tamil cultural values in education.</p>
                
                <h3>Key Statements</h3>
                <ul class="key-statements">
                    <li>"Education is the most powerful tool for social transformation and economic progress."</li>
                    <li>"We will ensure that no deserving student is denied higher education due to financial constraints."</li>
                    <li>"NEET undermines the state's rights in education and disadvantages our students from rural areas."</li>
                </ul>
            `;
        } else if (policy === 'economy') {
            content = `
                <h2>Economic Policy</h2>
                <p>MK Stalin's economic vision for Tamil Nadu focuses on inclusive growth, industrial development, and job creation. He has outlined a plan to attract ₹5 lakh crore in investments over five years and create 10 lakh jobs annually.</p>
                <p>Key elements of his economic policy include developing specialized industrial corridors, supporting MSMEs through financial assistance and simplified regulations, and promoting innovation through startup incubators.</p>
                <p>Stalin has emphasized the need for balanced regional development, with special focus on southern and western Tamil Nadu which have historically received less industrial investment.</p>
                
                <h3>Key Statements</h3>
                <ul class="key-statements">
                    <li>"Our economic policy will focus on creating jobs, reducing inequality, and ensuring sustainable development."</li>
                    <li>"We will transform Tamil Nadu into the most preferred investment destination in South Asia."</li>
                    <li>"MSMEs are the backbone of our economy and will receive special attention under our government."</li>
                </ul>
            `;
        } else if (policy === 'infrastructure') {
            content = `
                <h2>Infrastructure Policy</h2>
                <p>MK Stalin has proposed a comprehensive infrastructure development plan for Tamil Nadu with a focus on urban renewal, transportation, and digital connectivity.</p>
                <p>His infrastructure vision includes expanding the Chennai Metro to cover the entire metropolitan area, developing integrated transport systems in Coimbatore, Madurai, and Trichy, and implementing smart city solutions across urban centers.</p>
                <p>Stalin has also emphasized rural infrastructure development, promising all-weather roads to every village, 100% broadband connectivity, and upgraded healthcare facilities in rural areas.</p>
                
                <h3>Key Statements</h3>
                <ul class="key-statements">
                    <li>"Infrastructure is the foundation for economic growth and quality of life."</li>
                    <li>"We will ensure that every part of Tamil Nadu, urban or rural, has access to world-class infrastructure."</li>
                    <li>"Digital connectivity is no longer a luxury but a necessity, and we will make it available to all."</li>
                </ul>
            `;
        } else if (policy === 'water') {
            content = `
                <h2>Water Management Policy</h2>
                <p>MK Stalin has made water management a priority, particularly in light of recurring water scarcity issues and the ongoing Cauvery water dispute with neighboring states.</p>
                <p>His water policy focuses on river rejuvenation, rainwater harvesting, groundwater recharge, and modernization of irrigation systems. He has proposed a ₹10,000 crore comprehensive water security plan for the state.</p>
                <p>Stalin has also emphasized the need for a permanent solution to the Cauvery water dispute and has advocated for Tamil Nadu's rights in interstate water sharing arrangements.</p>
                
                <h3>Key Statements</h3>
                <ul class="key-statements">
                    <li>"Water security is national security, and we will ensure that Tamil Nadu never faces a water crisis again."</li>
                    <li>"We will revive traditional water bodies and implement modern water conservation technologies."</li>
                    <li>"The Cauvery is Tamil Nadu's lifeline, and we will protect our rightful share of its waters."</li>
                </ul>
            `;
        }
        
        policyContent.innerHTML = content;
    }
    
    function setActiveTopic(topic) {
        // Update active button
        topicButtons.forEach(button => {
            if (button.getAttribute('data-topic') === topic) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update comparison title
        const comparisonTitle = document.querySelector('.comparison-title');
        comparisonTitle.textContent = `Compare Candidates on ${topic.charAt(0).toUpperCase() + topic.slice(1)} Policy`;
        
        // Update comparison content
        const candidateColumns = document.querySelectorAll('.candidate-column');
        const keyDifferences = document.querySelector('.key-differences ul');
        
        if (topic === 'education') {
            candidateColumns[0].innerHTML = `
                <h2>MK Stalin (DMK)</h2>
                <ul class="policy-points">
                    <li>Allocation of 6% of state GDP to education</li>
                    <li>Free higher education for first-generation learners</li>
                    <li>Modernizing curriculum with digital skills training</li>
                    <li>Expanding Tamil medium instruction while strengthening English language education</li>
                    <li>Opposing NEET and advocating for state control of education</li>
                </ul>
            `;
            
            candidateColumns[1].innerHTML = `
                <h2>Edappadi K. Palaniswami (AIADMK)</h2>
                <ul class="policy-points">
                    <li>Mandatory skill development courses in all higher education institutions</li>
                    <li>Public-private partnerships to improve educational infrastructure</li>
                    <li>Enhanced English language proficiency programs</li>
                    <li>Vocational training integrated with academic education</li>
                    <li>Merit-based teacher recruitment and performance evaluation</li>
                </ul>
            `;
            
            keyDifferences.innerHTML = `
                <li>DMK opposes NEET, AIADMK supports it with certain modifications</li>
                <li>DMK emphasizes free education, AIADMK focuses on skill development</li>
                <li>DMK supports Tamil medium instruction, AIADMK emphasizes English proficiency</li>
            `;
        } else if (topic === 'language') {
            candidateColumns[0].innerHTML = `
                <h2>MK Stalin (DMK)</h2>
                <ul class="policy-points">
                    <li>Strong opposition to three-language policy</li>
                    <li>Advocacy for two-language policy (Tamil and English)</li>
                    <li>Promotion of Tamil language in all spheres</li>
                    <li>Opposition to Hindi imposition</li>
                    <li>Support for classical language status benefits for Tamil</li>
                </ul>
            `;
            
            candidateColumns[1].innerHTML = `
                <h2>Edappadi K. Palaniswami (AIADMK)</h2>
                <ul class="policy-points">
                    <li>Moderate stance on three-language policy</li>
                    <li>Support for Tamil as primary language with optional Hindi</li>
                    <li>Emphasis on English proficiency for global opportunities</li>
                    <li>Promotion of Tamil literature and culture</li>
                    <li>Balance between linguistic identity and practical needs</li>
                </ul>
            `;
            
            keyDifferences.innerHTML = `
                <li>DMK completely opposes three-language formula, AIADMK has a more moderate stance</li>
                <li>DMK opposes any form of Hindi requirement, AIADMK supports optional Hindi</li>
                <li>Both support Tamil promotion, but with different approaches to other languages</li>
            `;
        } else if (topic === 'economy') {
            candidateColumns[0].innerHTML = `
                <h2>MK Stalin (DMK)</h2>
                <ul class="policy-points">
                    <li>Plan to attract ₹5 lakh crore investments over five years</li>
                    <li>Focus on creating 10 lakh jobs annually</li>
                    <li>Support for MSMEs through financial assistance</li>
                    <li>Balanced regional development across Tamil Nadu</li>
                    <li>Promotion of innovation through startup incubators</li>
                </ul>
            `;
            
            candidateColumns[1].innerHTML = `
                <h2>Edappadi K. Palaniswami (AIADMK)</h2>
                <ul class="policy-points">
                    <li>Vision to make Tamil Nadu a $1 trillion economy by 2030</li>
                    <li>Focus on manufacturing sector and export promotion</li>
                    <li>Tax incentives for new industrial investments</li>
                    <li>Development of specialized economic zones</li>
                    <li>Public-private partnerships for infrastructure development</li>
                </ul>
            `;
            
            keyDifferences.innerHTML = `
                <li>DMK emphasizes balanced regional development, AIADMK focuses on specialized zones</li>
                <li>DMK prioritizes MSME support, AIADMK emphasizes large manufacturing</li>
                <li>DMK focuses on job creation metrics, AIADMK on overall economic size</li>
            `;
        } else if (topic === 'infrastructure') {
            candidateColumns[0].innerHTML = `
                <h2>MK Stalin (DMK)</h2>
                <ul class="policy-points">
                    <li>Expansion of Chennai Metro to cover entire metropolitan area</li>
                    <li>Integrated transport systems in Coimbatore, Madurai, and Trichy</li>
                    <li>All-weather roads to every village</li>
                    <li>100% broadband connectivity across the state</li>
                    <li>Smart city solutions for urban centers</li>
                </ul>
            `;
            
            candidateColumns[1].innerHTML = `
                <h2>Edappadi K. Palaniswami (AIADMK)</h2>
                <ul class="policy-points">
                    <li>Eight-lane expressways connecting major cities</li>
                    <li>Development of new airports in Hosur and Salem</li>
                    <li>Modernization of ports to boost export capabilities</li>
                    <li>Industrial corridors with plug-and-play infrastructure</li>
                    <li>24/7 power supply through renewable energy integration</li>
                </ul>
            `;
            
            keyDifferences.innerHTML = `
                <li>DMK prioritizes public transportation, AIADMK focuses on roadways</li>
                <li>DMK emphasizes digital infrastructure, AIADMK on industrial infrastructure</li>
                <li>DMK has stronger focus on urban renewal, AIADMK on new development</li>
            `;
        } else if (topic === 'water') {
            candidateColumns[0].innerHTML = `
                <h2>MK Stalin (DMK)</h2>
                <ul class="policy-points">
                    <li>₹10,000 crore comprehensive water security plan</li>
                    <li>River rejuvenation and rainwater harvesting</li>
                    <li>Modernization of irrigation systems</li>
                    <li>Strong stance on Cauvery water rights</li>
                    <li>Urban water body restoration projects</li>
                </ul>
            `;
            
            candidateColumns[1].innerHTML = `
                <h2>Edappadi K. Palaniswami (AIADMK)</h2>
                <ul class="policy-points">
                    <li>Interlinking of rivers within Tamil Nadu</li>
                    <li>Desalination plants for coastal districts</li>
                    <li>Groundwater recharge through check dams</li>
                    <li>Micro-irrigation promotion for agricultural efficiency</li>
                    <li>Diplomatic approach to interstate water disputes</li>
                </ul>
            `;
            
            keyDifferences.innerHTML = `
                <li>DMK takes a more assertive stance on interstate water disputes</li>
                <li>AIADMK emphasizes technological solutions like desalination</li>
                <li>DMK focuses on restoration, AIADMK on new infrastructure</li>
            `;
        }
    }
    
    function setActiveIssue(issue) {
        // Update active card
        issueCards.forEach(card => {
            if (card.getAttribute('data-issue') === issue) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        // Update issue detail content
        const issueDetail = document.getElementById('issue-detail');
        let content = '';
        
        if (issue === 'education') {
            content = `
                <h2>Education in Tamil Nadu</h2>
                
                <div class="issue-description">
                    <p>Education has emerged as a critical issue in Tamil Nadu politics, with parties presenting contrasting visions for the state's educational future. The debate encompasses several key aspects:</p>
                    
                    <h3>NEET Examination Controversy</h3>
                    <p>The National Eligibility cum Entrance Test (NEET) for medical admissions has been a contentious issue in Tamil Nadu. The DMK strongly opposes NEET, arguing it disadvantages rural students and those from state board backgrounds. The party has advocated for state-based admissions. In contrast, the AIADMK has taken a more moderate stance, supporting NEET with certain modifications to make it more accessible to Tamil Nadu students.</p>
                    
                    <h3>Language of Instruction</h3>
                    <p>The medium of instruction in educational institutions is another point of contention. The DMK emphasizes the importance of Tamil medium instruction while also strengthening English language education. The AIADMK, on the other hand, places greater emphasis on English proficiency programs, viewing English language skills as essential for global competitiveness.</p>
                    
                    <h3>Funding and Access</h3>
                    <p>The DMK has promised to allocate 6% of the state GDP to education and provide free higher education for first-generation learners. The AIADMK focuses more on public-private partnerships to improve educational infrastructure and mandatory skill development courses in higher education institutions.</p>
                    
                    <h3>Educational Quality</h3>
                    <p>Both parties acknowledge the need to improve educational quality, but with different approaches. The DMK emphasizes modernizing curriculum with digital skills training, while the AIADMK focuses on merit-based teacher recruitment and performance evaluation.</p>
                </div>
                
                <div class="candidate-positions">
                    <h3>Candidate Positions</h3>
                    
                    <div class="position-card">
                        <h4>MK Stalin (DMK)</h4>
                        <p>"We will allocate 6% of state GDP to education and ensure that every child in Tamil Nadu receives quality education regardless of their economic background."</p>
                        <p>"NEET must be abolished as it undermines the state's rights in education and disadvantages our students."</p>
                    </div>
                    
                    <div class="position-card">
                        <h4>Edappadi K. Palaniswami (AIADMK)</h4>
                        <p>"Our focus will be on skill development and ensuring that Tamil Nadu students are prepared for the jobs of tomorrow."</p>
                        <p>"We will work with the central government to make NEET more accessible to Tamil Nadu students while maintaining quality standards."</p>
                    </div>
                </div>
            `;
        } else if (issue === 'language') {
            content = `
                <h2>Language Policy in Tamil Nadu</h2>
                
                <div class="issue-description">
                    <p>Language policy has been a defining political issue in Tamil Nadu for decades, with strong sentiments around Tamil identity and resistance to perceived Hindi imposition. The debate continues to be significant in the 2026 elections:</p>
                    
                    <h3>Three-Language Formula</h3>
                    <p>The central government's three-language formula (typically Tamil, English, and Hindi in Tamil Nadu) has faced significant opposition in the state. The DMK strongly opposes this policy, viewing it as an attempt to impose Hindi. The AIADMK has taken a more moderate stance, supporting Tamil as the primary language with optional Hindi.</p>
                    
                    <h3>Medium of Instruction</h3>
                    <p>The language used for education is another contentious issue. The DMK advocates for strengthening Tamil medium instruction while also ensuring English proficiency. The AIADMK places greater emphasis on English language skills for global opportunities while still promoting Tamil.</p>
                    
                    <h3>Official Language Status</h3>
                    <p>Both parties support Tamil as the official language of Tamil Nadu but differ in their approach to other languages. The DMK is more resistant to any official status for Hindi, while the AIADMK takes a more pragmatic approach to multilingualism.</p>
                    
                    <h3>Cultural Preservation</h3>
                    <p>Both parties emphasize the importance of preserving and promoting Tamil literature, arts, and culture, but with different approaches to balancing this with modern educational and economic needs.</p>
                </div>
                
                <div class="candidate-positions">
                    <h3>Candidate Positions</h3>
                    
                    <div class="position-card">
                        <h4>MK Stalin (DMK)</h4>
                        <p>"The three-language formula is nothing but a disguised attempt to impose Hindi on Tamil Nadu. We will continue to resist any move that undermines Tamil language and identity."</p>
                        <p>"Tamil and English are sufficient for the educational and employment needs of our people."</p>
                    </div>
                    
                    <div class="position-card">
                        <h4>Edappadi K. Palaniswami (AIADMK)</h4>
                        <p>"While Tamil will always be our primary language, we must prepare our youth for a global future by emphasizing English proficiency and offering Hindi as an option for those who wish to learn it."</p>
                        <p>"We can protect our Tamil identity while still embracing the practical benefits of multilingualism."</p>
                    </div>
                </div>
            `;
        } else if (issue === 'economy') {
            content = `
                <h2>Economic Development in Tamil Nadu</h2>
                
                <div class="issue-description">
                    <p>Economic development and job creation are central issues in the 2026 Tamil Nadu elections, with parties offering different visions for the state's economic future:</p>
                    
                    <h3>Industrial Policy</h3>
                    <p>The DMK under MK Stalin has proposed attracting ₹5 lakh crore in investments over five years with a focus on balanced regional development. The AIADMK led by Edappadi K. Palaniswami has outlined a vision to make Tamil Nadu a $1 trillion economy by 2030, with emphasis on manufacturing and exports.</p>
                    
                    <h3>Employment Generation</h3>
                    <p>Job creation is a priority for both parties, with the DMK promising to create 10 lakh jobs annually through various initiatives. The AIADMK focuses on skill development and industrial growth as pathways to employment, with particular emphasis on manufacturing jobs.</p>
                    
                    <h3>MSME Support</h3>
                    <p>The DMK has emphasized support for Micro, Small, and Medium Enterprises through financial assistance and simplified regulations. The AIADMK has focused more on large-scale manufacturing while also offering some support programs for smaller businesses.</p>
                    
                    <h3>Economic Zones</h3>
                    <p>The AIADMK has proposed specialized economic zones with sector-specific infrastructure, while the DMK emphasizes more geographically balanced development across all regions of Tamil Nadu.</p>
                </div>
                
                <div class="candidate-positions">
                    <h3>Candidate Positions</h3>
                    
                    <div class="position-card">
                        <h4>MK Stalin (DMK)</h4>
                        <p>"Our economic policy will focus on creating jobs, reducing inequality, and ensuring sustainable development across all regions of Tamil Nadu."</p>
                        <p>"MSMEs are the backbone of our economy and will receive special attention under our government."</p>
                    </div>
                    
                    <div class="position-card">
                        <h4>Edappadi K. Palaniswami (AIADMK)</h4>
                        <p>"We will transform Tamil Nadu into a $1 trillion economy by 2030 through strategic investments in manufacturing, infrastructure, and exports."</p>
                        <p>"Our specialized economic zones will create clusters of excellence that can compete globally in key sectors."</p>
                    </div>
                </div>
            `;
        } else if (issue === 'infrastructure') {
            content = `
                <h2>Infrastructure Development in Tamil Nadu</h2>
                
                <div class="issue-description">
                    <p>Infrastructure development is a key focus area for both major parties in Tamil Nadu, with different priorities and approaches:</p>
                    
                    <h3>Transportation</h3>
                    <p>The DMK has emphasized public transportation, including the expansion of the Chennai Metro and integrated transport systems in other major cities. The AIADMK has focused more on roadways, proposing eight-lane expressways connecting major cities and new airports in Hosur and Salem.</p>
                    
                    <h3>Urban Development</h3>
                    <p>Urban infrastructure is a priority for both parties, with the DMK focusing on urban renewal and smart city solutions for existing urban centers. The AIADMK has emphasized new development projects and industrial corridors with modern infrastructure.</p>
                    
                    <h3>Rural Connectivity</h3>
                    <p>The DMK has promised all-weather roads to every village and 100% broadband connectivity across the state. The AIADMK has focused on connecting rural areas to industrial corridors and improving agricultural infrastructure.</p>
                    
                    <h3>Power Infrastructure</h3>
                    <p>Both parties have committed to ensuring reliable power supply, with the AIADMK emphasizing 24/7 power through renewable energy integration and the DMK focusing on modernizing the existing grid and expanding solar capacity.</p>
                </div>
                
                <div class="candidate-positions">
                    <h3>Candidate Positions</h3>
                    
                    <div class="position-card">
                        <h4>MK Stalin (DMK)</h4>
                        <p>"Infrastructure is the foundation for economic growth and quality of life. We will ensure that every part of Tamil Nadu, urban or rural, has access to world-class infrastructure."</p>
                        <p>"Digital connectivity is no longer a luxury but a necessity, and we will make it available to all."</p>
                    </div>
                    
                    <div class="position-card">
                        <h4>Edappadi K. Palaniswami (AIADMK)</h4>
                        <p>"Our infrastructure vision will transform Tamil Nadu's connectivity, with eight-lane expressways, new airports, and modernized ports to boost our economic potential."</p>
                        <p>"Industrial corridors with plug-and-play infrastructure will make Tamil Nadu the most attractive destination for global manufacturers."</p>
                    </div>
                </div>
            `;
        } else if (issue === 'water') {
            content = `
                <h2>Water Management in Tamil Nadu</h2>
                
                <div class="issue-description">
                    <p>Water management is a critical issue for Tamil Nadu, a state that faces both water scarcity and flooding challenges, as well as interstate water disputes:</p>
                    
                    <h3>Cauvery Water Dispute</h3>
                    <p>The ongoing Cauvery water dispute with Karnataka remains a significant political issue. The DMK has taken a more assertive stance on Tamil Nadu's water rights, while the AIADMK has emphasized a diplomatic approach to resolving the dispute.</p>
                    
                    <h3>Water Conservation</h3>
                    <p>Both parties have proposed water conservation measures, with the DMK focusing on river rejuvenation and rainwater harvesting, and the AIADMK emphasizing groundwater recharge through check dams and other structures.</p>
                    
                    <h3>Irrigation Infrastructure</h3>
                    <p>Agricultural water use is a key concern, with the DMK proposing modernization of irrigation systems and the AIADMK focusing on micro-irrigation promotion for agricultural efficiency.</p>
                    
                    <h3>Urban Water Supply</h3>
                    <p>For urban areas, the DMK has proposed urban water body restoration projects, while the AIADMK has emphasized desalination plants for coastal districts and new reservoir projects.</p>
                </div>
                
                <div class="candidate-positions">
                    <h3>Candidate Positions</h3>
                    
                    <div class="position-card">
                        <h4>MK Stalin (DMK)</h4>
                        <p>"Water security is national security, and we will ensure that Tamil Nadu never faces a water crisis again through our ₹10,000 crore comprehensive water security plan."</p>
                        <p>"The Cauvery is Tamil Nadu's lifeline, and we will protect our rightful share of its waters."</p>
                    </div>
                    
                    <div class="position-card">
                        <h4>Edappadi K. Palaniswami (AIADMK)</h4>
                        <p>"Our approach to water management combines traditional wisdom with modern technology, including interlinking rivers within Tamil Nadu and establishing desalination plants."</p>
                        <p>"We will work diplomatically with neighboring states to ensure fair water sharing while developing our own water resources."</p>
                    </div>
                </div>
            `;
        } else if (issue === 'agriculture') {
            content = `
                <h2>Agricultural Policy in Tamil Nadu</h2>
                
                <div class="issue-description">
                    <p>Agriculture remains the livelihood for a significant portion of Tamil Nadu's population, making agricultural policy a crucial election issue:</p>
                    
                    <h3>Farmer Welfare</h3>
                    <p>Both parties have emphasized farmer welfare, with the DMK proposing a comprehensive loan waiver and monthly support payments for small and marginal farmers. The AIADMK has focused on crop insurance, minimum support prices, and direct benefit transfers.</p>
                    
                    <h3>Agricultural Modernization</h3>
                    <p>The AIADMK has emphasized technological modernization of agriculture through mechanization, precision farming, and digital agriculture initiatives. The DMK has focused on sustainable farming practices and organic farming promotion.</p>
                    
                    <h3>Marketing Infrastructure</h3>
                    <p>Both parties have proposed improvements to agricultural marketing infrastructure, with the DMK focusing on farmer producer organizations and the AIADMK on cold storage facilities and food processing units.</p>
                    
                    <h3>Climate Resilience</h3>
                    <p>With climate change affecting agricultural productivity, both parties have proposed measures to enhance climate resilience, with different approaches to crop diversification, water management, and insurance.</p>
                </div>
                
                <div class="candidate-positions">
                    <h3>Candidate Positions</h3>
                    
                    <div class="position-card">
                        <h4>MK Stalin (DMK)</h4>
                        <p>"Farmers are the backbone of our state, and their welfare will be our top priority. We will ensure fair prices, comprehensive insurance, and support during natural calamities."</p>
                        <p>"We will promote sustainable and organic farming practices that protect both farmer livelihoods and our environment."</p>
                    </div>
                    
                    <div class="position-card">
                        <h4>Edappadi K. Palaniswami (AIADMK)</h4>
                        <p>"As a farmer myself, I understand the challenges faced by our agricultural community. Our policies will focus on modernization, mechanization, and market linkages."</p>
                        <p>"We will transform Tamil Nadu agriculture through technology, making it more productive, profitable, and resilient to climate challenges."</p>
                    </div>
                </div>
            `;
        }
        
        issueDetail.innerHTML = content;
        
        // Update search placeholder
        document.getElementById('issue-search-input').placeholder = `Ask about ${issue} policies...`;
    }
    
    function saveConversations() {
        localStorage.setItem('conversations', JSON.stringify(conversations));
        localStorage.setItem('currentConversationId', currentConversationId);
    }
});
