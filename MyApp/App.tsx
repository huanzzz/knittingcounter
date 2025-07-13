import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import PatternDetailScreen from './src/screens/PatternDetailScreen';
import AddPatternScreen from './src/screens/AddPatternScreen';
import EditPatternNameScreen from './src/screens/EditPatternNameScreen';

export type RootStackParamList = {
  Home: undefined;
  PatternDetail: { 
    images: string[];
    projectName: string;
    needleSize: string;
  };
  AddPattern: undefined;
  EditPatternName: { images: string[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '编织图解列表' }} />
        <Stack.Screen name="PatternDetail" component={PatternDetailScreen} options={{ title: '图解详情', headerShown: false }} />
        <Stack.Screen name="AddPattern" component={AddPatternScreen} options={{ title: '新建Pattern', headerShown: false }} />
        <Stack.Screen name="EditPatternName" component={EditPatternNameScreen} options={{ title: '编辑Pattern信息', headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
