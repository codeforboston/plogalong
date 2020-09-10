import * as React from 'react';
import {
  FlatList,
  Image,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import UserPicture from './UserPicture';
import Star from '../assets/svg/achievement_badges_48_48/baseline-grade-48px.svg';


const AchievementView = ({ item, achievement }) => {
	return (
		<View style={{marginLeft: 10, marginRight: 10, marginBottom: 20,}}>
	  	<View style={styles.icon}>
  			{React.createElement(item.achievement.icon, { fill: Colors.selectionColor, width: 75, height: 75 })}
  	  	<View style={styles.achievementText}>
	  	    <Text style={{color: Colors.selectionColor, fontSize: 18, fontWeight: 'bold', marginBottom: 5}}>{item.achievement.badgeTheme}</Text>
	      	<Text style={{color: "black", marginBottom: 5}}>{item.achievement.description}.</Text>
      		<Text style={{color: "black", fontWeight: 'bold'}}>+ {item.achievement.points} bonus minutes</Text>
    		</View>
  		</View>
		</View>
	)
}

const styles = StyleSheet.create({
  achievementText: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    //backgroundColor: '#EAF2F8',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.selectionColor,
    padding: 20,
    margin: 5,
    flexDirection: 'row',
  },
  star: {
    backgroundColor: '#EAF2F8',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.selectionColor,
    padding: 5,
    marginTop: 5,
    marginRight: 8,
    marginBottom: 5,
    marginLeft: 5,
    width: 59,
  },
  unlocked: {
    flexDirection: 'row',
	},
})

export default AchievementView;