// triangle.js listens for form submission in index.html, then draws the triangle using query params taken form input fields 
// then draws triangle while compute angles in display.html
// in index.html is builds a form data query string and redirects to display.html
// in display.html it reads the query string, draws the triangle, computes angles and displays them, including arcs and labels

(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("pointsForm");
        if (form) { // if  "pointsForm" id exists, we are in index.html-> need to get input and redirect to display.html
                    // else if not, we are in display.html -> need to draw the triangle
            form.addEventListener("submit", (e) => {
                e.preventDefault(); //prevents form from submitting and reloading the page
                location.href = `./display.html?${new URLSearchParams(new FormData(form))}`; //redirect user to display.html with query string (form data)
            });
            return;
        }

        const svg = document.getElementById("triCanvas");
        if (!svg) return; // in index.html the svg holds 'null', so you can't draw anything, thats why we check for it before proceeding
        
        // read points from query string
        const q = new URLSearchParams(location.search);
        
        const points = [
            { x: +q.get("p1x") || 0, y: +q.get("p1y") || 0, label: "A" },
            { x: +q.get("p2x") || 0, y: +q.get("p2y") || 0, label: "B" },
            { x: +q.get("p3x") || 0, y: +q.get("p3y") || 0, label: "C" },
        ];
        // show points summary data (beneath the triangle) 
        updatePointsSummary(points);

        //draw the triangle
        drawTriangle(svg, points);

        //dealing with angles (numbers, labels, arcs)
        const angles = computeAngles(points);
        updateAngles(angles); // //updating angles info at the bottom of the page
        drawAngleLabels(svg, points, angles); //// showing the angle values as text inside the triangle near each vertex
        drawAngleArcs(svg, points, angles);
    });

    // show a summary of info about each point (TODO: learn)
    function updatePointsSummary(points) {
        const el = document.getElementById("pointsSummary"); // "points-summary" exists only in display.html
        //converting 'points' array of objects to a string in order to display it
        if (el) el.textContent = points.map(p => `${p.label} = (${p.x}, ${p.y})`).join("\n"); 
    }

    //updating angles info at the bottom of the page
    function updateAngles({ A = null, B = null, C = null } = {}) {
        const set = (id, v) => {
            const el = document.getElementById(id);
            if (el) el.textContent = v != null ? v.toFixed(2) : "—";
        };
        //TODO: learn 'set' , create proper value to this specific key (a,b,c are keys)
        set("angleA", A); set("angleB", B); set("angleC", C);
    }

    //draw the triangle itself
    function drawTriangle(svg, points) {
        svg.innerHTML =

        // draws an outline of the triangle
            `<polygon points="${points.map(p => `${p.x},${p.y}`).join(" ")}" fill="none" stroke="#111" stroke-width="2"/>` +
           
        // draw points (vertices) and text labels
            points.map(p =>
                `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#111"/>` +
                `<text x="${p.x + 8}" y="${p.y - 8}">${p.label}</text>`
            ).join("");
    }

    // calculated angles and side lengths using the cosine rule
    function computeAngles(points) {
        const [Apt, Bpt, Cpt] = points;

        //  distances (sides) 
        const a = Math.sqrt((Bpt.x - Cpt.x) ** 2 + (Bpt.y - Cpt.y) ** 2); // opposite A
        const b = Math.sqrt((Apt.x - Cpt.x) ** 2 + (Apt.y - Cpt.y) ** 2); // opposite B
        const c = Math.sqrt((Apt.x - Bpt.x) ** 2 + (Apt.y - Bpt.y) ** 2); // opposite C

        // cosines of angles
        const cosA = (b * b + c * c - a * a) / (2 * b * c);
        const cosB = (a * a + c * c - b * b) / (2 * a * c);
        const cosC = (a * a + b * b - c * c) / (2 * a * b);

        // converting from radians to degrees 
        const A = Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI;
        const B = Math.acos(Math.max(-1, Math.min(1, cosB))) * 180 / Math.PI;
        const C = Math.acos(Math.max(-1, Math.min(1, cosC))) * 180 / Math.PI;

        return { A, B, C }; // A,B,C are Angles (numbers) in degrees
    }

    // showing the angle values as text inside the triangle near each vertex
    function drawAngleLabels(svg, points, angles) {
        const [A, B, C] = points;
        const angleTexts = [
            { x: A.x + 32, y: A.y + 20, angle: angles.A.toFixed(1) },
            { x: B.x - 30, y: B.y + 20, angle: angles.B.toFixed(1) },
            { x: C.x - 0, y: C.y - 25, angle: angles.C.toFixed(1) }
        ];

        //item.x, itemy are coordinates for the angles inside the triangle
        angleTexts.forEach(item => {
            svg.innerHTML += `<text x="${item.x}" y="${item.y}" fill="red" font-size="12" text-anchor="middle">${item.angle}</text>`;
        });
    }

    // draw arcs to represent angles at each corner (vertex) 
    function drawAngleArcs(svg, points, angles) {
        const [A, B, C] = points;
        const radius = 20;

        // Arc at vertex A
        const dirAB = Math.atan2(B.y - A.y, B.x - A.x);
        const dirAC = Math.atan2(C.y - A.y, C.x - A.x);
        const startA = { x: A.x + Math.cos(dirAB) * radius, y: A.y + Math.sin(dirAB) * radius };
        const endA = { x: A.x + Math.cos(dirAC) * radius, y: A.y + Math.sin(dirAC) * radius };
        svg.innerHTML += `<path d="M ${startA.x} ${startA.y} A ${radius} ${radius} 0 0 1 ${endA.x} ${endA.y}" 
                         stroke="green" stroke-width="2" fill="none"/>`;

        // Arc at vertex B  
        const dirBA = Math.atan2(A.y - B.y, A.x - B.x);
        const dirBC = Math.atan2(C.y - B.y, C.x - B.x);
        const startB = { x: B.x + Math.cos(dirBA) * radius, y: B.y + Math.sin(dirBA) * radius };
        const endB = { x: B.x + Math.cos(dirBC) * radius, y: B.y + Math.sin(dirBC) * radius };
        svg.innerHTML += `<path d="M ${startB.x} ${startB.y} A ${radius} ${radius} 0 0 1 ${endB.x} ${endB.y}" 
                         stroke="green" stroke-width="2" fill="none"/>`;

        // Arc at vertex C
        const dirCA = Math.atan2(A.y - C.y, A.x - C.x);
        const dirCB = Math.atan2(B.y - C.y, B.x - C.x);
        const startC = { x: C.x + Math.cos(dirCA) * radius, y: C.y + Math.sin(dirCA) * radius };
        const endC = { x: C.x + Math.cos(dirCB) * radius, y: C.y + Math.sin(dirCB) * radius };
        svg.innerHTML += `<path d="M ${startC.x} ${startC.y} A ${radius} ${radius} 0 0 1 ${endC.x} ${endC.y}" 
                         stroke="green" stroke-width="2" fill="none"/>`;
    }
})();
