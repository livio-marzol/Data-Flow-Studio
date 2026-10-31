import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Search,
  Maximize2,
  Database,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { DataRow } from '../types/pipeline';

interface ResultPanelProps {
  data: DataRow[];
  columns: string[];
  activeNodeTitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  initialTab?: 'table' | 'chart';
  defaultXAxis?: string;
  defaultYAxis?: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  data,
  columns,
  activeNodeTitle = 'Pipeline',
  isOpen,
  onToggle,
  initialTab = 'table',
  defaultXAxis,
  defaultYAxis
}) => {
  const [userTab, setUserTab] = useState<'table' | 'chart' | null>(null);
  const activeTab = userTab || initialTab;
  const [searchTerm, setSearchTerm] = useState('');

  // Detect numeric columns for chart
  const numericColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sample = data[0];
    return columns.filter((col) => typeof sample[col] === 'number');
  }, [data, columns]);

  const [userX, setUserX] = useState<string | null>(null);
  const [userY, setUserY] = useState<string | null>(null);

  // Derive active X axis
  const activeX = useMemo(() => {
    if (userX && columns.includes(userX)) return userX;
    if (defaultXAxis && columns.includes(defaultXAxis)) return defaultXAxis;
    if (columns.length > 0) {
      const nonNum = columns.find((c) => !numericColumns.includes(c));
      return nonNum || columns[0];
    }
    return '';
  }, [userX, defaultXAxis, columns, numericColumns]);

  // Derive active Y axis
  const activeY = useMemo(() => {
    if (userY && columns.includes(userY)) return userY;
    if (defaultYAxis && columns.includes(defaultYAxis)) return defaultYAxis;
    if (numericColumns.length > 0) return numericColumns[0];
    if (columns.length > 1) return columns[1];
    return columns[0] || '';
  }, [userY, defaultYAxis, columns, numericColumns]);

  // Filtered rows for table search
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // Chart data formatting (limit to top 15 for clean visualization)
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !activeX || !activeY) return [];
    return data.slice(0, 15).map((row) => ({
      name: String(row[activeX] ?? 'N/A'),
      value: Number(row[activeY]) || 0
    }));
  }, [data, activeX, activeY]);

  if (!isOpen) {
    return (
      <div className="absolute right-0 top-14 bottom-0 z-10 flex items-center">
        <button
          onClick={onToggle}
          className="bg-[#19191a] text-white border-l border-y border-[#373739] hover:border-[#60d4ea] hover:text-[#60d4ea] py-3 px-1.5 rounded-l-md shadow-lg transition-colors flex flex-col items-center gap-1 cursor-pointer"
          title="Abrir painel de resultados"
          aria-label="Abrir painel lateral de resultados"
        >
          <ChevronLeft size={16} />
          <span className="text-[10px] font-medium [writing-mode:vertical-rl] tracking-wider py-1">
            RESULTADOS
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside className="w-[360px] md:w-[380px] bg-[#19191a] border-l border-[#373739] flex flex-col shrink-0 z-10 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="p-3 border-b border-[#373739] flex items-center justify-between bg-[#19191a]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 rounded bg-[#60d4ea]/10 text-[#60d4ea]">
            <Database size={16} />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-semibold text-white truncate">
              {activeNodeTitle}
            </h3>
            <span className="text-[11px] text-[#a0a0a0]">
              {data.length} {data.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="text-[#a0a0a0] hover:text-white p-1 rounded hover:bg-[#252528] transition-colors cursor-pointer"
          title="Recolher painel"
          aria-label="Recolher painel lateral"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-2 gap-1.5 bg-[#141415] border-b border-[#373739]">
        <button
          type="button"
          onClick={() => setUserTab('table')}
          className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'table'
              ? 'bg-[#60d4ea] text-[#020202] font-semibold shadow-sm'
              : 'text-[#a0a0a0] hover:text-white hover:bg-[#252528]'
          }`}
        >
          <TableIcon size={14} />
          Tabela
        </button>

        <button
          type="button"
          onClick={() => setUserTab('chart')}
          className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'chart'
              ? 'bg-[#60d4ea] text-[#020202] font-semibold shadow-sm'
              : 'text-[#a0a0a0] hover:text-white hover:bg-[#252528]'
          }`}
        >
          <BarChart3 size={14} />
          Gráfico
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-3">
        {data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <AlertCircle size={28} className="text-[#a0a0a0]/60" />
            <p className="text-xs font-medium text-white">Nenhum dado para exibir</p>
            <p className="text-[11px] text-[#a0a0a0]">
              Conecte um bloco de dados ou verifique os filtros configurados.
            </p>
          </div>
        ) : activeTab === 'table' ? (
          <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#a0a0a0]"
              />
              <input
                type="text"
                placeholder="Buscar nesta tabela..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#252528] border border-[#373739] rounded pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-[#a0a0a0]/50 focus:outline-none focus:border-[#60d4ea] transition-colors"
              />
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto rounded border border-[#373739] bg-[#19191a]">
              <table className="w-full text-left text-xs text-white border-collapse">
                <thead className="bg-[#202023] sticky top-0 z-10 text-[11px] font-semibold text-[#a0a0a0] uppercase tracking-wider border-b border-[#373739]">
                  <tr>
                    <th className="py-2 px-2.5 w-10 text-center font-mono text-[10px] text-[#a0a0a0]/60">
                      #
                    </th>
                    {columns.map((col) => (
                      <th key={col} className="py-2 px-2.5 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#373739]/50">
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? 'bg-[#19191a] hover:bg-[#252528]/80 transition-colors'
                          : 'bg-[#1e1e21] hover:bg-[#252528]/80 transition-colors'
                      }
                    >
                      <td className="py-1.5 px-2.5 text-center font-mono text-[10px] text-[#a0a0a0]/60 select-none">
                        {idx + 1}
                      </td>
                      {columns.map((col) => {
                        const val = row[col];
                        const isNum = typeof val === 'number';
                        return (
                          <td
                            key={col}
                            className={`py-1.5 px-2.5 whitespace-nowrap ${
                              isNum ? 'text-right font-mono text-[#60d4ea]' : ''
                            }`}
                          >
                            {val === null || val === undefined ? (
                              <span className="text-[#a0a0a0]/40 italic">-</span>
                            ) : isNum ? (
                              val.toLocaleString('pt-BR')
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#a0a0a0] px-1">
              <span>Mostrando {filteredRows.length} de {data.length} linhas</span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[#60d4ea] hover:underline"
                >
                  Limpar busca
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Chart Tab */
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Axis Selector Controls */}
            <div className="grid grid-cols-2 gap-2 bg-[#252528] p-2 rounded border border-[#373739]">
              <div>
                <label className="text-[10px] text-[#a0a0a0] font-medium mb-1 block">
                  Eixo X (Categorias):
                </label>
                <select
                  value={activeX}
                  onChange={(e) => setUserX(e.target.value)}
                  className="w-full text-xs bg-[#19191a] border border-[#373739] rounded px-2 py-1 text-white focus:outline-none focus:border-[#60d4ea]"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#a0a0a0] font-medium mb-1 block">
                  Eixo Y (Métrica):
                </label>
                <select
                  value={activeY}
                  onChange={(e) => setUserY(e.target.value)}
                  className="w-full text-xs bg-[#19191a] border border-[#373739] rounded px-2 py-1 text-white focus:outline-none focus:border-[#60d4ea]"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col} {numericColumns.includes(col) ? '(Num)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-[310px] w-full rounded border border-[#373739] bg-[#141415] p-2 flex flex-col justify-center">
              {chartData.length === 0 ? (
                <p className="text-center text-xs text-[#a0a0a0]">
                  Selecione eixos válidos para exibir o gráfico.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={285}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 10, left: -5, bottom: 65 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#373739" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#a0a0a0"
                      tick={{ fill: '#a0a0a0', fontSize: 10 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={65}
                    />
                    <YAxis
                      stroke="#a0a0a0"
                      tick={{ fill: '#a0a0a0', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#19191a',
                        borderColor: '#60d4ea',
                        borderRadius: 6,
                        color: '#ffffff',
                        fontSize: 12
                      }}
                      itemStyle={{ color: '#60d4ea' }}
                      formatter={(val: any) => [
                        typeof val === 'number' ? val.toLocaleString('pt-BR') : val,
                        activeY
                      ]}
                      labelFormatter={(label) => `${activeX}: ${label}`}
                    />
                    <Bar
                      dataKey="value"
                      fill="#60d4ea"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <p className="text-[10px] text-[#a0a0a0] text-center">
              Exibindo os primeiros {chartData.length} itens ordenados
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
