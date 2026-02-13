// Splash screen handling
const splashScreen = document.getElementById('splash-screen');
if (splashScreen) {
    const dismissSplash = () => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.remove();
        }, 500); // Match CSS transition duration
    };
    
    // Dismiss on click
    splashScreen.addEventListener('click', dismissSplash);
    
    // Auto-dismiss after 3 seconds
    setTimeout(dismissSplash, 3000);
}

const targetDate = new Date('2026-01-24T00:00:00-05:00'); // January 24, 2026, 00:00:00 EST
const timerElement = document.getElementById('timer');
const statusElement = document.getElementById('status');
const linkContainer = document.getElementById('link-container');
const postTimerLinks = document.getElementById('post-timer-links');

function updateTimer() {
    const now = new Date();
    const difference = targetDate - now;
    
    if (difference <= 0) {
        timerElement.textContent = 'Phase 1 complete. Data processing commences. Duration indeterminate.';
        document.getElementById('waiver-link').classList.add('hidden'); // Hide only waiver link
        postTimerLinks.classList.remove('hidden');
        return;
    }
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((difference % 1000) / 10);
    
    const formatTime = (num) => String(num).padStart(2, '0');
    const formatMs = (num) => String(num).padStart(3, '0');
    
    timerElement.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}:${formatMs(milliseconds)}`;
}

// Update timer every 10ms for smooth millisecond display
setInterval(updateTimer, 10);
updateTimer(); // Initial call