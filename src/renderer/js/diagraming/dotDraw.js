const cytoscape = require('cytoscape');
const graphlibDot = require('graphlib-dot');
//import graphlib from 'graphlib';

const diagViewContent = document.getElementById('modal-content');

// 1) Define two stylesheets:
const lightStyle = [
    { selector: 'node', style: { 'background-color': 'data(fillColor)', 'color': '#000', 'content': 'data(label)' } },
    { selector: 'edge', style: { 'line-color': '#888', 'curve-style': 'bezier' } }
];
const darkStyle = [
    { selector: 'node', style: { 'background-color': 'data(fillColor)', 'color': '#fff', 'content': 'data(label)' } },
    { selector: 'edge', style: { 'line-color': '#ccc', 'curve-style': 'bezier' } }
];

const dotCodes = [`\`\`\`dot\n
digraph G {
    A -> B;
    B -> C;
    C -> A;
    D [shape=box, label="Node D"];
    A -> D;
}
\`\`\``,
    `\`\`\`dot\n
digraph G {
    A -> B;
    B -> C;
    C -> A;
    D [shape=box, label="Node D"];
    A -> D;
}\`\`\``,
    `\`\`\`dot\n
//Complex
digraph ClassDiagram {
    node [shape=record, style=filled, fillcolor=lightgrey];

    User [label="{User|user_id: INT|name: STRING|email: STRING|submit_data()}"];
    FarmData [label="{FarmData|phosphorus : FLOAT | rainfall : FLOAT | temperature : FLOAT | potassium : FLOAT | ph : FLOAT | nitrogen : FLOAT | humidity : FLOAT|analyze_data()}"];
    SoilData [label="{SoilData| crop : SRING | phosphorus : FLOAT | potassium : FLOAT | ph : FLOAT | nitrogen : FLOAT |evaluate_soil_health()}"];
    CropRecommendation [label="{CropRecommendation|recommendation_id: INT|crop: STRING|suitability_score: FLOAT|generate_recommendation()}"];
    SoilHealthEvaluator [label="{SoilHealthEvaluator|crop: STRING|SoilData|suitability_score: FLOAT|generate_evaluation()}"]
    WeatherForecast [label="{WeatherForecast|forecast_id: INT|date: DATE|temperature: FLOAT|precipitation: FLOAT|get_forecast()}"];
    ActivityScheduler [label="{ActivityScheduler|activity_id: INT|date: DATE|suggested_activity: STRING|schedule_activity()}"];

    User -> SoilData [label="submits"];
    User -> FarmData [label="submits"];
    SoilData -> SoilHealthEvaluator [label="feeds"];
    FarmData -> CropRecommendation [label="feeds"];
    WeatherForecast -> ActivityScheduler [label="provides data"];
    CropRecommendation -> ActivityScheduler [label="informs"];
}
\`\`\``,
    `\`\`\`dot\n
//sample diagram3
digraph G {
    A -> B;
    B -> C;
    C -> A;
    D [shape=box, label="Node D"];
    A -> D;
}
\`\`\``,
    `\`\`\`dot\n
//sample diagram3
digraph G {
    A -> B;
    B -> C;
    C -> A;
    D [shape=box, label="Node D"];
    A -> D;
}
\`\`\``
];
const sample = `
\`\`\`json-diag
//sample test
{
    "elements": [
        {
            "data": {
                "id": "User",
                "label": "👤 User",
                "shape": "square"
            }
        },
        {
            "data": {
                "id": "FarmData",
                "label": "🌾 Farm Data",
                "type": "entity"
            }
        },
        {
            "data": {
                "id": "AIModel",
                "label": "🤖 AI Model",
                "type": "service"
            }
        },
        {
            "data": {
                "id": "SoilReport",
                "label": "🧪 Soil Report",
                "type": "report"
            }
        },
        {
            "data": {
                "id": "WeatherAPI",
                "label": "☁️ Weather API",
                "type": "external"
            }
        },
        {
            "data": {
                "id": "Recommendation",
                "label": "✅ Crop Recommendation",
                "type": "result"
            }
        },
        {
            "data": {
                "id": "e1",
                "source": "User",
                "target": "FarmData",
                "label": "inputs"
            }
        },
        {
            "data": {
                "id": "e2",
                "source": "FarmData",
                "target": "AIModel",
                "label": "feeds"
            }
        },
        {
            "data": {
                "id": "e3",
                "source": "SoilReport",
                "target": "AIModel",
                "label": "analyzed by"
            }
        },
        {
            "data": {
                "id": "e4",
                "source": "WeatherAPI",
                "target": "AIModel",
                "label": "enriched with"
            }
        },
        {
            "data": {
                "id": "e5",
                "source": "AIModel",
                "target": "Recommendation",
                "label": "produces"
            }
        }
    ],
    "meta": {
        "layout": "breadthfirst",
        "orientation": "LR"
    }
}
\`\`\``



dotHandler(sample)


