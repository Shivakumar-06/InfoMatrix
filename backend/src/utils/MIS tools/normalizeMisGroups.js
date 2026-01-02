// Normalize MIS groups 

export function normalizeMisGroups(misGroups) {
  const result = {};

  for (const fullKey in misGroups) {
    const [type, sectionIndex] = fullKey.split("-section-");

    if (!result[type]) result[type] = {};
    if (!result[type][sectionIndex]) {
      result[type][sectionIndex] = { groups: [] };
    }

    const sectionData = misGroups[fullKey];
    if (Array.isArray(sectionData?.groups)) {
      result[type][sectionIndex].groups.push(...sectionData.groups);
    }
  }

  return result;
}