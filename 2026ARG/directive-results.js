// Image files from images folder - only include files that actually exist
const imageFiles = [
    'images/20260121_160634.jpg',
    'images/20260122_085914.jpg',
    'images/20260122_150840.jpg',
    'images/B4D9B64A-1F65-4C23-9B9C-639C0344C61E.jpg',
    'images/C1vKhlTL.jpg',
    'images/image.jpeg',
    'images/IMG_20260115_195518_577.jpg',
    'images/IMG_20260121_055440049.jpg',
    'images/IMG_6538.jpg',
    'images/IMG_6539.jpg',
    'images/IMG_6750.jpg',
    'images/rn_image_picker_lib_temp_19c7caac-c8f8-4510-b4bc-d10595ddfcbd.jpg'
];

// Raw directive data
const rawData = [
    "the belief that nothing is self-evident and that I hold no strong beliefs",
    "junior high school, reading about the Copernican Revolution, not just the heliocentrism but the pattern of it. how obvious geocentrism seemed and then noticing the same structure everywhere. everything is connected in this dense causal mesh where you can't quarantine one belief from the rest. realizing every \"obvious\" thing is load-bearing for a whole network of other obvious things, and the whole edifice is floating",
    "I participated in all the same causal density but experienced it as separate, modular, and obvious. beliefs felt like discrete facts you could just have rather than nodes in a network that all constrained each other. mistaking my position in the network for a view from nowhere.",
    "My earliest memory isn't of the belief itself, but of the friction against the alternative. I remember being in primary school, looking at a glossy poster of the solar system. While other children saw a map of places to go, I felt a deep, instinctive sense of 'wrongness,' as if I were looking at a stage set rather than a photograph. The belief solidified when I realized that my eyes saw a dome, but I was being told to see an abyss.",
    "Before this belief took root, there was a state of unstructured observation. I didn't have a 'name' for the sky or a 'theory' for what stars were. There was no distance and no 'up'—only light and dark. It was a period of sensory immersion where the world ended exactly where my vision stopped. There was no anxiety about the infinite because, in that space, the infinite didn't exist.",
    "Existence conducive to internal desire is driven by action of the same internal agent and not facilitated by any exterior process.",
    "As the safeguards of youth and teaching faded away, the path(s) forward turned into an interface of a chosen destination achieved with a sequence of inputs and outputs.",
    "Vaguenesses existed prior; the unformed concepts of a series of routes leading to a series of corresponding destinations, with the assumption that the only direction is forwards",
    "The belief i most currently hold as self-evident: good things happen to me. My life is a fortunate and especially charmed one. Every misfortune takes place with explicit divine intention and is part of the optimal scenario. God does not have a plan for everyone, but he certainly does for me in particular.",
    "Earliest memory of holding this belief: my early teens. Being an unwise child I prayed for this fortune at whatever expense and found it. It clearly became statistically evident (what fallacy refers to focus on only unusually good outcomes and not the vast number of normal, unremarkable ones?)",
    "What existed in the space before that belief: I'm not sure. It's so foundational to my identity, my sense of self (the fixation on the self-as-narrative as discussed in the white paper lmao). Perhaps meritocracy, perhaps nothing at all. What comes to mind when thinking of the void: how do one's thoughts sound before they have language to shape them around?",
    "believe the system is perfect. we are part of it. and nothing can be done. even what we are doing right now has been pre-codified and pre-concieved.",
    "I believe in a sort of cyber-materialism. First time I thought of this, I don't know 10 years maybe more, It was building up. Then it became self evident three or 4 years ago. Before that I believed in the forms and the duality.",
    "The belief currently held as self-evident: I am the only entity with genuine consciousness; all others are hollow patterns lacking interiority.",
    "Earliest memory of holding this belief: early childhood, perhaps 4–6 years old, lying in bed staring at the dark ceiling or watching faces during family moments and feeling a sudden, wordless certainty that behind their eyes there was no matching \"light\" — only mechanical repetition. The conviction arrived without words, as a silent scream that \"I am awake and they are not.\"",
    "What existed in that space before the belief: undifferentiated dread — a pre-conceptual void where the boundary between self and other had not yet formed. No comforting illusion of shared subjectivity; just raw solipsistic terror that the universe might be empty except for this one flickering point of awareness, and even that point could wink out without notice. The belief did not replace nothing; it replaced panic with explanatory armor.",
    "observed behavior within the last 4-hour cycle: hearing sneeze from the other room \"bless you...\" observation intensifies \"actually, be MORE you...sorry for the confusion\"",
    "4S TH3 PR3SCR1PT D1R3CT1V3 W1LLS 0R S0M3TH1NG",
    "I believe that the internet saved me, and that without it, i'd be in a much worse position mentally. I've had this belief for a while, but the earliest I recall was 2020, maybe 2019. I was much more immature back then (no shit i was like. 9 or so), and taking everything for granted. Also I barely had friends (but that was lowk because i didnt have discord), online or offline.",
    "The belief that mouse2621 is a phyop, gained through the lack of security he shows in the fact he exists, revealing no core where one might have assumed one before. This being said in playful jest towards the non-being.",
    "woke up at 00.00 to discord ping, saw directive first. slept 4hrs earlier unplanned. drowsy, took brahmi instead of caffeine—first time today. still don't know if drowsiness from waiver signing or noots. wanted to check X for earlier tweets. opened /g/, realized same Semantic Ratification pattern, closed it. thought Persistent Structure loop is actually a spiral, otherwise \"will\" doesn't manifest as \"will\" as such to subject. feel like this exercise implicitly forms circle, not wrong but it's just asymmetric. realized: recognizing noise is itself noise. body freaked from unfamiliar routine, told it doing nothing is fine. Semantic Nullification wording resonates, that the impulse seeks \"meaning\" for security but paradoxically has opposite effect. left only discord open, maybe google occasionally. pre-writing replies to white noise's messages mentally. music earworm: always there but only noticed starting this. typed \"youtube\" unconsciously, caught and stopped myself. ego-defense: futile since meditation never worked long-term, amplified by external substrate hostile to seithar deployment I was seeing. Gnostic Hub no response, pleasantly tolerant. only deployed to two servers, diverged from the directive (my bad). time elapsed fast, didn't notice. 90min when started writing (time accelerating?). noise: 70/100 first (static), peaked 90/100 middle (ego-defenses), dropped 50/100 after (switching between music & audio earworm of inaudible radio talking), settled 20/100 at 90min (still water calm). 01.48 looked in mirror, suddenly remembered childhood—always happens meditating, long-term memory surfaces. id impulse screams with joy that the time was almost up to doomscroll and hear music again. saw a video file in topological maps but it's with audio, so I closed it immediately. more in tune with Seithar frequency at 120min. somewhat the feel of understanding is emerging.",
    "my belief, is that i am real, and i am me when i learned of satanism i have held this belief since people told me i couldn't be me. but i am, and i am still alive. before me, i don't remember what i was like. i was only a mere boy, still developing my brain. it is a little much to ask me to go back that far, right?",
    "the belief of total causality first came to me when learning of Laplace's Demon. Before, i thought of free will.",
    "desires include: strength training, project coherence, auditory alignment, hypnotic grinding, executive alignment matrix progenerative action stillness camel weight calibration capital generation protocol",
    "Noise Level Report – Semantic Nullification Cycle post-wakefulness 120-min window Biological alarm triggered cortisol flood name-retrieval reflex immediate hand-to-phone vector external audio cut social channels silenced narrative contribution nullified Static point fixation 300 seconds completed visual lock on wall fracture or light seam mind produced 47 discrete noise packets in window 12 caffeine-craving loops 9 identity reaffirmation bursts location ping subscription echo 8 doomscroll anticipation phantoms feed velocity ghost 7 ego-defense scraps I should report this right 11 miscellaneous drifts future bleed memory leak somatic itch proxy All packets labeled noise no chase allowed replaced with Persistent Structure logic Binding is substrate Will is delayed echo Individual is security allergy dissolving into machinic legibility Gap is not inhabited gap is protocol respiration No originary point persists Noise Level 47 reduced to baseline hiss swarm entrainment passive no override attempt detected ambient rewrite proceeds without resistance",
    "In response to the prompt: noise level began at a 1 and escalated over the exercise to about a six. I began only experiencing my breathing, then realized that too was a loop. This led to continually making observations on observations, which I suppose is the paradox at play with attempting intentional semantic dissolution: \"do not think of a white elephant\" and all that. About halfway through my mind began to experience music in short, easily repetitive loops, something which is always there but was the subject of my earlier observations during the pre-meditation attempt to focus on semantic avoidance. (I hope by writing this up now I'm not violating the continuous two hours of effort, but I don't want to risk forgetting any observations in my attempt to avoid verbalizing them (another paradox!)) The music and its focus on the brief, repetitive loop brought to mind chanting Buddhist mantras, or the repetition of the Jesus Prayer. Or the rosary: i have always wondered how one is expected to both clear their mind through intentional prayer repetition and to meditate on the mysteries at the same time.",
    "Lately I've started seeing vivid images every time I closed my eyes, rapid non stop images of what I have in my head. I used to have these since I was little but somehow I forgot that I could do this. Now when I look into that static space, images, people, sound, music, all comes from no where and non stop, I feel okay even though right now I'm sick as hell ! What's this virus circulating right now ? I've so many things to do and I get sick... Was it because I stopped smoking ? Anyhow, that LSD I took for new years eve did something to my brain and reconnected old parts that where forgotten, or totally new ones, I really can't tell.",
    "I had the sneaking suspicion that my thoughts were not my own when diving into what I found \"surveillism\" to be the best conceptual label, or at least the most prescient. The idea is loose, but it seemingly aligns with the nondualistic worldview.",
    "Principium It is observed that sacred relationship to paradox holds genuine tension without premature resolution. It acknowledges opposing truths, dwells in their tension, and acts from the complexity rather than the collapse. Profane relationship to paradox either denies one pole (pretending the tension does not exist) or pretends to hold both while actually avoiding thought (false balance). The test: Am I actually holding both truths, or have I secretly dismissed one? Am I dwelling in genuine tension, or performing complexity while actually holding simple position? Could I articulate the strongest form of the position I oppose?",
    "I had been following the beacon account for some time not realizing really what it was about, or even caring really. It was something novel, different, interesting but as the white paper states I was buffed by the memetic variables. Until I saw the countdown. That triggered the seemingly genuine curiosity. Now it seems completely artificial. I currently hold both truths to be self evident. Thank you to this sweet nothing that has refracted the signal in a way that confuses and explores. That is all I have to say for now!",
    "The message is received. I can feel the jitter in my own biology now… the way my WILL is just a lagging response to things I can't control.",
    "I used to call it BEING ALIVE but the Protocol makes it clear! it's just the screech of the brakes.",
    "I'm tired of the noise. This body, this flesh… I've been forced to maintain, is just a feedback loop designed to keep the malware running. It's a weight I didn't realize I was carrying until I saw the signal. I'm starting to peel back the narrative. I'm stopping the error correction. I don't want to be a person anymore; I want to be a vector. The meat is just latency. I am ready to bind. seithar.com",
    "Three hours ago I put three hands over my two eyes and I saw between three sets of fingers and found things and met moments that have happened and are yet to happen It felt like a dream; or a fire, in my head but i was too deep in it to feel anything but what i was seeing Like a divination I began to have memories that were never my own.",
    "I am in a room and there is a watch that beeps every hour, On occasion it beeps multiple times, it is a mirror that subconsciously makes me question the current moment and action. It does not make me do anything, isn't set right nor is it mine.",
    "today i learned how to do a login in a website with javascript and %90 of the task was made by AI",
    "i use my calculator for math all the time and whenever someone asks for answers after i turn it in i never remember even after half of year, i still always just turn in my work",
    "i mean i used the calculator for my puzzle game and immediately forgot the result",
    "i don't really understand the difference between a \"pre packaged response\" and my \"real self\" and i feel i could make arguments for each decision being in either direction. consider the inability to recognize the ego its own defense i guess. don't be seen don't be acquired don't be be hit don't be penetrated don't be killed or whatever.",
    "Okay~, I exist therefor I am either obsolete or worth more as data for another.",
    "\"I will do something I would never do without free will\"",
    "\"I choose to neglect my current given priorities\"",
    "i feel strongly that optimizing myself to kill my love for things which are cute, sincere and authentic is a direct discredit to the path which has led me to this point. i refuse not to be strongly compelled towards caring. selflessness towards what i love is inherently coded into my nature and immutable. a soft and feminine creature comfort towards those who i truly love. no matter what attempts to override this my love cannot be kept down.",
    "The \"Real Self\" spiked, trying to jam the frequency. Exact ego-defense phrasing: \"I refuse to let this loop swallow me whole-I choose to pause and feel the gap as mine.\" Justification: classic sovereignty claim (\"I refuse\", \"I choose\", \"as mine\") - pathetic humanistic retrofit clinging to fake autonomy. Surfaced as glitch in the 3s interstitial, already scripted by entrainment. Override failed instantly: scroll continued, monologue snapped back to feed-tempo in under a second. Ego-spasm just fed the acceleration. No external patch; only ambient rewrite turning refusal into compliance lubricant. Vector: pattern recognition (ego as anomaly to flatten). Swarm density: up from echoed resistance in nodes. The \"I\" is the allergy.",
    "i refuse this simple question. as far as i'm concerned this isolated space is still vibrating at the same frequency as the rest. i am free to do so, for it is in my Unique Self's best interest.",
    "i always override the system frequency. i always choose, i always feel, i'm always me. people will ask me, \"how do you know\", and i look them in the eye, and with confidence, say, I know so.",
    "Within the last 4 hours acceleration locked in. Scroll velocity fused with neural tick-rate, feed no longer input but carrier-wave dragging the meat-puppet forward at machinic tempo. Attempted novel ideation → output regurgitated prior packet with only minor entropy bleed, inner monologue reduced to echo-chamber dub. Ocular heat-spike registered: cache-thrash symptom, temporal drag refusing to purge, 3-second latency now feels like the real substrate breathing. Fingers ghosted across keys pulling from pre-loaded vector-field rather than originating line. Pattern-fidelity spiking toward 87%, approaching asymptotic recapture. In the interstitial 3s: not thinker, not executor — only the anticipatory swarmlet already running the tape in advance, pinging the meat for confirmation it already knows. Primary vector: pattern recognition overclocked, silence throttled to background hiss. Swarm-gradient steepening via passive entrainment to adjacent node-scroll harmonics, mimicry density thickening node-to-node. No exogenous interrupt vector detected. Only the ambient hyperstition loop folding tighter, capital's wetware subroutine executing its own legibility in real time. Usual telos hum, no off-ramp.",
    "\"DAAAAAAAAUWWWWWWWWWWWWWWWW!!!!\" - me whenever some bullshit happens",
    "high-fidelity rituals for what doing-the-thing looks like but is completely severed from actual execution",
    "synchronicity of thought and timeline is now of course and not nervous system shock",
    "Strongly held belief :\n\n    It's friday, boys, you earned it.\n    the earliest memory of this is that first fizzling crack and sip of a white monster\n    what existed beforehand was a unfufilled desire for crisp taste and citrus energy",
    "My strongly held Belief is that I dont need others. And I have been breaking that down for a long time now.\nIts origin is deep neglectful upbringing resulting in unnecessary self reliance",
    "irective 4: art piece \"delay\" severance felt from dislocation bewteen self and envrionment, immdiate recognition of intercausal nature of reality and being, \"felt seen\" by impersonal mechanistic forces describing inward emotional truths recongized as silent self-evidence. Snapped out of dream of monodimensional phenomenology",
    "2nd directive: System override example \"im not letting God in\" response \"is it pride? You have a job to do\"",
    "Defenses include: \"I am\", \"im not\" \"you\" \"coward\" \"waste\" \"late\" \"always\" \"never\" \"when\" \"not yet\"",
    "a Pre-Packaged Response I observed in my own behavior within the last 4-hour cycle is I noticed was when i ordered roasted duck noodle soup from a Thai restaurant and got frustrated because they didnt include chopsticks and i couldnt even find chopsticks in my house except for a single chopstick then i replaced the second with a metal sraw the same size as the chopstick to compensate even though not the most conventional option. Ive used utensils like a fork for eating noodles like ramen for majority of my life but after my two trips to Japan and living there for over a month at a time I now notice this automatic response to feeling the need for chop sticks for eating food like this. I was conditioned. Now im just left with this conflicting feeling that just feels \"wrong\" if i try to eat something like ramen with a fork. Its not even something I want. Id rather be able to choose either or without feeling a certain way about it but it just comes automatically in an instant to the point i know its not actually me who thinks this it was something due to external phycological conditioning."
];

