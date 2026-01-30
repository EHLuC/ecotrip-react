import { useState, useEffect } from 'react';
import { cn } from './utils/cn';

// Eu defino aqui os fatores de emissão constantes para usar nos cálculos.
// Organizei em um objeto para facilitar o acesso pelas chaves (ex: 'carro', 'moto').
const EMISSION_FACTORS: Record<string, { factor: number; icon: string; label: string; color: string }> = {
  carro: { factor: 0.12, icon: '🚗', label: 'Carro', color: 'from-red-400 to-red-600' },
  moto: { factor: 0.08, icon: '🏍️', label: 'Moto', color: 'from-orange-400 to-orange-600' },
  onibus: { factor: 0.05, icon: '🚌', label: 'Ônibus', color: 'from-yellow-400 to-yellow-600' },
  aviao: { factor: 0.25, icon: '✈️', label: 'Avião', color: 'from-purple-400 to-purple-600' },
  trem: { factor: 0.04, icon: '🚆', label: 'Trem', color: 'from-green-400 to-green-600' },
  bicicleta: { factor: 0, icon: '🚴', label: 'Bicicleta', color: 'from-emerald-400 to-emerald-600' },
  pe: { factor: 0, icon: '🚶', label: 'A pé', color: 'from-teal-400 to-teal-600' },
};

// Eu crio uma interface TypeScript para garantir que meu histórico tenha sempre esse formato.
interface HistoryItem {
  id: number;
  distancia: number;
  transporte: string;
  pegada: number;
  data: string;
}

// Lista de dicas genéricas que eu uso caso a "IA" não tenha uma regra específica.
const DICAS_ECOLOGICAS = [
  "🌳 Plante uma árvore para compensar suas emissões!",
  "🚲 Considere usar bicicleta para trajetos curtos.",
  "🚌 O transporte público reduz a pegada de carbono em até 75%.",
  "🌿 Compartilhe caronas para dividir as emissões.",
  "⚡ Veículos elétricos emitem 50% menos CO2.",
  "🚆 Trens são os transportes motorizados mais ecológicos.",
  "🌍 Cada pequena ação conta para o planeta!",
  "💚 Compense suas emissões apoiando projetos ambientais.",
];

