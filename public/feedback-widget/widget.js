/**
 * Legolasan Client Feedback Widget
 * Self-contained embeddable feedback system for client project previews
 *
 * Usage:
 * <script>
 *   window.LEGOLASAN_FEEDBACK_CONFIG = {
 *     projectId: 'your-project-slug',
 *     apiUrl: 'https://legolasan.in/api',
 *     token: 'your-access-token'
 *   };
 * </script>
 * <script src="https://legolasan.in/feedback-widget/widget.js" defer></script>
 */

(function() {
  'use strict';

  // Configuration
  const config = window.LEGOLASAN_FEEDBACK_CONFIG || {};
  if (!config.projectId || !config.apiUrl || !config.token) {
    console.error('Legolasan Feedback Widget: Missing required configuration');
    return;
  }

  // State
  let feedbackMode = false;
  let existingFeedback = [];
  let highlightedElement = null;

  // CSS Styles
  const styles = `
    .legolasan-feedback-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 24px;
      color: white;
    }

    .legolasan-feedback-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
    }

    .legolasan-feedback-btn.active {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .legolasan-feedback-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      z-index: 999997;
      cursor: crosshair;
    }

    .legolasan-feedback-highlight {
      outline: 3px solid #667eea !important;
      outline-offset: 2px !important;
      cursor: pointer !important;
      position: relative !important;
    }

    .legolasan-feedback-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .legolasan-feedback-modal h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .legolasan-feedback-modal textarea {
      width: 100%;
      min-height: 120px;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      resize: vertical;
      box-sizing: border-box;
    }

    .legolasan-feedback-modal textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .legolasan-feedback-modal input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin-bottom: 12px;
      box-sizing: border-box;
    }

    .legolasan-feedback-modal input:focus {
      outline: none;
      border-color: #667eea;
    }

    .legolasan-feedback-modal .element-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      margin: 12px 0;
      font-size: 13px;
      color: #666;
      font-family: monospace;
    }

    .legolasan-feedback-modal .buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .legolasan-feedback-modal button {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .legolasan-feedback-modal .btn-submit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .legolasan-feedback-modal .btn-submit:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .legolasan-feedback-modal .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .legolasan-feedback-modal .btn-cancel {
      background: #f0f0f0;
      color: #333;
    }

    .legolasan-feedback-modal .btn-cancel:hover {
      background: #e0e0e0;
    }

    .legolasan-feedback-pin {
      position: absolute;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      cursor: pointer;
      z-index: 999996;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
    }

    .legolasan-feedback-pin:hover {
      transform: rotate(-45deg) scale(1.2);
    }

    .legolasan-feedback-pin::before {
      content: attr(data-count);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      color: white;
      font-size: 12px;
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .legolasan-feedback-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #333;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .legolasan-feedback-toast.success {
      border-left: 4px solid #10b981;
    }

    .legolasan-feedback-toast.error {
      border-left: 4px solid #ef4444;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create feedback button
  const feedbackBtn = document.createElement('button');
  feedbackBtn.className = 'legolasan-feedback-btn';
  feedbackBtn.innerHTML = '💬';
  feedbackBtn.title = 'Leave Feedback';
  feedbackBtn.setAttribute('aria-label', 'Leave Feedback');

  // Toggle feedback mode
  feedbackBtn.addEventListener('click', () => {
    feedbackMode = !feedbackMode;

    if (feedbackMode) {
      enableFeedbackMode();
    } else {
      disableFeedbackMode();
    }
  });

  // Enable feedback mode
  function enableFeedbackMode() {
    feedbackBtn.classList.add('active');
    feedbackBtn.innerHTML = '✖';
    feedbackBtn.title = 'Exit Feedback Mode';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'legolasan-feedback-overlay';
    overlay.id = 'legolasan-overlay';
    document.body.appendChild(overlay);

    // Add mouseover listener to highlight elements
    document.addEventListener('mouseover', highlightElement);
    document.addEventListener('click', handleElementClick);

    showToast('Click any element to leave feedback', 'success');
  }

  // Disable feedback mode
  function disableFeedbackMode() {
    feedbackBtn.classList.remove('active');
    feedbackBtn.innerHTML = '💬';
    feedbackBtn.title = 'Leave Feedback';

    // Remove overlay
    const overlay = document.getElementById('legolasan-overlay');
    if (overlay) overlay.remove();

    // Remove highlight
    if (highlightedElement) {
      highlightedElement.classList.remove('legolasan-feedback-highlight');
      highlightedElement = null;
    }

    // Remove listeners
    document.removeEventListener('mouseover', highlightElement);
    document.removeEventListener('click', handleElementClick);
  }

  // Highlight element on mouseover
  function highlightElement(e) {
    if (!feedbackMode) return;

    const target = e.target;

    // Ignore our own elements
    if (target.closest('.legolasan-feedback-btn') ||
        target.closest('.legolasan-feedback-overlay') ||
        target.closest('.legolasan-feedback-modal') ||
        target.closest('.legolasan-feedback-pin')) {
      return;
    }

    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.classList.remove('legolasan-feedback-highlight');
    }

    // Add new highlight
    target.classList.add('legolasan-feedback-highlight');
    highlightedElement = target;
  }

  // Handle element click
  function handleElementClick(e) {
    if (!feedbackMode) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target;

    // Ignore our own elements
    if (target.closest('.legolasan-feedback-btn') ||
        target.closest('.legolasan-feedback-overlay') ||
        target.closest('.legolasan-feedback-modal') ||
        target.closest('.legolasan-feedback-pin')) {
      return;
    }

    // Show feedback modal
    showFeedbackModal(target, e.clientX, e.clientY);
  }

  // Show feedback modal
  function showFeedbackModal(element, x, y) {
    disableFeedbackMode();

    const modal = document.createElement('div');
    modal.className = 'legolasan-feedback-modal';
    modal.innerHTML = `
      <h3>💬 Leave Feedback</h3>
      <div class="element-info">
        <div><strong>Element:</strong> ${element.tagName.toLowerCase()}</div>
        ${element.id ? `<div><strong>ID:</strong> ${element.id}</div>` : ''}
        ${element.className ? `<div><strong>Class:</strong> ${element.className}</div>` : ''}
        ${element.textContent.trim().substring(0, 50) ? `<div><strong>Text:</strong> ${element.textContent.trim().substring(0, 50)}...</div>` : ''}
      </div>
      <textarea
        id="legolasan-feedback-content"
        placeholder="What would you like to share about this element?"
        autofocus
      ></textarea>
      <input
        type="text"
        id="legolasan-feedback-name"
        placeholder="Your name (optional)"
      />
      <input
        type="email"
        id="legolasan-feedback-email"
        placeholder="Your email (optional)"
      />
      <div class="buttons">
        <button class="btn-cancel" id="legolasan-feedback-cancel">Cancel</button>
        <button class="btn-submit" id="legolasan-feedback-submit">Submit Feedback</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus textarea
    setTimeout(() => {
      document.getElementById('legolasan-feedback-content').focus();
    }, 100);

    // Cancel button
    document.getElementById('legolasan-feedback-cancel').addEventListener('click', () => {
      modal.remove();
    });

    // Submit button
    document.getElementById('legolasan-feedback-submit').addEventListener('click', () => {
      submitFeedback(element, x, y, modal);
    });
  }

  // Submit feedback
  async function submitFeedback(element, x, y, modal) {
    const content = document.getElementById('legolasan-feedback-content').value.trim();
    const name = document.getElementById('legolasan-feedback-name').value.trim();
    const email = document.getElementById('legolasan-feedback-email').value.trim();

    if (!content) {
      showToast('Please enter your feedback', 'error');
      return;
    }

    const submitBtn = document.getElementById('legolasan-feedback-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Capture screenshot
      const screenshotData = await captureScreenshot();

      // Generate element selector
      const selector = generateSelector(element);

      // Prepare feedback data
      const feedbackData = {
        projectSlug: config.projectId,
        accessToken: config.token,
        content: content,
        pageUrl: window.location.href,
        pagePath: window.location.pathname,
        elementSelector: selector,
        elementText: element.textContent.trim().substring(0, 500),
        elementHtml: element.outerHTML.substring(0, 1000),
        screenshotData: screenshotData,
        positionX: x,
        positionY: y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        clientName: name || null,
        clientEmail: email || null
      };

      // Submit to API
      const response = await fetch(`${config.apiUrl}/client-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit feedback');
      }

      const result = await response.json();

      modal.remove();
      showToast('✅ Feedback submitted successfully!', 'success');

      // Reload feedback pins
      await loadExistingFeedback();

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showToast('❌ ' + error.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Feedback';
    }
  }

  // Capture screenshot
  async function captureScreenshot() {
    try {
      // Use html2canvas if available, otherwise return null
      if (typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(document.body);
        return canvas.toDataURL('image/png');
      }

      // Fallback: Simple canvas screenshot (limited browser support)
      return null;
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  }

  // Generate CSS selector for element
  function generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();

      if (element.className) {
        const classes = element.className.split(' ').filter(c => c && !c.startsWith('legolasan-'));
        if (classes.length) {
          selector += '.' + classes.join('.');
        }
      }

      path.unshift(selector);
      element = element.parentNode;

      if (path.length > 5) break; // Limit depth
    }

    return path.join(' > ');
  }

  // Load existing feedback
  async function loadExistingFeedback() {
    try {
      const response = await fetch(
        `${config.apiUrl}/client-feedback?projectSlug=${config.projectId}&pagePath=${encodeURIComponent(window.location.pathname)}&token=${config.token}`
      );

      if (!response.ok) return;

      const data = await response.json();
      existingFeedback = data.feedback || [];

      // Remove existing pins
      document.querySelectorAll('.legolasan-feedback-pin').forEach(pin => pin.remove());

      // Show feedback pins
      existingFeedback.forEach(feedback => {
        if (feedback.positionX && feedback.positionY) {
          showFeedbackPin(feedback);
        }
      });

    } catch (error) {
      console.error('Failed to load existing feedback:', error);
    }
  }

  // Show feedback pin
  function showFeedbackPin(feedback) {
    const pin = document.createElement('div');
    pin.className = 'legolasan-feedback-pin';
    pin.style.left = feedback.positionX + 'px';
    pin.style.top = feedback.positionY + 'px';
    pin.setAttribute('data-count', '💬');
    pin.title = feedback.content.substring(0, 100);

    // Show feedback details on click
    pin.addEventListener('click', () => {
      showToast(
        `<strong>${feedback.clientName || 'Anonymous'}</strong><br>${feedback.content}`,
        'success'
      );
    });

    document.body.appendChild(pin);
  }

  // Show toast notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `legolasan-feedback-toast ${type}`;
    toast.innerHTML = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Initialize
  function init() {
    // Add feedback button to page
    document.body.appendChild(feedbackBtn);

    // Load existing feedback
    loadExistingFeedback();

    console.log('Legolasan Feedback Widget initialized');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
