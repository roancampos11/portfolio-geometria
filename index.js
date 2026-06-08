/* ==========================================================================
   ACADEMIC GEOMETRY PORTFOLIO - MAIN INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize LaTeX rendering via KaTeX for non-dynamic elements
    try {
        if (typeof renderMathInElement === "function") {
            renderMathInElement(document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ]
            });
        }
    } catch (e) {
        console.warn("KaTeX rendering error on load:", e);
    }

    // 2. Core Modules Initialization
    initThemeSwitcher();
    initEmailCopier();
    initNavigationScroll();
    initAnglesWidget();
    initPythagorasWidget();
    initPolygonsWidget();
    initEulerWidget();
    initGeoGebraIntegration();
});

/* ==========================================================================
   THEME SWITCHER
   ========================================================================== */
function initThemeSwitcher() {
    const themeToggle = document.getElementById("theme-toggle");
    const htmlElement = document.documentElement;
    
    // Check saved preference or system theme
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
        htmlElement.setAttribute("data-theme", savedTheme);
    } else {
        htmlElement.setAttribute("data-theme", systemPrefersDark ? "dark" : "light");
    }
    
    themeToggle.addEventListener("click", () => {
        const currentTheme = htmlElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        htmlElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

/* ==========================================================================
   EMAIL COPIER
   ========================================================================== */
function initEmailCopier() {
    const copyBtn = document.getElementById("copy-email-btn");
    const emailText = document.getElementById("author-email").textContent.trim();
    
    if (!copyBtn) return;
    
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(emailText).then(() => {
            copyBtn.classList.add("copied");
            copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            
            setTimeout(() => {
                copyBtn.classList.remove("copied");
                copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
            }, 2000);
        }).catch(err => {
            console.error("Erro ao copiar e-mail: ", err);
        });
    });
}

/* ==========================================================================
   NAVIGATION SMOOTH SCROLL & INDICATORS
   ========================================================================== */
function initNavigationScroll() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll("section");
    
    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        const scrollPosition = window.scrollY + 100; // offset for nav bar
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });
        
        if (currentSectionId) {
            navItems.forEach(item => {
                item.classList.remove("active");
                if (item.getAttribute("href") === `#${currentSectionId}`) {
                    item.classList.add("active");
                }
            });
        }
    });
}

/* ==========================================================================
   1.1 CONCEITOS E ÂNGULOS WIDGET
   ========================================================================== */
function initAnglesWidget() {
    const angleInput = document.getElementById("angle-input");
    const angleValue = document.getElementById("angle-value");
    const angleClass = document.getElementById("angle-class");
    const angleClassDesc = document.getElementById("angle-class-desc");
    const rotLine = document.getElementById("angle-rot-line");
    const arcPath = document.getElementById("angle-arc");
    
    if (!angleInput) return;
    
    const updateAngle = () => {
        const val = parseInt(angleInput.value, 10);
        angleValue.textContent = val;
        
        // 1. Classification
        let label = "Agudo";
        let desc = "Ângulo menor que $90^\\circ$.";
        
        if (val === 0) {
            label = "Nulo";
            desc = "Ângulo cuja medida é exatamente $0^\\circ$.";
        } else if (val === 90) {
            label = "Reto";
            desc = "Ângulo cuja medida é exatamente $90^\\circ$ (ortogonal).";
        } else if (val > 90 && val < 180) {
            label = "Obtuso";
            desc = "Ângulo maior que $90^\\circ$ e menor que $180^\\circ$.";
        } else if (val === 180) {
            label = "Raso";
            desc = "Ângulo de meia-volta, cuja medida é exatamente $180^\\circ$.";
        }
        
        angleClass.textContent = label;
        angleClassDesc.innerHTML = desc;
        
        // Re-render LaTeX inside desc
        if (typeof katex !== "undefined") {
            try {
                katex.render(desc, angleClassDesc, { displayMode: false, throwOnError: false });
            } catch (e) {
                angleClassDesc.textContent = desc.replace(/\$/g, "");
            }
        }
        
        // 2. SVG Rotations (Center: 100, 150; Radius: 70)
        const rad = (val * Math.PI) / 180;
        const x = 100 + 70 * Math.cos(rad);
        const y = 150 - 70 * Math.sin(rad); // Subtract since Y goes down in SVG
        
        rotLine.setAttribute("x2", x);
        rotLine.setAttribute("y2", y);
        
        // Arc (Radius: 30)
        const arcRad = 30;
        const arcX = 100 + arcRad * Math.cos(rad);
        const arcY = 150 - arcRad * Math.sin(rad);
        
        if (val > 0) {
            arcPath.setAttribute("d", `M 130 150 A ${arcRad} ${arcRad} 0 0 0 ${arcX} ${arcY} L 100 150 Z`);
            arcPath.style.display = "block";
        } else {
            arcPath.style.display = "none";
        }
    };
    
    angleInput.addEventListener("input", updateAngle);
    // Initial run
    updateAngle();
}

