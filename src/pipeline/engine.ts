import Papa from 'papaparse';
import { DataRow, FilterOperator } from '../types/pipeline';

export const SAMPLE_SALES_DATA: DataRow[] = [
  { id: 1, data: '2025-01-05', produto: 'Notebook Pro 16', categoria: 'Eletrônicos', quantidade: 2, valor: 8500.0, vendedor: 'Carlos Silva', cidade: 'São Paulo' },
  { id: 2, data: '2025-01-07', produto: 'Teclado Mecânico RGB', categoria: 'Periféricos', quantidade: 5, valor: 350.0, vendedor: 'Mariana Costa', cidade: 'Rio de Janeiro' },
  { id: 3, data: '2025-01-10', produto: 'Monitor Ultrawide 34', categoria: 'Eletrônicos', quantidade: 3, valor: 2800.0, vendedor: 'Rafael Lima', cidade: 'Belo Horizonte' },
  { id: 4, data: '2025-01-12', produto: 'Mouse Sem Fio Ergonômico', categoria: 'Periféricos', quantidade: 12, valor: 180.0, vendedor: 'Ana Paula', cidade: 'Curitiba' },
  { id: 5, data: '2025-01-15', produto: 'Cadeira Gamer Pro', categoria: 'Móveis', quantidade: 4, valor: 1250.0, vendedor: 'Carlos Silva', cidade: 'São Paulo' },
  { id: 6, data: '2025-01-18', produto: 'Headset Noise Cancelling', categoria: 'Áudio', quantidade: 8, valor: 650.0, vendedor: 'Juliana Rocha', cidade: 'Porto Alegre' },
  { id: 7, data: '2025-01-20', produto: 'Mesa Elétrica Regulável', categoria: 'Móveis', quantidade: 2, valor: 2400.0, vendedor: 'Mariana Costa', cidade: 'Rio de Janeiro' },
  { id: 8, data: '2025-01-22', produto: 'Smartphone 5G 256GB', categoria: 'Eletrônicos', quantidade: 6, valor: 3900.0, vendedor: 'Rafael Lima', cidade: 'Belo Horizonte' },
  { id: 9, data: '2025-01-25', produto: 'Microfone Condensador USB', categoria: 'Áudio', quantidade: 7, valor: 420.0, vendedor: 'Ana Paula', cidade: 'Curitiba' },
  { id: 10, data: '2025-01-28', produto: 'Webcam 4K Ultra', categoria: 'Periféricos', quantidade: 9, valor: 580.0, vendedor: 'Juliana Rocha', cidade: 'Porto Alegre' },
  { id: 11, data: '2025-02-02', produto: 'Tablet 11 Pol 128GB', categoria: 'Eletrônicos', quantidade: 4, valor: 2100.0, vendedor: 'Carlos Silva', cidade: 'São Paulo' },
  { id: 12, data: '2025-02-04', produto: 'Caixa de Som Bluetooth', categoria: 'Áudio', quantidade: 15, valor: 290.0, vendedor: 'Mariana Costa', cidade: 'Rio de Janeiro' },
  { id: 13, data: '2025-02-08', produto: 'Hub USB-C 8 em 1', categoria: 'Acessórios', quantidade: 20, valor: 145.0, vendedor: 'Rafael Lima', cidade: 'Belo Horizonte' },
  { id: 14, data: '2025-02-12', produto: 'Suporte Articulado Monitor', categoria: 'Acessórios', quantidade: 11, valor: 195.0, vendedor: 'Ana Paula', cidade: 'Curitiba' },
  { id: 15, data: '2025-02-15', produto: 'Estante Modular Escritório', categoria: 'Móveis', quantidade: 3, valor: 890.0, vendedor: 'Juliana Rocha', cidade: 'Porto Alegre' },
  { id: 16, data: '2025-02-18', produto: 'Projetor Full HD Smart', categoria: 'Eletrônicos', quantidade: 2, valor: 3100.0, vendedor: 'Carlos Silva', cidade: 'São Paulo' },
  { id: 17, data: '2025-02-22', produto: 'Carregador Indução Qi', categoria: 'Acessórios', quantidade: 18, valor: 110.0, vendedor: 'Mariana Costa', cidade: 'Rio de Janeiro' },
  { id: 18, data: '2025-02-25', produto: 'Soundbar 2.1 Canais', categoria: 'Áudio', quantidade: 5, valor: 780.0, vendedor: 'Rafael Lima', cidade: 'Belo Horizonte' },
  { id: 19, data: '2025-03-01', produto: 'Mochila Impermeável Tech', categoria: 'Acessórios', quantidade: 14, valor: 220.0, vendedor: 'Ana Paula', cidade: 'Curitiba' },
  { id: 20, data: '2025-03-05', produto: 'Placa de Captura 4K', categoria: 'Periféricos', quantidade: 4, valor: 950.0, vendedor: 'Juliana Rocha', cidade: 'Porto Alegre' },
  { id: 21, data: '2025-03-08', produto: 'iPad Air 64GB', categoria: 'Eletrônicos', quantidade: 3, valor: 4500.0, vendedor: 'Carlos Silva', cidade: 'São Paulo' },
  { id: 22, data: '2025-03-12', produto: 'Fones TWS com ANC', categoria: 'Áudio', quantidade: 16, valor: 380.0, vendedor: 'Mariana Costa', cidade: 'Rio de Janeiro' },
  { id: 23, data: '2025-03-15', produto: 'Luminária de Mesa LED', categoria: 'Móveis', quantidade: 10, valor: 160.0, vendedor: 'Rafael Lima', cidade: 'Belo Horizonte' },
  { id: 24, data: '2025-03-18', produto: 'Organizador de Cabos', categoria: 'Acessórios', quantidade: 25, valor: 45.0, vendedor: 'Ana Paula', cidade: 'Curitiba' },
  { id: 25, data: '2025-03-22', produto: 'SSD Externo 1TB NVMe', categoria: 'Periféricos', quantidade: 8, valor: 620.0, vendedor: 'Juliana Rocha', cidade: 'Porto Alegre' }
];

