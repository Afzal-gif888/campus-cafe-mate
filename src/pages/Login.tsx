import React, { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Coffee, User, GraduationCap } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [credentials, setCredentials] = useState({
    rollNumber: '',
    username: '',
    password: ''
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCredentials({ rollNumber: '', username: '', password: '' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) return;

    const success = await login({
      role: selectedRole,
      rollNumber: selectedRole === 'student' ? credentials.rollNumber : undefined,
      username: selectedRole === 'admin' ? credentials.username : undefined,
      password: credentials.password
    });

    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetToRoleSelection = () => {
    setSelectedRole(null);
    setCredentials({ rollNumber: '', username: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-gradient-hero p-4 rounded-full shadow-medium">
              <Coffee className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-cafe-espresso">Cafe Management</h1>
          <p className="text-cafe-medium">Select your role to continue</p>
        </div>

        <Card className="shadow-medium border-cafe-light">
          <CardHeader className="space-y-4">
            {selectedRole ? (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={resetToRoleSelection}
                  className="mb-2 text-cafe-medium hover:text-cafe-dark"
                >
                  ← Back to role selection
                </Button>
                <CardTitle className="text-cafe-espresso">
                  {selectedRole === 'student' ? 'Student Login' : 'Admin Login'}
                </CardTitle>
                <CardDescription>
                  {selectedRole === 'student' 
                    ? 'Enter your roll number and password'
                    : 'Enter your admin credentials'
                  }
                </CardDescription>
              </div>
            ) : (
              <div>
                <CardTitle className="text-cafe-espresso">Choose Your Role</CardTitle>
                <CardDescription>Select how you want to access the system</CardDescription>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {!selectedRole ? (
              <div className="space-y-4">
                <Button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full h-16 bg-gradient-coffee text-white hover:opacity-90 transition-smooth"
                  size="lg"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Student Login</div>
                      <div className="text-sm opacity-90">Place orders and view menu</div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleRoleSelect('admin')}
                  className="w-full h-16 bg-cafe-dark text-white hover:bg-cafe-espresso transition-smooth"
                  size="lg"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Admin Login</div>
                      <div className="text-sm opacity-90">Manage orders and menu</div>
                    </div>
                  </div>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {selectedRole === 'student' ? (
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber" className="text-cafe-espresso">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      type="text"
                      value={credentials.rollNumber}
                      onChange={(e) => setCredentials(prev => ({ ...prev, rollNumber: e.target.value }))}
                      placeholder="Enter your roll number"
                      required
                      className="border-cafe-light focus:ring-cafe-medium"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-cafe-espresso">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter admin username"
                      required
                      className="border-cafe-light focus:ring-cafe-medium"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-cafe-espresso">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    className="border-cafe-light focus:ring-cafe-medium"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-hero text-white hover:opacity-90 transition-smooth"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                {selectedRole === 'admin' && (
                  <div className="text-xs text-cafe-medium text-center bg-cafe-cream p-3 rounded-lg">
                    Demo credentials: admin / CBIT23
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;