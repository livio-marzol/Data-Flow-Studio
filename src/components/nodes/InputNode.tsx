import React, { useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FolderUp, Database, FileSpreadsheet, Trash2, CheckCircle2 } from 'lucide-react';
import { InputNodeData } from '../../types/pipeline';
import { parseCsvString, parseJsonString, getSampleSalesData } from '../../pipeline/engine';

export interface InputNodeProps extends NodeProps {
  data: InputNodeData & {
    onUpdateData?: (nodeId: string, newData: Partial<InputNodeData>) => void;
    onDeleteNode?: (nodeId: string) => void;
  };
}

export const InputNode: React.FC<InputNodeProps> = ({ id, data, selected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        let parsed: { data: any[]; columns: string[] };
        if (file.name.endsWith('.json')) {
          parsed = parseJsonString(text);
        } else {
          parsed = parseCsvString(text);
        }

        data.onUpdateData?.(id, {
          filename: file.name,
          rawData: parsed.data,
          columns: parsed.columns,
          rowCount: parsed.data.length,
          label: file.name
        });
      } catch (err) {
        console.error('Erro ao ler arquivo:', err);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleUseDemo = () => {
    const sample = getSampleSalesData();
    data.onUpdateData?.(id, {
      filename: 'vendas_demo.csv',
      rawData: sample.data,
      columns: sample.columns,
      rowCount: sample.data.length,
      label: 'Vendas Demo'
    });
  };

  return (
    <div
      className={`rounded-lg bg-[#19191a] border min-w-[260px] max-w-[290px] shadow-lg transition-all duration-150 ${
        selected ? 'border-[#60d4ea] ring-2 ring-[#60d4ea]/30 shadow-[#60d4ea]/10' : 'border-[#373739]'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#373739] bg-[#1d1d1f] rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-[#60d4ea]/10 text-[#60d4ea]">
            <FolderUp size={16} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#60d4ea] block leading-none">
              Entrada
            </span>
            <span className="text-xs font-medium text-white truncate max-w-[130px] block">
              {data.label || 'Subir Arquivo'}
            </span>
          </div>
        </div>

        {data.onDeleteNode && (
          <button
            onClick={() => data.onDeleteNode?.(id)}
            className="text-[#a0a0a0] hover:text-red-400 p-1 rounded hover:bg-[#252528] transition-colors"
            title="Remover bloco"
            aria-label="Remover bloco Subir Arquivo"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".csv,.json,text/csv,application/json"
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-[#252528] hover:bg-[#2e2e33] border border-[#373739] rounded transition-colors"
          >
            <FileSpreadsheet size={13} className="text-[#60d4ea]" />
            Upload CSV
          </button>

          <button
            type="button"
            onClick={handleUseDemo}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#60d4ea] bg-[#60d4ea]/10 hover:bg-[#60d4ea]/20 border border-[#60d4ea]/30 rounded transition-colors"
          >
            <Database size={13} />
            Dados Demo
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-[11px] text-[#a0a0a0] pt-1 border-t border-[#373739]/60">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className={data.rowCount ? 'text-[#60d4ea]' : 'text-[#373739]'} />
            {data.rowCount ? `${data.rowCount} linhas carregadas` : 'Nenhum dado'}
          </span>
          {data.columns && data.columns.length > 0 && (
            <span className="text-[10px] text-[#a0a0a0] bg-[#252528] px-1.5 py-0.5 rounded">
              {data.columns.length} cols
            </span>
          )}
        </div>

        {/* Column tags preview */}
        {data.columns && data.columns.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto pt-0.5">
            {data.columns.slice(0, 5).map((col) => (
              <span
                key={col}
                className="text-[9px] px-1.5 py-0.5 rounded bg-[#252528] text-[#a0a0a0] font-mono border border-[#373739]/50"
              >
                {col}
              </span>
            ))}
            {data.columns.length > 5 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#252528] text-[#60d4ea] font-mono">
                +{data.columns.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Single Output Handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="custom-handle"
        style={{ right: -6 }}
      />
    </div>
  );
};
