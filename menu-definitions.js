// menu-definitions.js

const ALL_MENUS = {
    // Huvudmenyn
    'main': {
        key: 'main',
        image: 'handdator.png',
        events: [
            { name: "Lasta ut", coords: { top:  197, left: 71, width: 138, height: 76 } },
            { name: "Lossa in", coords: { top: 197, left: 221, width: 138, height: 76 } },
            { name: "Hämta", coords: { top: 287, left: 71, width: 138, height: 76 }, submenu: 'hamta' }, // <-- Länkar till 'hamta'-menyn
            { name: "Leverera", coords: { top: 287, left: 221, width: 138, height: 76 } },
            { name: "Bomhämtning", coords: { top: 374, left: 71, width: 138, height: 76 } },
            { name: "Ej levererat", coords: { top: 374, left: 221, width: 138, height: 76 } },
            { name: "Hämtning utan sändnings-ID", coords: { top: 463, left: 71, width: 138, height: 76 } },
            { name: "Åter terminal", coords: { top: 463, left: 221, width: 138, height: 76 } },
            { name: "Flänsa", coords: { top: 552, left: 71, width: 138, height: 76 }, submenu: 'flansa' }, // <-- Länkar till 'flansa'-menyn
            { name: "Hem", coords: { top: 655, left: 90, width: 35, height: 50 }, submenu: 'hem' } // <-- Länkar till 'hem'-menyn
        ]
    },

    // Undermeny för "Hämta"
    'hamta': {
        key: 'hamta',
        image: 'handdator-hamta.png',
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Hämta åt annan bil", coords: { top: 295, left: 70, width: 185, height: 30 } },
            { name: "Hämta obokad hämtning", coords: { top: 240, left: 70, width: 185, height: 30 } }
        ]
    },

    // Undermeny för "Flänsa"
    'flansa': {
        key: 'flansa',
        image: 'handdator-flansa.png',
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Flänsa på", coords: { top: 197, left: 71, width: 138, height: 76 } },
            { name: "Flänsa av", coords: { top: 197, left: 221, width: 138, height: 76 } }
        ]
    },

    // Undermeny för "Hem"
    'hem': {
        key: 'hem',
        image: 'handdator-hem.png',
        backButtonCoords: { top: 655, left: 175, width: 80, height: 50 },
        events: [
            { name: "Synkronisera visa", coords: { top: 385, left: 70, width: 80, height: 25 }, submenu: 'senastehandelse' } // <-- Länkar till nästa nivå
        ]
    },

    // Undermeny för "Senaste Händelse"
    'senastehandelse': {
        key: 'senastehandelse',
        image: 'handdator-senastehandelse.png',
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Ångra", coords: { top: 240, left: 300, width: 60, height: 30 } }
        ]
    }
    // Lägg till nya menyer här som 'min-nya-meny': { ... }
};
