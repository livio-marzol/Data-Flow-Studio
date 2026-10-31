import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Eye, Table, BarChart2, Trash2, ArrowRightCircle } from 'lucide-react';
import { OutputNodeData } from '../../types/pipeline';

export interface OutputNodeProps extends NodeProps {
  data: OutputNodeData & {
    onUpdateData?: (nodeId: string, newData: Partial<OutputNodeData>) => void;
    onDeleteNode?: (nodeId: string) => void;
    onOpenPanel?: (nodeId: string) => void;
  };
}

export const OutputNode: React.FC<OutputNodeProps> = ({ id, data, selected }) => {
  const columns = data.columns || [];
  const hasIncoming = columns.length > 0;

  const handleModeChange = (viewMode: 'table' | 'chart') => {
    data.onUpdateData?.(id, { viewMode });
  };

  const handleXAxisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onUpdateData?.(id, { xAxis: e.target.value });
  };

  const handleYAxisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onUpdateData?.(id, { yAxis: e.target.value });
  };

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
            <Eye size={16} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[#60d4ea] block leading-none">
              Saída
            </span>
            <span className="text-xs font-medium text-white truncate max-w-[130px] block">
              Visualizar
            </span>
          </div>
        </div>

        {data.onDeleteNode && (
          <button
            onClick={() => data.onDeleteNode?.(id)}
            className="text-[#a0a0a0] hover:text-red-400 p-1 rounded hover:bg-[#252528] transition-colors"
            title="Remover bloco"
            aria-label="Remover bloco Visualizar"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Node Body */}
      <div className="p-3 space-y-2.5">
        {!hasIncoming ? (
          <div className="py-3 px-2 rounded bg-[#252528]/50 border border-dashed border-[#373739] text-center">
            <BarChart2 size={16} className="mx-auto text-[#a0a0a0] mb-1" />
            <p className="text-[11px] text-[#a0a0a0]">Conecte dados para visualizar tabela ou gráfico</p>
          </div>
        ) : (
          <>
            {/* View Mode Toggle */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#252528] p-1 rounded border border-[#373739]">
              <button
                type="button"
                onClick={() => handleModeChange('table')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  data.viewMode === 'table'
                    ? 'bg-[#60d4ea] text-[#020202] font-semibold shadow-sm'
                    : 'text-[#a0a0a0] hover:text-white'
                }`}
              >
                <Table size={12} />
                Tabela
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('chart')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  data.viewMode === 'chart'
                    ? 'bg-[#60d4ea] text-[#020202] font-semibold shadow-sm'
                    : 'text-[#a0a0a0] hover:text-white'
                }`}
              >
                <BarChart2 size={12} />
                Gráfico
              </button>
            </div>

            {/* If chart: X and Y axis dropdowns */}
            {data.viewMode === 'chart' && (
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[10px] font-medium text-[#a0a0a0] mb-1 block">
                    Eixo X:
                  </label>
                  <select
                    value={data.xAxis || ''}
                    onChange={handleXAxisChange}
                    className="w-full text-[11px] bg-[#252528] border border-[#373739] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#60d4ea] transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-[#a0a0a0] mb-1 block">
                    Eixo Y (Valor):
                  </label>
                  <select
                    value={data.yAxis || ''}
                    onChange={handleYAxisChange}
                    className="w-full text-[11px] bg-[#252528] border border-[#373739] rounded px-2 py-1.5 text-white focus:outline-none focus:border-[#60d4ea] transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Action button: Abrir no Painel Lateral */}
            <button
              type="button"
              onClick={() => data.onOpenPanel?.(id)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#252528] hover:bg-[#2e2e33] border border-[#373739] text-xs font-medium text-white hover:text-[#60d4ea] hover:border-[#60d4ea]/50 transition-colors"
            >
              <ArrowRightCircle size={13} className="text-[#60d4ea]" />
              Abrir no Painel Lateral
            </button>

            {/* Status */}
            <div className="flex items-center justify-between text-[11px] text-[#a0a0a0] pt-1 border-t border-[#373739]/60">
              <span className="text-[#60d4ea]">
                {data.rowCount !== undefined ? `${data.rowCount} linhas prontas` : 'Aguardando dados'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
