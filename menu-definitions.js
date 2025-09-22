// menu-definitions.js
const ALL_MENUS = {
    'main': {
        key: 'main',
        image: 'images/simulator-screens/handdator.png',
        originalWidth: 426,
        events: [
            { name: "Lasta ut", coords: { top:  197, left: 71, width: 138, height: 76 } },
            { name: "Lossa in", coords: { top: 197, left: 221, width: 138, height: 76 } },
            { name: "Hämta", coords: { top: 287, left: 71, width: 138, height: 76 }, submenu: 'hamta-valj-kontor' },
            { name: "Leverera", coords: { top: 287, left: 221, width: 138, height: 76 } },
            { name: "Bomhämtning", coords: { top: 374, left: 71, width: 138, height: 76 } },
            { name: "Ej levererat", coords: { top: 374, left: 221, width: 138, height: 76 }, submenu: 'ej-levererat' },
            { name: "Hämtning utan sändnings-ID", coords: { top: 463, left: 71, width: 138, height: 76 } },
            { name: "Åter terminal", coords: { top: 463, left: 221, width: 138, height: 76 } },
            { name: "Flänsa", coords: { top: 552, left: 71, width: 138, height: 76 }, submenu: 'flansa' },
            { name: "Hem", coords: { top: 655, left: 90, width: 35, height: 50 }, submenu: 'hem' }
        ]
    },
    'hamta-typ': {
        key: 'hamta-typ',
        image: 'images/simulator-screens/handdator-hamta.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Hämta åt annan bil", coords: { top: 295, left: 70, width: 185, height: 30 } },
            { name: "Hämta obokad hämtning", coords: { top: 240, left: 70, width: 185, height: 30 } }
        ]
    },
    'hamta-valj-kontor': {
        key: 'hamta-valj-kontor',
        image: 'images/simulator-screens/handdator-hamta-valj-kontor.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25  },
        events: [
            {
                name: "Kontor",
                type: "dropdown",
                // UPPDATERAD: 'coords' är nu uppdelad
                triggerCoords: { top: 180, left: 55, width: 315, height: 30 },
                panelCoords: { top: 180, left: 55, width: 315, height: 520 },
                title: "Välj kontor i lista",
                layout: "radio-list",
                options: "ALL_OFFICES"
            },
            { name: "Bekräfta Kontor", coords: { top: 640, left: 67, width: 288, height: 40 }, submenu: 'hamta-typ' }
        ]
    },
    'ej-levererat': {
        key: 'ej-levererat',
        image: 'images/simulator-screens/handdator-ej-levererat.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { 
                name: "Orsakskod",
                type: "dropdown", 
                // UPPDATERAD: 'coords' är nu uppdelad med samma värden
                triggerCoords: { top: 180, left: 55, width: 315, height: 460 },
                panelCoords: { top: 180, left: 55, width: 315, height: 460 },
                title: "Välj orsakskod",
                layout: "radio-list",
                options: [ "Felaktigt lastad", "Togs ej emot av mottagaren", "Stängt/Semester", "Hittar ej mottagaren", "Portkod", "Ej komplett", "Ej lastat", "Fel adress", "Försenad" ]
            },
            { name: "Bekräfta Orsak", coords: { top: 640, left: 67, width: 288, height: 40 } }
        ]
    },
    'flansa': {
        key: 'flansa',
        image: 'images/simulator-screens/handdator-flansa.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Flänsa på", coords: { top: 197, left: 71, width: 138, height: 76 } },
            { name: "Flänsa av", coords: { top: 197, left: 221, width: 138, height: 76 } }
        ]
    },
    'hem': {
        key: 'hem',
        image: 'images/simulator-screens/handdator-hem.png',
        originalWidth: 426,
        backButtonCoords: { top: 655, left: 175, width: 80, height: 50 },
        events: [
            { name: "Synkronisera visa", coords: { top: 385, left: 70, width: 80, height: 25 }, submenu: 'senastehandelse' }
        ]
    },
    'senastehandelse': {
        key: 'senastehandelse',
        image: 'images/simulator-screens/handdator-senaste-handelse.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Ångra", coords: { top: 240, left: 300, width: 60, height: 30 } }
        ]
    }
};
