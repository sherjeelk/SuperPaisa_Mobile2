//import React from "react";

// New 
import React, { useEffect } from "react";
import { LogBox, View, Button, Alert } from "react-native";

import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
//import { useEffect } from "react";
//import { LogBox } from "react-native";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { ThemeProvider } from "./context/ThemeProvider";
import { Web3Modal } from "@web3modal/react-native";
import { providerMetadata, sessionParams } from "./constants/Config";

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import { ENV_PROJECT_ID } from "@env";

export default function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();

    // avoid warnings showing up in app. comment below code if you want to see warnings.
    useEffect(() => {
        LogBox.ignoreAllLogs();
    }, []);


      // New code
      const handleCreateWallet = async () => {

        try {

            const response = await fetch('http://localhost:3000/create-wallet-and-deploy', {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json',

                },

                body: JSON.stringify({ email: 'testuser@superpaisa.com' }),

            });



            if (response.ok) {

                Alert.alert('Success', 'Wallet creation and deployment initiated!');

            } else {

                Alert.alert('Error', 'Failed to initiate wallet creation.');

            }

        } catch (error) {

            Alert.alert('Error', 'Network error. Check server availability.');

            console.error('Error:', error);

        }

    };
    //New code



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
