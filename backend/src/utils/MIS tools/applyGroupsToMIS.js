export const applyGroupsToMIS = (misData, sectionGroups) => {

  // If MIS data is invalid return it as it is
  if (!misData || !misData.sections) return misData;

  // normalize function to convert string to lowercase and trim
  const normalize = (s) => (s || "").trim().toLowerCase();

  return {

    // How it is used
       // We copy misData
       // Loop through each section (P&L, BS, etc.)
       // secIndex is used to match grouping config

    ...misData,
    sections: misData.sections.map((section, secIndex) => {

      // sectionGroups is indexed by section number
      // If no grouping is defined → return section unchanged
      const gCfg = sectionGroups[String(secIndex)];
      if (!gCfg || !Array.isArray(gCfg.groups)) return section;

      const rows = [...section.rows]; // Copy of rows
      const parents = []; // Zoho default headings (e.g. "Office Expenses")
      const blocks = {}; // Parent → children mapping
      let activeParent = null; // Tracks current parent while scanning

      // Identify parent headings (Zoho defaults headings)
      rows.forEach((r) => {
        const n = normalize(r.name);
        if (r.isGroup && !n.startsWith("total ")) {
          parents.push(r);
          blocks[n] = { parent: r, children: [], summary: null };
          activeParent = n;
          return;
        }

        // Ignore rows until first parent is found
        if (!activeParent) return;

        // If group available we make it total otherwise we display single child row like (rent etc)
        if (n.startsWith("total ")) { // total for custom headings for example total office expense
          blocks[activeParent].summary = r; 
        } else {
          blocks[activeParent].children.push(r);
        }
      });

      // Apply admin-created groups
      // Now we process each Zoho parent separately
      Object.values(blocks).forEach((block) => {
        let children = block.children; // Original rows
        let used = new Set(); // Tracks rows already grouped
        let finalChildren = []; // New reordered children

        // Now we process each admin group separately
        // Loop admin groups
        gCfg.groups.forEach((grp) => {
          const gName = grp.group_name;
          const entries = grp.entries.map(normalize);

          // Finds rows that belong to this admin group
          // Prevents double usage
          let matched = [];
          children.forEach((r, idx) => {
            if (!used.has(idx) && entries.includes(normalize(r.name))) {
              matched.push(r);
              used.add(idx);
            }
          });

          if (matched.length) {
            // Admin group (explicitly marked)
            finalChildren.push({
              name: gName,
              isGroup: true,
              isCustomGroup: true, // Important 
            });

            // Add matched rows under the group
            matched.forEach((m) => finalChildren.push(m));

            // Calculate totals dynamically
            // Find one row to know how many columns exist.
            const sample = matched.find((m) => Array.isArray(m.values));
            let totals = [];

            // Calculate totals:
            // Month-wise totals
            // Values remain untouched
            // Only sums are created
            if (sample) {
              totals = Array(sample.values.length).fill(0);
              matched.forEach((m) =>
                m.values.forEach((v, i) => (totals[i] += Number(v || 0)))
              );
            }

            finalChildren.push({
              name: `Total ${gName}`,
              values: totals,
              isSummary: true,
              isGroup: false,
            });
          }
        });

        // Add unmatched rows
        // Any row not pair of admin groups
        // Appears normally under parent
        children.forEach((r, idx) => {
          if (!used.has(idx)) finalChildren.push(r);
        });

        block.children = finalChildren;
      });

      //  Rebuild rows
      const finalRows = [];
      parents.forEach((p) => {
        const key = normalize(p.name);
        const block = blocks[key];
        finalRows.push(block.parent);
        finalRows.push(...block.children);
        if (block.summary) finalRows.push(block.summary);
      });

      return { ...section, rows: finalRows };
    }),
  };
};
