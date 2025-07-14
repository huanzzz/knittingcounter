import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AddPatternScreen from './src/screens/AddPatternScreen';
import PatternDetailScreen from './src/screens/PatternDetailScreen';
import EditPatternNameScreen from './src/screens/EditPatternNameScreen';
import { initDatabase } from './src/utils/database';
import { PhotoStorage } from './src/utils/PhotoStorage';

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
  useEffect(() => {
    // 初始化数据库和照片存储
    const initApp = async () => {
      try {
        await initDatabase();
        await PhotoStorage.init();
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddPattern" component={AddPatternScreen} />
        <Stack.Screen name="PatternDetail" component={PatternDetailScreen} />
        <Stack.Screen name="EditPatternName" component={EditPatternNameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
