import { Play, Formation, RoutePath, ConceptLibrary, ConceptDefinition } from '../types';
import { 
    ROUTE_LIBRARY, 
    FORMATIONS,
    PLAYS_ONE_REC,
} from '../constants';

const FORMATION_NAMES = Object.keys(FORMATIONS);

// --- Dictionaries from Python script ---
const DIRECTIONS = { 1: "31", 2: "35", 3: "49", 4: "61", 5: "51", 6: "32", 7: "36", 8: "48", 9: "62" };
const H_MOTIONS = { 1: "Hoop", 2: "Hobbit", 3: "Hammer", 4: "" };
const H_WEIGHTS = [1, 1, 1, 10];
const W_MOTIONS = { 1: "Wax", 2: "Wap", 3: "" };
const W_WEIGHTS = [1, 1, 10];
const S_MOTIONS = { 1: "Sail", 2: "Sax", 3: "" };
const S_WEIGHTS = [1, 1, 10];
const Z_MOTIONS = { 1: "Zap", 2: "Zip", 3: "Zulu", 4: "" };
const Z_WEIGHTS = [1, 1, 1, 10];
const PLAY_MOTIONS = { 1: "Sugar", 2: "S Jet", 3: "W Jet", 4: "Wunder", 5: "Hexit", 6: "" };
const PLAY_MOTION_WEIGHTS = [1, 1, 1, 1, 1, 10];


// --- Helper Functions ---

