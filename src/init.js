document.addEventListener('DOMContentLoaded', () => {
  renderLeverGrid();
  selCount(); // fire on load so warning shows if defaults exceed 6
  // Init cost state from slider defaults (sliders have value= attrs so this works)
  costRows = defaultCostRows();
  rebuildCostState();
  syncNav();
});