export function getSampleSalesData(): { data: DataRow[]; columns: string[] } {
  const data = JSON.parse(JSON.stringify(SAMPLE_SALES_DATA));
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  return { data, columns };
}

export function parseCsvString(csvText: string): { data: DataRow[]; columns: string[] } {
  const result = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  const rawRows = (result.data as Record<string, unknown>[]) || [];
  const validRows: DataRow[] = [];
  const colSet = new Set<string>();

  for (const row of rawRows) {
    if (!row || typeof row !== 'object') continue;
    const cleanRow: DataRow = {};
    for (const [key, val] of Object.entries(row)) {
      if (!key) continue;
      colSet.add(key);
      if (val === null || val === undefined || val === '') {
        cleanRow[key] = null;
      } else if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'string') {
        cleanRow[key] = val;
      } else {
        cleanRow[key] = String(val);
      }
    }
    validRows.push(cleanRow);
  }

  const columns = Array.from(colSet);
  return { data: validRows, columns };
}

export function parseJsonString(jsonText: string): { data: DataRow[]; columns: string[] } {
  try {
    const parsed = JSON.parse(jsonText);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const validRows: DataRow[] = [];
    const colSet = new Set<string>();

    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const cleanRow: DataRow = {};
      for (const [key, val] of Object.entries(row)) {
        colSet.add(key);
        if (val === null || val === undefined) {
          cleanRow[key] = null;
        } else if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'string') {
          cleanRow[key] = val;
        } else {
          cleanRow[key] = JSON.stringify(val);
        }
      }
      validRows.push(cleanRow);
    }
    return { data: validRows, columns: Array.from(colSet) };
  } catch (err) {
    throw new Error('Formato JSON inválido: ' + (err instanceof Error ? err.message : String(err)));
  }
}

export function filterRows(
  rows: DataRow[],
  column: string,
  operator: FilterOperator,
  filterValue: string
): DataRow[] {
  if (!rows || rows.length === 0) return [];
  if (!column || filterValue === undefined || filterValue === null || filterValue === '') {
    return rows;
  }

  const trimmedValue = String(filterValue).trim();
  const numFilter = Number(trimmedValue);
  const isFilterNumeric = !isNaN(numFilter) && trimmedValue !== '';

  return rows.filter((row) => {
    const rawVal = row[column];
    if (rawVal === null || rawVal === undefined) return false;

    const rowValStr = String(rawVal).toLowerCase();
    const targetStr = trimmedValue.toLowerCase();

    switch (operator) {
      case 'contains':
        return rowValStr.includes(targetStr);

      case 'eq':
        if (typeof rawVal === 'number' && isFilterNumeric) {
          return rawVal === numFilter;
        }
        return rowValStr === targetStr;

      case 'gt':
        if (typeof rawVal === 'number' && isFilterNumeric) {
          return rawVal > numFilter;
        }
        return rowValStr > targetStr;

      case 'lt':
        if (typeof rawVal === 'number' && isFilterNumeric) {
          return rawVal < numFilter;
        }
        return rowValStr < targetStr;

      default:
        return true;
    }
  });
}

export function sortRows(
  rows: DataRow[],
  column: string,
  direction: 'asc' | 'desc'
): DataRow[] {
  if (!rows || rows.length <= 1 || !column) return rows;

  return [...rows].sort((a, b) => {
    const valA = a[column];
    const valB = b[column];

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    let comparison = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB;
    } else {
      comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

export function checkHasCycle(
  sourceId: string,
  targetId: string,
  edges: { source: string; target: string }[]
): boolean {
  if (sourceId === targetId) return true;

  // Check if target can reach source (meaning adding source -> target would create a cycle)
  const adjList = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjList.has(edge.source)) {
      adjList.set(edge.source, []);
    }
    adjList.get(edge.source)!.push(edge.target);
  }

  // BFS from targetId to see if we can reach sourceId
  const visited = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceId) return true;
    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = adjList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  return false;
}

export function convertToCsvBlob(data: DataRow[]): Blob {
  if (!data || data.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8;' });
  }
  const csv = Papa.unparse(data);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export function triggerDownload(blob: Blob, filename = 'resultado_pipeline.csv') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
