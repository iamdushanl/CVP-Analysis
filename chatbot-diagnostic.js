// Quick diagnostic script to test chatbot functionality
console.log('====================================');
console.log('CHATBOT DIAGNOSTIC TEST');
console.log('====================================\n');

// Test 1: Check if ChatbotService is defined
console.log('1. ChatbotService Check:');
if (typeof ChatbotService !== 'undefined') {
    console.log('   ✅ ChatbotService is loaded');
    console.log('   - isInitialized:', ChatbotService.isInitialized);
    console.log('   - API Key present:', ChatbotService.apiKey ? 'Yes' : 'No');
} else {
    console.log('   ❌ ChatbotService is NOT loaded');
}

// Test 2: Check if ChatbotUI is defined
console.log('\n2. ChatbotUI Check:');
if (typeof ChatbotUI !== 'undefined') {
    console.log('   ✅ ChatbotUI is loaded');
} else {
    console.log('   ❌ ChatbotUI is NOT loaded');
}

// Test 3: Check if CVP_KNOWLEDGE_BASE is defined
console.log('\n3. CVP_KNOWLEDGE_BASE Check:');
if (typeof CVP_KNOWLEDGE_BASE !== 'undefined') {
    console.log('   ✅ CVP_KNOWLEDGE_BASE is loaded');
} else {
    console.log('   ❌ CVP_KNOWLEDGE_BASE is NOT loaded');
}

// Test 4: Check for chatbot container
console.log('\n4. Chatbot Container Check:');
const container = document.getElementById('chatbotContainer');
if (container) {
    console.log('   ✅ Chatbot container exists');
    console.log('   - innerHTML length:', container.innerHTML.length);
    console.log('   - Has content:', container.innerHTML.length > 0 ? 'Yes' : 'No');
} else {
    console.log('   ❌ Chatbot container NOT found');
}

// Test 5: Check for chatbot widget
console.log('\n5. Chatbot Widget Check:');
const widget = document.querySelector('.chatbot-widget');
if (widget) {
    console.log('   ✅ Chatbot widget found');
    console.log('   - Is minimized:', widget.classList.contains('minimized'));
    const computedStyle = window.getComputedStyle(widget);
    console.log('   - Display:', computedStyle.display);
    console.log('   - Visibility:', computedStyle.visibility);
    console.log('   - Position:', computedStyle.position);
    console.log('   - Bottom:', computedStyle.bottom);
    console.log('   - Right:', computedStyle.right);
    console.log('   - Z-index:', computedStyle.zIndex);
} else {
    console.log('   ❌ Chatbot widget NOT found in DOM');
}

// Test 6: Check for toggle button
console.log('\n6. Toggle Button Check:');
const toggleBtn = document.getElementById('chatbotToggle');
if (toggleBtn) {
    console.log('   ✅ Toggle button found');
    const computedStyle = window.getComputedStyle(toggleBtn);
    console.log('   - Display:', computedStyle.display);
    console.log('   - Visibility:', computedStyle.visibility);
} else {
    console.log('   ❌ Toggle button NOT found');
}

// Test 7: Check CSS loading
console.log('\n7. CSS Loading Check:');
const links = document.querySelectorAll('link[rel="stylesheet"]');
let chatbotCSSFound = false;
links.forEach(link => {
    if (link.href.includes('chatbot-styles.css')) {
        chatbotCSSFound = true;
        console.log('   ✅ chatbot-styles.css link found');
        console.log('   - Href:', link.href);
    }
});
if (!chatbotCSSFound) {
    console.log('   ❌ chatbot-styles.css NOT found in page links');
}

console.log('\n====================================');
console.log('END DIAGNOSTIC TEST');
console.log('====================================');
