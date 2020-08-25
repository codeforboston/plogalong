import * as React from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { connect } from 'react-redux';

import Colors from '../constants/Colors';

import Instructions from '../components/Instructions';
import { NavLink } from '../components/Link';

import intro from '../screens/intro/intro';
import fightDirty from '../screens/intro/fightDirty';
import plog from '../screens/intro/plog';
import stayEngaged from '../screens/intro/stayEngaged';

import * as actions from '../redux/actions';


class ScreenSlider extends React.Component {
    constructor(props) {
        super(props);
        const { width } = Dimensions.get("window");

        this.state = {
            showingIndex: props.showingIndex || 0,
            width,
        };
    }

    done = () => {
        this.props.setPreferences({ sawIntro: true });
        this.props.navigation.navigate('Login');
        this.props.loginAnonymously();
    }

    advance = (step=1) => {
        let {showingIndex} = this.state;
        showingIndex += step;

        const len = 4;
        if (showingIndex >= len) {
            this.done();
            return;
        }
        if (showingIndex < 0)
            return;

        this._flatList.scrollToIndex({ index: showingIndex });
        this.setState({ showingIndex });
    }

    renderInstructions = ({index, item}) => {
        const { width } = this.state;

        return <View style={{ flex: 1, width }} key={index}>
                 <Instructions {...item}
                               onButtonPress={() => this.advance()}
                 />
               </View>;
    }

    onLayout = e => {
        const {width} = e.nativeEvent.layout;

        this.setState({ width });
    }

    onMomentumScrolled = e => {
        const {x} = e.nativeEvent.contentOffset;
        const showingIndex = Math.round(x / this.state.width);

        if (showingIndex !== this.state.showingIndex)
            this.setState({ showingIndex });
    }

    renderPageIndicator() {
        const {showingIndex} = this.state;
        const pages = [1, 2, 3, 4];

        return (
            <View style={styles.paginationDots}>
              {pages.map((_, i) => (
                  <TouchableOpacity key={i}
                                    style={[styles.dot,
                                           i === showingIndex && styles.activeDot]}/>
              ))}
            </View>
        );
    }

    render() {
        const pages = [
            intro, plog, stayEngaged, fightDirty
        ];

        return (
            <View style={styles.container}>
              <FlatList ref={list => { this._flatList = list; }}
                        data={pages}
                        keyExtractor={(page, i) => page.heading || `${i}`}
                        horizontal
                        initialNumToRender={1}
                        initialScrollIndex={this.state.showingIndex}
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        onLayout={this.onLayout}
                        onMomentumScrollEnd={this.onMomentumScrolled}
                        renderItem={this.renderInstructions}
                        style={styles.slider}
              />
              <NavLink style={styles.textLink}
                       onPress={this.done} >
                Skip intro
              </NavLink>
              {this.renderPageIndicator()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.selectionColor,
        flex: 1,
    },
    activeDot: {
        backgroundColor: 'white',
    },
    dot: {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    paginationDots: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 16,
        justifyContent: 'center',
        margin: 20,
        marginBottom: 20,
    },
    slider: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 30,
    },
    textLink: {
        color: 'white',
        fontSize: 15,
        alignSelf: 'center',
        textDecorationLine: 'underline',   
        marginTop: 10,
    },
});

export default connect(null, dispatch => ({
  loginAnonymously: (...args) => dispatch(actions.loginAnonymously(...args)),
  setPreferences: (...args) => dispatch(actions.setPreferences(...args))
}))(ScreenSlider);
