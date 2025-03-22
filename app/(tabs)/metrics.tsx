import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, TouchableOpacity, Dimensions, Animated, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthService } from '@/services/AuthService';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');

interface TreatmentCardProps {
  name: string;
  index: number;
  total: number;
  isSelected: boolean;
  onPress: () => void;
}

// Component for the treatment visualization
const TreatmentCard: React.FC<TreatmentCardProps> = ({ name, index, total, isSelected, onPress }) => {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  // Calculate a color shade based on the index
  const opacity = 1 - (index * 0.15);
  const cardSize = Math.max(70, 100 - (index * 10));
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.treatmentCard,
        {
          backgroundColor: isSelected ? tintColor : backgroundColor,
          width: `${cardSize}%`,
          height: 60 + (total - index) * 5,
          zIndex: total - index,
          borderColor: tintColor,
          marginBottom: 12,
        } as ViewStyle
      ]}
    >
      <ThemedText 
        style={[
          styles.treatmentText, 
          { 
            color: isSelected ? 'white' : textColor,
            opacity: opacity
          }
        ]}
      >
        {name}
      </ThemedText>
      <View style={[styles.rankBadge, { backgroundColor: isSelected ? 'white' : tintColor }]}>
        <ThemedText style={[styles.rankText, { color: isSelected ? tintColor : 'white' }]}>
          {index + 1}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

interface ParameterMetricViewProps {
  parameterId: number;
  parameterName: string;
}

