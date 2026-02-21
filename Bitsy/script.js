
(function() {
    const REDIRECT_CONFIGS = [
        {
            roomId: '1s',
            url: 'https://www.linkedin.com/in/jaouensarah/details/projects/',
            title: 'Fleur Réactive',
            message: 'projet touchdesigner'
        },
        {
            roomId: '1t',
            url: 'https://youtu.be/paNw93YMrFo?si=yfSbUw_1YdB91HFA',
            title: 'Arcane Prod 3D',
            message: 'projet cinema4d'
        },
        {
            roomId: '1u',
            url: 'https://www.linkedin.com/in/jaouensarah/details/projects/',
            title: 'Collodion Interactif',
            message: 'projet touchdesigner'
        }
    ];

    // le game canva 
    const GAME_CANVAS_ID = 'game';
    // popup html à injecter
    const POPUP_HTML_FILE = 'popup.html';

    let bitsyGameCanvas = null;
    
    let triggeredActions = {};
    
    let lastDetectedRoom = null;

    
    function getBitsyCanvas() {
        if (!bitsyGameCanvas) {
            bitsyGameCanvas = document.getElementById(GAME_CANVAS_ID);
            if (!bitsyGameCanvas) {
                bitsyGameCanvas = document.querySelector('canvas');
            }
        }
        return bitsyGameCanvas;
    }

   
    function getCurrentBitsyRoomId() {
        if (typeof curRoom !== 'undefined') {
            return String(curRoom);
        }
        return null;
    }

    
    let customPopup, popupTitle, popupMessage, popupInstruction, popupOpenBtn, popupCloseBtn;
    let storedRedirectUrl = '';

    
    function setupPopupElements() {
        customPopup = document.getElementById('customPopup');
        popupTitle = document.getElementById('popupTitle');
        popupMessage = document.getElementById('popupMessage');
        popupInstruction = document.getElementById('popupInstruction');
        popupOpenBtn = document.getElementById('popupOpenBtn');
        popupCloseBtn = document.getElementById('popupCloseBtn');

        if (!customPopup || !popupTitle || !popupMessage || !popupInstruction || !popupOpenBtn || !popupCloseBtn) {
            console.error("CRITICAL: One or more custom popup HTML elements not found. Please ensure 'popup.html' is correct and IDs match.");
            return false;
        }

        popupOpenBtn.addEventListener('click', onPopupOpenClick);
        popupCloseBtn.addEventListener('click', onPopupCloseClick);

        return true;
    }

    
    window.showCustomPopup = function(title, message, url) {
        if (!customPopup) {
            if (!setupPopupElements()) {
                console.error("Cannot show popup: Elements not ready after initial setup attempt.");
                return;
            }
        }

        popupTitle.textContent = title;
        popupMessage.textContent = message;
        storedRedirectUrl = url;

        customPopup.style.display = 'block';
    };

    
    function onPopupOpenClick() {
        if (storedRedirectUrl) {
            window.open(storedRedirectUrl, '_blank');
        }
        customPopup.style.display = 'none';
        storedRedirectUrl = '';
    }

    
    function onPopupCloseClick() {
        customPopup.style.display = 'none';
        storedRedirectUrl = '';
    }

    // --- fonction d'inject html pour orga ---
    async function loadPopupHtmlAndCss() {
        try {
            const response = await fetch(POPUP_HTML_FILE);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}. Could not load '${POPUP_HTML_FILE}'.`);
            }
            const htmlContent = await response.text();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            const styleElement = tempDiv.querySelector('style');
            if (styleElement) {
                document.head.appendChild(styleElement);
            } else {
                console.warn(`No <style> tag found in '${POPUP_HTML_FILE}'.`);
            }

            const popupDiv = tempDiv.querySelector('#customPopup');
            if (popupDiv) {
                document.body.appendChild(popupDiv);
            } else {
                console.error(`No '#customPopup' div found in '${POPUP_HTML_FILE}'.`);
            }

            setupPopupElements();

        } catch (e) {
            console.error(`ouch html css pas loadé '${POPUP_HTML_FILE}':`, e);
        }
    }

    // --- Loop et Detection de room ---
    function checkCurrentRoomAndTriggerAction() {
        const currentRoom = getCurrentBitsyRoomId();

        
        if (currentRoom === null || currentRoom === lastDetectedRoom) {
            return;
        }

        
        lastDetectedRoom = currentRoom;

        
        const config = REDIRECT_CONFIGS.find(cfg => cfg.roomId === currentRoom);

        if (config) {
            
            if (!triggeredActions[currentRoom]) {
                console.log(`Entered room "${currentRoom}". Triggering popup for URL: ${config.url}`);
                window.showCustomPopup(config.title, config.message, config.url);
                triggeredActions[currentRoom] = true; 
            }
        } else {
           
            // recharger la popup si room entree encore
            for (const roomId in triggeredActions) {
                if (triggeredActions.hasOwnProperty(roomId) && triggeredActions[roomId]) {
                    triggeredActions[roomId] = false;
                }
            }
            console.log(`Mauvaise room"${currentRoom}". Reset des flags`);
        }
    }


    // --- Init les hacks ---
    window.addEventListener('load', () => {
        // popup injecteur 
        loadPopupHtmlAndCss().then(() => {
            
            setTimeout(() => {
                const canvas = getBitsyCanvas(); 

                if (canvas) {
                    console.log('Bitsy game start, detection de room');
                    // room ID detection selon la doc de Bitsy3D
                    setInterval(checkCurrentRoomAndTriggerAction, 500); 
                } else {
                    console.error("Bitsy game canvas erreur");
                }
            }, 3000); // Increased wait time to 3 seconds for maximum robustness
        });
    });

})();