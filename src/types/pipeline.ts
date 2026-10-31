export type DataRow = Record<string, string | number | boolean | null>;

export type FilterOperator = 'gt' | 'lt' | 'eq' | 'contains';

export interface InputNodeData {
  [key: string]: unknown;
  label: string;
  filename?: string;
  rawData: DataRow[];
  columns: string[];
  rowCount: number;
}

export interface FilterNodeData {
  [key: string]: unknown;
  label: string;
  column: string;
  operator: FilterOperator;
  value: string;
  inputRowCount?: number;
  outputRowCount?: number;
  columns?: string[];
}

export interface SortNodeData {
  [key: string]: unknown;
  label: string;
  column: string;
  direction: 'asc' | 'desc';
  columns?: string[];
  rowCount?: number;
}

export interface OutputNodeData {
  [key: string]: unknown;
  label: string;
  viewMode: 'table' | 'chart';
  xAxis: string;
  yAxis: string;
  columns?: string[];
  rowCount?: number;
}

export type PipelineNodeType = 'inputNode' | 'filterNode' | 'sortNode' | 'outputNode';
