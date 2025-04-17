const cytoscape = require('cytoscape');
const graphlibDot = require('graphlib-dot');

const diagViewContent = document.getElementById('modal-content');
const dotCodes = [`
digraph G {
    A -> B;
    B -> C;
    C -> A;
    D [shape=box, label="Node D"];
    A -> D;
}
`,
    `digraph G {
    A -> B;
    B -> C;
    C -> A;
    D [shape=box, label="Node D"];
    A -> D;
}`,
    `
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
`,
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
const sample = `Sure, Mwikya! To set the animation duration for all animations in a section using TailwindCSS, you can use\n
\`\`\`dot\n
//sample diagram
digraph G {
    A -> B;
    B -> C;
    C -> A;
    D [shape=box, label="Node D"];
    A -> D;
}
\`\`\`
`

dotCodes.forEach(dot => {
    dotHandler(dot)
});

function extractDotCodesWithNames(aiResponse) {
    try {
        const dotBlocks = [];

        const dotCodeRegex = /```dot\s+([\s\S]*?)```/gi;
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

// Assuming you have cytoscape and a DOT parser (e.g., graphlib-dot or your own DOT to JSON converter)
async function renderDiagramCytoscape(dotCode, Cname, desc = null) {
    try {
        // Step 1: Convert DOT to Cytoscape-friendly JSON format
        const graphData = parseDotToCytoscape(dotCode); // You must define or import this parser

        // Step 2: Create container section
        const section = document.createElement('section');
        section.className = `block p-2 border border-blue-400 rounded-md bg-white dark:bg-zinc-900`;

        // Title
        const namesec = document.createElement('p');
        namesec.className = `bg-gray-200 dark:bg-zinc-700 rounded-md p-1 my-2 w-fit font-mono text-blue-500 dark:text-blue-400`;
        namesec.textContent = `Name: ${Cname}`;
        section.appendChild(namesec);

        // Description (if any)
        if (desc) {
            const descEl = document.createElement('p');
            descEl.className = `text-sm text-gray-500 dark:text-gray-300 italic mb-2`;
            descEl.textContent = desc;
            section.appendChild(descEl);
        }

        // Graph container
        const graphContainer = document.createElement('div');
        graphContainer.className = `h-[400px] w-full rounded-lg bg-gray-50 dark:bg-zinc-800`;
        graphContainer.style.position = "relative";
        section.appendChild(graphContainer);

        // Append section to the viewer
        diagViewContent.appendChild(section);

        // Step 3: Render using Cytoscape
        cytoscape({
            container: graphContainer,
            elements: graphData.elements,
            layout: { name: 'cose' }, // or any other: 'grid', 'circle', etc.
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#1d4ed8',
                        'label': 'data(label)', // Display label
                        'shape': 'data(shape)', // Map the shape attribute from DOT to Cytoscape's shape
                        'color': 'white',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': 12,
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#999',
                        'target-arrow-color': '#999',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                    }
                }
            ]
        });

    } catch (error) {
        console.error("Error rendering Cytoscape diagram:", error);
    }
}


function parseDotToCytoscape(dotCode) {
    const g = graphlibDot.read(dotCode);
    const nodes = g.nodes().map(id => {
        return {
            data: {
                id: id,
                label: g.node(id).label || id
            }
        };
    });

    const edges = g.edges().map(edge => {
        return {
            data: {
                source: edge.v,
                target: edge.w,
                label: g.edge(edge).label || ''
            }
        };
    });

    return { elements: [...nodes, ...edges] };
}
