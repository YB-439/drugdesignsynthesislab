/**
 * 3D Docking Visualizer Module (powered by 3Dmol.js)
 * Drug Design and Synthesis Lab, Punjabi University Patiala
 */

window.DockingViewer = (function () {
  let viewerInstance = null;
  let currentTarget = 'bace1';

  // Sample PDB structures & coordinates
  const DOCKING_TARGETS = {
    bace1: {
      name: "BACE-1 Complexed with Benzimidazole Lead (PDB: 4D8C)",
      pdbId: "4D8C",
      targetName: "Beta-Secretase 1 (Alzheimer's Target)",
      scaffold: "Benzimidazole Series",
      bindingAffinity: "-9.4 kcal/mol",
      keyResidues: "Asp32, Asp228, Gly230, Tyr71"
    },
    vegfr2: {
      name: "VEGFR-2 Kinase Domain with Coumarin Analog (PDB: 4AG8)",
      pdbId: "4AG8",
      targetName: "Vascular Endothelial Growth Factor Receptor 2",
      scaffold: "Coumarin Derivatives",
      bindingAffinity: "-10.2 kcal/mol",
      keyResidues: "Glu917, Cys919, Asp1046, Phe1047"
    },
    ache: {
      name: "Acetylcholinesterase with Indole-Benzimidazole Hybrid (PDB: 1EVE)",
      pdbId: "1EVE",
      targetName: "Acetylcholinesterase (AChE Target)",
      scaffold: "Indole-Benzimidazole Hybrid",
      bindingAffinity: "-11.1 kcal/mol",
      keyResidues: "Trp84, Asp72, Tyr121, Trp279"
    }
  };

  function initViewer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (window.$3Dmol) {
      viewerInstance = $3Dmol.createViewer(container, {
        backgroundColor: '#050b14'
      });
      loadTargetStructure(currentTarget);
    } else {
      console.warn("3Dmol.js library not loaded yet.");
    }
  }

  function loadTargetStructure(targetKey) {
    if (!viewerInstance) return;

    currentTarget = targetKey;
    const targetData = DOCKING_TARGETS[targetKey] || DOCKING_TARGETS.bace1;

    // Update UI info labels
    const titleElem = document.getElementById('target-title-display');
    const affinityElem = document.getElementById('target-affinity-display');
    const residuesElem = document.getElementById('target-residues-display');

    if (titleElem) titleElem.textContent = targetData.name;
    if (affinityElem) affinityElem.textContent = targetData.bindingAffinity;
    if (residuesElem) residuesElem.textContent = targetData.keyResidues;

    viewerInstance.clear();
    
    // Fetch PDB structure from RCSB PDB web API
    const pdbUri = `https://files.rcsb.org/download/${targetData.pdbId}.pdb`;

    fetch(pdbUri)
      .then(res => res.text())
      .then(pdbData => {
        viewerInstance.addModel(pdbData, "pdb");
        
        // Style protein as cartoon ribbon
        viewerInstance.setStyle({ chain: 'A' }, { cartoon: { color: 'spectrum' } });
        
        // Style hetero atoms / ligand as sticks
        viewerInstance.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon', radius: 0.25 } });

        viewerInstance.zoomTo();
        viewerInstance.render();
      })
      .catch(err => {
        console.error("Failed to load PDB from RCSB, building fallback 3D representation:", err);
        renderFallbackMolecule();
      });
  }

  function renderFallbackMolecule() {
    if (!viewerInstance) return;
    viewerInstance.clear();
    // Fallback sphere & stick visual if offline
    viewerInstance.addSphere({ center: { x: 0, y: 0, z: 0 }, radius: 2.0, color: 'cyan' });
    viewerInstance.addSphere({ center: { x: 3, y: 1, z: -1 }, radius: 1.5, color: 'magenta' });
    viewerInstance.addCylinder({ start: { x: 0, y: 0, z: 0 }, end: { x: 3, y: 1, z: -1 }, radius: 0.4, color: 'white' });
    viewerInstance.zoomTo();
    viewerInstance.render();
  }

  function setDisplayStyle(styleType) {
    if (!viewerInstance) return;

    viewerInstance.removeAllSurfaces();
    if (styleType === 'ribbon') {
      viewerInstance.setStyle({}, { cartoon: { color: 'spectrum' } });
      viewerInstance.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon', radius: 0.3 } });
    } else if (styleType === 'surface') {
      viewerInstance.setStyle({}, { cartoon: { color: 'spectrum' } });
      viewerInstance.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.6, colorscheme: 'spectrum' });
      viewerInstance.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon', radius: 0.35 } });
    } else if (styleType === 'stick') {
      viewerInstance.setStyle({}, { stick: { radius: 0.15 } });
      viewerInstance.setStyle({ hetflag: true }, { stick: { colorscheme: 'magentaCarbon', radius: 0.35 } });
    } else if (styleType === 'cpk') {
      viewerInstance.setStyle({}, { sphere: { scale: 0.8 } });
    }

    viewerInstance.render();
  }

  function toggleSpin(enable) {
    if (!viewerInstance) return;
    viewerInstance.spin(enable ? 'y' : false, 1.0);
  }

  function resetView() {
    if (!viewerInstance) return;
    viewerInstance.zoomTo();
    viewerInstance.render();
  }

  return {
    DOCKING_TARGETS: DOCKING_TARGETS,
    initViewer: initViewer,
    loadTargetStructure: loadTargetStructure,
    setDisplayStyle: setDisplayStyle,
    toggleSpin: toggleSpin,
    resetView: resetView
  };
})();