/* ==========================================================================
   1.2.1 PYTHAGORAS WIDGET (COLLAPSIBLE)
   ========================================================================== */
function initPythagorasWidget() {
    const catBInput = document.getElementById("cateto-b");
    const catCInput = document.getElementById("cateto-c");
    const valB = document.getElementById("val-b");
    const valC = document.getElementById("val-c");
    const calcPanel = document.querySelector(".pythagoras-calc-panel");
    const pythGroup = document.getElementById("pyth-group");
    
    // Collapsible buttons handlers
    const toggleBtns = document.querySelectorAll(".toggle-widget-btn");
    const closeBtns = document.querySelectorAll(".close-widget-btn");
    
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const targetWidget = document.getElementById(targetId);
            
            // Close other widgets
            document.querySelectorAll(".interactive-widget").forEach(w => {
                if (w.getAttribute("id") !== targetId && w.classList.contains("collapsed-widget") === false) {
                    w.classList.add("collapsed-widget");
                }
            });
            
            targetWidget.classList.toggle("collapsed-widget");
            
            // Scroll to widget smoothly
            if (!targetWidget.classList.contains("collapsed-widget")) {
                setTimeout(() => {
                    targetWidget.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 150);
            }
        });
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            document.getElementById(targetId).classList.add("collapsed-widget");
        });
    });
    
    if (!catBInput || !pythGroup) return;
    
    const drawPythagoras = () => {
        const b = parseInt(catBInput.value, 10); // horizontal
        const c = parseInt(catCInput.value, 10); // vertical
        
        valB.textContent = `${b} px`;
        valC.textContent = `${c} px`;
        
        // Calculations
        const b2 = b * b;
        const c2 = c * c;
        const a2 = b2 + c2;
        const a = Math.sqrt(a2).toFixed(1);
        
        // Update Panel
        calcPanel.innerHTML = `
            <p class="calc-step">Cateto $b^2 = ${b}^2 = ${b2}$ u.a.</p>
            <p class="calc-step">Cateto $c^2 = ${c}^2 = ${c2}$ u.a.</p>
            <p class="calc-step">Soma $b^2 + c^2 = ${b2} + ${c2} = ${a2}$ u.a.</p>
            <p class="calc-result">Hipotenusa $a = \\sqrt{${a2}} = ${a}$ u.m. <br> Área $a^2 = ${a2}$ u.a.</p>
        `;
        
        if (typeof katex !== "undefined") {
            renderMathInElement(calcPanel, { delimiters: [{left: '$', right: '$', display: false}] });
        }
        
        // Coordinates setup: Right angle is at (70, 140)
        const ax = 70;
        const ay = 140;
        
        // Triangle points
        const bx = ax + b;
        const by = ay;
        
        const cx = ax;
        const cy = ay - c;
        
        // Clear previous SVG contents
        pythGroup.innerHTML = "";
        
        // 1. Draw Cateto b Square (Horizontal - downwards)
        const sqB = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        sqB.setAttribute("points", `${ax},${ay} ${bx},${by} ${bx},${by + b} ${ax},${ay + b}`);
        sqB.setAttribute("class", "pyth-cat2-sq");
        pythGroup.appendChild(sqB);
        
        // 2. Draw Cateto c Square (Vertical - leftwards)
        const sqC = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        sqC.setAttribute("points", `${ax},${ay} ${cx},${cy} ${cx - c},${cy} ${ax - c},${ay}`);
        sqC.setAttribute("class", "pyth-cat1-sq");
        pythGroup.appendChild(sqC);
        
        // 3. Draw Hypotenuse a Square (Outwards)
        // Vector BC is (-b, -c). Perpendicular vector (outwards) is (-c, b)
        const dx = cx - c;
        const dy = cy + b;
        
        const ex = bx - c;
        const ey = by + b;
        
        const sqA = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        sqA.setAttribute("points", `${bx},${by} ${cx},${cy} ${dx},${dy} ${ex},${ey}`);
        sqA.setAttribute("class", "pyth-hyp-sq");
        pythGroup.appendChild(sqA);
        
        // 4. Draw Right Triangle
        const tri = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        tri.setAttribute("points", `${ax},${ay} ${bx},${by} ${cx},${cy}`);
        tri.setAttribute("class", "pyth-tri");
        pythGroup.appendChild(tri);
        
        // 5. Draw Right Angle indicator square
        const rSize = 8;
        const rAngle = document.createElementNS("http://www.w3.org/2000/svg", "path");
        rAngle.setAttribute("d", `M ${ax + rSize} ${ay} L ${ax + rSize} ${ay - rSize} L ${ax} ${ay - rSize}`);
        rAngle.setAttribute("fill", "none");
        rAngle.setAttribute("stroke", "var(--text-color)");
        rAngle.setAttribute("stroke-width", "1");
        pythGroup.appendChild(rAngle);
        
        // Add dot inside right angle
        const rDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        rDot.setAttribute("cx", ax + rSize/2);
        rDot.setAttribute("cy", ay - rSize/2);
        rDot.setAttribute("r", "1.5");
        rDot.setAttribute("fill", "var(--text-color)");
        pythGroup.appendChild(rDot);
    };
    
    catBInput.addEventListener("input", drawPythagoras);
    catCInput.addEventListener("input", drawPythagoras);
    
    // Initial draw
    drawPythagoras();
}