export function App() {
  // Eu inicializo os estados da minha aplicação (variáveis que mudam na tela).
  const [distancia, setDistancia] = useState<string>(''); // Começa vazio
  const [transporte, setTransporte] = useState<string>('carro'); // Padrão é carro
  const [resultado, setResultado] = useState<{ pegada: number; dica: string; arvores: number } | null>(null);
  const [historico, setHistorico] = useState<HistoryItem[]>([]);
  const [showComparacao, setShowComparacao] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Eu uso o useEffect para carregar o histórico do LocalStorage assim que a página abre.
  useEffect(() => {
    const saved = localStorage.getItem('ecotrip-historico');
    if (saved) {
      setHistorico(JSON.parse(saved)); // Eu transformo a string salva de volta em objeto
    }
  }, []);

  // Esta é a função principal onde eu realizo o cálculo e gero a "IA".
  const calcular = () => {
    const dist = parseFloat(distancia);
    // Eu verifico se a distância é válida antes de continuar.
    if (!dist || dist <= 0) return;

    setIsCalculating(true); // Eu ativo o estado de carregamento para mostrar o spinner
    
    // Eu simulo um pequeno atraso (800ms) para dar a sensação de processamento da IA.
    setTimeout(() => {
      const fator = EMISSION_FACTORS[transporte]?.factor || 0;
      const pegada = dist * fator;
      
      // Eu calculo quantas árvores são necessárias (aproximação: 1 árvore absorve ~22kg CO2/ano).
      const arvores = Math.ceil(pegada / 22);
      
      // --- Lógica da "IA" baseada em regras ---
      let dicaGerada = "";
      
      // Eu analiso o contexto (transporte + distância) para dar uma dica inteligente.
      if (transporte === 'aviao' && dist < 500) {
        dicaGerada = "✈️ IA Sugere: Para distâncias curtas (<500km), o avião é ineficiente. Considere ônibus ou trem.";
      } else if (transporte === 'carro' && dist < 5) {
        dicaGerada = "🚗 IA Sugere: Distâncias menores que 5km são ideais para bicicleta ou caminhada.";
      } else if (pegada > 100) {
        dicaGerada = "🌳 IA Sugere: Sua emissão é alta. Plante 5 árvores ou doe para ONGs de reflorestamento.";
      } else if (pegada === 0) {
        dicaGerada = "🌟 IA Analisa: Perfeito! Você atingiu a neutralidade de carbono nesta viagem.";
      } else {
        // Se nenhuma regra bater, eu pego uma dica aleatória da lista.
        dicaGerada = DICAS_ECOLOGICAS[Math.floor(Math.random() * DICAS_ECOLOGICAS.length)];
      }

      // Eu atualizo o estado com o resultado final.
      setResultado({ pegada: Math.round(pegada * 100) / 100, dica: dicaGerada, arvores });
      
      // Eu crio um novo objeto para o histórico.
      const novoItem: HistoryItem = {
        id: Date.now(), // Uso o timestamp como ID único
        distancia: dist,
        transporte,
        pegada: Math.round(pegada * 100) / 100,
        data: new Date().toLocaleDateString('pt-BR'),
      };
      
      // Eu mantenho apenas os últimos 10 itens no histórico para não poluir.
      const novoHistorico = [novoItem, ...historico].slice(0, 10);
      setHistorico(novoHistorico);
      // Eu salvo no navegador para não perder os dados se der refresh.
      localStorage.setItem('ecotrip-historico', JSON.stringify(novoHistorico));
      
      setIsCalculating(false); // Finalizo o carregamento.
    }, 800);
  };

  const limparHistorico = () => {
    setHistorico([]);
    localStorage.removeItem('ecotrip-historico'); // Eu removo os dados salvos do navegador.
  };

  // Eu crio uma função auxiliar para definir cores baseadas na gravidade da emissão.
  const getEmissionLevel = (pegada: number) => {
    if (pegada === 0) return { level: 'zero', label: 'Zero Emissão', color: 'text-emerald-500', bg: 'bg-emerald-100' };
    if (pegada < 20) return { level: 'baixa', label: 'Baixa', color: 'text-green-500', bg: 'bg-green-100' };
    if (pegada < 50) return { level: 'media', label: 'Média', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (pegada < 100) return { level: 'alta', label: 'Alta', color: 'text-orange-500', bg: 'bg-orange-100' };
    return { level: 'muito-alta', label: 'Muito Alta', color: 'text-red-500', bg: 'bg-red-100' };
  };

  // Eu preparo os dados para a tabela comparativa, ordenando do menos para o mais poluente.
  const comparacaoTransportes = () => {
    const dist = parseFloat(distancia) || 100; // Se não tiver distância, uso 100km como base
    return Object.entries(EMISSION_FACTORS)
      .map(([key, value]) => ({
        key,
        ...value,
        emissao: Math.round(dist * value.factor * 100) / 100,
      }))
      .sort((a, b) => a.emissao - b.emissao);
  };

  // Aqui começa a renderização visual (JSX).
  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      darkMode 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
        : "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50"
    )}>
      {/* ... (O restante do JSX segue a mesma estrutura anterior, mas a lógica principal está comentada acima) ... */}
      {/* Mantive o restante do HTML/JSX igual ao seu código original para economizar espaço aqui, 
          mas aplique as mudanças da função calcular() acima no seu arquivo! */}
      
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-md border-b",
        darkMode ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-emerald-100"
      )}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/50 animate-pulse">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <h1 className={cn(
                "text-xl font-bold",
                darkMode ? "text-white" : "text-slate-800"
              )}>
                EcoTrip Calculator
              </h1>
              <p className={cn(
                "text-xs",
                darkMode ? "text-slate-400" : "text-slate-500"
              )}>
                Simulador de Impacto Ambiental
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={cn(
              "p-3 rounded-xl transition-all duration-300",
              darkMode 
                ? "bg-slate-700 hover:bg-slate-600 text-yellow-400" 
                : "bg-emerald-100 hover:bg-emerald-200 text-slate-700"
            )}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calculadora Principal */}
          <div className={cn(
            "lg:col-span-2 rounded-3xl p-6 shadow-xl transition-all duration-300",
            darkMode ? "bg-slate-800 shadow-slate-900/50" : "bg-white shadow-emerald-100"
          )}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🧮</span>
              <h2 className={cn(
                "text-xl font-semibold",
                darkMode ? "text-white" : "text-slate-800"
              )}>
                Calcule sua Pegada de Carbono
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Input Distância */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  darkMode ? "text-slate-300" : "text-slate-600"
                )}>
                  📏 Distância da Viagem
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={distancia}
                    onChange={(e) => setDistancia(e.target.value)}
                    placeholder="Ex: 150"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4",
                      darkMode 
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20" 
                        : "bg-white border-emerald-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-100"
                    )}
                  />
                  <span className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 font-medium",
                    darkMode ? "text-slate-400" : "text-slate-500"
                  )}>
                    km
                  </span>
                </div>
              </div>

              {/* Select Transporte */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  darkMode ? "text-slate-300" : "text-slate-600"
                )}>
                  🚗 Meio de Transporte
                </label>
                <select
                  value={transporte}
                  onChange={(e) => setTransporte(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 cursor-pointer",
                    darkMode 
                      ? "bg-slate-700 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20" 
                      : "bg-white border-emerald-200 text-slate-800 focus:border-emerald-500 focus:ring-emerald-100"
                  )}
                >
                  {Object.entries(EMISSION_FACTORS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.icon} {value.label} ({value.factor} kg CO₂/km)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={calcular}
                disabled={!distancia || isCalculating}
                className={cn(
                  "flex-1 min-w-[200px] py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                  "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-200/50"
                )}
              >
                {isCalculating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Calculando...
                  </span>
                ) : (
                  '🌱 Calcular Impacto'
                )}
              </button>
              <button
                onClick={() => setShowComparacao(!showComparacao)}
                className={cn(
                  "py-4 px-6 rounded-xl font-semibold transition-all duration-300",
                  darkMode 
                    ? "bg-slate-700 text-white hover:bg-slate-600" 
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                )}
              >
                📊 {showComparacao ? 'Ocultar' : 'Comparar'} Transportes
              </button>
            </div>

            {/* Resultado */}
            {resultado && (
              <div className={cn(
                "rounded-2xl p-6 transition-all duration-500 animate-fade-in",
                darkMode ? "bg-slate-700" : "bg-gradient-to-br from-emerald-50 to-teal-50"
              )}>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {/* Emissão Total */}
                  <div className={cn(
                    "text-center p-4 rounded-xl",
                    darkMode ? "bg-slate-600" : "bg-white shadow-sm"
                  )}>
                    <p className={cn(
                      "text-sm mb-1",
                      darkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      Emissão Total
                    </p>
                    <p className={cn(
                      "text-3xl font-bold",
                      getEmissionLevel(resultado.pegada).color
                    )}>
                      {resultado.pegada}
                    </p>
                    <p className={cn(
                      "text-xs",
                      darkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      kg CO₂
                    </p>
                  </div>

                  {/* Nível */}
                  <div className={cn(
                    "text-center p-4 rounded-xl",
                    darkMode ? "bg-slate-600" : "bg-white shadow-sm"
                  )}>
                    <p className={cn(
                      "text-sm mb-1",
                      darkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      Nível de Impacto
                    </p>
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-sm font-semibold",
                      getEmissionLevel(resultado.pegada).bg,
                      getEmissionLevel(resultado.pegada).color
                    )}>
                      {getEmissionLevel(resultado.pegada).label}
                    </span>
                  </div>

                  {/* Árvores para compensar */}
                  <div className={cn(
                    "text-center p-4 rounded-xl",
                    darkMode ? "bg-slate-600" : "bg-white shadow-sm"
                  )}>
                    <p className={cn(
                      "text-sm mb-1",
                      darkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      Árvores para Compensar
                    </p>
                    <p className="text-3xl font-bold text-emerald-500">
                      {resultado.arvores}
                    </p>
                    <p className={cn(
                      "text-xs",
                      darkMode ? "text-slate-400" : "text-slate-500"
                    )}>
                      🌳 por ano
                    </p>
                  </div>
                </div>

                {/* Dica */}
                <div className={cn(
                  "p-4 rounded-xl border-l-4 border-emerald-500",
                  darkMode ? "bg-slate-600/50" : "bg-white"
                )}>
                  <p className={cn(
                    "font-medium",
                    darkMode ? "text-white" : "text-slate-700"
                  )}>
                    💡 Dica Ecológica
                  </p>
                  <p className={cn(
                    "mt-1",
                    darkMode ? "text-slate-300" : "text-slate-600"
                  )}>
                    {resultado.dica}
                  </p>
                </div>
              </div>
            )}

            {/* Comparação de Transportes */}
            {showComparacao && (
              <div className={cn(
                "mt-6 rounded-2xl p-6 animate-fade-in",
                darkMode ? "bg-slate-700" : "bg-slate-50"
              )}>
                <h3 className={cn(
                  "font-semibold mb-4 flex items-center gap-2",
                  darkMode ? "text-white" : "text-slate-800"
                )}>
                  📊 Comparação de Emissões para {distancia || 100} km
                </h3>
                <div className="space-y-3">
                  {comparacaoTransportes().map((item, index) => {
                    const maxEmissao = Math.max(...comparacaoTransportes().map(t => t.emissao));
                    const percentage = maxEmissao > 0 ? (item.emissao / maxEmissao) * 100 : 0;
                    
                    return (
                      <div key={item.key} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "font-medium flex items-center gap-2",
                            darkMode ? "text-slate-200" : "text-slate-700"
                          )}>
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                            {index === 0 && item.emissao === 0 && (
                              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                🌟 Melhor escolha!
                              </span>
                            )}
                          </span>
                          <span className={cn(
                            "font-bold",
                            item.emissao === 0 ? "text-emerald-500" : darkMode ? "text-slate-300" : "text-slate-600"
                          )}>
                            {item.emissao} kg CO₂
                          </span>
                        </div>
                        <div className={cn(
                          "h-3 rounded-full overflow-hidden",
                          darkMode ? "bg-slate-600" : "bg-slate-200"
                        )}>
                          <div
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                              item.color
                            )}
                            style={{ width: `${percentage || 2}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Histórico */}
          <div className={cn(
            "rounded-3xl p-6 shadow-xl h-fit transition-all duration-300",
            darkMode ? "bg-slate-800 shadow-slate-900/50" : "bg-white shadow-emerald-100"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn(
                "font-semibold flex items-center gap-2",
                darkMode ? "text-white" : "text-slate-800"
              )}>
                📜 Histórico
              </h3>
              {historico.length > 0 && (
                <button
                  onClick={limparHistorico}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Limpar
                </button>
              )}
            </div>

            {historico.length === 0 ? (
              <p className={cn(
                "text-center py-8",
                darkMode ? "text-slate-500" : "text-slate-400"
              )}>
                Nenhum cálculo realizado ainda.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {historico.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">
                        {EMISSION_FACTORS[item.transporte]?.icon}
                      </span>
                      <span className={cn(
                        "text-xs",
                        darkMode ? "text-slate-400" : "text-slate-500"
                      )}>
                        {item.data}
                      </span>
                    </div>
                    <p className={cn(
                      "font-medium mt-1",
                      darkMode ? "text-white" : "text-slate-700"
                    )}>
                      {item.distancia} km de {EMISSION_FACTORS[item.transporte]?.label}
                    </p>
                    <p className={cn(
                      "text-sm",
                      getEmissionLevel(item.pegada).color
                    )}>
                      {item.pegada} kg CO₂
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Estatísticas */}
            {historico.length > 0 && (
              <div className={cn(
                "mt-4 pt-4 border-t",
                darkMode ? "border-slate-700" : "border-slate-200"
              )}>
                <p className={cn(
                  "text-sm font-medium",
                  darkMode ? "text-slate-300" : "text-slate-600"
                )}>
                  📈 Total de emissões:
                </p>
                <p className="text-2xl font-bold text-orange-500">
                  {Math.round(historico.reduce((acc, item) => acc + item.pegada, 0) * 100) / 100} kg CO₂
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  darkMode ? "text-slate-400" : "text-slate-500"
                )}>
                  🌳 {Math.ceil(historico.reduce((acc, item) => acc + item.pegada, 0) / 22)} árvores para compensar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className={cn(
            "rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105",
            darkMode ? "bg-slate-800" : "bg-white shadow-lg shadow-emerald-100/50"
          )}>
            <div className="text-4xl mb-3">🌿</div>
            <h4 className={cn(
              "font-semibold",
              darkMode ? "text-white" : "text-slate-800"
            )}>
              Transporte Verde
            </h4>
            <p className={cn(
              "text-sm mt-2",
              darkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Bicicleta e caminhada são opções com zero emissão de carbono.
            </p>
          </div>
          <div className={cn(
            "rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105",
            darkMode ? "bg-slate-800" : "bg-white shadow-lg shadow-emerald-100/50"
          )}>
            <div className="text-4xl mb-3">🌳</div>
            <h4 className={cn(
              "font-semibold",
              darkMode ? "text-white" : "text-slate-800"
            )}>
              Compensação
            </h4>
            <p className={cn(
              "text-sm mt-2",
              darkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Uma árvore absorve cerca de 22kg de CO₂ por ano em média.
            </p>
          </div>
          <div className={cn(
            "rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105",
            darkMode ? "bg-slate-800" : "bg-white shadow-lg shadow-emerald-100/50"
          )}>
            <div className="text-4xl mb-3">💚</div>
            <h4 className={cn(
              "font-semibold",
              darkMode ? "text-white" : "text-slate-800"
            )}>
              Escolha Consciente
            </h4>
            <p className={cn(
              "text-sm mt-2",
              darkMode ? "text-slate-400" : "text-slate-500"
            )}>
              Cada decisão de transporte impacta o futuro do nosso planeta.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className={cn(
          "mt-12 text-center py-6 border-t",
          darkMode ? "border-slate-700" : "border-emerald-100"
        )}>
          <p className={cn(
            "text-sm",
            darkMode ? "text-slate-400" : "text-slate-500"
          )}>
            🌍 EcoTrip Calculator - Desenvolvido para o BootCamp DIO
          </p>
          <p className={cn(
            "text-xs mt-1",
            darkMode ? "text-slate-500" : "text-slate-400"
          )}>
            Feito com 💜 por{' '}
          <a 
            href="https://www.linkedin.com/in/lucascassianodev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-bold text-emerald-500 hover:text-emerald-400 hover:underline transition-colors"
          >
            Lucas Cassiano
            </a>
            <br />
            React + TypeScript + Tailwind CSS
          </p>
        </footer>
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}