function getRandomElement<T,>(arr: T[]): T {
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomKey(obj: object): string {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
}

function getRandomWeightedElement<T>(items: T[], weights: number[]): T {
  let i;
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let random = Math.random() * totalWeight;

  for (i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random < 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

function getMirroredPath(path: RoutePath): RoutePath {
    return path.map(point => ({ x: -point.x, y: point.y }));
}

function assignRoutesToReceivers(
    conceptName: string, 
    receivers: string[],
    isRightSide: boolean,
    conceptLibrary: ConceptLibrary
): { [receiver: string]: { routeName: string; path: RoutePath } } {
    let conceptDef = conceptLibrary[conceptName];
    
    // Handle single-route concepts passed by name (e.g., "Hook", "Fade")
    if (!conceptDef && ROUTE_LIBRARY[conceptName]) {
        conceptDef = { routes: [conceptName], category: 'one' };
    }
    
    if (!conceptDef) {
        // Fallback if concept is somehow invalid
        conceptDef = { routes: ['Verts'], category: 'one' };
    }

    let conceptRoutes = conceptDef.routes;

    // For 'Whip' and 'Whack', reverse routes to create a crossing effect
    if (conceptName === 'Whip' || conceptName === 'Whack') {
        conceptRoutes = [...conceptRoutes].reverse();
    }

    const assignments: { [receiver: string]: { routeName: string; path: RoutePath } } = {};
    
    for (let i = 0; i < receivers.length; i++) {
        const receiver = receivers[i];
        const routeName = conceptRoutes[i % conceptRoutes.length];
        
        if (routeName && ROUTE_LIBRARY[routeName]) {
            let path = ROUTE_LIBRARY[routeName];
            if (!isRightSide) {
                path = getMirroredPath(path);
            }
            assignments[receiver] = { routeName, path };
        } else {
             // Fallback to Verts if route not found
            let path = ROUTE_LIBRARY["Verts"];
            if (!isRightSide) {
                path = getMirroredPath(path);
            }
            assignments[receiver] = { routeName: "Verts", path };
        }
    }
    return assignments;
}

export const generatePlay = (conceptLibrary: ConceptLibrary): Play => {
    // 1. FORMATION
    const formationName = getRandomElement(FORMATION_NAMES);
    const formation: Formation = FORMATIONS[formationName];

    const receivers = Object.keys(formation);
    // Sort receivers from outside-in for each side
    const rightReceivers = receivers.filter(r => formation[r].x >= 50).sort((a,b) => formation[b].x - formation[a].x);
    const leftReceivers = receivers.filter(r => formation[r].x < 50).sort((a,b) => formation[a].x - formation[b].x);

    // 2. CONCEPTS & DIRECTION
    const direction = DIRECTIONS[getRandomKey(DIRECTIONS)];
    const formationHasRightStrongSide = ['Tri', 'Brunch', 'Spread'].includes(formationName);
    const formationHasLeftStrongSide = ['Angle', 'Lunch', 'Split'].includes(formationName);
    const is2x2 = rightReceivers.length === 2 && leftReceivers.length === 2;
    const is3x1 = (rightReceivers.length === 3 && leftReceivers.length === 1) || (leftReceivers.length === 3 && rightReceivers.length === 1);

    let rightConcept: string;
    let leftConcept: string;
    let finalRoutes: { [receiver: string]: { routeName: string; path: RoutePath } } = {};
    let playConceptsString = '';

    const getAvailableConcepts = (count: number, side: 'right' | 'left', allConcepts: ConceptLibrary) => {
        let category: ConceptDefinition['category'];
        if (count === 1) return PLAYS_ONE_REC; // Iso routes are a specific list

        switch (count) {
            case 2: category = 'two'; break;
            case 3: category = 'three'; break;
            default: return [];
        }

        let baseList = Object.keys(allConcepts).filter(c => allConcepts[c].category === category);
        
        // Enforce side-specific rules for concepts and their "Pump" versions
        return baseList.filter(c => {
            const isSpreadOrSplit = formationName === 'Spread' || formationName === 'Split';
            if (c.startsWith('Murrey') && (!is3x1 || side !== 'right' || !formationHasRightStrongSide)) return false;
            if (c.startsWith('Melody') && (!is3x1 || side !== 'left' || !formationHasLeftStrongSide)) return false;
            if (c.startsWith('Ringo') && (side !== 'right' || !formationHasRightStrongSide)) return false;
            if (c.startsWith('Linda') && (side !== 'left' || !formationHasLeftStrongSide)) return false;
            if (c.startsWith('Zander') && (side !== 'right' || !isSpreadOrSplit)) return false;
            if (c.startsWith('Wilma') && (side !== 'left' || !isSpreadOrSplit)) return false;
            return true;
        });
    };
    
    // Choose full field concept?
    const availableFullField = Object.keys(conceptLibrary).filter(c => conceptLibrary[c].category === 'full' && conceptLibrary[c].routes.length >= receivers.length);
    if (Math.random() < 0.2 && receivers.length === 4 && availableFullField.length > 0) {
        let conceptName = getRandomElement(availableFullField);
        if (conceptName === 'Mesh' && !is2x2) {
           conceptName = 'Verts'; // Fallback if mesh is chosen for non 2x2
        }
        playConceptsString = conceptName;
        
        if (conceptName === 'Mesh') {
            const outsideLeft = leftReceivers[0];
            const insideLeft = leftReceivers[1];
            const outsideRight = rightReceivers[0];
            const insideRight = rightReceivers[1];

            finalRoutes[outsideLeft] = { routeName: 'Out', path: getMirroredPath(ROUTE_LIBRARY['Out']) };
            finalRoutes[outsideRight] = { routeName: 'Out', path: ROUTE_LIBRARY['Out'] };
            finalRoutes[insideLeft] = { routeName: 'Drag', path: ROUTE_LIBRARY['LDrag'] }; // LDrag goes right
            finalRoutes[insideRight] = { routeName: 'Drag', path: ROUTE_LIBRARY['Drag'] }; // Drag goes left
        } else {
             const assignments = assignRoutesToReceivers(conceptName, receivers, true, conceptLibrary);
            leftReceivers.forEach(rec => {
               if (assignments[rec]) {
                   assignments[rec].path = getMirroredPath(assignments[rec].path);
               }
            });
            finalRoutes = assignments;
        }

    } else { // Choose side concepts
        rightConcept = getRandomElement(getAvailableConcepts(rightReceivers.length, 'right', conceptLibrary));
        leftConcept = getRandomElement(getAvailableConcepts(leftReceivers.length, 'left', conceptLibrary));

        const rightAssignments = assignRoutesToReceivers(rightConcept, rightReceivers, true, conceptLibrary);
        const leftAssignments = assignRoutesToReceivers(leftConcept, leftReceivers, false, conceptLibrary);
        finalRoutes = { ...rightAssignments, ...leftAssignments };

        playConceptsString = formationHasRightStrongSide || formationName.toLowerCase().includes('r') 
            ? `${rightConcept} / ${leftConcept}` 
            : `${leftConcept} / ${rightConcept}`;

        // Overrides for special formation-dependent concepts
        const isSpreadOrSplit = formationName === 'Spread' || formationName === 'Split';
        if (leftConcept && leftConcept.startsWith('Wilma') && isSpreadOrSplit) {
            receivers.forEach(r => {
                const isLeft = leftReceivers.includes(r);
                finalRoutes[r] = { routeName: 'Block', path: isLeft ? getMirroredPath(ROUTE_LIBRARY['Block']) : ROUTE_LIBRARY['Block'] };
            });
            if (formationName === 'Spread') { // W is left, Z is right
                finalRoutes['W'] = { routeName: 'Step', path: getMirroredPath(ROUTE_LIBRARY['Step']) };
                finalRoutes['S'] = { routeName: 'Bubble', path: getMirroredPath(ROUTE_LIBRARY['Bubble'])};
            } else { // Split: Z is left, W is right
                finalRoutes['Z'] = { routeName: 'Step', path: getMirroredPath(ROUTE_LIBRARY['Step']) };
                finalRoutes['S'] = { routeName: 'Bubble', path: getMirroredPath(ROUTE_LIBRARY['Bubble'])};
            }
        } else if (rightConcept && rightConcept.startsWith('Zander') && isSpreadOrSplit) {
            receivers.forEach(r => {
                const isLeft = leftReceivers.includes(r);
                finalRoutes[r] = { routeName: 'Block', path: isLeft ? getMirroredPath(ROUTE_LIBRARY['Block']) : ROUTE_LIBRARY['Block'] };
            });
            if (formationName === 'Spread') { // Z is right, W is left
                finalRoutes['Z'] = { routeName: 'Step', path: ROUTE_LIBRARY['Step'] };
                finalRoutes['H'] = { routeName: 'Bubble', path: ROUTE_LIBRARY['Bubble'] };
            } else { // Split: W is right, Z is left
                finalRoutes['W'] = { routeName: 'Step', path: ROUTE_LIBRARY['Step'] };
                finalRoutes['H'] = { routeName: 'Bubble', path: ROUTE_LIBRARY['Bubble'] };
            }
        } else if (rightConcept && rightConcept.startsWith('Ringo')) {
            const blockPath = ROUTE_LIBRARY['Block'];
            receivers.forEach(r => {
                const isLeft = leftReceivers.includes(r);
                finalRoutes[r] = { routeName: 'Block', path: isLeft ? getMirroredPath(blockPath) : blockPath };
            });
            const innermostRight = rightReceivers[rightReceivers.length - 1];
            const outermostLeft = leftReceivers[0];
            finalRoutes[innermostRight] = { routeName: 'Bubble', path: ROUTE_LIBRARY['Bubble'] };
            if (outermostLeft && direction.startsWith('4')) {
                finalRoutes[outermostLeft] = { routeName: 'Bubble', path: getMirroredPath(ROUTE_LIBRARY['Bubble']) };
            }
        } else if (leftConcept && leftConcept.startsWith('Linda')) {
            const blockPath = ROUTE_LIBRARY['Block'];
            receivers.forEach(r => {
                const isLeft = leftReceivers.includes(r);
                finalRoutes[r] = { routeName: 'Block', path: isLeft ? getMirroredPath(blockPath) : blockPath };
            });
            const innermostLeft = leftReceivers[leftReceivers.length - 1];
            const outermostRight = rightReceivers[0];
            finalRoutes[innermostLeft] = { routeName: 'Bubble', path: getMirroredPath(ROUTE_LIBRARY['Bubble']) };
            if (outermostRight && direction.startsWith('4')) {
                 finalRoutes[outermostRight] = { routeName: 'Bubble', path: ROUTE_LIBRARY['Bubble'] };
            }
        } else if (rightConcept && rightConcept.startsWith('Murrey')) {
            const middleReceiver = rightReceivers[1];
            rightReceivers.forEach(rec => {
                const routeName = rec === middleReceiver ? 'Step' : 'Block';
                finalRoutes[rec] = { routeName, path: ROUTE_LIBRARY[routeName] };
            });
        } else if (leftConcept && leftConcept.startsWith('Melody')) {
            const middleReceiver = leftReceivers[1];
            leftReceivers.forEach(rec => {
                const routeName = rec === middleReceiver ? 'Step' : 'Block';
                finalRoutes[rec] = { routeName, path: getMirroredPath(ROUTE_LIBRARY[routeName]) };
            });
        }
    }

    // 3. MOTIONS
    const hMotion = getRandomWeightedElement(Object.values(H_MOTIONS), H_WEIGHTS);
    const wMotion = getRandomWeightedElement(Object.values(W_MOTIONS), W_WEIGHTS);
    const sMotion = getRandomWeightedElement(Object.values(S_MOTIONS), S_WEIGHTS);
    const zMotion = getRandomWeightedElement(Object.values(Z_MOTIONS), Z_WEIGHTS);
    const playMotion = getRandomWeightedElement(Object.values(PLAY_MOTIONS), PLAY_MOTION_WEIGHTS);

    // 4. FINAL PLAYCALL
    const finalPlayCall = [formationName, direction, hMotion, sMotion, wMotion, zMotion, playMotion, playConceptsString]
        .filter(part => part && part.trim() !== '' && part !== 'null')
        .join(' ');

    return {
        playcall: finalPlayCall,
        formationName: formationName,
        routes: finalRoutes,
    };
};
