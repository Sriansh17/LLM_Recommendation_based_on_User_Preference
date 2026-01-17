// jsonl-to-excel.js
import { count } from 'console';
import fs from 'fs';
import XLSX from 'xlsx';

/**
 * Clean text for Excel:
 * - removes markdown
 * - removes code blocks
 * - removes emojis & control chars
 * - normalizes whitespace
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`+/g, '')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize domain:
 * - Combine Aptitude + Reasoning into "Reasoning"
 */
function normalizeDomain(domain) {
  if (!domain) return '';
  const d = domain.toLowerCase();
  if (d === 'aptitude' || d === 'reasoning') {
    return 'Reasoning';
  }
  return domain;
}

function convertJsonlToExcel(inputFile, outputFile) {
  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const lines = fileContent.trim().split('\n');

  // Parse JSONL safely
  const data = lines
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        console.error('❌ JSON parse error, skipping line');
        return null;
      }
    })
    .filter(Boolean);

  // Map JSON → flat Excel rows + filtering
  const formattedData = data
    .map(item => ({
      question_id: item.metadata?.question_id ?? '',
      domain: normalizeDomain(item.metadata?.domain),
      difficulty_level: item.metadata?.['difficulty-level'] || '',
      question: cleanText(
        item.request?.messages?.find(m => m.role === 'user')?.content
      ),
      model_response: cleanText(
        item.response?.choices?.[0]?.message?.content
      ),
      ai_model: item.ai_model || item.response?.model || '',
      response_time: item.response_time || item.responseTime || '',
      cost: item.cost || ''
    }))
    // ❌ Remove records with blank / missing question_id
    .filter(row => row.question_id !== '' && row.question_id !== null);

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 },  // question_id
    { wch: 22 },  // domain
    { wch: 18 },  // difficulty_level
    { wch: 60 },  // question
    { wch: 100 }, // model_response
    { wch: 26 },  // ai_model
    { wch: 16 },  // response_time
    { wch: 12 }   // cost
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Benchmark Results');

  // Write Excel file
  XLSX.writeFile(workbook, outputFile);

  console.log(`✅ Converted & cleaned ${formattedData.length} records`);
  console.log(`📄 Output file: ${outputFile}`);
  const domainCounts = {};
formattedData.forEach(row => {
  domainCounts[row.domain] = (domainCounts[row.domain] || 0) + 1;
});

console.log('Domain distribution:', domainCounts);

}

// -------- USAGE --------
const inputFile = 'logs.jsonl';
const outputFile = 'output.xlsx';

convertJsonlToExcel(inputFile, outputFile);
