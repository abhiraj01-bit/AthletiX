import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Trophy, TrendingUp, Filter, Search, Star } from 'lucide-react';
import APIService from '@/lib/api';

interface AthleteProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  district: string;
  sport: string;
  averageScore: number;
  totalTests: number;
  bestPerformances: Record<string, any>;
  recentTrend: string;
  rank: number;
}

export default function CoachDashboard() {
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<AthleteProfile[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    gender: 'all',
    district: 'all',
    sport: 'all',
    minScore: 0
  });
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAthletes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [athletes, filters]);

  const loadAthletes = async () => {
    try {
      // Get leaderboard data which contains athlete profiles
      const leaderboard = await APIService.getLeaderboard('national', 'All', '', 100);
      
      const athleteProfiles: AthleteProfile[] = leaderboard.map((entry, index) => ({
        id: entry.userId,
        name: entry.name,
        age: Math.floor(Math.random() * 15) + 16, // Mock age 16-30
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        district: entry.district,
        sport: entry.sport,
        averageScore: entry.score,
        totalTests: Math.floor(Math.random() * 10) + 1,
        bestPerformances: { pushUps: entry.score, sitUps: entry.score - 5 },
        recentTrend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)],
        rank: entry.rank
      }));

      setAthletes(athleteProfiles);
    } catch (error) {
      console.error('Failed to load athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = athletes.filter(athlete => {
      const matchesSearch = athlete.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           athlete.district.toLowerCase().includes(filters.search.toLowerCase());
      const matchesGender = filters.gender === 'all' || athlete.gender === filters.gender;
      const matchesDistrict = filters.district === 'all' || athlete.district === filters.district;
      const matchesSport = filters.sport === 'all' || athlete.sport === filters.sport;
      const matchesScore = athlete.averageScore >= filters.minScore;

      return matchesSearch && matchesGender && matchesDistrict && matchesSport && matchesScore;
    });

    setFilteredAthletes(filtered);
  };

  const getBenchmarkColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBenchmarkLabel = (score: number) => {
    if (score >= 90) return 'National';
    if (score >= 80) return 'State';
    if (score >= 70) return 'District';
    return 'Regional';
  };

  const mockPerformanceData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 68 },
    { month: 'Mar', score: 72 },
    { month: 'Apr', score: 75 },
    { month: 'May', score: 78 },
    { month: 'Jun', score: 82 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading athlete data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze athlete performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {filteredAthletes.length} Athletes
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Athletes</p>
                <p className="text-2xl font-bold">{athletes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">National Level</p>
                <p className="text-2xl font-bold">{athletes.filter(a => a.averageScore >= 90).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Improving</p>
                <p className="text-2xl font-bold">{athletes.filter(a => a.recentTrend === 'improving').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{Math.round(athletes.reduce((sum, a) => sum + a.averageScore, 0) / athletes.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="athletes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="athletes">Athlete Profiles</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="athletes" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Search Athletes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search athletes..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.district} onValueChange={(value) => setFilters({...filters, district: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {[...new Set(athletes.map(a => a.district))].map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.sport} onValueChange={(value) => setFilters({...filters, sport: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {[...new Set(athletes.map(a => a.sport))].map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Min Score"
                  value={filters.minScore}
                  onChange={(e) => setFilters({...filters, minScore: Number(e.target.value)})}
                />
                <Button onClick={() => setFilters({search: '', gender: 'all', district: 'all', sport: 'all', minScore: 0})}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Athletes List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAthletes.map((athlete) => (
              <Card key={athlete.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAthlete(athlete)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{athlete.name}</CardTitle>
                    <Badge className={getBenchmarkColor(athlete.averageScore)}>
                      #{athlete.rank}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {athlete.age}y • {athlete.gender} • {athlete.district}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Score:</span>
                      <span className="font-bold">{athlete.averageScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Tests:</span>
                      <span>{athlete.totalTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Level:</span>
                      <Badge variant="outline" className={getBenchmarkColor(athlete.averageScore)}>
                        {getBenchmarkLabel(athlete.averageScore)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Trend:</span>
                      <span className={`text-sm ${
                        athlete.recentTrend === 'improving' ? 'text-green-600' :
                        athlete.recentTrend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {athlete.recentTrend}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { range: '90-100', count: athletes.filter(a => a.averageScore >= 90).length },
                    { range: '80-89', count: athletes.filter(a => a.averageScore >= 80 && a.averageScore < 90).length },
                    { range: '70-79', count: athletes.filter(a => a.averageScore >= 70 && a.averageScore < 80).length },
                    { range: '60-69', count: athletes.filter(a => a.averageScore >= 60 && a.averageScore < 70).length },
                    { range: '<60', count: athletes.filter(a => a.averageScore < 60).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>National Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span>National Level</span>
                    <Badge className="bg-green-600">90-100</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span>State Level</span>
                    <Badge className="bg-blue-600">80-89</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span>District Level</span>
                    <Badge className="bg-yellow-600">70-79</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span>Regional Level</span>
                    <Badge className="bg-red-600">60-69</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAthletes.slice(0, 5).map((athlete, index) => (
                    <div key={athlete.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{athlete.name}</span>
                      </div>
                      <span className="font-bold">{athlete.averageScore}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Athlete Detail Modal */}
      {selectedAthlete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedAthlete.name} - Detailed Profile</CardTitle>
                <Button variant="outline" onClick={() => setSelectedAthlete(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Demographics</h4>
                  <div className="space-y-1 text-sm">
                    <p>Age: {selectedAthlete.age} years</p>
                    <p>Gender: {selectedAthlete.gender}</p>
                    <p>District: {selectedAthlete.district}</p>
                    <p>Sport: {selectedAthlete.sport}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <p>Overall Rank: #{selectedAthlete.rank}</p>
                    <p>Average Score: {selectedAthlete.averageScore}/100</p>
                    <p>Total Tests: {selectedAthlete.totalTests}</p>
                    <p>Trend: <span className={`${
                      selectedAthlete.recentTrend === 'improving' ? 'text-green-600' :
                      selectedAthlete.recentTrend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                    }`}>{selectedAthlete.recentTrend}</span></p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Performance Trend</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Benchmark Comparison</h4>
                <div className="p-4 border rounded">
                  <div className="flex items-center justify-between">
                    <span>Current Level:</span>
                    <Badge className={getBenchmarkColor(selectedAthlete.averageScore)}>
                      {getBenchmarkLabel(selectedAthlete.averageScore)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}