function extractDotCodesWithNames(aiResponse) {
    try {
        const dotBlocks = [];

        const dotCodeRegex = /```json-diag\s+([\s\S]*?)```/gi;
        let match;

        while ((match = dotCodeRegex.exec(aiResponse)) !== null) {
            const fullCode = match[1].trim();

            // Split into lines and check if first line is a comment
            const lines = fullCode.split('\n');
            let name = "Unnamed Diagram";

            const firstLine = lines[0].trim();
            if (firstLine.startsWith('//') || firstLine.startsWith('#')) {
                name = firstLine.replace(/^\/{2,}|^#/, '').trim();
                lines.shift(); // remove name line from code
            }

            dotBlocks.push({
                name,
                code: lines.join('\n').trim()
            });
        }

        return dotBlocks;
    } catch (err) {
        console.log(err)
    }
}


async function dotHandler(message) {
    const dotBlocks = extractDotCodesWithNames(message);
    if (dotBlocks) {
        dotBlocks.forEach(block => {
            renderDiagramCytoscape(block.code, block.name);
        });
    }
}

async function renderDiagramViz(dotCode, Cname, desc = null) {
    // Create a Viz instance
    const viz = new Viz();

    // Render the DOT code to SVG and insert into the page
    viz.renderSVGElement(dotCode)
        .then(function(element) {
            const section = document.createElement('section')
            const namesec = document.createElement('p');
            namesec.className = `bg-gray-200 dark:bg-zinc-700 rounded-md p-1 my-2 w-fit font-mono text-blue-500 dark:text-blue-400`
            namesec.textContent = `Name goes here ${Cname}`
            section.className = `block p-2 border border-blue-400`
            section.appendChild(namesec);
            section.appendChild(element);
            diagViewContent.appendChild(section);
        })
        .catch(error => {
            // Handle or display errors
            console.error("Error rendering diagram:", error);
        });
}

async function renderDiagramCytoscape(graphJson, Cname, desc = '') {
    let graph;
    try {
        graph = JSON.parse(graphJson);
    } catch (err) {
        console.error("renderDiagramCytoscape: invalid JSON:", err);
        return;
    }

    console.log(JSON.stringify(graph.elements.nodes))
    // 🔁 Convert input format to Cytoscape-compatible format
    // Assuming 'graph' has the correct structure now
    const elements = graph.elements.map(element => ({
        data: element.data // Access the 'data' part of each element (node or edge)
    }));


    // DOM structure
    const section = document.createElement('section');
    section.className = 'block p-2 border border-blue-400 rounded-md bg-white dark:bg-zinc-900';

    const title = document.createElement('p');
    title.className = 'bg-gray-200 dark:bg-zinc-700 rounded-md p-1 my-2 w-fit font-mono text-blue-500 dark:text-blue-400';
    title.textContent = `Name: ${Cname}`;
    section.appendChild(title);

    if (desc) {
        const d = document.createElement('p');
        d.className = 'text-sm text-gray-500 dark:text-gray-300 italic mb-2';
        d.textContent = desc;
        section.appendChild(d);
    }

    const graphContainer = document.createElement('div');
    graphContainer.id = `cy-${Cname}`;
    graphContainer.className = 'h-[400px] w-full rounded-lg bg-gray-50 dark:bg-zinc-800';
    section.appendChild(graphContainer);
    diagViewContent.appendChild(section);

    // Cytoscape setup
    const cy = cytoscape({
        container: graphContainer,
        elements,
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'color': '#222',
                    'text-wrap': 'wrap',
                    'text-max-width': 100,
                    'font-size': 12,
                    'background-color': 'data(backgroundColor)',
                    'shape': 'data(shape)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': 10,
                    'text-rotation': 'autorotate',
                    'text-margin-x': 0,
                    'text-margin-y': -10,
                }
            }
        ],
        layout: { name: 'breadthfirst', orientation: 'horizontal', padding: 10 }
    });

    // Optional theme toggle:
    /*
     *    document.getElementById('toggleTheme').addEventListener('click', () => {
     *        const isDark = document.documentElement.classList.toggle('dark');
     *        cy.style(isDark ? darkStyle : lightStyle).update();
});
*/
}


// 2) Main parser: builds nodes & edges arrays, plus captures graph-wide attrs
// 1) DOT → Cytoscape converter via graphlib‑dot
function parseDotToCytoscape(dotCode) {
    // Parse into a graphlib.Graph
    const g = graphlibDot.read(dotCode);

    // Collect graph‑level attributes (e.g. rankdir, bgcolor, etc.)
    const graphAttributes = g.graph() || {};

    // Convert nodes
    const elements = g.nodes().map(id => {
        const attrs = g.node(id) || {};
        return {
            data: {
                id,
                label: attrs.label || id,
                shape: attrs.shape || 'ellipse',
                color: attrs.color || '#999999',
                'border-color': attrs.color || '#000000',
                width: (parseFloat(attrs.width) || 1) * 50,
                height: (parseFloat(attrs.height) || 1) * 50,
                'font-size': parseFloat(attrs.fontsize) || 12,
                'font-color': attrs.fontcolor || '#000000'
            }
        };
    });

    // Convert edges
    g.edges().forEach(e => {
        const attrs = g.edge(e) || {};
        elements.push({
            data: {
                source: e.v,
                target: e.w,
                label: attrs.label || '',
                'line-color': attrs.color || '#888888',
                width: parseFloat(attrs.penwidth) || 2,
                'target-arrow-shape': attrs.arrowhead || 'triangle',
                'line-style': attrs.style || 'solid'
            }
        });
    });

    return { elements, graphAttributes };
}
