/*
 * @PageName: 页面名称
 * @Description: 
 * @Author: 刘成
 * @Date: 2019-09-27 16:09:20
 * @LastEditTime: 2019-09-27 16:09:20
 * @LastEditors: 刘成
 */

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view-forked'

export default class App extends Component {
  render() {
    return (
      <ScrollableTabView
        renderTabBar={() => (
          <DefaultTabBar
            style={styles.scrollStyle}
            tabStyle={styles.tabStyle}
          />
        )}
        tabBarTextStyle={styles.tabBarTextStyle}
        tabBarInactiveTextColor={'black'}
        tabBarActiveTextColor={'red'}
        tabBarUnderlineStyle={styles.underlineStyle}
        initialPage={2}
        // containerWidth={200}
      >

        <View key={'1'} tabLabel={'firt tab '} style={{flex:1,backgroundColor:'red'}}/>
        <View key={'2'} tabLabel={'second tab'} style={{flex:1,backgroundColor:'blue'}}/>
        <View key={'3'} tabLabel={'third tab'} style={{flex:1,backgroundColor:'yellow'}}/>
      </ScrollableTabView>
    );
  }
}

const styles = StyleSheet.create({
   tabStyle: {},
  scrollStyle: {
    backgroundColor: 'white',
    // paddingLeft: 65,
    // paddingRight: 65,
    // justifyContent: 'center',
  },
  tabBarTextStyle: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  underlineStyle: {
    height: 3,
    backgroundColor: 'red',
    borderRadius: 3,
    width: 15,
  },
});
