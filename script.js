document.addEventListener('DOMContentLoaded', () => {
    // Din topLevelMenu och ORIGINAL_IMAGE_WIDTH är oförändrade...
    const ORIGINAL_IMAGE_WIDTH = 430; 
    const topLevelMenu = { /* ... din data med alla koordinater ... */ };

    let loadedScenario = null;
    let currentScenarioStepIndex = 0;
    let currentSequenceStep = 0;
    let currentMenuView = topLevelMenu;
    let menuHistory = [];

    // HTML-element...
    const gameImage = document.getElementById('game-image');
    // ... och alla andra ...

    // Huvudfunktion för att starta spelet
    async function initializeGame() {
        let scenarioPlaylist = JSON.parse(sessionStorage.getItem('scenarioPlaylist'));
        let currentPlaylistIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);

        // Om ingen spellista finns, skapa en ny
        if (!scenarioPlaylist) {
            try {
                const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
                if (!response.ok) throw new Error('Nätverksfel');
                let allScenarios = await response.json();

                // Blanda scenarierna (Fisher-Yates shuffle)
                for (let i = allScenarios.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allScenarios[i], allScenarios[j]] = [allScenarios[j], allScenarios[i]];
                }
                
                scenarioPlaylist = allScenarios;
                sessionStorage.setItem('scenarioPlaylist', JSON.stringify(scenarioPlaylist));
                sessionStorage.setItem('currentPlaylistIndex', '0');

            } catch (error) {
                // ... felhantering ...
                return;
            }
        }

        // Kolla om vi är klara med alla scenarier
        if (currentPlaylistIndex >= scenarioPlaylist.length) {
            // ALLT ÄR KLART! Skicka till certifikatsidan.
            window.location.href = 'certifikat.html';
            return;
        }

        // Ladda det aktuella scenariot från spellistan
        loadedScenario = scenarioPlaylist[currentPlaylistIndex];
        currentScenarioStepIndex = 0;
        setupCurrentScenarioStep();
    }
    
    // Byt namn på knappen och dess funktion
    const nextScenarioButton = document.getElementById('reset-button');
    nextScenarioButton.textContent = 'Nästa Scenario';
    nextScenarioButton.style.display = 'none'; // Göm knappen från start
    nextScenarioButton.addEventListener('click', () => {
        let currentIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        sessionStorage.setItem('currentPlaylistIndex', currentIndex + 1);
        location.reload(); // Ladda om sidan för att starta nästa scenario
    });


    // Din handleEventClick-funktion behöver en liten ändring
    function handleEventClick(clickedEvent, areaElement) {
        // ... all din tidigare logik för att hantera klick ...
        // ÄNDA FRAM TILL sista delen där hela scenariot är klart
        
        // Inuti if(isLastStepOfScenario) { ... }
        // Byt ut setTimeout-blocket mot detta:
        setTimeout(() => {
            feedbackMessage.textContent = 'Bra gjort! Hela scenariot är slutfört. Klicka på "Nästa Scenario".';
            feedbackArea.className = 'feedback-correct';
            nextScenarioButton.style.display = 'block'; // Visa knappen för att gå vidare
            if (menuHistory.length > 0) {
                menuHistory = [];
                switchMenuView(topLevelMenu);
            }
        }, 700);
        // ... resten av din handleEventClick ...
    }
    
    // Alla andra funktioner (setupCurrentScenarioStep, resetGameState, etc.) är oförändrade
    // ...
    
    // Starta spelet
    initializeGame(); 
});