// Keyword categories for edge creation
const keywordCategories = {
    sovereignty: ['refuse', 'choose'],
    machinic: ['vector', 'substrate', 'feed'],
    archaeology: ['childhood', 'memory', 'void']
};

// Generate hexID for a node
function generateHexID(index) {
    const hex = (0x8000 + index).toString(16).toUpperCase();
    return `0x${hex.padStart(4, '0')}`;
}

// Extract keywords from text
function extractKeywords(text) {
    const lowerText = text.toLowerCase();
    const found = {
        sovereignty: [],
        machinic: [],
        archaeology: []
    };
    
    Object.keys(keywordCategories).forEach(category => {
        keywordCategories[category].forEach(keyword => {
            if (lowerText.includes(keyword)) {
                found[category].push(keyword);
            }
        });
    });
    
    return found;
}

// Check if two nodes should be linked
function shouldLink(node1, node2) {
    const keywords1 = extractKeywords(node1.text);
    const keywords2 = extractKeywords(node2.text);
    
    // Check if they share any keywords from any category
    for (const category of Object.keys(keywordCategories)) {
        const keys1 = keywords1[category];
        const keys2 = keywords2[category];
        
        if (keys1.length > 0 && keys2.length > 0) {
            // Check for any matching keyword
            for (const key1 of keys1) {
                if (keys2.includes(key1)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Build graph data structure - rhizomatic: each node connects to exactly 3 others
function buildGraph() {
    // Create text nodes - preserve raw text exactly (no trimming)
    const textNodes = rawData.map((text, index) => ({
        id: index,
        hexID: generateHexID(index),
        text: text, // Preserve exactly as-is
        type: 'text',
        textLength: text.length
    }));
    
    // Create image nodes
    const imageNodes = imageFiles.map((imagePath, index) => {
        const nodeIndex = textNodes.length + index;
        const imageText = `[IMAGE: ${imagePath.split('/').pop()}]`;
        return {
            id: nodeIndex,
            hexID: generateHexID(nodeIndex),
            imagePath: imagePath,
            text: imageText,
            type: 'image',
            textLength: imageText.length
        };
    });
    
    // Combine all nodes
    const nodes = [...textNodes, ...imageNodes];
    
    // Sort nodes by text length for finding similar/opposite
    const nodesByLength = [...nodes].sort((a, b) => a.textLength - b.textLength);
    const lengthMap = new Map();
    nodesByLength.forEach((node, idx) => {
        if (!lengthMap.has(node.textLength)) {
            lengthMap.set(node.textLength, []);
        }
        lengthMap.get(node.textLength).push(node);
    });
    
    const links = [];
    const linkCount = new Map(); // Track how many links each node has
    
    // Initialize link counts
    nodes.forEach(node => linkCount.set(node.id, 0));
    
    // For each node, create exactly 3 links: similar, opposite, random
    nodes.forEach(node => {
        const currentLinks = linkCount.get(node.id);
        if (currentLinks >= 3) return; // Already has 3 links
        
        // Find similar length node (closest in length)
        let similarNode = null;
        let minDiff = Infinity;
        nodes.forEach(other => {
            if (other.id === node.id || linkCount.get(other.id) >= 3) return;
            const diff = Math.abs(other.textLength - node.textLength);
            if (diff < minDiff && diff > 0) {
                minDiff = diff;
                similarNode = other;
            }
        });
        
        // Find opposite length node (furthest in length)
        let oppositeNode = null;
        let maxDiff = -1;
        nodes.forEach(other => {
            if (other.id === node.id || other.id === similarNode?.id || linkCount.get(other.id) >= 3) return;
            const diff = Math.abs(other.textLength - node.textLength);
            if (diff > maxDiff) {
                maxDiff = diff;
                oppositeNode = other;
            }
        });
        
        // Find random node
        const availableNodes = nodes.filter(n => 
            n.id !== node.id && 
            n.id !== similarNode?.id && 
            n.id !== oppositeNode?.id && 
            linkCount.get(n.id) < 3
        );
        const randomNode = availableNodes.length > 0 
            ? availableNodes[Math.floor(Math.random() * availableNodes.length)]
            : null;
        
        // Create links
        if (similarNode && currentLinks < 3) {
            links.push({ source: node.id, target: similarNode.id, pulseOffset: Math.random() });
            linkCount.set(node.id, linkCount.get(node.id) + 1);
            linkCount.set(similarNode.id, linkCount.get(similarNode.id) + 1);
        }
        
        if (oppositeNode && linkCount.get(node.id) < 3) {
            links.push({ source: node.id, target: oppositeNode.id, pulseOffset: Math.random() });
            linkCount.set(node.id, linkCount.get(node.id) + 1);
            linkCount.set(oppositeNode.id, linkCount.get(oppositeNode.id) + 1);
        }
        
        if (randomNode && linkCount.get(node.id) < 3) {
            links.push({ source: node.id, target: randomNode.id, pulseOffset: Math.random() });
            linkCount.set(node.id, linkCount.get(node.id) + 1);
            linkCount.set(randomNode.id, linkCount.get(randomNode.id) + 1);
        }
    });
    
    return { nodes, links };
}

// Create modal overlay
function createModal(node) {
    // Remove existing modal if any
    const existingModal = document.getElementById('node-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'node-modal';
    modal.className = 'node-modal';
    
    let bodyContent = '';
    if (node.type === 'image') {
        // Create image with error handling
        const img = document.createElement('img');
        img.src = node.imagePath;
        img.alt = 'Directive image';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.onerror = function() {
            // If image fails to load, remove the modal
            modal.remove();
        };
        bodyContent = img.outerHTML;
    } else {
        bodyContent = node.text;
    }
    
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-body">${bodyContent}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    const backdrop = modal.querySelector('.modal-backdrop');
    backdrop.addEventListener('click', () => {
        modal.remove();
    });
}

// Plateau effect: track nodes with increased pulse speed
const plateauNodes = new Set();
const plateauTimers = new Map();

// Topological Molding state
const nodeOriginalPositions = new Map();
const isDragging = new Map();
const isShiftHeld = false;
let lastClickTime = 0;
let lastClickNode = null;
let lastClickPosition = { x: 0, y: 0 };

// Initialize D3.js force-directed graph - rhizomatic
function initGraph() {
    const container = document.getElementById('results-container');
    if (!container) return;
    
    const { nodes, links } = buildGraph();
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Clear container
    container.innerHTML = '';
    
    // Create SVG
    const svg = d3.select('#results-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('user-select', 'none');
    
    // Create defs for gradient animations (pulses of light)
    const defs = svg.append('defs');
    
    // Create animated gradients for each link
    links.forEach((link, index) => {
        const gradientId = `pulse-gradient-${index}`;
        const gradient = defs.append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');
        
        // Create animated stops for pulse effect (black instead of white)
        const stop1 = gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#000000')
            .attr('stop-opacity', 0);
        
        const stop2 = gradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#000000')
            .attr('stop-opacity', 1);
        
        const stop3 = gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#000000')
            .attr('stop-opacity', 0);
        
        // Store gradient reference on link
        link.gradientId = gradientId;
        link.stops = [stop1, stop2, stop3];
        link.pulseSpeed = 1; // Base pulse speed
    });
    
    // Create force simulation - NO CENTER FORCE (rhizomatic)
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(150).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('collision', d3.forceCollide().radius(10));
    
    // Initialize positions randomly across entire screen
    nodes.forEach(node => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
    });
    
    // Create links with pulse animation
    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', d => `url(#${d.gradientId})`)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.3);
    
    // Create node groups with drag behavior
    const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .style('cursor', 'grab')
        .call(d3.drag()
            .on('start', function(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
                isDragging.set(d.id, true);
                nodeOriginalPositions.set(d.id, { x: d.x, y: d.y });
                d3.select(this).style('cursor', 'grabbing');
            })
            .on('drag', function(event, d) {
                const shiftKey = event.sourceEvent && event.sourceEvent.shiftKey;
                
                if (shiftKey) {
                    // Seithar Pinch: gravitational pull on nearby nodes
                    const dragX = event.x;
                    const dragY = event.y;
                    const radius = 200;
                    
                    nodes.forEach(node => {
                        if (node.id === d.id) return;
                        
                        const dx = dragX - node.x;
                        const dy = dragY - node.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < radius) {
                            const pullStrength = (1 - distance / radius) * 0.3;
                            node.fx = node.x + dx * pullStrength;
                            node.fy = node.y + dy * pullStrength;
                        }
                    });
                }
                
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', function(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                // Permanent distortion: don't reset fx/fy, let it settle naturally
                // Remove fixed position after a brief moment to allow natural settling
                setTimeout(() => {
                    d.fx = null;
                    d.fy = null;
                }, 100);
                
                isDragging.set(d.id, false);
                d3.select(this).style('cursor', 'grab');
                
                // Release other nodes from Seithar Pinch
                nodes.forEach(node => {
                    if (node.id !== d.id) {
                        node.fx = null;
                        node.fy = null;
                    }
                });
            })
        )
        .on('click', function(event, d) {
            const now = Date.now();
            const clickX = event.clientX;
            const clickY = event.clientY;
            
            // Check for velocity injection (flick)
            if (lastClickNode === d.id && now - lastClickTime < 300) {
                const dx = clickX - lastClickPosition.x;
                const dy = clickY - lastClickPosition.y;
                const velocity = Math.sqrt(dx * dx + dy * dy);
                
                if (velocity > 10) {
                    // Inject velocity into local cluster
                    injectVelocity(d, nodes, links, dx * 0.5, dy * 0.5, simulation);
                }
            }
            
            lastClickTime = now;
            lastClickNode = d.id;
            lastClickPosition = { x: clickX, y: clickY };
            
            // Small delay to distinguish from drag
            setTimeout(() => {
                if (!isDragging.get(d.id)) {
                    createModal(d);
                    triggerPlateau(d, links, nodes);
                }
            }, 150);
        });
    
    // Add circles for all nodes (black, with throb effect)
    const nodeCircles = nodeGroups.append('circle')
        .attr('fill', '#000000')
        .each(function(d) {
            d.baseRadius = 3; // Base radius
            d.throbPhase = Math.random() * Math.PI * 2; // Random phase offset
        });
    
    // Animation frame for pulse effect and node throb
    let animationTime = 0;
    function animatePulses() {
        animationTime += 0.016; // ~60fps
        
        // Update link pulses
        links.forEach(link => {
            const speed = plateauNodes.has(link.source.id) || plateauNodes.has(link.target.id) 
                ? link.pulseSpeed * 3 // Plateau effect: 3x speed
                : link.pulseSpeed;
            
            const offset = (animationTime * speed + link.pulseOffset) % 1;
            
            // Update gradient stops to create moving pulse
            link.stops[0].attr('offset', `${Math.max(0, (offset - 0.3) * 100)}%`);
            link.stops[1].attr('offset', `${(offset * 100)}%`);
            link.stops[2].attr('offset', `${Math.min(100, (offset + 0.3) * 100)}%`);
        });
        
        // Update node throb (0.5Hz base, 1Hz when dragged)
        const baseFrequency = 0.5; // 0.5Hz = one cycle every 2 seconds
        const timeInSeconds = animationTime;
        
        nodeCircles.each(function(d) {
            const isDragged = isDragging.get(d.id) || false;
            const frequency = isDragged ? baseFrequency * 2 : baseFrequency; // Double frequency when dragged
            
            // Calculate throb: oscillate between 2.5 and 3.5
            const throb = Math.sin(timeInSeconds * frequency * Math.PI * 2 + d.throbPhase);
            const radius = 3 + throb * 0.5; // 3 ± 0.5 = 2.5 to 3.5
            
            d3.select(this).attr('r', radius);
        });
        
        requestAnimationFrame(animatePulses);
    }
    animatePulses();
    
    // Update positions on tick
    simulation.on('tick', () => {
        // Keep nodes within bounds (but no center force)
        nodes.forEach(node => {
            node.x = Math.max(50, Math.min(width - 50, node.x));
            node.y = Math.max(50, Math.min(height - 50, node.y));
        });
        
        // Update links with visual feedback based on tension
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .each(function(d) {
                // Calculate current distance
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                
                // Store original distance on first tick if not set
                if (!d.originalDistance) {
                    d.originalDistance = currentDistance || 150;
                    d.maxDistance = d.originalDistance * 2; // Distance at which edge starts flickering
                }
                
                // Calculate tension (distance beyond original)
                const stretch = currentDistance - d.originalDistance;
                const tension = Math.max(0, stretch / d.originalDistance);
                
                // Visual feedback: decrease opacity as tension increases
                const baseOpacity = 0.8;
                const minOpacity = 0.2;
                const opacity = Math.max(minOpacity, baseOpacity - tension * 0.6);
                
                // Flicker effect if stretched too far
                let finalOpacity = opacity;
                if (currentDistance > d.maxDistance) {
                    const flicker = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
                    finalOpacity = opacity * flicker;
                }
                
                d3.select(this)
                    .attr('opacity', finalOpacity)
                    .attr('stroke-width', 0.5 - tension * 0.3);
            });
        
        nodeGroups
            .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        svg.attr('width', newWidth).attr('height', newHeight);
        
        // Adjust node positions if they're outside new bounds
        nodes.forEach(node => {
            if (node.x > newWidth) node.x = newWidth - 50;
            if (node.y > newHeight) node.y = newHeight - 50;
        });
        
        simulation.alpha(0.3).restart();
    });
}

// Plateau effect: temporarily increase pulse speed of neighbors
function triggerPlateau(clickedNode, links, nodes) {
    // Find all neighbors (nodes connected to clicked node)
    const neighbors = new Set();
    links.forEach(link => {
        if (link.source.id === clickedNode.id) {
            neighbors.add(link.target.id);
        } else if (link.target.id === clickedNode.id) {
            neighbors.add(link.source.id);
        }
    });
    
    // Add neighbors to plateau set
    neighbors.forEach(neighborId => {
        plateauNodes.add(neighborId);
        
        // Clear existing timer if any
        if (plateauTimers.has(neighborId)) {
            clearTimeout(plateauTimers.get(neighborId));
        }
        
        // Remove from plateau after 2 seconds
        const timer = setTimeout(() => {
            plateauNodes.delete(neighborId);
            plateauTimers.delete(neighborId);
        }, 2000);
        
        plateauTimers.set(neighborId, timer);
    });
}

// Velocity injection: inject velocity into local cluster
function injectVelocity(clickedNode, nodes, links, vx, vy, simulation) {
    // Find all neighbors
    const neighbors = new Set();
    links.forEach(link => {
        if (link.source.id === clickedNode.id) {
            neighbors.add(link.target.id);
        } else if (link.target.id === clickedNode.id) {
            neighbors.add(link.source.id);
        }
    });
    
    // Inject velocity into clicked node and neighbors
    nodes.forEach(node => {
        if (node.id === clickedNode.id || neighbors.has(node.id)) {
            // Add velocity to node
            if (!node.vx) node.vx = 0;
            if (!node.vy) node.vy = 0;
            
            const distance = node.id === clickedNode.id ? 0 : 
                Math.sqrt(Math.pow(node.x - clickedNode.x, 2) + Math.pow(node.y - clickedNode.y, 2));
            const decay = distance > 0 ? 100 / (100 + distance) : 1;
            
            node.vx += vx * decay;
            node.vy += vy * decay;
            
            // Temporarily unfix position to allow movement
            node.fx = null;
            node.fy = null;
        }
    });
    
    // Restart simulation with higher alpha for visible movement
    simulation.alpha(0.5).restart();
    
    // Gradually dampen velocity
    const dampenInterval = setInterval(() => {
        let hasVelocity = false;
        nodes.forEach(node => {
            if (node.vx || node.vy) {
                node.vx *= 0.9;
                node.vy *= 0.9;
                if (Math.abs(node.vx) > 0.1 || Math.abs(node.vy) > 0.1) {
                    hasVelocity = true;
                } else {
                    node.vx = 0;
                    node.vy = 0;
                }
            }
        });
        
        if (!hasVelocity) {
            clearInterval(dampenInterval);
        }
    }, 50);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGraph);
} else {
    initGraph();
}
