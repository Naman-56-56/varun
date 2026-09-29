import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import FloodMap from './components/Map/FloodMap';
import DashboardView from './components/Dashboard/DashboardView';
import DrainageView from './components/Drainage/DrainageView';
import RoutingView from './components/Routing/RoutingView';
import SimulationView from './components/Simulation/SimulationView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import AssistantDrawer from './components/Assistant/AssistantDrawer';
import DataSourcesModal from './components/Common/DataSourcesModal';
import { getDashboardMetrics } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [timeHorizon, setTimeHorizon] = useState('NOW');
  const [cityMetrics, setCityMetrics] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');
  const [activeRouteData, setActiveRouteData] = useState(null);
  const [simulatedRainfall, setSimulatedRainfall] = useState(null);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);

  // Poll / fetch city-level telemetry metrics
  useEffect(() => {
    getDashboardMetrics(timeHorizon, simulatedRainfall)
      .then((res) => {
        setCityMetrics(res.data);
      })
      .catch((err) => {
        console.error('Error fetching city metrics:', err);
      });
  }, [timeHorizon, simulatedRainfall]);

  const handleAskAssistant = (query) => {
    setAssistantInitialQuery(query);
    setIsAssistantOpen(true);
  };

  const handleApplySimulation = (rainfallVal) => {
    setSimulatedRainfall(rainfallVal);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsAssistantOpen={setIsAssistantOpen}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        cityMetrics={cityMetrics}
      />

      {/* Main Viewport */}
      <main className="flex-1 relative">
        {activeTab === 'map' && (
          <FloodMap
            timeHorizon={timeHorizon}
            onTimeHorizonChange={setTimeHorizon}
            activeRouteData={activeRouteData}
            onAskAssistant={handleAskAssistant}
            simulatedRainfall={simulatedRainfall}
            isAssistantOpen={isAssistantOpen}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectZone={() => setActiveTab('map')}
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToDrainage={() => setActiveTab('drainage')}
            onAskAssistant={handleAskAssistant}
            timeHorizon={timeHorizon}
          />
        )}

        {activeTab === 'drainage' && (
          <DrainageView
            onNavigateToMap={() => setActiveTab('map')}
            onAskAssistant={handleAskAssistant}
            timeHorizon={timeHorizon}
            simulatedRainfall={simulatedRainfall}
          />
        )}

        {activeTab === 'routing' && (
          <RoutingView
            onRouteCalculated={(data) => setActiveRouteData(data)}
            onNavigateToMap={() => setActiveTab('map')}
            onAskAssistant={handleAskAssistant}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationView
            onApplySimulationToMap={handleApplySimulation}
            onNavigateToMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView onAskAssistant={handleAskAssistant} />
        )}
      </main>

      {/* AI Assistant Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setAssistantInitialQuery('');
        }}
        initialQuery={assistantInitialQuery}
      />

      {/* Global Data Sources & Prototype Disclaimer Modal */}
      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
      />
    </div>
  );
}