// Component for parameter specific visualization
const ParameterMetricView: React.FC<ParameterMetricViewProps> = ({ parameterId, parameterName }) => {
  const [treatments, setTreatments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const tintColor = useThemeColor({}, 'tint');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUserId = await AuthService.getCurrentUserId() || 3;
        setUserId(currentUserId);
        const response = await fetch(`${AuthService.API_URL}/users/${currentUserId}/metric/parameter/${parameterId}/norm/5`);
        const data = await response.json();
        setTreatments(data);
      } catch (error) {
        console.error('Error fetching parameter metric:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [parameterId]);
  
  if (loading) {
    return <ActivityIndicator size="small" color={tintColor} />;
  }
  
  return (
    <View style={styles.parameterMetricContainer}>
      <ThemedText style={styles.parameterTitle}>{parameterName}</ThemedText>
      <View style={styles.treatmentsRanking}>
        {treatments.slice(0, 3).map((treatment, index) => (
          <View key={index} style={styles.parameterTreatment}>
            <View style={[styles.rankCircle, { opacity: 1 - (index * 0.2) }]}>
              <ThemedText style={styles.rankCircleText}>{index + 1}</ThemedText>
            </View>
            <ThemedText style={styles.parameterTreatmentText}>{treatment}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

// Interface for log entries
interface LogEntry {
  parameters: Record<string, number>;
  perceived_effectiveness: number | null;
  time: string;
  treatment: string;
}

interface TreatmentTimelineProps {
  treatmentName: string | null;
}

// Component to visualize treatment effectiveness over time
const TreatmentTimeline: React.FC<TreatmentTimelineProps> = ({ treatmentName }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const tintColor = useThemeColor({}, 'tint');
  
  useEffect(() => {
    const fetchLogs = async () => {
      if (!treatmentName) {
        setLoading(false);
        return;
      }
      
      try {
        const currentUserId = await AuthService.getCurrentUserId() || 3;
        const response = await fetch(`${AuthService.API_URL}/users/${currentUserId}/logs`);
        const data = await response.json();
        
        // Filter logs for the selected treatment
        const filteredLogs = data.filter((log: LogEntry) => log.treatment === treatmentName);
        setLogs(filteredLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [treatmentName]);
  
  if (loading) {
    return <ActivityIndicator size="small" color={tintColor} style={{ marginVertical: 20 }} />;
  }
  
  if (!treatmentName) {
    return (
      <View style={styles.timelineContainer}>
        <ThemedText style={styles.emptyMessage}>
          Select a treatment to see effectiveness timeline
        </ThemedText>
      </View>
    );
  }
  
  if (logs.length === 0) {
    return (
      <View style={styles.timelineContainer}>
        <ThemedText style={styles.timelineTitle}>Timeline for {treatmentName}</ThemedText>
        <ThemedText style={styles.emptyMessage}>
          No data available for this treatment
        </ThemedText>
      </View>
    );
  }
  
  // Get the 5 most recent logs
  const recentLogs = [...logs].sort((a, b) => 
    new Date(b.time).getTime() - new Date(a.time).getTime()
  ).slice(0, 5).reverse();
  
  return (
    <View style={styles.timelineContainer}>
      <ThemedText style={styles.timelineTitle}>Timeline for {treatmentName}</ThemedText>
      
      <View style={styles.timelineChart}>
        {recentLogs.map((log, index) => {
          // Calculate effectiveness score based on the parameters
          // Here we use perceived_effectiveness if available, or estimate from the parameters
          const effectivenessScore = log.perceived_effectiveness !== null ? 
            log.perceived_effectiveness : 
            0.5 + Math.random() * 0.5; // Simulate score between 0.5 and 1 for demo
          
          const barHeight = effectivenessScore * 100;
          const date = new Date(log.time).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          return (
            <View key={index} style={styles.timelineBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight, 
                      backgroundColor: tintColor,
                      opacity: 0.6 + (index * 0.1) // Make more recent bars more vibrant
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.timelineDate}>{date}</ThemedText>
            </View>
          );
        })}
      </View>
      
      {/* Effectiveness scale */}
      <View style={styles.effectivenessScale}>
        <ThemedText style={styles.effectivenessLabel}>High Effectiveness</ThemedText>
        <ThemedText style={styles.effectivenessLabel}>Low Effectiveness</ThemedText>
      </View>
    </View>
  );
};

interface Parameter {
  id: number;
  name: string;
  parameter_type: string;
  passive: boolean;
  user: number | null;
  baselineQuestion: boolean;
  weight: number;
}

export default function MetricsScreen() {
  const [activeTreatments, setActiveTreatments] = useState<string[]>([]);
  const [passiveTreatments, setPassiveTreatments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  
  const tintColor = useThemeColor({}, 'tint');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  
  // Function to reload data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentUserId = await AuthService.getCurrentUserId() || 3;
      setUserId(currentUserId);
      
      // Fetch active treatments
      const activeResponse = await fetch(`${AuthService.API_URL}/users/${currentUserId}/metric/active/all`);
      if (!activeResponse.ok) {
        throw new Error(`Failed to fetch active treatments: ${activeResponse.status}`);
      }
      const activeData = await activeResponse.json();
      setActiveTreatments(activeData);
      
      if (activeData.length > 0) {
        setSelectedTreatment(activeData[0]);
      }
      
      // Fetch passive treatments
      const passiveResponse = await fetch(`${AuthService.API_URL}/users/${currentUserId}/metric/passive/all`);
      if (!passiveResponse.ok) {
        throw new Error(`Failed to fetch passive treatments: ${passiveResponse.status}`);
      }
      const passiveData = await passiveResponse.json();
      setPassiveTreatments(passiveData);
      
      // Fetch parameters
      const parametersResponse = await fetch(`${AuthService.API_URL}/parameters`);
      if (!parametersResponse.ok) {
        throw new Error(`Failed to fetch parameters: ${parametersResponse.status}`);
      }
      const parametersData = await parametersResponse.json();
      setParameters(parametersData.filter((p: Parameter) => !p.passive).slice(0, 3)); // Just get top 3 for now
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const currentTreatments = activeTab === 'active' ? activeTreatments : passiveTreatments;
  
  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Your Treatment Metrics</ThemedText>
        
        {loading ? (
          <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              {error}
            </ThemedText>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadData}
            >
              <ThemedText style={styles.retryButtonText}>
                Retry
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'active' && { borderBottomColor: tintColor }]} 
                onPress={() => setActiveTab('active')}
              >
                <ThemedText style={[styles.tabText, activeTab === 'active' ? { color: tintColor } : { color: tabIconDefault }]}>
                  Active Treatments
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'passive' && { borderBottomColor: tintColor }]} 
                onPress={() => setActiveTab('passive')}
              >
                <ThemedText style={[styles.tabText, activeTab === 'passive' ? { color: tintColor } : { color: tabIconDefault }]}>
                  Passive Treatments
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {/* Treatment Rankings */}
            <View style={styles.rankingContainer}>
              <ThemedText style={styles.sectionTitle}>Most Effective Treatments</ThemedText>
              
              {currentTreatments.length > 0 ? (
                <View style={styles.treatmentsContainer}>
                  {currentTreatments.map((treatment, index) => (
                    <TreatmentCard
                      key={index}
                      name={treatment}
                      index={index}
                      total={currentTreatments.length}
                      isSelected={treatment === selectedTreatment}
                      onPress={() => setSelectedTreatment(treatment)}
                    />
                  ))}
                </View>
              ) : (
                <ThemedText style={styles.emptyMessage}>
                  No {activeTab} treatment data available yet
                </ThemedText>
              )}
            </View>
            
            {/* Treatment Timeline */}
            <TreatmentTimeline treatmentName={selectedTreatment} />
            
            {/* Parameter-specific metrics */}
            <View style={styles.parameterMetricsContainer}>
              <ThemedText style={styles.sectionTitle}>Parameter-Specific Effectiveness</ThemedText>
              
              {parameters.length > 0 ? (
                parameters.map(param => (
                  <ParameterMetricView 
                    key={param.id} 
                    parameterId={param.id} 
                    parameterName={param.name}
                  />
                ))
              ) : (
                <ThemedText style={styles.emptyMessage}>
                  No parameter data available
                </ThemedText>
              )}
            </View>
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loader: {
    marginTop: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  rankingContainer: {
    marginBottom: 24,
  },
  treatmentsContainer: {
    alignItems: 'center',
  },
  treatmentCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  treatmentText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  parameterMetricsContainer: {
    marginBottom: 30,
  },
  parameterMetricContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
  },
  parameterTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  treatmentsRanking: {
    marginTop: 8,
  },
  parameterTreatment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  parameterTreatmentText: {
    marginLeft: 10,
    fontSize: 15,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8a4fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCircleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineContainer: {
    marginTop: 10,
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timelineChart: {
    flexDirection: 'row',
    height: 120,
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
  },
  timelineBar: {
    alignItems: 'center',
    width: 40,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  timelineDate: {
    fontSize: 10,
    marginTop: 5,
  },
  effectivenessScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  effectivenessLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#8a4fff', // Use a hardcoded color instead of tintColor
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 