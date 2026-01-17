import XLSX from 'xlsx';
import fs from 'fs';

/**
 * Merge multiple Excel files into one Excel file
 * Schema is fixed and enforced
 */

// 🔒 FIXED COLUMN ORDER (DO NOT CHANGE)
const COLUMNS = [
  'question_id',
  'question',
  'domain',
  'difficulty_level',

  'model_1_quality_score',
  'model_2_quality_score',
  'model_3_quality_score',
  'model_4_quality_score',
  'model_5_quality_score',
  'model_6_quality_score',

  'model_1_latency',
  'model_2_latency',
  'model_3_latency',
  'model_4_latency',
  'model_5_latency',
  'model_6_latency',

  'model_1_cost',
  'model_2_cost',
  'model_3_cost',
  'model_4_cost',
  'model_5_cost',
  'model_6_cost'
];

function mergeExcelFiles(inputFiles, outputFile) {
  let combinedData = [];

  inputFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found, skipping: ${filePath}`);
      return;
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false
    });

    if (!rows.length) return;

    // Normalize rows strictly to schema
    const normalizedRows = rows.map(row => {
      const normalized = {};
      COLUMNS.forEach(col => {
        normalized[col] = row[col] ?? '';
      });
      return normalized;
    });

    combinedData.push(...normalizedRows);

    console.log(`✅ Loaded ${normalizedRows.length} rows from ${filePath}`);
  });

  if (!combinedData.length) {
    console.error('❌ No data found to merge');
    return;
  }

  // Create worksheet with fixed headers
  const worksheet = XLSX.utils.json_to_sheet(combinedData, {
    header: COLUMNS
  });

  worksheet['!cols'] = COLUMNS.map(() => ({ wch: 22 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Combined Logs');

  XLSX.writeFile(workbook, outputFile);

  console.log(`📄 Combined Excel created: ${outputFile}`);
  console.log(`📊 Total rows: ${combinedData.length}`);
}

// -------- USAGE --------

const inputExcelFiles = [
  'output_reasoning_log.xlsx',
  'output_advice_log.xlsx',
  'output_content_log.xlsx',
  'output_general_q&a_log.xlsx',
  'output_summarization_log.xlsx',
  'output_coding_debugging_log.xlsx'
];

const outputExcelFile = 'combined_all_domains.xlsx';

mergeExcelFiles(inputExcelFiles, outputExcelFile);
