import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArrowUpDown, ArrowUpNarrowWide, ArrowDownWideNarrow, Trash2, Layers } from 'lucide-react';
import { SortNodeData } from '../../types/pipeline';

export interface SortNodeProps extends NodeProps {
  data: SortNodeData & {
    onUpdateData?: (nodeId: string, newData: Partial<SortNodeData>) => void;
    onDeleteNode?: (nodeId: string) => void;
  };
}

export const SortNode: React.FC<SortNodeProps> = ({ id, data, selected }) => {
  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onUpdateData?.(id, { column: e.target.value });
  };

  const handleDirectionChange = (direction: 'asc' | 'desc') => {
    data.onUpdateData?.(id, { direction });
  };

  const columns = data.columns || [];
  const hasIncoming = columns.length > 0;
  const isAsc = data.direction === 'asc';

  return (
    <div
      className={`rounded-lg bg-[#19191a] border min-w-[260px] max-w-[290px] shadow-lg transition-all duration-150 ${
        selected ? 'border-[#60d4ea] ring-2 ring-[#60d4ea]/30 shadow-[#60d4ea]/10' : 'border-[#373739]'
      }`}
    >
      {/* Input Handle on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="custom-handle"
        style={{ left: -6 }}
      />

      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#373739] bg-[#1d1d1f] rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-[#60d4ea]/10 text-[#60d4ea]">
            <ArrowUpDown size={16} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#60d4ea] block leading-none">
              Ordenar
            </span>
            <span className="text-xs font-medium text-white truncate max-w-[130px] block">
              Organizar
            </span>
          </div>
        </div>

        {data.onDeleteNode && (
          <button
            onClick={() => data.onDeleteNode?.(id)}
            className="text-[#a0a0a0] hover:text-red-400 p-1 rounded hover:bg-[#252528] transition-colors"
            title="Remover bloco"
            aria-label="Remover bloco Organizar"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2.5">
        {!hasIncoming ? (
          <div className="py-3 px-2 rounded bg-[#252528]/50 border border-dashed border-[#373739] text-center">
            <Layers size={16} className="mx-auto text-[#a0a0a0] mb-1" />
            <p className="text-[11px] text-[#a0a0a0]">Conecte um bloco à esquerda para ordenar dados</p>
          </div>
        ) : (
          <>
            {/* Column select */}
            <div>
              <label className="text-[10px] font-medium text-[#a0a0a0] mb-1 block">
                Coluna Alvo:
              </label>
              <select
                value={data.column || ''}
                onChange={handleColumnChange}
                className="w-full text-xs bg-[#252528] border border-[#373739] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#60d4ea] transition-colors"
              >
                <option value="">Selecione a coluna...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Direction toggle buttons */}
            <div>
              <label className="text-[10px] font-medium text-[#a0a0a0] mb-1 block">
                Sentido da Ordenação:
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#252528] p-1 rounded border border-[#373739]">
                <button
                  type="button"
                  onClick={() => handleDirectionChange('asc')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                    isAsc
                      ? 'bg-[#60d4ea] text-[#020202] font-semibold shadow-sm'
                      : 'text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  <ArrowUpNarrowWide size={12} />
                  Menor &rarr; Maior
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectionChange('desc')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                    !isAsc
                      ? 'bg-[#60d4ea] text-[#020202] font-semibold shadow-sm'
                      : 'text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  <ArrowDownWideNarrow size={12} />
                  Maior &rarr; Menor
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-[11px] text-[#a0a0a0] pt-1.5 border-t border-[#373739]/60">
              <span className="text-[#60d4ea] truncate">
                {data.column
                  ? `Ordenado por ${data.column} (${isAsc ? 'Crescente' : 'Decrescente'})`
                  : 'Selecione uma coluna'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Output Handle on the right */}
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
