import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Filter, Trash2, SlidersHorizontal } from 'lucide-react';
import { FilterNodeData, FilterOperator } from '../../types/pipeline';

export interface FilterNodeProps extends NodeProps {
  data: FilterNodeData & {
    onUpdateData?: (nodeId: string, newData: Partial<FilterNodeData>) => void;
    onDeleteNode?: (nodeId: string) => void;
  };
}

export const FilterNode: React.FC<FilterNodeProps> = ({ id, data, selected }) => {
  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onUpdateData?.(id, { column: e.target.value });
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onUpdateData?.(id, { operator: e.target.value as FilterOperator });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.onUpdateData?.(id, { value: e.target.value });
  };

  const columns = data.columns || [];
  const hasIncoming = columns.length > 0;

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
            <Filter size={16} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#60d4ea] block leading-none">
              Filtro
            </span>
            <span className="text-xs font-medium text-white truncate max-w-[130px] block">
              Peneira
            </span>
          </div>
        </div>

        {data.onDeleteNode && (
          <button
            onClick={() => data.onDeleteNode?.(id)}
            className="text-[#a0a0a0] hover:text-red-400 p-1 rounded hover:bg-[#252528] transition-colors"
            title="Remover bloco"
            aria-label="Remover bloco Peneira"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2.5">
        {!hasIncoming ? (
          <div className="py-3 px-2 rounded bg-[#252528]/50 border border-dashed border-[#373739] text-center">
            <SlidersHorizontal size={16} className="mx-auto text-[#a0a0a0] mb-1" />
            <p className="text-[11px] text-[#a0a0a0]">Conecte um bloco à esquerda para filtrar os dados</p>
          </div>
        ) : (
          <>
            {/* Column select */}
            <div>
              <label className="text-[10px] font-medium text-[#a0a0a0] mb-1 block">
                Coluna:
              </label>
              <select
                value={data.column || ''}
                onChange={handleColumnChange}
                className="w-full text-xs bg-[#252528] border border-[#373739] rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-[#60d4ea] transition-colors"
              >
                <option value="">Selecione uma coluna...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator & Value row */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[10px] font-medium text-[#a0a0a0] mb-1 block">
                  Regra:
                </label>
                <select
                  value={data.operator || 'gt'}
                  onChange={handleOperatorChange}
                  className="w-full text-[11px] bg-[#252528] border border-[#373739] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#60d4ea] transition-colors"
                >
                  <option value="gt">Maior que (&gt;)</option>
                  <option value="lt">Menor que (&lt;)</option>
                  <option value="eq">Igual a (=)</option>
                  <option value="contains">Contém</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#a0a0a0] mb-1 block">
                  Valor:
                </label>
                <input
                  type="text"
                  placeholder="Ex: 500"
                  value={data.value ?? ''}
                  onChange={handleValueChange}
                  className="w-full text-xs bg-[#252528] border border-[#373739] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#60d4ea] transition-colors placeholder:text-[#a0a0a0]/50"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-[11px] text-[#a0a0a0] pt-1.5 border-t border-[#373739]/60">
              <span className="text-[#60d4ea]">
                {data.outputRowCount !== undefined && data.inputRowCount !== undefined
                  ? `Restaram ${data.outputRowCount} de ${data.inputRowCount} linhas`
                  : 'Pronto para filtrar'}
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
