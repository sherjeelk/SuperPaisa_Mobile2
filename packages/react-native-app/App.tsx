import React, { useEffect } from "react";
import { LogBox, View, Button, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { ThemeProvider } from "./context/ThemeProvider";
import { Web3Modal } from "@web3modal/react-native";
import { providerMetadata, sessionParams } from "./constants/Config";
import { ENV_PROJECT_ID } from "@env";

export default function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();

    useEffect(() => {
        LogBox.ignoreAllLogs();
    }, []);

    const handleCreateWallet = async () => {
        try {
            console.log("Sending request to create wallet and deploy...");
            const response = await fetch('http://10.0.2.2:3000/create-wallet-and-deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: 'testuser@superpaisa.com' }),
            });

            if (response.ok) {
                console.log("Wallet creation request successful.");
                Alert.alert('Success', 'Wallet creation and deployment initiated!');
            } else {
                console.log("Wallet creation request failed.");
                Alert.alert('Error', 'Failed to initiate wallet creation.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Network error. Check server availability.');
        }
    };

    if (!isLoadingComplete) {
        return null;
    } else {
        return (
            <ThemeProvider>
                <SafeAreaProvider>
                    <Navigation colorScheme={colorScheme} />
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Button title="Create Wallet and Deploy" onPress={handleCreateWallet} />
                    </View>
                    <StatusBar />
                    <Web3Modal
                        projectId={ENV_PROJECT_ID}
                        providerMetadata={providerMetadata}
                        sessionParams={sessionParams}
                    />
                </SafeAreaProvider>
            </ThemeProvider>
        );
    }
}
