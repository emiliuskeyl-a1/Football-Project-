import { RouteLibrary, ConceptLibrary, FormationLibrary, MotionLibrary } from './types';

// Coordinates are relative (in yards). X is horizontal, Y is vertical downfield.
export const DEFAULT_ROUTE_LIBRARY: RouteLibrary = {
    "Slant": [{x: 0, y: 0}, {x: 0, y: 3}, {x: -7, y: 7}],
    "Corner": [{x: 0, y: 0}, {x: 0, y: 8}, {x: 7, y: 15}],
    "Flat": [{x: 0, y: 0}, {x: 0, y: 2}, {x: 8, y: 2}],
    "Verts": [{x: 0, y: 0}, {x: 0, y: 30}],
    "Post": [{x: 0, y: 0}, {x: 0, y: 8}, {x: -7, y: 15}],
    "Out": [{x: 0, y: 0}, {x: 0, y: 5}, {x: 10, y: 5}],
    "Dig": [{x: 0, y: 0}, {x: 0, y: 10}, {x: -10, y: 10}],
    "Bubble": [{x: 0, y: 0}, {x: 2, y: -1}, {x: 7, y: 0}],
    "Hitch": [{x: 0, y: 0}, {x: 0, y: 6}, {x: -1, y: 5}],
    "Comeback": [{x: 0, y: 0}, {x: 0, y: 12}, {x: 5, y: 10}],
    "Drag": [{x: 0, y: 0}, {x: -5, y: 3}, {x: -15, y: 5}],
    "Step": [{x: 0, y: 0}, {x: 0, y: 1}],
    "Stick": [{x: 0, y: 0}, {x: 0, y: 8}, {x: -1, y: 7}],
    "Comebackgo": [{x: 0, y: 0}, {x: 0, y: 10}, {x: 1, y: 9}, {x: 0, y: 15}],
    "Dragsit": [{x: 0, y: 0}, {x: -5, y: 3}, {x: -9, y: 6}],
    "Slantcorner": [{x: 0, y: 0}, {x: -5, y: 3}, {x: -5, y: 5}, {x: 0, y: 10}],
    "Block": [{x: 0, y: 0}, {x: 0, y: 5}, {x: -1, y: 5}, {x: 1, y: 5}],
    "Pump": [{x: 0, y: 0}, {x: 0, y: 5}, {x: -1, y: 6}, {x: 0, y: 7}, {x: 0, y: 10}],
    "Wheel": [{x: 0, y: 0}, {x: 3, y: 3}, {x: 5, y: 5}, {x: 5, y: 10}],
    "Wheelsit": [{x: 0, y: 0}, {x: 3, y: 3}, {x: 5, y: 5}, {x: 5, y: 10}, {x: 4, y: 9}],
    "Postsit": [{x: 0, y: 0}, {x: 0, y: 8}, {x: -5, y: 15}, {x: -6, y: 14}],
    "LDrag": [{x: 0, y: 0}, {x: 5, y: 3}, {x: 15, y: 5}],
    "Seam": [{x: 0, y: 0}, {x: 0, y: 20}],
    "Fade": [{x: 0, y: 0}, {x: 2, y: 20}],
    "Hook": [{x: 0, y: 0}, {x: 0, y: 10}, {x: 0, y: 9}],
    "Quick Out": [{x: 0, y: 0}, {x: 5, y: 3}],
    "LOut": [{x: 0, y: 0}, {x: 0, y: 5}, {x: -10, y: 5}],
};

export const DEFAULT_CONCEPT_LIBRARY: ConceptLibrary = {
    "Mesh": { routes: ["Out", "Drag", "LDrag", "LOut"], category: 'full' },
    "Captain": { routes: ["Comeback", "Comeback", "Comeback", "Comeback"], category: 'full' },
    "Verts": { routes: ["Verts", "Verts", "Verts", "Verts"], category: 'full' },
    "China": { routes: ["Hitch", "Corner"], category: 'two' },
    "Drive": { routes: ["Drag", "Seam"], category: 'two' },
    "Hiker": { routes: ["Hitch", "Hitch", "Hitch", "Hitch"], category: 'two' },
    "Pipes": { routes: ["Drag", "Post"], category: 'two' },
    "Twig": { routes: ["Fade", "Stick"], category: 'two' },
    "Dragon": { routes: ["Drag", "Dig"], category: 'two' },
    "Ohio": { routes: ["Hitch", "Out"], category: 'two' },
    "Verts Stop": { routes: ["Verts", "Verts"], category: 'two' },
    "Slants": { routes: ["Dig", "Slant"], category: 'two' },
    "Whip": { routes: ["Postsit", "Wheel"], category: 'two' },
    "Whack": { routes: ["Post", "Wheelsit"], category: 'two' },
    "Outlaw": { routes: ["Drag", "Dig"], category: 'two' },
    "Dublin": { routes: ["Dig", "Dig", "Out"], category: 'two' },
    "Pylon": { routes: ["Slantcorner", "Flat"], category: 'two' },
    "Ringo": { routes: ["Block", "Bubble", "Block", "Bubble"], category: 'two' },
    "Ringo Pump": { routes: ["Pump", "Bubble", "Block", "Bubble"], category: 'two' },
    "Linda": { routes: ["Bubble", "Block", "Bubble", "Block"], category: 'two' },
    "Linda Pump": { routes: ["Bubble", "Block", "Bubble", "Pump"], category: 'two' },
    "Dagger": { routes: ["Dig", "Fade", "Out"], category: 'three' },
    "Pinto": { routes: ["Post", "Dig", "Out"], category: 'three' },
    "Hit Em Up": { routes: ["Comebackgo", "Fade", "Dragsit"], category: 'three' },
    "Zander": { routes: ["Step", "Block", "Block", "Bubble"], category: 'three' },
    "Zander Pump": { routes: ["Step", "Fade", "Block", "Bubble"], category: 'three' },
    "Wilma": { routes: ["Bubble", "Block", "Block", "Step"], category: 'three' },
    "Wilma Pump": { routes: ["Bubble", "Block", "Fade", "Step"], category: 'three' },
    "Murrey": { routes: ["Block", "Step", "Block", "Block"], category: 'three' },
    "Murrey Pump": { routes: ["Block", "Block", "Fade", "Step"], category: 'three' },
    "Melody": { routes: ["Block", "Step", "Block", "Block"], category: 'three' },
    "Melody Pump": { routes: ["Pump", "Step", "Block", "Block"], category: 'three' }
};

