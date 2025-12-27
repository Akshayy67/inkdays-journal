import React, { useMemo } from 'react';
import { Routine } from '@/types/habit';
import { getDateKey, getDatesInRange } from '@/lib/habitUtils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Calendar, Flame, BarChart3, PieChart } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ReviewIslandProps {
  routine?: Routine;
  allRoutines: Routine[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

const ReviewIsland: React.FC<ReviewIslandProps> = ({ routine, allRoutines }) => {
  const analytics = useMemo(() => {
    if (!routine) return null;
    
    const dates = getDatesInRange(routine.startDate, routine.duration);
    const today = getDateKey(new Date());
    const pastDates = dates.filter(d => d <= today);
    
    // Calculate weekly completion rates
    const weeks: { week: string; rate: number; completed: number; total: number }[] = [];
    for (let i = 0; i < Math.ceil(pastDates.length / 7); i++) {
      const weekDates = pastDates.slice(i * 7, (i + 1) * 7);
      let completed = 0;
      let total = 0;
      
      weekDates.forEach(date => {
        routine.habits.forEach(habit => {
          total++;
          if (habit.cells[date]?.completed) completed++;
        });
      });
      
      weeks.push({ 
        week: `W${i + 1}`, 
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total 
      });
    }
    
    // Calculate momentum
    const recentWeeks = weeks.slice(-3);
    let momentum: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentWeeks.length >= 2) {
      const trend = recentWeeks[recentWeeks.length - 1].rate - recentWeeks[0].rate;
      if (trend > 10) momentum = 'improving';
      else if (trend < -10) momentum = 'declining';
    }
    
    // Current streak
    let currentStreak = 0;
    for (let i = pastDates.length - 1; i >= 0; i--) {
      const date = pastDates[i];
      const allComplete = routine.habits.every(h => h.cells[date]?.completed);
      if (allComplete) currentStreak++;
      else break;
    }

    // Per-habit completion data
    const habitData = routine.habits.map((habit, index) => {
      let completed = 0;
      pastDates.forEach(date => {
        if (habit.cells[date]?.completed) completed++;
      });
      return {
        name: habit.name.length > 12 ? habit.name.slice(0, 12) + '...' : habit.name,
        fullName: habit.name,
        completed,
        total: pastDates.length,
        rate: pastDates.length > 0 ? Math.round((completed / pastDates.length) * 100) : 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    // Daily completion for area chart (last 14 days)
    const recentDates = pastDates.slice(-14);
    const dailyData = recentDates.map(date => {
      let completed = 0;
      routine.habits.forEach(habit => {
        if (habit.cells[date]?.completed) completed++;
      });
      const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return {
        date: dayLabel,
        completed,
        total: routine.habits.length,
        rate: routine.habits.length > 0 ? Math.round((completed / routine.habits.length) * 100) : 0,
      };
    });

    // Time of day distribution
    const timeDistribution = { morning: 0, evening: 0, anytime: 0 };
    routine.habits.forEach(habit => {
      timeDistribution[habit.timeOfDay || 'anytime']++;
    });
    const timeData = [
      { name: 'Morning', value: timeDistribution.morning, fill: '#fbbf24' },
      { name: 'Evening', value: timeDistribution.evening, fill: '#8b5cf6' },
      { name: 'Anytime', value: timeDistribution.anytime, fill: 'hsl(var(--primary))' },
    ].filter(t => t.value > 0);
    
    return { weeks, momentum, currentStreak, totalDays: pastDates.length, habitData, dailyData, timeData };
  }, [routine]);

  if (!analytics) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Choose a routine to see insights</p>
      </div>
    );
  }

  const MomentumIcon = analytics.momentum === 'improving' ? TrendingUp : 
                       analytics.momentum === 'declining' ? TrendingDown : Minus;

  const momentumColor = analytics.momentum === 'improving' ? 'text-green-500' : 
                        analytics.momentum === 'declining' ? 'text-orange-400' : 'text-muted-foreground';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="floating-panel p-6 md:p-8">
        {/* Island header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Review Island</h2>
          <p className="text-muted-foreground text-sm">A quiet place to observe your journey</p>
        </div>

        {/* Momentum indicator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-6 p-4 rounded-xl bg-secondary/50"
        >
          <MomentumIcon className={`w-6 h-6 ${momentumColor}`} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Momentum</p>
            <p className={`text-lg font-medium capitalize ${momentumColor}`}>{analytics.momentum}</p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card text-center"
          >
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{analytics.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="stat-card text-center"
          >
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{analytics.totalDays}</p>
            <p className="text-xs text-muted-foreground">Days tracked</p>
          </motion.div>
        </div>

        {/* Daily Completion Trend - Area Chart */}
        {analytics.dailyData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Daily Completion (Last 14 Days)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Completion']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Weekly Comparison - Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Weekly Progress
          </h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                />
                <Bar 
                  dataKey="rate" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Habit Performance & Time Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Per-Habit Completion */}
          {analytics.habitData.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Habit Performance
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={analytics.habitData} 
                    layout="vertical" 
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                    <XAxis 
                      type="number"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% (${props.payload.completed}/${props.payload.total} days)`, 
                        props.payload.fullName
                      ]}
                    />
                    <Bar 
                      dataKey="rate" 
                      radius={[0, 4, 4, 0]}
                      maxBarSize={24}
                    >
                      {analytics.habitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Time Distribution Pie Chart */}
          {analytics.timeData.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Time Distribution
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={analytics.timeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {analytics.timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} habits`, 'Count']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Gentle message */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-sm text-muted-foreground mt-6 italic"
        >
          "Every day you show up is a day you grew."
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ReviewIsland;
