// menu-definitions.js
const ALL_MENUS = {
    'main': {
        key: 'main',
        image: 'handdator.png',
        originalWidth: 426,
        events: [
            { name: "Lasta ut", coords: { top:  197, left: 71, width: 138, height: 76 } },
            { name: "Lossa in", coords: { top: 197, left: 221, width: 138, height: 76 } },
            { name: "Hämta", coords: { top: 287, left: 71, width: 138, height: 76 }, submenu: 'hamta' },
            { name: "Leverera", coords: { top: 287, left: 221, width: 138, height: 76 } },
            { name: "Bomhämtning", coords: { top: 374, left: 71, width: 138, height: 76 } },
            { name: "Ej levererat", coords: { top: 374, left: 221, width: 138, height: 76 },submenu: 'ej-levererat' },
            { name: "Hämtning utan sändnings-ID", coords: { top: 463, left: 71, width: 138, height: 76 } },
            { name: "Åter terminal", coords: { top: 463, left: 221, width: 138, height: 76 } },
            { name: "Flänsa", coords: { top: 552, left: 71, width: 138, height: 76 }, submenu: 'flansa' },
            { name: "Hem", coords: { top: 655, left: 90, width: 35, height: 50 }, submenu: 'hem' }
        ]
    },
    'hamta': {
        key: 'hamta',
        image: 'handdator-hamta.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Hämta åt annan bil", coords: { top: 295, left: 70, width: 185, height: 30 } },
            { name: "Hämta obokad hämtning", coords: { top: 240, left: 70, width: 185, height: 30 } }
        ]
    },
    'ej-levererat': {
        key: 'ej-levererat',
        image: 'handdator-ej-levererat.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { 
        name: "Orsakskod",
        type: "dropdown", 
        coords: { top: 180, left: 55, width: 315, height: 460 },
        // Nya egenskaper:
        title: "Välj orsakskod",
        layout: "radio-list", // <-- Vi döper den nuvarande layouten till 'radio-list'
        options: [
            "Felaktigt lastad",
            "Togs ej emot av mottagaren",
            "Stängt/Semester",
            "Hittar ej mottagaren",
            "Portkod",
            "Ej komplett",
            "Ej lastat",
            "Fel adress",
            "Försenad"
        ]
    },

        // NYTT TILLÄGG: Objekt 2, en vanlig klickbar yta
        // Lägg till ett kommatecken efter rullist-objektet och klistra in detta:
        { 
            name: "Bekräfta Orsak", 
            coords: { top: 640, left: 67, width: 288, height: 40 } // <-- BYT UT MOT DINA KOORDINATER
        }
    ]
    },
    'flansa': {
        key: 'flansa',
        image: 'handdator-flansa.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Flänsa på", coords: { top: 197, left: 71, width: 138, height: 76 } },
            { name: "Flänsa av", coords: { top: 197, left: 221, width: 138, height: 76 } }
        ]
    },
    'hem': {
        key: 'hem',
        image: 'handdator-hem.png',
        originalWidth: 426,
        backButtonCoords: { top: 655, left: 175, width: 80, height: 50 },
        events: [
            { name: "Synkronisera visa", coords: { top: 385, left: 70, width: 80, height: 25 }, submenu: 'senastehandelse' }
        ]
    },
    'senastehandelse': {
        key: 'senastehandelse',
        image: 'handdator-senaste-handelse.png',
        originalWidth: 426,
        backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
        events: [
            { name: "Ångra", coords: { top: 240, left: 300, width: 60, height: 30 } }
        ]
    }
};