// Positions are % of width/height. Origin (0,0) is top-left.
// Y: 80% is the Line of Scrimmage
const LINE_OF_SCRIMMAGE_Y = 80;

export const FORMATIONS: FormationLibrary = {
    "Spread": { 
        W: { x: 10, y: LINE_OF_SCRIMMAGE_Y }, 
        S: { x: 35, y: LINE_OF_SCRIMMAGE_Y + 2 }, 
        H: { x: 65, y: LINE_OF_SCRIMMAGE_Y + 2 }, 
        Z: { x: 90, y: LINE_OF_SCRIMMAGE_Y } 
    },
    "Split": { 
        Z: { x: 10, y: LINE_OF_SCRIMMAGE_Y }, 
        S: { x: 35, y: LINE_OF_SCRIMMAGE_Y + 2 }, 
        H: { x: 65, y: LINE_OF_SCRIMMAGE_Y + 2 }, 
        W: { x: 90, y: LINE_OF_SCRIMMAGE_Y } 
    },
    "Tri": { 
        W: { x: 15, y: LINE_OF_SCRIMMAGE_Y }, 
        S: { x: 65, y: LINE_OF_SCRIMMAGE_Y }, 
        H: { x: 75, y: LINE_OF_SCRIMMAGE_Y + 2 }, 
        Z: { x: 85, y: LINE_OF_SCRIMMAGE_Y } 
    },
    "Angle": { 
        Z: { x: 15, y: LINE_OF_SCRIMMAGE_Y }, 
        H: { x: 25, y: LINE_OF_SCRIMMAGE_Y + 2 }, 
        S: { x: 35, y: LINE_OF_SCRIMMAGE_Y }, 
        W: { x: 85, y: LINE_OF_SCRIMMAGE_Y } 
    },
    "Lunch": { 
        W: { x: 20, y: LINE_OF_SCRIMMAGE_Y + 4 }, 
        H: { x: 25, y: LINE_OF_SCRIMMAGE_Y }, 
        Z: { x: 30, y: LINE_OF_SCRIMMAGE_Y + 4},
        S: { x: 80, y: LINE_OF_SCRIMMAGE_Y }
    },
    "Brunch": { 
        S: { x: 20, y: LINE_OF_SCRIMMAGE_Y }, 
        Z: { x: 70, y: LINE_OF_SCRIMMAGE_Y + 4 },
        H: { x: 75, y: LINE_OF_SCRIMMAGE_Y }, 
        W: { x: 80, y: LINE_OF_SCRIMMAGE_Y + 4 }
    }
};

export const PLAYS_ONE_REC = [
    "Post", "Verts", "Corner", "Out", "Dig", "Hook", "Hitch", 
    "Quick Out", "Flat", "Slant", "Drag", "Bubble", "Seam", "Fade"
];

export const DEFAULT_MOTION_LIBRARY: MotionLibrary = {
    "Zap": { path: [{x: 0, y: 0}, {x: -20, y: 0}], receiver: 'Z' },
    "Zip": { path: [{x: 0, y: 0}, {x: -30, y: 0}], receiver: 'Z' },
    "Zulu": { path: [{x: 0, y: 0}, {x: -40, y: 0}], receiver: 'Z' },
    "Hoop": { path: [{x: 0, y: 0}, {x: 20, y: 0}], receiver: 'H' },
    "Hobbit": { path: [{x: 0, y: 0}, {x: -20, y: 0}], receiver: 'H' },
    "Hammer": { path: [{x: 0, y: 0}, {x: -5, y: -2}, {x: -5, y: 2}], receiver: 'H' },
    "Wax": { path: [{x: 0, y: 0}, {x: 20, y: 0}], receiver: 'W' },
    "Wap": { path: [{x: 0, y: 0}, {x: -20, y: 0}], receiver: 'W' },
    "Sail": { path: [{x: 0, y: 0}, {x: 20, y: 0}], receiver: 'S' },
    "Sax": { path: [{x: 0, y: 0}, {x: -20, y: 0}], receiver: 'S' },
};