/* ==========================================================================
   1.2.2 REGULAR POLYGONS WIDGET (COLLAPSIBLE)
   ========================================================================== */
function initPolygonsWidget() {
    const nButtons = document.querySelectorAll(".n-btn");
    const polyName = document.getElementById("poly-name");
    const polyDiagCalc = document.getElementById("poly-diag-calc");
    const polyAngleCalc = document.getElementById("poly-angle-calc");
    const polySingleAngle = document.getElementById("poly-single-angle");
    
    const polyShape = document.getElementById("poly-shape");
    const polyDiags = document.getElementById("poly-diags");
    const polyVertices = document.getElementById("poly-vertices");
    
    if (!polyShape) return;
    
    let activeN = 5; // Default pentagon
    
    const polygonNames = {
        3: "Triângulo Equilátero",
        4: "Quadrado (Quadrilátero Regular)",
        5: "Pentágono Regular",
        6: "Hexágono Regular",
        8: "Octógono Regular",
        10: "Decágono Regular",
        12: "Dodecágono Regular"
    };
    
    const drawPolygon = (n) => {
        activeN = n;
        
        // 1. Calculate values
        const d = (n * (n - 3)) / 2;
        const si = (n - 2) * 180;
        const alpha = (si / n).toFixed(1);
        
        // 2. Update text panels
        polyName.textContent = polygonNames[n];
        
        if (typeof katex !== "undefined") {
            katex.render(`d = \\frac{${n} \\cdot (${n} - 3)}{2} = ${d} \\text{ diagonais}`, polyDiagCalc);
            katex.render(`S_i = (${n} - 2) \\cdot 180^\\circ = ${si}^\\circ \\text{ (soma)}`, polyAngleCalc);
            katex.render(`\\alpha_i = \\frac{${si}^\\circ}{${n}} = ${alpha}^\\circ \\text{ (ângulo interno)}`, polySingleAngle);
        } else {
            polyDiagCalc.textContent = `Diagonais: d = ${d}`;
            polyAngleCalc.textContent = `Soma dos Ângulos: Si = ${si}°`;
            polySingleAngle.textContent = `Ângulo Interno: ${alpha}°`;
        }
        
        // 3. Coordinate Generation (Center: 100, 100; Radius: 70)
        const cx = 100;
        const cy = 100;
        const r = 70;
        const points = [];
        
        for (let i = 0; i < n; i++) {
            // Start at top (-PI/2) and rotate clockwise
            const theta = -Math.PI / 2 + (2 * Math.PI * i) / n;
            const px = cx + r * Math.cos(theta);
            const py = cy + r * Math.sin(theta);
            points.push({ x: px, y: py });
        }
        
        // Set points for the main polygon SVG outline
        const pointsString = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        polyShape.setAttribute("points", pointsString);
        
        // 4. Generate Diagonals in SVG
        polyDiags.innerHTML = "";
        for (let i = 0; i < n; i++) {
            for (let j = i + 2; j < n; j++) {
                // Ignore border lines (adjacents, and wrap-around first/last)
                if (i === 0 && j === n - 1) continue;
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", points[i].x);
                line.setAttribute("y1", points[i].y);
                line.setAttribute("x2", points[j].x);
                line.setAttribute("y2", points[j].y);
                polyDiags.appendChild(line);
            }
        }
        
        // 5. Generate Vertex dots
        polyVertices.innerHTML = "";
        points.forEach((p, idx) => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", "4");
            circle.setAttribute("class", "poly-v-dot");
            
            // Add a small hover label showing vertex index or letter (A, B, C...)
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `Vértice ${String.fromCharCode(65 + idx)}`; // A, B, C...
            circle.appendChild(title);
            
            polyVertices.appendChild(circle);
        });
    };
    
    // Add click listeners to selector buttons
    nButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            nButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            drawPolygon(parseInt(btn.getAttribute("data-n"), 10));
        });
    });
    
    // Initial draw
    drawPolygon(activeN);
}

