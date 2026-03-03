import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Users, Settings, Receipt, ArrowLeft, ArrowRight,
  UserPlus, Utensils, Car, Home, Map as MapIcon, ShoppingCart, Tag,
  Sun, Moon, Wallet, User, Check, X, Calendar, Edit2, Trash2, Heart,
  PieChart, Activity, Plane, Coffee, Ticket, ShoppingBag, Fuel, PlusCircle, Share2, Copy, Archive
} from 'lucide-react';

const IconMap = { Utensils, Car, Home, MapIcon, ShoppingCart, Tag, Plane, Coffee, Ticket, ShoppingBag, Fuel };

const DEFAULT_CATEGORIES = {
  'Alimentação': { icon: 'Utensils', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  'Transporte': { icon: 'Car', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/10' },
  'Alojamento': { icon: 'Home', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' },
  'Passeios': { icon: 'MapIcon', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
  'Voo': { icon: 'Plane', color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-500/10' },
  'Supermercado': { icon: 'ShoppingCart', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/10' },
  'Bebidas': { icon: 'Coffee', color: 'text-amber-700 dark:text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  'Ingressos': { icon: 'Ticket', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-500/10' },
  'Compras': { icon: 'ShoppingBag', color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
  'Combustível': { icon: 'Fuel', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/10' },
  'Outros': { icon: 'Tag', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/10' },
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// ============================================================================
// COMPONENTE APP PRINCIPAL (Gerencia Temas e Histórico Global)
// ============================================================================
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme_mode');
    if (savedMode) return savedMode === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [rateios, setRateios] = useState(() => {
    const saved = localStorage.getItem('historico_rateios');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeRateioId, setActiveRateioId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('historico_rateios', JSON.stringify(rateios));
    } catch (error) {
      console.error("Erro ao salvar dados locais:", error);
      alert("Armazenamento cheio! O comprovante ou a quantidade de viagens ultrapassou o limite do seu aparelho.");
    }
  }, [rateios]);

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('historico_categorias');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('historico_categorias', JSON.stringify(customCategories));
    } catch (error) {
      console.error("Erro ao salvar categorias locais:", error);
    }
  }, [customCategories]);

  if (!activeRateioId) {
    return (
      <AllTripsScreen
        rateios={rateios}
        setRateios={setRateios}
        setActiveRateioId={setActiveRateioId}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <TripScope
      rateios={rateios}
      setRateios={setRateios}
      activeRateioId={activeRateioId}
      goBack={() => setActiveRateioId(null)}
      customCategories={customCategories}
      setCustomCategories={setCustomCategories}
    />
  );
}

// ============================================================================
// ECRÃ: LISTA DE RATEIOS (Visão Global)
// ============================================================================
function AllTripsScreen({ rateios, setRateios, setActiveRateioId, isDarkMode, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('active');
  const [globalTab, setGlobalTab] = useState('trips'); // trips | friends | activity | settings
  const [newRateioModal, setNewRateioModal] = useState({ isOpen: false, name: '', date: new Date().toISOString().split('T')[0] });
  const [editRateioModal, setEditRateioModal] = useState({ isOpen: false, id: null, name: '', date: '' });

  const createRateio = (e) => {
    e.preventDefault();
    if (!newRateioModal.name.trim() || !newRateioModal.date) return;
    const newRateio = {
      id: generateId(),
      name: newRateioModal.name.trim(),
      date: newRateioModal.date,
      participants: [],
      expenses: [],
      centralizerId: null,
      isFinished: false
    };
    setRateios([...rateios, newRateio]);
    setNewRateioModal({ isOpen: false, name: '', date: new Date().toISOString().split('T')[0] });
    setActiveRateioId(newRateio.id);
  };

  const deleteRateio = (id) => {
    if (window.confirm("Confirmar exclusão desta viagem?")) {
      setRateios(rateios.filter(r => r.id !== id));
    }
  };

  const toggleFinishRateio = (id) => {
    setRateios(rateios.map(r => {
      if (r.id === id) {
        return { ...r, isFinished: !r.isFinished };
      }
      return r;
    }));
  };

  return (
    <div className="min-h-screen bg-brand-lightBg dark:bg-brand-darkBg text-slate-800 dark:text-white flex flex-col pb-20 transition-colors duration-200 w-full max-w-md mx-auto relative shadow-2xl">

      {/* HEADER */}
      <div className="px-6 pt-10 pb-4 bg-brand-lightBg dark:bg-brand-darkBg sticky top-0 z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 overflow-hidden relative rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 shrink-0">
              <img
                src="/logo_variations.png"
                alt="Split Trip Logo"
                className={`absolute left-0 top-0 w-full max-w-none transition-transform duration-300 pointer-events-none drop-shadow-sm ${isDarkMode ? '-translate-y-1/2' : 'translate-y-0'}`}
                style={{ height: '206.6%' }} // 465/225 ratio
              />
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Split Trip</h1>
          </div>
          <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-brand-darkCard text-slate-500 dark:text-slate-400 shadow-sm transition-colors">
            {isDarkMode ? <Sun size={18} className="text-brand-green" /> : <Moon size={18} />}
          </button>
        </div>

        {/* TABS */}
        {globalTab === 'trips' && (
          <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800">
            <button onClick={() => setActiveTab('active')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'active' ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 dark:text-slate-500'}`}>Ativos</button>
            <button onClick={() => setActiveTab('past')} className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'past' ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 dark:text-slate-500'}`}>Passados</button>
          </div>
        )}
        {globalTab === 'friends' && <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Meus Amigos</h2>}
        {globalTab === 'activity' && <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Atividade Global</h2>}
        {globalTab === 'settings' && <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Ajustes</h2>}
      </div>

      {/* CONTENT */}
      {globalTab === 'trips' && (
        <div className="px-6 flex-1 overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            {activeTab === 'active' ? 'Viagens em Andamento' : 'Viagens Passadas'}
          </h2>

          {(() => {
            const displayed = rateios.filter(r => activeTab === 'active' ? !r.isFinished : r.isFinished);
            if (displayed.length === 0) {
              return (
                <div className="text-center py-12">
                  <Receipt size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma viagem {activeTab === 'active' ? 'em andamento' : 'passada'}.</p>
                </div>
              );
            }
            return (
              <div className="space-y-5">
                {displayed.sort((a, b) => new Date(b.date) - new Date(a.date)).map(rateio => {
                  const totalGasto = rateio.expenses.reduce((acc, exp) => acc + exp.amount, 0);
                  return (
                    <div key={rateio.id} className="bg-white dark:bg-brand-darkCard rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 cursor-pointer" onClick={() => setActiveRateioId(rateio.id)}>
                          <h3 className="text-lg font-bold">{rateio.name}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5"><Calendar size={12} /> {new Date(rateio.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        </div>
                        <div className="flex items-center gap-1 z-10">
                          <button onClick={(e) => { e.stopPropagation(); toggleFinishRateio(rateio.id); }} className="text-slate-300 hover:text-brand-green transition-colors p-2 bg-slate-50 dark:bg-brand-darkBg rounded-full" title={rateio.isFinished ? "Reativar viagem" : "Encerrar viagem"}><Archive size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); setEditRateioModal({ isOpen: true, id: rateio.id, name: rateio.name, date: rateio.date }); }} className="text-slate-300 hover:text-brand-green transition-colors p-2 bg-slate-50 dark:bg-brand-darkBg rounded-full"><Edit2 size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteRateio(rateio.id); }} className="text-slate-300 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-brand-darkBg rounded-full"><Trash2 size={16} /></button>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mb-5">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Gasto Total</p>
                          <p className="text-lg font-black font-mono">R$ {totalGasto.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs px-2 py-0.5 rounded-full font-bold ${rateio.isFinished ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'text-brand-green bg-brand-green/10'}`}>
                            {rateio.isFinished ? 'Encerrada' : 'Ativa'}
                          </p>
                        </div>
                      </div>

                      <button onClick={() => setActiveRateioId(rateio.id)} className="w-full bg-brand-green/10 hover:bg-brand-green/20 text-brand-green dark:text-[#00D06C] font-bold py-3 rounded-xl transition-colors text-sm">
                        Ver Detalhes
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {globalTab === 'friends' && <GlobalFriendsScreen rateios={rateios} />}
      {globalTab === 'activity' && <GlobalActivityScreen rateios={rateios} categories={DEFAULT_CATEGORIES} />}
      {globalTab === 'settings' && <GlobalSettingsScreen isDarkMode={isDarkMode} toggleTheme={toggleTheme} setRateios={setRateios} />}

      {/* FAB - CREATE RATEIO */}
      {globalTab === 'trips' && (
        <button onClick={() => setNewRateioModal({ ...newRateioModal, isOpen: true })} className="absolute bottom-24 right-6 bg-brand-green w-14 h-14 rounded-full shadow-lg shadow-brand-green/30 flex items-center justify-center text-white hover:bg-brand-greenHover transition-transform active:scale-95">
          <Plus size={24} />
        </button>
      )}

      {/* GLOBAL BOTTOM NAV */}
      <div className="fixed bottom-0 w-full max-w-md bg-white dark:bg-brand-darkCard border-t border-slate-100 dark:border-brand-darkBg px-6 flex justify-between items-center pb-8 safe-area-pb z-20 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        <NavBtn icon={<MapIcon size={24} />} label="Viagens" active={globalTab === 'trips'} onClick={() => setGlobalTab('trips')} />
        <NavBtn icon={<Users size={24} />} label="Amigos" active={globalTab === 'friends'} onClick={() => setGlobalTab('friends')} />
        <NavBtn icon={<Activity size={24} />} label="Atividade" active={globalTab === 'activity'} onClick={() => setGlobalTab('activity')} />
        <NavBtn icon={<Settings size={24} />} label="Ajustes" active={globalTab === 'settings'} onClick={() => setGlobalTab('settings')} />
      </div>

      {/* CREATE MODAL */}
      {newRateioModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkCard w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Nova Viagem</h3>
              <button onClick={() => setNewRateioModal({ ...newRateioModal, isOpen: false })} className="p-2 bg-slate-100 dark:bg-brand-darkBg rounded-full text-slate-500"><X size={18} /></button>
            </div>
            <form onSubmit={createRateio}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome</label>
                  <input type="text" autoFocus required placeholder="Ex: Férias de Verão" className="w-full bg-slate-50 dark:bg-brand-darkBg border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-green outline-none" value={newRateioModal.name} onChange={(e) => setNewRateioModal({ ...newRateioModal, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data Início</label>
                  <input type="date" required className="w-full bg-slate-50 dark:bg-brand-darkBg border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-green outline-none" value={newRateioModal.date} onChange={(e) => setNewRateioModal({ ...newRateioModal, date: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl hover:bg-brand-greenHover transition-colors">Criar Viagem</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editRateioModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkCard w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Editar Viagem</h3>
              <button onClick={() => setEditRateioModal({ ...editRateioModal, isOpen: false })} className="p-2 bg-slate-100 dark:bg-brand-darkBg rounded-full text-slate-500"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editRateioModal.name.trim() || !editRateioModal.date) return;
              setRateios(rateios.map(r => r.id === editRateioModal.id ? { ...r, name: editRateioModal.name.trim(), date: editRateioModal.date } : r));
              setEditRateioModal({ isOpen: false, id: null, name: '', date: '' });
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome</label>
                  <input type="text" autoFocus required className="w-full bg-slate-50 dark:bg-brand-darkBg border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-green outline-none" value={editRateioModal.name} onChange={(e) => setEditRateioModal({ ...editRateioModal, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data Início</label>
                  <input type="date" required className="w-full bg-slate-50 dark:bg-brand-darkBg border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-green outline-none" value={editRateioModal.date} onChange={(e) => setEditRateioModal({ ...editRateioModal, date: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl hover:bg-brand-greenHover transition-colors">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ESCOPO INTERNO DO RATEIO (Gerencia Navegação Interna do Rateio)
// ============================================================================
function TripScope({ rateios, setRateios, activeRateioId, goBack, customCategories, setCustomCategories }) {
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard | activity | balances | group
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const currentRateioIndex = rateios.findIndex(r => r.id === activeRateioId);
  const rateio = rateios[currentRateioIndex] || { expenses: [], participants: [] };

  const categories = useMemo(() => {
    const merged = { ...DEFAULT_CATEGORIES };
    Object.entries(customCategories).forEach(([name, def]) => {
      merged[name] = def;
    });
    return merged;
  }, [customCategories]);

  const updateCurrentRateio = (updatedData) => {
    const newRateios = [...rateios];
    newRateios[currentRateioIndex] = { ...rateio, ...updatedData };
    setRateios(newRateios);
  };

  // Funções Financeiras Base
  const expenses = rateio.expenses || [];
  const participants = rateio.participants || [];
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Calcula histórico de pessoas para facilitar inserção
  const historicNames = Array.from(new Set(rateios.flatMap(r => r.participants?.map(p => p.name) || [])))
    .filter(name => !participants.some(p => p.name === name)).sort();

  return (
    <div className="min-h-screen bg-brand-lightBg dark:bg-brand-darkBg text-slate-800 dark:text-white flex flex-col w-full max-w-md mx-auto relative shadow-2xl transition-colors duration-200">

      {/* FULL SCREEN ADD/EDIT EXPENSE */}
      {isAddingExpense ? (
        <AddExpenseScreen
          rateio={rateio}
          initialExpense={typeof isAddingExpense === 'object' ? isAddingExpense : null}
          onClose={() => setIsAddingExpense(false)}
          updateRateio={updateCurrentRateio}
          categories={categories}
          customCategories={customCategories}
          setCustomCategories={setCustomCategories}
        />
      ) : (
        <>
          {/* HEADER SUPERIOR */}
          <div className="px-6 pt-10 pb-4 flex justify-between items-center sticky top-0 bg-brand-lightBg/90 dark:bg-brand-darkBg/90 backdrop-blur-md z-10">
            <button onClick={goBack} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-brand-darkCard text-slate-800 dark:text-white shadow-sm border border-slate-100 dark:border-brand-darkCard"><ArrowLeft size={20} /></button>
            <h1 className="font-bold text-lg truncate px-4">{rateio.name}</h1>
            <div className="w-10"></div> {/* Spacer para centrar título */}
          </div>

          {/* ÁREA DE CONTEÚDO */}
          <div className="flex-1 overflow-y-auto pb-28 px-6">
            {currentTab === 'dashboard' && <TripDashboard rateio={rateio} totalExpenses={totalExpenses} onAdd={() => setIsAddingExpense(true)} onEditExpense={(exp) => setIsAddingExpense(exp)} onSettle={() => setCurrentTab('balances')} updateRateio={updateCurrentRateio} categories={categories} />}
            {currentTab === 'activity' && <TripActivityFeed rateio={rateio} categories={categories} onEditExpense={(exp) => setIsAddingExpense(exp)} />}
            {currentTab === 'balances' && <BalancesScreen rateio={rateio} totalExpenses={totalExpenses} updateRateio={updateCurrentRateio} />}
            {currentTab === 'group' && <GroupSettingsScreen rateio={rateio} updateRateio={updateCurrentRateio} historicNames={historicNames} />}
          </div>

          {/* INNER BOTTOM NAV */}
          <div className="fixed bottom-0 w-full max-w-md bg-white dark:bg-brand-darkCard border-t border-slate-100 dark:border-brand-darkBg px-6 flex justify-between items-center pb-8 safe-area-pb z-20 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
            <NavBtn icon={<PieChart size={24} />} label="Início" active={currentTab === 'dashboard'} onClick={() => setCurrentTab('dashboard')} />
            <NavBtn icon={<Activity size={24} />} label="Atividade" active={currentTab === 'activity'} onClick={() => setCurrentTab('activity')} />

            {/* FLOATING ACTION BOTTON IN CENTER */}
            <div className="relative -top-6">
              <button onClick={() => setIsAddingExpense(true)} className="bg-brand-green w-16 h-16 rounded-full shadow-xl shadow-brand-green/30 flex items-center justify-center text-white hover:bg-brand-greenHover transition-transform active:scale-95 border-4 border-brand-lightBg dark:border-brand-darkBg">
                <Plus size={28} />
              </button>
            </div>

            <NavBtn icon={<Wallet size={24} />} label="Saldos" active={currentTab === 'balances'} onClick={() => setCurrentTab('balances')} />
            <NavBtn icon={<Users size={24} />} label="Grupo" active={currentTab === 'group'} onClick={() => setCurrentTab('group')} />
          </div>
        </>
      )}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 pt-5 w-16 transition-colors ${active ? 'text-brand-green' : 'text-slate-400 dark:text-slate-500'}`}>
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

// ============================================================================
// TELA: DASHBOARD DA VIAGEM
// ============================================================================
function TripDashboard({ rateio, totalExpenses, onAdd, onEditExpense, onSettle, updateRateio, categories }) {
  const expenses = rateio.expenses || [];

  // Agrupar por categoria
  const catTotals = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  const handleDeleteExpense = (id) => {
    if (window.confirm("Confirmar exclusão desta despesa?")) {
      updateRateio({ expenses: expenses.filter(e => e.id !== id) });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* BALANÇO CARD */}
      <div className="bg-slate-900 dark:bg-brand-darkCard rounded-[32px] p-6 text-white relative overflow-hidden shadow-lg">
        {/* Glow effect on dark card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 relative z-10">Total Gasto</p>
        <h2 className="text-4xl font-black font-mono relative z-10 mb-6 tracking-tight">R$ {totalExpenses.toFixed(2)}</h2>

        <div className="flex gap-3 relative z-10">
          <button onClick={onAdd} className="flex-1 bg-brand-green hover:bg-brand-greenHover text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
            <Plus size={18} /> Adicionar
          </button>
          <button onClick={onSettle} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm backdrop-blur-sm">
            <Receipt size={18} /> Acertos
          </button>
        </div>
      </div>

      {/* CATEGORIAS */}
      {Object.keys(catTotals).length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-4">Gastos por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
              const catStyle = categories[cat] || categories['Outros'] || { icon: 'Tag', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/10' };
              const CatIcon = IconMap[catStyle.icon] || Tag;
              return (
                <div key={cat} className="flex items-center justify-between bg-white dark:bg-brand-darkCard p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${catStyle.bg} ${catStyle.color}`}><CatIcon size={20} /></div>
                    <span className="font-bold text-sm">{cat}</span>
                  </div>
                  <span className="font-mono font-bold text-sm">R$ {amount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECENTES */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-sm font-bold">Transações Recentes</h3>
        </div>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-6">Nenhum registo ainda.</p>
          ) : (
            expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(e => {
              const catStyle = categories[e.category || 'Outros'] || { icon: 'Tag', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/10' };
              const CatIcon = IconMap[catStyle.icon] || Tag;
              const payerName = rateio.participants.find(p => p.id === e.payerId)?.name || 'Alguém';

              return (
                <div key={e.id} className="flex items-center justify-between bg-white dark:bg-brand-darkCard p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 relative group overflow-hidden">
                  <div className="flex items-center gap-3 relative z-10 w-full pr-16 md:pr-0 md:w-auto">
                    <div className={`p-2.5 rounded-xl ${catStyle.bg} ${catStyle.color} shrink-0`}><CatIcon size={18} /></div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{e.description || e.category}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">Pago por <span className="font-semibold">{payerName}</span></p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm relative z-10 self-center md:static absolute right-4 top-1/2 -translate-y-1/2 md:translate-y-0 bg-white dark:bg-brand-darkCard md:bg-transparent pl-2 group-hover:opacity-0 md:group-hover:opacity-100 transition-opacity">R$ {e.amount.toFixed(2)}</span>

                  {/* Hover Actions (Mobile and Desktop) */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white dark:bg-brand-darkCard pl-2">
                    <button onClick={() => onEditExpense(e)} className="p-2 text-slate-400 hover:text-brand-green bg-slate-50 dark:bg-brand-darkBg rounded-full transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteExpense(e.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-brand-darkBg rounded-full transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TELA: ADICIONAR DESPESA (FULL SCREEN MODAL)
// ============================================================================
function AddExpenseScreen({ rateio, initialExpense, onClose, updateRateio, categories, customCategories, setCustomCategories }) {
  const participants = rateio.participants || [];
  const [form, setForm] = useState(initialExpense || {
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Alimentação',
    payerId: participants.length > 0 ? participants[0].id : '',
    receipt: null
  });

  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [showCategorySelectModal, setShowCategorySelectModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size > 1 * 1024 * 1024) { // 1MB for PDF
          alert('PDFs não podem ultrapassar 1MB para não lotar o armazenamento do navegador.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(prev => ({ ...prev, receipt: reader.result }));
        };
        reader.readAsDataURL(file);
      } else {
        // Image Compression
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const MAX_DIMENSION = 800; // Resize to reasonable dimensions

            if (width > height) {
              if (width > MAX_DIMENSION) {
                height *= MAX_DIMENSION / width;
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width *= MAX_DIMENSION / height;
                height = MAX_DIMENSION;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.6 quality to save space
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

            // Validate size (rough base64 approx)
            if (compressedBase64.length > 500 * 1024) { // Roughly 500KB 
              alert('A imagem é muito grande mesmo após compressão. Escolha outra.');
              return; // Avoid saving and crashing
            }

            setForm(prev => ({ ...prev, receipt: compressedBase64 }));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeReceipt = () => setForm(prev => ({ ...prev, receipt: null }));

  const handleSave = (e) => {
    e?.preventDefault();
    if (!form.amount || !form.payerId) return;
    const val = parseFloat(form.amount.toString().replace(',', '.'));
    if (isNaN(val) || val <= 0) return;

    if (initialExpense) {
      // Edição
      const updatedExpense = {
        ...initialExpense,
        amount: val,
        description: form.description.trim(),
        date: form.date,
        category: form.category,
        payerId: form.payerId,
        receipt: form.receipt
      };
      updateRateio({ expenses: rateio.expenses.map(exp => exp.id === initialExpense.id ? updatedExpense : exp) });
    } else {
      // Novo
      const newExpense = {
        id: generateId(),
        amount: val,
        description: form.description.trim(),
        date: form.date,
        category: form.category,
        payerId: form.payerId,
        receipt: form.receipt
      };
      updateRateio({ expenses: [...(rateio.expenses || []), newExpense] });
    }
    onClose();
  };

  if (participants.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Users size={48} className="text-slate-300 mb-4" />
        <h2 className="text-lg font-bold mb-2">Sem participantes</h2>
        <p className="text-sm text-slate-500 mb-6">Adicione amigos primeiro no menu Grupo.</p>
        <button onClick={onClose} className="bg-brand-green px-6 py-3 rounded-xl text-white font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-brand-lightBg dark:bg-brand-darkBg animate-in slide-in-from-bottom flex flex-col h-[100dvh]">
      {/* Header Modal */}
      <div className="px-6 pt-10 pb-4 flex justify-between items-center sticky top-0 bg-brand-lightBg dark:bg-brand-darkBg z-10">
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-brand-darkCard text-slate-500"><X size={20} /></button>
        <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400">Nova Despesa</h2>
        <button onClick={handleSave} className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-green/10 text-brand-green"><Check size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28">
        {/* BIG AMOUNT INPUT */}
        <div className="py-8 text-center flex flex-col items-center border-b border-slate-200 dark:border-slate-800 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor Total</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-black text-brand-green">R$</span>
            <input
              type="number" step="0.01" placeholder="0.00" autoFocus
              className="bg-transparent border-none text-5xl font-black font-mono w-48 text-center placeholder-slate-300 dark:placeholder-slate-700 focus:ring-0 p-0"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="space-y-4">
            {/* Descrição */}
            <div className="bg-white dark:bg-brand-darkCard p-1 rounded-2xl flex items-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="p-3 text-slate-400"><Edit2 size={20} /></div>
              <input type="text" placeholder="Com o que foi o gasto?" className="flex-1 bg-transparent border-none py-3 pr-4 text-sm focus:ring-0 font-medium placeholder-slate-400" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Data e Categoria Linha */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-brand-darkCard p-1 rounded-2xl flex items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="p-3 text-slate-400"><Calendar size={18} /></div>
                <input type="date" className="flex-1 bg-transparent border-none py-3 pr-2 text-sm focus:ring-0 font-medium" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="bg-white dark:bg-brand-darkCard p-1 rounded-2xl flex items-center border border-slate-100 dark:border-slate-800 shadow-sm relative">
                <button
                  type="button"
                  onClick={() => setShowCategorySelectModal(true)}
                  className="w-full flex items-center justify-between py-2 px-3 bg-transparent border-none focus:ring-0"
                >
                  <div className="flex items-center gap-2 truncate">
                    {(() => {
                      const selCat = categories[form.category] || categories['Outros'] || { icon: 'Tag', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/10' };
                      const SelIcon = IconMap[selCat.icon] || Tag;
                      return (
                        <div className={`p-1.5 rounded-lg ${selCat.bg} ${selCat.color} shrink-0`}>
                          <SelIcon size={16} />
                        </div>
                      );
                    })()}
                    <span className="truncate font-medium text-sm text-slate-800 dark:text-white">{form.category}</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quem Pagou?</h3>
              <div className="flex flex-wrap gap-2">
                {participants.map(p => (
                  <button key={p.id} type="button" onClick={() => setForm({ ...form, payerId: p.id })} className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${form.payerId === p.id ? 'bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20 scale-105' : 'bg-white dark:bg-brand-darkCard border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Receipt Section */}
            <div className="pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Comprovante (Opcional)</h3>
              {form.receipt ? (
                <div className="relative inline-block mt-2">
                  {form.receipt.startsWith('data:image') ? (
                    <img src={form.receipt} alt="Comprovante" className="h-24 w-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
                  ) : (
                    <div className="h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 flex-col gap-1 shadow-sm">
                      <Receipt size={24} />
                      <span className="text-[10px] uppercase font-bold text-center px-1 truncate w-full">Documento</span>
                    </div>
                  )}
                  <button type="button" onClick={removeReceipt} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"><X size={14} /></button>
                </div>
              ) : (
                <label className="flex items-center gap-3 bg-white dark:bg-brand-darkCard p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer w-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mt-2">
                  <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl"><Copy size={20} /></div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 flex-1">Anexar foto ou PDF</span>
                  <span className="text-xs text-slate-400 font-medium">Máx 5MB</span>
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleReceiptChange} />
                </label>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white dark:bg-brand-darkCard border-t border-slate-100 dark:border-brand-darkBg p-6 pb-8 safe-area-pb z-20">
        <button onClick={handleSave} className="w-full bg-brand-green hover:bg-brand-greenHover text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-green/20 transition-transform active:scale-95 text-lg">
          {initialExpense ? 'Atualizar Despesa' : 'Guardar Despesa'}
        </button>
      </div>

      {/* MODAL NOVA CATEGORIA */}
      {showNewCatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 min-h-[100dvh]" onClick={() => setShowNewCatModal(false)}>
          <div className="bg-white dark:bg-brand-darkCard w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Nova Categoria Pessoal</h3>
            <input
              autoFocus
              placeholder="Ex: Lavandaria"
              className="w-full bg-slate-50 dark:bg-brand-darkBg border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none mb-6"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!newCatName.trim()) return;
                  const name = newCatName.trim();
                  setCustomCategories({ ...customCategories, [name]: { icon: 'Tag', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' } });
                  setForm({ ...form, category: name });
                  setShowNewCatModal(false);
                  setNewCatName('');
                }
              }}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNewCatModal(false)} type="button" className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">Cancelar</button>
              <button
                type="button"
                onClick={() => {
                  if (!newCatName.trim()) return;
                  const name = newCatName.trim();
                  setCustomCategories({ ...customCategories, [name]: { icon: 'Tag', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' } });
                  setForm({ ...form, category: name });
                  setShowNewCatModal(false);
                  setNewCatName('');
                }}
                className="flex-1 bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-brand-greenHover transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SELECIONAR CATEGORIA (CUSTOM SELECT) */}
      {showCategorySelectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] flex flex-col justify-end" onClick={() => setShowCategorySelectModal(false)}>
          <div
            className="bg-brand-lightBg dark:bg-brand-darkBg w-full max-w-md mx-auto rounded-t-[32px] p-6 pb-8 safe-area-pb shadow-2xl animate-in slide-in-from-bottom flex flex-col"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '85vh' }}
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-bold">Escolher Categoria</h3>
              <button type="button" onClick={() => setShowCategorySelectModal(false)} className="p-2 bg-white dark:bg-brand-darkCard shadow-sm rounded-full text-slate-500 hover:text-brand-green"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar flex-1 pb-10">
              {/* Opção para Nova Categoria no Topo */}
              <button
                type="button"
                onClick={() => { setShowCategorySelectModal(false); setShowNewCatModal(true); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-brand-darkCard transition-transform active:scale-95 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent mb-4"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                  <Plus size={20} />
                </div>
                <span className="font-bold text-sm text-brand-green">Criar Nova Categoria...</span>
              </button>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-4"></div>

              {/* Lista de Categorias */}
              {Object.entries(categories).map(([catName, catStyle]) => {
                const CatIcon = IconMap[catStyle.icon] || Tag;
                const isSelected = form.category === catName;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, category: catName });
                      setShowCategorySelectModal(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-95 ${isSelected ? 'bg-white dark:bg-brand-darkCard border-2 border-brand-green shadow-md' : 'bg-white/50 dark:bg-brand-darkCard/50 border-2 border-transparent hover:bg-white dark:hover:bg-brand-darkCard'}`}
                  >
                    <div className={`p-3 rounded-xl ${catStyle.bg} ${catStyle.color} shrink-0`}>
                      <CatIcon size={20} />
                    </div>
                    <span className={`font-bold text-sm flex-1 text-left ${isSelected ? 'text-brand-green' : 'text-slate-800 dark:text-white'}`}>{catName}</span>
                    {isSelected && <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center text-white shrink-0"><Check size={14} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TELA: BALANÇOS E ACERTOS
// ============================================================================
function BalancesScreen({ rateio, totalExpenses, updateRateio }) {
  const participants = rateio.participants || [];
  const expenses = rateio.expenses || [];
  const [isCentralized, setIsCentralized] = useState(false);
  const [centralizedPayerId, setCentralizedPayerId] = useState('');

  const avg = participants.length > 0 ? totalExpenses / participants.length : 0;

  // 1. Calculate individual balances
  const rawBalances = participants.map(p => {
    const paidByP = expenses.filter(e => e.payerId === p.id).reduce((acc, curr) => acc + curr.amount, 0);
    return { ...p, paid: paidByP, bal: paidByP - avg };
  });

  // 2. Group Couples
  const balances = [];
  const processedIds = new Set();
  rawBalances.forEach(b => {
    if (processedIds.has(b.id)) return;
    if (b.partnerId) {
      const partner = rawBalances.find(p => p.id === b.partnerId);
      if (partner && !processedIds.has(partner.id)) {
        processedIds.add(b.id);
        processedIds.add(partner.id);
        balances.push({
          id: b.id + '_' + partner.id,
          name: `${b.name} & ${partner.name}`,
          paid: b.paid + partner.paid,
          bal: b.bal + partner.bal,
          pix: b.pix || partner.pix || '',
          originalIds: [b.id, partner.id]
        });
        return;
      }
    }
    processedIds.add(b.id);
    balances.push({ ...b, originalIds: [b.id] });
  });

  // Automatically set centralized payer if enabled but none selected
  useEffect(() => {
    if (isCentralized && !centralizedPayerId && participants.length > 0) {
      setCentralizedPayerId(participants[0].id);
    }
  }, [isCentralized, centralizedPayerId, participants]);

  // 3. Calc Settlements
  const calculateSettlements = (bals) => {
    if (isCentralized && centralizedPayerId) {
      // Find the grouped entity that contains the chosen individual payer
      const centerP = bals.find(b => b.originalIds && b.originalIds.includes(centralizedPayerId));
      if (!centerP) return [];

      const sets = [];
      bals.forEach(b => {
        if (b.id === centerP.id) return;
        if (b.bal < -0.01) {
          sets.push({ from: b.name, to: centerP.name, amount: Math.abs(b.bal), toPix: centerP.pix });
        } else if (b.bal > 0.01) {
          sets.push({ from: centerP.name, to: b.name, amount: b.bal, toPix: b.pix });
        }
      });
      return sets;
    }

    // Normal minimization algorithm
    const debtors = bals.filter(b => b.bal < -0.01).map(b => ({ ...b, bal: Math.abs(b.bal) })).sort((a, b) => b.bal - a.bal);
    const creditors = bals.filter(b => b.bal > 0.01).map(b => ({ ...b })).sort((a, b) => b.bal - a.bal);
    const sets = [];
    let d = 0, c = 0;
    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d], creditor = creditors[c];
      const amt = Math.min(debtor.bal, creditor.bal);
      if (amt > 0.01) sets.push({ from: debtor.name, to: creditor.name, amount: amt, toPix: creditor.pix });
      debtor.bal -= amt; creditor.bal -= amt;
      if (debtor.bal < 0.01) d++;
      if (creditor.bal < 0.01) c++;
    }
    return sets;
  };

  const settlements = calculateSettlements(balances.map(b => ({ ...b })));

  // 4. Handle Share
  const handleShare = async () => {
    let text = `💰 *Resumo da Viagem*\n`;
    text += `Total Gasto: R$ ${totalExpenses.toFixed(2)}\n`;
    if (avg > 0) text += `Gasto Médio: R$ ${avg.toFixed(2)} por pessoa\n\n`;

    text += `🔄 *Saldos:*\n`;
    balances.forEach(b => {
      const balText = b.bal > 0.01 ? `Recebe R$ ${(b.bal).toFixed(2)}` : b.bal < -0.01 ? `Deve R$ ${Math.abs(b.bal).toFixed(2)}` : `Quitado`;
      text += `- ${b.name}: ${balText}\n`;
    });

    text += `\n💸 *Quem paga a quem:*\n`;
    if (settlements.length === 0) {
      text += `Tudo certo! Ninguém deve a ninguém. 🎉\n`;
    } else {
      settlements.forEach(s => {
        text += `➡ ${s.from} paga R$ ${s.amount.toFixed(2)} a ${s.to}\n`;
        if (s.toPix) text += `   PIX: ${s.toPix}\n`;
      });
    }

    if (navigator.share) {
      try { await navigator.share({ title: 'Acertos da Viagem', text }); } catch (err) { }
    } else {
      navigator.clipboard.writeText(text);
      alert('Resumo copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      <div className="flex gap-4">
        <div className="bg-white dark:bg-brand-darkCard flex-1 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
          <p className="text-xs text-brand-green font-bold uppercase tracking-widest mb-1 mt-1">Gasto Médio</p>
          <p className="text-xl font-black font-mono">R$ {avg.toFixed(2)}</p>
        </div>
        <button onClick={handleShare} className="bg-brand-green text-white p-5 rounded-3xl shadow-sm hover:bg-brand-greenHover transition-colors flex items-center justify-center">
          <Share2 size={24} />
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold">Saldos do Grupo</h3>
          {rawBalances.length !== balances.length && (
            <span className="text-[10px] bg-brand-green/20 text-brand-green px-2 py-1 rounded-full font-bold">Casais Agrupados</span>
          )}
        </div>

        <div className="space-y-3">
          {balances.map(b => (
            <div key={b.id} className="bg-white dark:bg-brand-darkCard p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-brand-darkBg flex items-center justify-center font-bold text-slate-500">
                  {b.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm">{b.name}</p>
                  <p className="text-xs text-slate-400">Pagou R$ {b.paid.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black font-mono block ${b.bal > 0.01 ? 'text-brand-green' : b.bal < -0.01 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {b.bal > 0.01 ? '+' : b.bal < -0.01 ? '-' : ''} R$ {Math.abs(b.bal).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{b.bal > 0.01 ? 'A Receber' : b.bal < -0.01 ? 'A Pagar' : 'Quitado'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-col mb-4">
          <h3 className="text-sm font-bold mb-1">Quem paga a quem?</h3>

          <div className="flex items-center justify-between bg-slate-50 dark:bg-brand-darkBg p-3 rounded-xl mt-2 border border-slate-200 dark:border-slate-800">
            <div className="flex-1">
              <span className="text-xs font-bold block dark:text-white">Centralizar Pagamentos</span>
              <span className="text-[10px] text-slate-500 block">Um tesoureiro recebe e distribui o dinheiro</span>
            </div>
            <button
              onClick={() => setIsCentralized(!isCentralized)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isCentralized ? 'bg-brand-green' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isCentralized ? 'translate-x-2' : '-translate-x-2'}`} />
            </button>
          </div>

          {isCentralized && (
            <div className="mt-2 text-xs">
              <span className="text-slate-500 mr-2">Tesoureiro:</span>
              <select
                value={centralizedPayerId}
                onChange={(e) => setCentralizedPayerId(e.target.value)}
                className="bg-white dark:bg-brand-darkCard border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs focus:ring-1 focus:ring-brand-green outline-none"
              >
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {settlements.length === 0 ? (
          <div className="text-center p-6 bg-brand-green/10 border border-brand-green/20 rounded-2xl text-brand-green font-bold">
            🎉 Tudo em dia!
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div key={i} className="bg-white dark:bg-brand-darkCard p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-rose-500 truncate">{s.from}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deve</p>
                  </div>
                  <div className="px-2 md:px-4">
                    <ArrowRight size={18} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-sm text-brand-green truncate">{s.to}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recebe</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-brand-darkBg px-4 py-3 -mx-5 -mb-5 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                  <div className="flex-1">
                    {s.toPix ? (
                      <div className="flex items-center gap-1.5 text-xs text-brand-green font-medium cursor-pointer" onClick={() => { navigator.clipboard.writeText(s.toPix); alert('Chave PIX copiada!'); }}>
                        <span className="bg-brand-green text-white text-[9px] font-black px-1.5 py-0.5 rounded">PIX</span>
                        <span className="truncate">{s.toPix}</span>
                        <Copy size={12} className="shrink-0" />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sem PIX registado</span>
                    )}
                  </div>
                  <span className="font-mono font-black text-lg bg-white dark:bg-brand-darkCard px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">R$ {s.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TELA: ATIVIDADE (FEED)
// ============================================================================
function TripActivityFeed({ rateio, onEditExpense }) {
  const expenses = rateio.expenses || [];
  const participants = rateio.participants || [];

  return (
    <div className="animate-in fade-in">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 px-1">Feed de Atividade</h3>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
        {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map((e, idx) => {
          const payer = participants.find(p => p.id === e.payerId)?.name || 'Alguém';
          return (
            <div key={e.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon / Node */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-brand-lightBg dark:border-brand-darkBg bg-brand-green text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                <Receipt size={16} />
              </div>

              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-brand-darkCard p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white"><span className="text-brand-green">{payer}</span> adicionou um gasto</p>
                  <span className="font-mono font-black text-xs bg-slate-100 dark:bg-brand-darkBg px-2 py-1 rounded-md">R$ {e.amount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-2">{e.description || e.category}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10} /> {new Date(e.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>

                {/* Ações na atividade */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <button onClick={() => onEditExpense(e)} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-brand-green transition-colors"><Edit2 size={12} /> Editar</button>
                </div>
              </div>
            </div>
          );
        })}
        {expenses.length === 0 && <p className="text-slate-400 text-sm italic py-10 w-full text-center">Tão sossegado... Registe um gasto!</p>}
      </div>
    </div>
  );
}

// ============================================================================
// TELA: DEFINIÇÕES DO GRUPO (Amigos) -> Com suporte a 'Casais' e 'Edição'
// ============================================================================
function GroupSettingsScreen({ rateio, updateRateio, historicNames }) {
  const participants = rateio.participants || [];
  const [newName, setNewName] = useState('');
  const [newPix, setNewPix] = useState('');
  const [editingParticipant, setEditingParticipant] = useState(null); // {id, name, pix}

  const addPart = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    updateRateio({ participants: [...participants, { id: generateId(), name: newName.trim(), partnerId: null, pix: newPix.trim() }] });
    setNewName('');
    setNewPix('');
  }

  const saveEditPart = () => {
    if (!editingParticipant.name.trim()) return;
    updateRateio({
      participants: participants.map(p => p.id === editingParticipant.id ? { ...p, name: editingParticipant.name.trim(), pix: editingParticipant.pix?.trim() || '' } : p)
    });
    setEditingParticipant(null);
  }

  const removePart = (id) => {
    const hasExp = rateio.expenses?.some(e => e.payerId === id);
    if (hasExp) { alert("Esta pessoa tem gastos associados!"); return; }
    // Remover também a ligação se for parceiro de alguém
    updateRateio({ participants: participants.filter(p => p.id !== id).map(p => p.partnerId === id ? { ...p, partnerId: null } : p) });
  }

  const linkPartners = (id1, id2) => {
    updateRateio({
      participants: participants.map(p => {
        if (p.id === id1) return { ...p, partnerId: id2 === "" ? null : id2 };
        if (p.id === id2) return { ...p, partnerId: id1 };
        // Se alguém já era parceiro de id1 ou id2, remover ligação antiga
        if (p.partnerId === id1 || p.partnerId === id2) return { ...p, partnerId: null };
        return p;
      })
    });
  };

  return (
    <div className="animate-in fade-in space-y-8">
      <div>
        <h3 className="text-sm font-bold mb-4">Membros Atuais ({participants.length})</h3>
        <div className="space-y-3 mb-6">
          {participants.map(p => (
            <div key={p.id} className="flex flex-col bg-white dark:bg-brand-darkCard p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3 w-full border-r border-slate-100 dark:border-slate-800 pr-2">
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex shrink-0 items-center justify-center font-bold text-sm">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  {editingParticipant?.id === p.id ? (
                    <div className="flex w-full items-center gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Nome"
                          value={editingParticipant.name}
                          onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditPart()}
                          className="w-full bg-slate-50 dark:bg-brand-darkBg border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-brand-green outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Chave PIX (Opcional)"
                          value={editingParticipant.pix || ''}
                          onChange={(e) => setEditingParticipant({ ...editingParticipant, pix: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditPart()}
                          className="w-full bg-slate-50 dark:bg-brand-darkBg border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-brand-green outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={saveEditPart} className="p-1.5 text-brand-green hover:bg-brand-green/10 rounded-full transition-colors"><Check size={16} /></button>
                        <button onClick={() => setEditingParticipant(null)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"><X size={16} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm block truncate">{p.name}</span>
                      {p.pix && <span className="text-[10px] text-slate-400 block truncate">PIX: {p.pix}</span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 pl-2 shrink-0 self-start mt-2">
                  <button onClick={() => setEditingParticipant({ id: p.id, name: p.name, pix: p.pix || '' })} className="p-2 text-slate-300 hover:text-brand-green bg-slate-50 dark:bg-brand-darkBg rounded-full transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => removePart(p.id)} className="p-2 text-slate-300 hover:text-red-500 bg-slate-50 dark:bg-brand-darkBg rounded-full transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Casal Connection */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-brand-darkBg p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                <Heart size={14} className="text-rose-500 shrink-0" />
                <select
                  className="bg-transparent border-none text-xs text-slate-500 dark:text-slate-400 w-full focus:ring-0 cursor-pointer"
                  value={p.partnerId || ""}
                  onChange={(e) => linkPartners(p.id, e.target.value)}
                >
                  <option value="">Sem parceiro(a)</option>
                  {participants.filter(other => other.id !== p.id).map(other => (
                    <option key={other.id} value={other.id}>{other.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {participants.length === 0 && <p className="text-slate-400 text-sm italic text-center py-4">Nenhum membro no grupo. Adicione alguém!</p>}
        </div>

        <form onSubmit={addPart} className="flex flex-col gap-2">
          <input type="text" placeholder="Nome do participante" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white dark:bg-brand-darkCard border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-green outline-none shadow-sm" />
          <div className="flex gap-2">
            <input type="text" placeholder="Chave PIX (Opcional)" value={newPix} onChange={e => setNewPix(e.target.value)} className="flex-1 bg-white dark:bg-brand-darkCard border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none shadow-sm" />
            <button type="submit" disabled={!newName.trim()} className="bg-brand-green text-white px-6 rounded-2xl font-bold font-mono text-lg shadow-sm disabled:opacity-50 hover:bg-brand-greenHover transition-colors">+</button>
          </div>
        </form>
      </div>

      {historicNames.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Adicionar Rápidamente</h3>
          <div className="flex flex-wrap gap-2">
            {historicNames.map((name, i) => (
              <button key={i} onClick={() => updateRateio({ participants: [...participants, { id: generateId(), name, partnerId: null, pix: '' }] })} className="bg-white dark:bg-brand-darkCard border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 hover:border-brand-green hover:text-brand-green transition-colors shadow-sm">
                <Plus size={12} /> {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TELA GLOBAL: AMIGOS
// ============================================================================
function GlobalFriendsScreen({ rateios }) {
  const friends = Array.from(new Set(rateios.flatMap(r => r.participants?.map(p => p.name) || []))).sort();

  return (
    <div className="px-6 flex-1 overflow-y-auto pb-28">
      {friends.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Ainda não tens amigos registados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map(name => (
            <div key={name} className="bg-white dark:bg-brand-darkCard p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold uppercase">
                {name.substring(0, 2)}
              </div>
              <span className="font-bold text-sm">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TELA GLOBAL: ATIVIDADE
// ============================================================================
function GlobalActivityScreen({ rateios, categories }) {
  const allExpenses = rateios.flatMap(r =>
    (r.expenses || []).map(e => ({ ...e, rateioName: r.name, payerName: r.participants.find(p => p.id === e.payerId)?.name || 'Alguém' }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="px-6 flex-1 overflow-y-auto pb-28">
      {allExpenses.length === 0 ? (
        <div className="text-center py-12">
          <Activity size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Sem atividade recente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allExpenses.map(e => {
            const catStyle = categories[e.category || 'Outros'] || { icon: 'Tag', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/10' };
            const CatIcon = IconMap[catStyle.icon] || Tag;

            return (
              <div key={`${e.id}-${e.rateioName}`} className="flex items-center justify-between bg-white dark:bg-brand-darkCard p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3 w-full pr-16">
                  <div className={`p-2.5 rounded-xl ${catStyle.bg} ${catStyle.color} shrink-0`}><CatIcon size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{e.description || e.category}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate"><span className="font-semibold">{e.payerName}</span> em {e.rateioName}</p>
                  </div>
                </div>
                <span className="font-mono font-black text-sm shrink-0">R$ {e.amount.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TELA GLOBAL: AJUSTES
// ============================================================================
function GlobalSettingsScreen({ isDarkMode, toggleTheme, setRateios }) {
  const handleClearData = () => {
    if (window.confirm("ATENÇÃO! Isto vai apagar TODAS as tuas viagens e dados. Desejas continuar?")) {
      setRateios([]);
      localStorage.removeItem('historico_rateios');
      localStorage.removeItem('historico_categorias');
      window.location.reload();
    }
  };

  return (
    <div className="px-6 flex-1 overflow-y-auto space-y-6 pb-28">
      <div className="bg-white dark:bg-brand-darkCard rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-sm">Modo Escuro</h3>
              <p className="text-xs text-slate-400">Alternar tema da aplicação</p>
            </div>
          </div>
          <button onClick={toggleTheme} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-brand-green' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-brand-darkCard rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perigo</h3>
        <button onClick={handleClearData} className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
          <span className="font-bold text-sm">Apagar Todos os Dados</span>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
