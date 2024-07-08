import React, { useEffect, useState, useRef } from "react";
import { LogBox, View, Button, Alert, Text, AppState, AppStateStatus } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { ThemeProvider } from "./context/ThemeProvider";
import { Web3Modal } from "@web3modal/react-native";
import { providerMetadata, sessionParams } from "./constants/Config";
import { ENV_PROJECT_ID } from "@env";
import { getQuote, checkAndSetAllowance, getTransaction, executeTransaction } from './services/VoyagerService';
import { ethers } from 'ethers';

export default function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();
    const [status, setStatus] = useState('');
    const [quoteData, setQuoteData] = useState<any>(null);
    const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL'); // Ensure this is your actual RPC URL
    const wallet = useRef<ethers.Wallet | null>(null);

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
                const data = await response.json();
                console.log("Wallet creation request successful.");
                wallet.current = new ethers.Wallet(data.privateKey, provider);
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

    const handleVoyagerOperation = async () => {
        try {
            if (!wallet.current) {
                Alert.alert('Error', 'Please create wallet first');
                return;
            }

            setStatus('Getting quote...');
            const quoteParams = {
                fromTokenAddress: '0x0000000000000000000000000000000000000000', // Replace with actual token address on Polygon Mumbai
                toTokenAddress: '0x0000000000000000000000000000000000000000',   // Replace with actual token address on Avalanche Fuji
                amount: '1000000000000000000', // 1 token in wei (adjust as needed)
                fromTokenChainId: '80001',
                toTokenChainId: '43113',
                widgetId: 0
            };

            const quote = await getQuote(quoteParams);
            if (!quote || !quote.allowanceTo) {
                throw new Error('Quote data is invalid');
            }
            setQuoteData(quote);

            setStatus('Checking and setting allowance...');
            await checkAndSetAllowance(wallet.current, quoteParams.fromTokenAddress, quote.allowanceTo, quoteParams.amount);

            setStatus('Executing transaction...');
            const txData = await getTransaction(quoteParams, quote);
            await executeTransaction(wallet.current, txData);

            setStatus('Transaction complete');
            Alert.alert('Success', 'Cross-chain transfer completed successfully!');
        } catch (error) {
            console.error('Error:', error);
            setStatus('Transaction failed');
            Alert.alert('Error', `Transaction failed: ${error.message}`);
        }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
            // App is in the foreground
        }
    };

    useEffect(() => {
        AppState.addEventListener('change', handleAppStateChange);
        return () => {
            AppState.removeEventListener('change', handleAppStateChange);
        };
    }, []);

    if (!isLoadingComplete) {
        return null;
    } else {
        return (
            <ThemeProvider>
                <SafeAreaProvider>
                    <Navigation colorScheme={colorScheme} />
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Button title="Create Wallet and Deploy" onPress={handleCreateWallet} />
                        <Button title="Initiate Cross-Chain Transfer" onPress={handleVoyagerOperation} />
                        <Text>{status}</Text>
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