/* ==========================================================================
   2.1 EULER RELATION & 3D CSS SHAPES
   ========================================================================== */
function initEulerWidget() {
    const solidSelect = document.getElementById("solid-select");
    const eulerV = document.getElementById("euler-v");
    const eulerA = document.getElementById("euler-a");
    const eulerF = document.getElementById("euler-f");
    const eulerCheck = document.getElementById("euler-check");
    const modelContainer = document.getElementById("cube-3d-model");
    
    if (!solidSelect || !modelContainer) return;
    
    const solidsData = {
        "tetraedro": { v: 4, a: 6, f: 4, label: "Tetraedro" },
        "cubo": { v: 8, a: 12, f: 6, label: "Hexaedro (Cubo)" },
        "octaedro": { v: 6, a: 12, f: 8, label: "Octaedro" },
        "dodecaedro": { v: 20, a: 30, f: 12, label: "Dodecaedro" },
        "icosaedro": { v: 12, a: 30, f: 20, label: "Icosaedro" },
        "prisma-tri": { v: 6, a: 9, f: 5, label: "Prisma Triangular" },
        "piramide-quad": { v: 5, a: 8, f: 5, label: "Pirâmide Quadrangular" }
    };
    
    // HTML templates for 3D spinning wireframes using CSS 3D
    const css3DHtmlTemplates = {
        "cubo": `
            <div class="face front"></div>
            <div class="face back"></div>
            <div class="face left"></div>
            <div class="face right"></div>
            <div class="face top"></div>
            <div class="face bottom"></div>
        `,
        "tetraedro": `
            <!-- Styled via CSS skew/rotations for custom triangular structure -->
            <div class="face tetra-f" style="width:0; height:0; border-left:50px solid transparent; border-right:50px solid transparent; border-bottom:86px solid var(--accent-color); transform: translate3d(0, -28px, 20px) rotateX(20deg); opacity: 0.7; background:none;"></div>
            <div class="face tetra-l" style="width:0; height:0; border-left:50px solid transparent; border-right:50px solid transparent; border-bottom:86px solid var(--accent-color); transform: translate3d(-35px, -28px, -15px) rotateY(120deg) rotateX(20deg); opacity: 0.7; background:none;"></div>
            <div class="face tetra-r" style="width:0; height:0; border-left:50px solid transparent; border-right:50px solid transparent; border-bottom:86px solid var(--accent-color); transform: translate3d(35px, -28px, -15px) rotateY(-120deg) rotateX(20deg); opacity: 0.7; background:none;"></div>
            <div class="face tetra-b" style="width:0; height:0; border-left:50px solid transparent; border-right:50px solid transparent; border-bottom:86px solid var(--accent-color); transform: translate3d(0, 15px, 0) rotateX(90deg); opacity: 0.7; background:none;"></div>
        `,
        "prisma-tri": `
            <!-- Triangular prism with 3 sides + 2 triangular bases -->
            <div class="face side1" style="width:60px; height:100px; transform: translate3d(-30px, -50px, 17px) rotateY(30deg); background: rgba(99, 102, 241, 0.1); border: 2px solid var(--accent-color);"></div>
            <div class="face side2" style="width:60px; height:100px; transform: translate3d(0px, -50px, -35px) rotateY(150deg); background: rgba(99, 102, 241, 0.1); border: 2px solid var(--accent-color);"></div>
            <div class="face side3" style="width:60px; height:100px; transform: translate3d(30px, -50px, 17px) rotateY(-90deg); background: rgba(99, 102, 241, 0.1); border: 2px solid var(--accent-color);"></div>
            <div class="face base-t" style="width:0; height:0; border-left:30px solid transparent; border-right:30px solid transparent; border-bottom:52px solid var(--accent-color); transform: translate3d(0, -76px, 0) rotateX(90deg); background:none; opacity:0.6;"></div>
            <div class="face base-b" style="width:0; height:0; border-left:30px solid transparent; border-right:30px solid transparent; border-bottom:52px solid var(--accent-color); transform: translate3d(0, 24px, 0) rotateX(-90deg); background:none; opacity:0.6;"></div>
        `,
        "piramide-quad": `
            <!-- Square base pyramid -->
            <div class="face pyr-base" style="width:80px; height:80px; transform: translate3d(-40px, 10px, -40px) rotateX(90deg); background: rgba(99, 102, 241, 0.1); border: 2px solid var(--accent-color);"></div>
            <div class="face pyr-f" style="width:0; height:0; border-left:40px solid transparent; border-right:40px solid transparent; border-bottom:70px solid var(--accent-color); transform: translate3d(-40px, -30px, 40px) rotateX(30deg); background:none; opacity:0.7; transform-origin: center bottom;"></div>
            <div class="face pyr-b" style="width:0; height:0; border-left:40px solid transparent; border-right:40px solid transparent; border-bottom:70px solid var(--accent-color); transform: translate3d(-40px, -30px, -40px) rotateY(180deg) rotateX(30deg); background:none; opacity:0.7; transform-origin: center bottom;"></div>
            <div class="face pyr-l" style="width:0; height:0; border-left:40px solid transparent; border-right:40px solid transparent; border-bottom:70px solid var(--accent-color); transform: translate3d(-80px, -30px, 0px) rotateY(-90deg) rotateX(30deg); background:none; opacity:0.7; transform-origin: center bottom;"></div>
            <div class="face pyr-r" style="width:0; height:0; border-left:40px solid transparent; border-right:40px solid transparent; border-bottom:70px solid var(--accent-color); transform: translate3d(0px, -30px, 0px) rotateY(90deg) rotateX(30deg); background:none; opacity:0.7; transform-origin: center bottom;"></div>
        `,
        "default": `
            <!-- Abstract polyhedral representation of vertices using particles -->
            <div class="face" style="width:60px; height:60px; border-radius:50%; border:2px dashed var(--accent-color); transform: rotateX(45deg);"></div>
            <div class="face" style="width:60px; height:60px; border-radius:50%; border:2px dashed var(--accent-color); transform: rotateY(45deg);"></div>
            <div style="position:absolute; width:10px; height:10px; background:var(--text-color); border-radius:50%; transform:translateZ(40px)"></div>
            <div style="position:absolute; width:10px; height:10px; background:var(--text-color); border-radius:50%; transform:translateZ(-40px)"></div>
            <div style="position:absolute; width:10px; height:10px; background:var(--text-color); border-radius:50%; transform:translateX(40px)"></div>
            <div style="position:absolute; width:10px; height:10px; background:var(--text-color); border-radius:50%; transform:translateX(-40px)"></div>
        `
    };
    
    const updateEuler = () => {
        const solid = solidSelect.value;
        const data = solidsData[solid];
        
        eulerV.textContent = data.v;
        eulerA.textContent = data.a;
        eulerF.textContent = data.f;
        
        // Show validation step
        const eqStr = `V - A + F = ${data.v} - ${data.a} + ${data.f} = 2 \\quad (\\text{Válido!})`;
        
        if (typeof katex !== "undefined") {
            katex.render(eqStr, eulerCheck, { displayMode: true });
        } else {
            eulerCheck.textContent = `V - A + F = ${data.v} - ${data.a} + ${data.f} = 2 (Válido!)`;
        }
        
        // Update 3D wireframe visuals
        modelContainer.innerHTML = css3DHtmlTemplates[solid] || css3DHtmlTemplates["default"];
        
        // Small tweak to center templates correctly if class changes
        modelContainer.className = "solid-3d-container " + solid;
    };
    
    solidSelect.addEventListener("change", updateEuler);
    // Initial run
    updateEuler();
}

