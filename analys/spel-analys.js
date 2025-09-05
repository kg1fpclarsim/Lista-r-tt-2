document.addEventListener('DOMContentLoaded', () => {
    const scenarioContainer = document.querySelector('.analysis-container');
    const titleElement = scenarioContainer.querySelector('.scenario-title');
    const descriptionElement = scenarioContainer.querySelector('.task-description');
    const chainContainer = document.querySelector('.sequence-chain-container');

    function renderChain(scenario) {
        chainContainer.innerHTML = '';
        titleElement.textContent = scenario.title;
        descriptionElement.innerHTML = marked.parse(scenario.steps[0].description);

        const elementsToAnimate = [];
        scenario.steps[0].sequenceGroups.forEach(group => {
            elementsToAnimate.push({ type: 'group', data: group });
        });

        animateElement(elementsToAnimate, 0);
    }

    function animateElement(elements, index) {
        if (index >= elements.length) return;

        const elementInfo = elements[index];

        if (elementInfo.type === 'group') {
            const group = elementInfo.data;
            const groupBlock = document.createElement('div');
            groupBlock.className = `group-block ${group.color} hidden`;
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'group-title';
            titleDiv.innerHTML = marked.parse(group.title);
            
            const eventsDiv = document.createElement('div');
            eventsDiv.className = 'group-events';

            group.events.forEach((event, eventIndex) => {
                const eventBlock = document.createElement('div');
                eventBlock.className = 'event-block';
                eventBlock.innerHTML = `
                    <div class="event-type">${event.event}</div>
                    <div class="event-icon-container"></div>
                    <div class="event-office">${event.office}</div>
                `;
                eventsDiv.appendChild(eventBlock);

                if (eventIndex < group.events.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.className = 'sequence-arrow';
                    arrow.textContent = '→';
                    eventsDiv.appendChild(arrow);
                }
            });

            groupBlock.appendChild(titleDiv);
            groupBlock.appendChild(eventsDiv);
            chainContainer.appendChild(groupBlock);

            requestAnimationFrame(() => {
                setTimeout(() => {
                    groupBlock.classList.remove('hidden');
                }, 10);
            });
        }

        setTimeout(() => {
            animateElement(elements, index + 1);
        }, 300);
    }

    async function loadAndStartAnalysisGame() {
        try {
            const response = await fetch('scenarios-analys.json?cachebust=' + new Date().getTime());
            if (!response.ok) throw new Error('Kunde inte ladda scenarios-analys.json');
            const scenarios = await response.json();
            
            if (scenarios.length > 0) {
                renderChain(scenarios[0]);
            } else {
                titleElement.textContent = "Inga scenarier hittades";
            }
        } catch (error) {
            console.error("Fel:", error);
            titleElement.textContent = "Ett fel uppstod";
        }
    }

    loadAndStartAnalysisGame();
});
