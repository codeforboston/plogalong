import * as React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';


import Box from '../components/Box';

import $S from '../styles';

// https://expo.github.io/vector-icons/
// https://icons.expo.fyi
// https://github.com/codeforboston/plogalong/issues/185
// https://mobti.me/plogalong
// https://marvelapp.com/prototype/6548b00/screen/76879305
// https://material.io/resources/icons/?search=money&icon=paid&style=baseline

export default class CouchPloggingScreen extends React.Component {
    static navigationOptions = {
        title: 'Couch Plogging'
    };

    render() {
        return (
            <ScrollView style={$S.container} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={$S.bodyContainer}>
                    <Text style={$S.body}>
                        Plogalong is a volunteer project built by Code for Boston civic hackers.
                    </Text>
                    <Text style={$S.body}>
                        Contribute to Plogalong app maintenance, design, and development by purchasing bonus plogging minutes.
                    </Text>
                    <Text style={$S.body}>
                        Get in on the ground floor! Someday your plogging minutes will be worth their weight in cryptocurrency (Just kidding). However, 10% of your in-app purchase will be donated to the Climate Reality Project.
                    </Text>
                </View>
                <View>
                    <View style={{flexDirection: "row", justifyContent: 'space-around', marginBottom: 10}}>
                        <Box style={{ height: 100, flexShrink: 1}}
                            content={                        
                            <>
                                <MaterialCommunityIcons name="currency-usd" color= {Colors.selectionColor} size={32} />
                                <Text style={$S.itemTitle}>$5.99</Text>
                                <Text style={{color: Colors.selectionColor}}>+60 minutes</Text>
                            </>                        
                        }
                        />
                        <Box style={{ height: 100, flexShrink: 1,}} 
                            content={                        
                            <>
                                <MaterialCommunityIcons name="currency-usd" color= {Colors.selectionColor} size={32} />
                                <Text style={$S.itemTitle}>$10.99</Text>
                                <Text style={{color: Colors.selectionColor}}>+150 minutes</Text>
                            </>                        
                        }/>
                        <Box style={{ height: 100, flexShrink: 1,}} 
                            content={                        
                            <>
                                <MaterialCommunityIcons name="currency-usd" color= {Colors.selectionColor} size={32} />
                                <Text style={$S.itemTitle}>$19.99</Text>
                                <Text style={{color: Colors.selectionColor}}>+500 minutes</Text>
                            </>                        
                        }/>
                    </View>
                    <View>
                        <Box style={{width: "auto", paddingVertical: 20, borderWidth: 1}}
                            content={<>
                            <Text style={$S.itemTitle}>
                                Business Partnerships
                            </Text>
                            <Text style={{color: Colors.selectionColor, paddingHorizontal: 6, textAlign: 'center'}}>
                                Contact us directly about sponsorships and collaboration opportunities. We are currently building functionality to allow local businesses to support ploggers.
                            </Text>
                            </>} 
                        />
                    </View>
                </View>
            </ScrollView>
        );
    }
}


const styles = StyleSheet.create({

});
