export const convertToMIS = (report) => {
  const { type, data, start_date, end_date } = report;
  let misData = {};

  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthRangeCache = new Map();

  const getMonthRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const months = [];
    let current = new Date(s);
    while (current <= e) {
      months.push(
        `${monthNamesShort[current.getMonth()]} ${current.getFullYear()}`
      );
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  const cacheKey = `${start_date}_${end_date}`;
  let monthRange = monthRangeCache.get(cacheKey);

  if (!monthRange) {
    monthRange = getMonthRange(start_date, end_date);
    monthRangeCache.set(cacheKey, monthRange);
  }

  const safeNum = (n) => (typeof n === "number" ? n : 0);

  // Normalize Zoho response
  // Why this exists:
  // Zoho returns different structures for different types of reports
  // this normalizes the response to a common structure

  const monthlyValueCache = new Map();


  const monthlyReports = data?.monthly_reports?.length
    ? data.monthly_reports
    : [{ month: monthRange[0], report: data }];

  // Get monthly values
  // For each month, extract the same value (sales, expense, total, etc.)

  const getMonthlyValues = (monthlyReports, getValueFn) =>
    // For each month, extract the same value (Sales, Expense, Total, etc.)
    // Return 0 if not found and Return array of values
    monthRange.map((m, i) => {
      const found =
        monthlyReports[i] || monthlyReports.find((mr) => mr.month === m); // try to find the data for the  month
      return found ? safeNum(getValueFn(found.report)) : 0; // return the value if found else return 0
    });

  // build structured rows (recursive grouping)

  const buildStructuredRows = (sectionNodes = [], sectionName) => {
    // Array of nodes from Zoho (Operating Expense, Other Expense) && Which PL section this belongs to (Net Profit/Loss)

    const rows = []; // Array of rows to return

    // For each node can be a parent (has children) or a flat account (no children)
    // check if this node has a childerns

    for (const node of sectionNodes || []) {
      // Zoho uses account_transactions for nested accounts
      // If it exists → this is a group
      // If it doesn't exist -> this is flat account

      const hasChildren =
        Array.isArray(node.account_transactions) &&
        node.account_transactions.length > 0;

      if (hasChildren) {
        const children = node.account_transactions.map((child) => ({
          name: child.name,
          values: getMonthlyValues(monthlyReports, (r) => {
            // Find correct PL section
            // (e.g., "Net Profit/Loss")

            const section = r?.profit_and_loss?.find(
              (x) => x.name === sectionName
            );

            // Find parent account
            // (e.g., "Operating Expense")

            const parent = section?.account_transactions?.find(
              (x) => x.name === node.name
            );

            // Find child account
            // (e.g., "Rent")

            const childNode = parent?.account_transactions?.find(
              (c) => c.name === child.name
            );

            // Return numeric value, If missing → 0
            // This guarantees month-safe values

            return safeNum(childNode?.total);
          }),
        }));

        // Push parent row
        rows.push({ name: node.name, isGroup: true });

        // Push children row
        rows.push(...children);

        // Push total row
        rows.push({
          name: `Total ${node.name}`,
          values: getMonthlyValues(monthlyReports, (r) => {
            const section = r?.profit_and_loss?.find(
              (x) => x.name === sectionName
            );
            const parent = section?.account_transactions?.find(
              (x) => x.name === node.name
            );
            return safeNum(parent?.total);
          }),
        });
      } else {
        rows.push({
          name: node.name,
          values: getMonthlyValues(monthlyReports, (r) => {
            // Uses Zoho’s official total
            const section = r?.profit_and_loss?.find(
              (x) => x.name === sectionName
            );

            // Since no children exist, we search directly

            const flat = section?.account_transactions || [];
            const found = flat.find((x) => x.name === node.name);
            return safeNum(found?.total);
          }),
        });
      }
    }

    return rows;
  };

  // PROFIT & LOSS

  if (type === "pl") {
    // Why this is needed:
    // Zoho P&L structure (sections) is same for every month
    // We inspect the first month to understand the layout

    const firstPL = monthlyReports[0]?.report?.profit_and_loss || [];

    // Sections inside Zoho PL

    const revenueSection = firstPL.find((x) => x.name === "Gross Profit");
    const expenseSection = firstPL.find((x) => x.name === "Operating Profit");
    const profitSection = firstPL.find((x) => x.name === "Net Profit/Loss");

    // I. REVENUE (SHOW ALL INCOME ITEMS)

    let revenueRows = [];

    // Safety check:
    // Some companies may have no revenue
    // Prevents crashes

    if (revenueSection) {
      // Collect ALL income names across ALL months
      // Why this is critical:
      // One month may have “Sales”
      // Another month may also have “Other Charges”
      // MIS must show same rows for every month

      const uniqueIncomeNames = new Set();

      // 1️: Collect all income names (Sales, Other Charges, etc.)

      monthlyReports.forEach((m) => {
        // Loop through all months
        const pl = m.report?.profit_and_loss || [];
        const sec = pl.find((x) => x.name === "Gross Profit"); // Extract Gross profit section
        if (!sec) return;

        const op = sec.account_transactions.find(
          // This is where Zoho stores: (Sales, Service Income, Other Income)
          (a) => a.name?.toLowerCase() === "operating income" // Find operating income
        );
        if (!op) return;

        // Add all income names to set
        // Now you have all income account names across months.

        op.account_transactions.forEach((child) =>
          uniqueIncomeNames.add(child.name)
        );
      });

      const allIncomeNames = [...uniqueIncomeNames];

      revenueRows.push({ name: "Operating Income", isGroup: true, values: [] });

      // 2️: Build rows for each income item

      allIncomeNames.forEach((incName) => {
        // How its working:
        // 1: Find gross profit section
        // 2: Find operating income section
        // 3: Find child account
        // 4: Return numeric value
        // 5: If missing -> 0
        // 6: Push row
        // 7: Return monthly values

        const monthlyValues = getMonthlyValues(monthlyReports, (rep) => {
          const pl = rep.profit_and_loss || [];

          const sec = pl.find((x) => x.name === "Gross Profit");
          const op = sec?.account_transactions?.find(
            (a) => a.name?.toLowerCase() === "operating income"
          );

          const child = op?.account_transactions?.find(
            (c) => c.name === incName
          );
          return safeNum(child?.total);
        });

        revenueRows.push({
          name: incName,
          values: monthlyValues,
        });
      });

      // 3️ Total for Operating Income

      const monthlyTotalIncome = getMonthlyValues(monthlyReports, (rep) => {
        const pl = rep.profit_and_loss || [];
        const sec = pl.find((x) => x.name === "Gross Profit");
        const op = sec?.account_transactions?.find(
          (a) => a.name?.toLowerCase() === "operating income"
        );
        return safeNum(op?.total);
      });

      revenueRows.push({
        name: "Total Operating Income",
        values: monthlyTotalIncome,
        isSummary: true,
      });
    }

    // II. EXPENDITURE

    let expenseRows = [];

    if (expenseSection) {
      const uniqueExpenseNames = new Set();

      // 1: Collect all distinct expense names from ALL months

      monthlyReports.forEach((m) => {
        const pl = m.report?.profit_and_loss || [];
        const sec = pl.find((x) => x.name === "Operating Profit");
        if (!sec) return;

        const op = sec.account_transactions.find(
          (a) => a.name?.toLowerCase() === "operating expense"
        );
        if (!op) return;

        op.account_transactions.forEach((child) => {
          uniqueExpenseNames.add(child.name);
        });
      });

      const allExpenseNames = [...uniqueExpenseNames];

      expenseRows.push({
        name: "Operating Expense",
        isGroup: true,
        values: [],
      });

      // 2: Build rows for each expense item

      allExpenseNames.forEach((expName) => {
        const monthlyValues = getMonthlyValues(monthlyReports, (rep) => {
          const pl = rep.profit_and_loss || [];
          const sec = pl.find((x) => x.name === "Operating Profit");

          const op = sec?.account_transactions?.find(
            (a) => a.name?.toLowerCase() === "operating expense"
          );
          if (!op) return 0;

          const child = op.account_transactions.find((c) => c.name === expName);
          return safeNum(child?.total);
        });

        expenseRows.push({ name: expName, values: monthlyValues });
      });

      // 3: Adding total for operating expense

      const monthlyTotalExpense = getMonthlyValues(monthlyReports, (rep) => {
        const sec = rep.profit_and_loss?.find(
          (x) => x.name === "Operating Profit"
        );
        return safeNum(sec?.total);
      });

      expenseRows.push({
        name: "Total Operating Expense",
        values: monthlyTotalExpense,
        isSummary: true,
      });
    }

    // III. NET PROFIT / LOSS

    // Extract Net profit values month-wise

    const netProfitValues = getMonthlyValues(monthlyReports, (rep) => {
      const sec = rep.profit_and_loss?.find(
        (x) => x.name === "Net Profit/Loss"
      );
      return safeNum(sec?.total);
    });

    const profitRows = [];

    if (profitSection && Array.isArray(profitSection.account_transactions)) {
      profitRows.push(
        ...buildStructuredRows(
          profitSection.account_transactions,
          "Net Profit/Loss"
        )
      );
    }

    profitRows.push({
      name: "Net Profit / Loss",
      values: netProfitValues,
      isSummary: true,
    });

    misData = {
      title: "STATEMENT OF PROFIT AND LOSS",
      period: `${monthRange[0]} to ${monthRange[monthRange.length - 1]}`,
      headers: ["Particulars", ...monthRange],
      sections: [
        { heading: "I. REVENUE", rows: revenueRows },
        { heading: "II. EXPENDITURE", rows: expenseRows },
        { heading: "III. PROFIT / LOSS FOR THE PERIOD", rows: profitRows },
      ],
    };
  }

  // BALANCE SHEET

  // Helper functions

  const getPLNetProfit = (report) => {
    // Reads Net Profit from P&L
    // Used to fix Current Year Earnings (CYE)

    const pl = report?.profit_and_loss || [];
    const row = pl.find((x) => x.name.toLowerCase().includes("net profit"));
    return Number(row?.total) || 0;
  };

  // This section builts current year earnings row for months
  // Use to get netprofit from P&L

  const buildCurrentYearEarnings = (monthlyReports) => ({
    name: "Current Year Earnings",
    values: monthlyReports.map((m) => getPLNetProfit(m.report)),
  });

  // sorts accounts in balance sheet
  // Assets are sorted in a specific order
  // Liabilities & equities are sorted in a specific order

  const sortBSAccounts = (sectionName, accounts) => {
    if (sectionName === "Assets") {
      const ORDER = [
        "fixed assets",
        "other assets",
        "current assets",
        "other current assets",
      ];

      return [...accounts].sort(
        (a, b) =>
          ORDER.findIndex((o) => (a.name || "").toLowerCase().includes(o)) -
          ORDER.findIndex((o) => (b.name || "").toLowerCase().includes(o))
      );
    }

    if (sectionName === "Liabilities & Equities") {
      return [...accounts].sort((a, b) => {
        if ((a.name || "").toLowerCase().includes("equities")) return -1;
        if ((b.name || "").toLowerCase().includes("equities")) return 1;
        return 0;
      });
      x;
    }

    return accounts;
  };

  // Add values month wise

  const sumRows = (rows) => {
    const sample = rows.find((r) => Array.isArray(r.values)); // This line tells that if no rows have values then it returns empty array
    if (!sample) return [];

    const sums = Array(sample.values.length).fill(0); // Each index represents one month

    rows.forEach((r) => {
      if (!Array.isArray(r.values)) return; // Skips row which has no values
      if (r.isGroup) return; // Skips group header
      if ((r.name || "").toLowerCase().startsWith("total ")) return; // Skips total row

      // For each month:
      //Convert value to number
      // Add to correct index
      // If value is invalid → add 0

      r.values.forEach((v, i) => {
        sums[i] += Number(v) || 0;
      });
    });

    return sums;
  };

  // It converts Zoho Balance Sheet section data (Assets or Liabilities & Equities) into flat, month-wise MIS rows, handling

  const buildBSRows = (sectionName, firstBS, monthlyReports) => {
    // Why first month?
    // Zoho BS structure is same for every month
    // First month defines layout

    const section = firstBS.find((x) => x.name === sectionName);
    if (!section) return [];

    // Extracts all accounts under this section
    // Sorts them using accounting rules

    const accounts = sortBSAccounts(
      sectionName,
      section.account_transactions || []
    );

    // Loop through each parent account
    // flatMap is used because:
    // Each parent may produce multiple rows
    // It flattens the final array

    return accounts.flatMap((parent) => {
      // Get child accounts
      // Each parent account may have:
      // No children (simple account)
      // Multiple children (group account)

      const children = parent.account_transactions || [];

      if (children.length === 0) {
        return [
          {
            name: parent.name,
            values: getMonthlyValues(monthlyReports, (r) => {
              const bs = r.balance_sheet || [];
              const sec = bs.find((x) => x.name === sectionName);
              const found = sec?.account_transactions?.find(
                (x) => x.name === parent.name
              );
              return Number(found?.total) || 0;
            }),
          },
        ];
      }

      // GROUPED ROWS (multiple children)

      const childRows = children
        .filter(
          (c) =>
            c.name && c.name.trim() !== "" && c.name.toLowerCase() !== "no data"
        )
        .map((child) => ({
          name: child.name,
          values: getMonthlyValues(monthlyReports, (r) => {
            const bs = r.balance_sheet || [];
            const sec = bs.find((x) => x.name === sectionName);
            const p = sec?.account_transactions?.find(
              (x) => x.name === parent.name
            );
            const c = p?.account_transactions?.find(
              (x) => x.name === child.name
            );
            return Number(c?.total) || 0;
          }),
        }));

      return [
        { name: parent.name, isGroup: true },
        ...childRows,
        {
          name: `Total ${parent.name}`,
          values: getMonthlyValues(monthlyReports, (r) => {
            const bs = r.balance_sheet || [];
            const sec = bs.find((x) => x.name === sectionName);
            const p = sec?.account_transactions?.find(
              (x) => x.name === parent.name
            );
            return Number(p?.total) || 0;
          }),
        },
      ];
    });
  };

  if (type === "bs") {
    const firstBS = monthlyReports[0]?.report?.balance_sheet || [];

    let liabilityRows = buildBSRows(
      "Liabilities & Equities",
      firstBS,
      monthlyReports
    );

    let assetRows = buildBSRows("Assets", firstBS, monthlyReports);

    // Replace Zoho Current Year Earnings with P&L value

    const cyeRow = buildCurrentYearEarnings(monthlyReports);

    // Finding existing CYE now

    const cyeIndex = liabilityRows.findIndex((r) =>
      r.name.toLowerCase().includes("current year earnings")
    );

    // Replacing existing CYE with new one

    if (cyeIndex !== -1) liabilityRows[cyeIndex] = cyeRow;

    // TOTAL EQUITIES

    const eqStart = liabilityRows.findIndex(
      (r) => r.name.toLowerCase() === "equities"
    );
    const eqEnd = liabilityRows.findIndex((r) =>
      r.name.toLowerCase().includes("total equities")
    );

    // Summing up equities

    const eqSum = sumRows(liabilityRows.slice(eqStart + 1, eqEnd));
    if (eqEnd !== -1) liabilityRows[eqEnd].values = eqSum;

    // TOTAL LIABILITIES

    const liStart = liabilityRows.findIndex(
      (r) => r.name.toLowerCase() === "liabilities"
    );
    const liEnd = liabilityRows.findIndex((r) =>
      r.name.toLowerCase().includes("total liabilities")
    );

    // summing up liabilities

    const liSum = sumRows(liabilityRows.slice(liStart + 1, liEnd));
    if (liEnd !== -1) liabilityRows[liEnd].values = liSum;

    // TOTAL LIABILITIES & EQUITIES

    const tleSum = liSum.map((v, i) => v + (eqSum[i] || 0));
    const tleIndex = liabilityRows.findIndex((r) =>
      r.name.toLowerCase().includes("total liabilities & equities")
    );
    if (tleIndex !== -1) liabilityRows[tleIndex].values = tleSum;
    else
      liabilityRows.push({
        name: "Total Liabilities & Equities",
        values: tleSum,
      });

    // TOTAL ASSETS (no double counting)

    // const parentTotals = assetRows.filter(
    //   (r) =>
    //     r.name.toLowerCase().startsWith("total") &&
    //     r.name.toLowerCase() !== "total assets"
    // );

    const assetSum = sumRows(
      assetRows.filter(
        (r) => !r.isGroup && !r.name.toLowerCase().startsWith("total")
      )
    );

    const taIndex = assetRows.findIndex(
      (r) => r.name.toLowerCase() === "total assets"
    );

    if (taIndex !== -1) {
      assetRows[taIndex] = {
        ...assetRows[taIndex],
        values: assetSum,
        isTotal: true,
      };
    } else {
      assetRows.push({
        name: "Total Assets",
        values: assetSum,
        isTotal: true,
      });
    }

    // FINAL MIS OUTPUT
    misData = {
      title: "BALANCE SHEET",
      period: `${monthRange[0]} to ${monthRange[monthRange.length - 1]}`,
      headers: ["Particulars", ...monthRange],
      sections: [
        { heading: "I. EQUITY AND LIABILITIES", rows: liabilityRows },
        { heading: "II. ASSETS", rows: assetRows },
      ],
    };
  }

  // GENERAL LEDGER

  if (type === "gl") {
    // actual Zoho response

    const firstGL = monthlyReports[0]?.report?.generalledger || [];

    // Helper to extract debit, credit, and balance for each account

    const getAccountMonthlyValues = (accountName, field) => {
      return monthRange.map((m, i) => {
        const foundMonth =
          monthlyReports[i] || monthlyReports.find((mr) => mr.month === m);
        if (!foundMonth) return 0;

        const gl = foundMonth.report?.generalledger || [];
        const account = gl.find((a) => a.name === accountName);
        if (!account) return 0;

        // Convert string like "12,345.67" → number

        const safeParse = (val) => {
          if (!val) return 0;
          if (typeof val === "number") return val;
          return parseFloat(val.toString().replace(/,/g, "")) || 0;
        };

        return safeParse(account[field]);
      });
    };

    // Collect all unique account names across all months

    const allAccounts = new Set();
    for (const monthData of monthlyReports) {
      const gl = monthData.report?.generalledger || [];
      gl.forEach((acc) => allAccounts.add(acc.name));
    }

    const glRows = Array.from(allAccounts).map((accName) => ({
      name: accName,
      debitValues: getAccountMonthlyValues(accName, "debit_total"),
      creditValues: getAccountMonthlyValues(accName, "credit_total"),
      balanceValues: getAccountMonthlyValues(accName, "balance"),
    }));

    // Dynamic headers (Debit, Credit, Balance per month)

    const headers = ["Account"];
    monthRange.forEach((m) => {
      headers.push(`${m} - Debit`, `${m} - Credit`, `${m} - Balance`);
    });

    misData = {
      title: "GENERAL LEDGER",
      period: `${monthRange[0]} to ${monthRange[monthRange.length - 1]}`,
      headers,
      sections: [
        {
          heading: "LEDGER SUMMARY",
          rows: glRows.map((row) => ({
            name: row.name,
            values: monthRange.flatMap((_, idx) => [
              row.debitValues[idx],
              row.creditValues[idx],
              row.balanceValues[idx],
            ]),
          })),
        },
      ],
    };
  }

  // Accounts payable

  if (type === "bills") {
    const monthlyReports = data?.monthly_reports || [];
    const sections = [];

    for (const monthData of monthlyReports) {
      const bills = monthData.report?.bills || [];
      if (bills.length === 0) continue;

      // Sort bills by date inside the month

      bills.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Map to formatted rows

      const rows = bills.map((bill) => ({
        // first column

        name: bill.date || "",

        // rest of the columns in order of your headers (excluding first)

        values: [
          bill.bill_number || "",
          bill.reference_number || "-",
          bill.vendor_name || "",
          bill.status || "",
          bill.due_date || "",
          bill.total || 0,
          bill.balance || 0,
        ],
      }));

      // Add month section

      sections.push({
        heading: monthData.month,
        rows,
      });
    }

    misData = {
      title: "BILLS SUMMARY",
      period: `${monthRange[0]} to ${monthRange[monthRange.length - 1]}`,
      headers: [
        "Date",
        "Bill No",
        "Reference No",
        "Vendor",
        "Status",
        "Due Date",
        "Amount",
        "Balance Due",
      ],
      sections,
    };
  }

  // Accounts receivable (Invoices)

  if (type === "invoices") {
    const monthlyReports = data?.monthly_reports || [];
    const sections = [];

    for (const monthData of monthlyReports) {
      const invoices = monthData.report?.invoices || [];
      if (invoices.length === 0) continue;

      // Sort invoices by date

      invoices.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Map to formatted rows

      const rows = invoices.map((inv) => ({
        // first column

        name: inv.date || "",

        // remaining columns (similar to bills but for customers)

        values: [
          inv.invoice_number || "",
          inv.reference_number || "-",
          inv.customer_name || "",
          inv.status || "",
          inv.due_date || "",
          inv.total || 0,
          inv.balance || 0,
        ],
      }));

      // Add each month section

      sections.push({
        heading: monthData.month,
        rows,
      });
    }

    misData = {
      title: "INVOICES SUMMARY",
      period: `${monthRange[0]} to ${monthRange[monthRange.length - 1]}`,
      headers: [
        "Date",
        "Invoice No",
        "Order/Ref No",
        "Customer Name",
        "Status",
        "Due Date",
        "Amount",
        "Balance Due",
      ],
      sections,
    };
  }

  return misData;
};
