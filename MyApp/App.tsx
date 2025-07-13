import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import AddPatternScreen from './src/screens/AddPatternScreen';
import PatternDetailScreen from './src/screens/PatternDetailScreen';
import EditPatternNameScreen from './src/screens/EditPatternNameScreen';

export type RootStackParamList = {
  Home: undefined;
  AddPattern: undefined;
  PatternDetail: { 
    images: string[];
    projectName: string;
    needleSize: string;
  };
  EditPatternName: { 
    images: string[];
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#fff' }
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
          />
          <Stack.Screen 
            name="AddPattern" 
            component={AddPatternScreen} 
          />
          <Stack.Screen 
            name="PatternDetail" 
            component={PatternDetailScreen} 
          />
          <Stack.Screen 
            name="EditPatternName" 
            component={EditPatternNameScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