/* ==========================================================================
   3. GEOGEBRA INTEGRATION & CLIENT WORKSPACE
   ========================================================================== */
function initGeoGebraIntegration() {
    const tabBtns = document.querySelectorAll(".lab-tab-btn");
    const practiceInfos = document.querySelectorAll(".practice-content");
    const modeBtns = document.querySelectorAll(".mode-btn");
    const resetGgbBtn = document.getElementById("btn-ggb-reset");
    const statusText = document.getElementById("ggb-status-text");
    const statusDot = document.querySelector(".status-indicator .status-dot");
    
    let activePractice = "1"; // "1" for 2D, "2" for 3D
    let activeMode = "sandbox"; // "sandbox" (blank) or "demo" (pre-built)
    
    // Checked checklist tracking
    const setupChecklistListeners = () => {
        const checkBoxes = document.querySelectorAll(".task-checkbox");
        checkBoxes.forEach(box => {
            box.addEventListener("change", () => {
                // Visual reward/effect on complete
                const list = box.closest(".checklist-list");
                const allChecked = Array.from(list.querySelectorAll(".task-checkbox")).every(b => b.checked);
                
                if (allChecked) {
                    // Trigger dynamic green glow on container
                    const panel = box.closest(".lab-control-panel");
                    panel.style.boxShadow = "0 10px 40px rgba(16, 185, 129, 0.15)";
                    panel.style.borderColor = "var(--success-color)";
                    
                    // Simple animation alert
                    statusText.textContent = "Excelente! Roteiro concluído!";
                    statusDot.className = "status-dot green";
                } else {
                    const panel = box.closest(".lab-control-panel");
                    panel.style.boxShadow = "";
                    panel.style.borderColor = "";
                    statusText.textContent = "GeoGebra Ativo";
                }
            });
        });
    };
    
    setupChecklistListeners();
    
    // Switch between practices
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const practice = btn.getAttribute("data-practice");
            if (activePractice === practice) return;
            
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            practiceInfos.forEach(info => info.classList.remove("active"));
            document.getElementById(`practice-${practice}-info`).classList.add("active");
            
            activePractice = practice;
            loadGeoGebraApplet();
        });
    });
    
    // Switch between Sandbox (Blank) vs Demo (Pre-built)
    modeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const mode = btn.getAttribute("id") === "btn-mode-demo" ? "demo" : "sandbox";
            if (activeMode === mode) return;
            
            activeMode = mode;
            loadGeoGebraApplet();
        });
    });
    
    // Reset Applet
    resetGgbBtn.addEventListener("click", () => {
        loadGeoGebraApplet();
    });
    
    // Global variable to keep track of loaded GeoGebra applet
    let ggbApp = null;
    
    // Load GeoGebra Applet depending on active practice and mode using iframe to bypass local filesystem security blocks
    const loadGeoGebraApplet = () => {
        // Clear previous element
        const container = document.getElementById("ggb-element");
        container.innerHTML = "";
        
        statusText.textContent = "Carregando GeoGebra Engine...";
        statusDot.className = "status-dot yellow";
        
        let url = "";
        
        if (activeMode === "sandbox") {
            if (activePractice === "1") {
                // Geometry 2D Sandbox
                url = "https://www.geogebra.org/geometry?embed";
            } else {
                // 3D Calculator Sandbox
                url = "https://www.geogebra.org/3d?embed";
            }
        } else {
            if (activePractice === "1") {
                // Demo Triângulo (Soma dos Ângulos)
                url = "https://www.geogebra.org/material/iframe/id/mgpw3epu/rc/true/sdz/true/smb/false/stb/false/stbh/true/ld/false/sri/true";
            } else {
                // Demo Planificação (Prisma/Pirâmide)
                url = "https://www.geogebra.org/material/iframe/id/fwT2GTXZ/rc/true/sdz/true/smb/false/stb/false/stbh/true/ld/false/sri/true";
            }
        }
        
        // Inject iframe directly
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.borderRadius = "8px";
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("allow", "geolocation; microphone; camera; autoplay; encrypted-media");
        
        iframe.onload = () => {
            statusText.textContent = "GeoGebra Ativo";
            statusDot.className = "status-dot green";
        };
        
        iframe.onerror = () => {
            statusText.textContent = "Erro ao carregar GeoGebra";
            statusDot.className = "status-dot";
        };
        
        container.appendChild(iframe);
    };
    
    // Load default applet on startup immediately
    loadGeoGebraApplet();
}
