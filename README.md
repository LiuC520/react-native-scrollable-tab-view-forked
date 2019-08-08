<!--
 * @PageName: 页面名称
 * @Description: 
 * @Author: 刘成
 * @Date: 2019-08-08 15:56:02
 * @LastEditTime: 2019-08-08 16:00:00
 * @LastEditors: 刘成
 -->

## react-native-scrollable-tab-view-forked
[![npm version](https://badge.fury.io/js/react-native-scrollable-tab-view-forked.svg)](https://badge.fury.io/js/react-native-scrollable-tab-view-forked)

This is probably my favorite navigation pattern on Android, I wish it
were more common on iOS! This is a very simple JavaScript-only
implementation of it for React Native. For more information about how
the animations behind this work, check out the Rebound section of the
[React Native Animation Guide](https://facebook.github.io/react-native/docs/animations.html)

## add , set line width
## add , fix defaulttabbar's width
## add , can set DefaultTabBar's width
## add , can set ScrollableTabBar's width



## Add it to your project

1. Run `npm install react-native-scrollable-tab-view-forked --save`
2. `import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view-forked'`

## Demo
![示例](https://github.com/LiuC520/react-native-scrollable-tab-view-forked/blob/master/example/example.png)

## Basic usage

```javascript

export default class App extends Component {
  render() {
    return (
      <ScrollableTabView

        renderTabBar={() => (
          <ScrollableTabBar
            style={styles.scrollStyle}
            tabStyle={styles.tabStyle}
          />
        )}
        tabBarTextStyle={styles.tabBarTextStyle}
        tabBarInactiveTextColor={'black'}
        tabBarActiveTextColor={'red'}
        tabBarUnderlineStyle={styles.underlineStyle}
        initialPage={2}
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
    paddingLeft: 65,
    paddingRight: 65,
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
```

## Injecting a custom tab bar

Suppose we had a custom tab bar called `CustomTabBar`, we would inject
it into our `ScrollableTabView` like this:

```javascript
var ScrollableTabView = require('react-native-scrollable-tab-view-forked');
var CustomTabBar = require('./CustomTabBar');

var App = React.createClass({
  render() {
    return (
      <ScrollableTabView renderTabBar={() => <CustomTabBar someProp={'here'} />}>
        <ReactPage tabLabel="React" />
        <FlowPage tabLabel="Flow" />
        <JestPage tabLabel="Jest" />
      </ScrollableTabView>
    );
  }
});
```
To start you can just copy [DefaultTabBar](https://github.com/skv-headless/react-native-scrollable-tab-view-forked/blob/master/DefaultTabBar.js).

## Examples 示例可以参考react-native-scrollable-tab-view中的实例，用法一样

[SimpleExample](https://github.com/skv-headless/react-native-scrollable-tab-view/blob/master/examples/FacebookTabsExample/SimpleExample.js).

[ScrollableTabsExample](https://github.com/skv-headless/react-native-scrollable-tab-view/blob/master/examples/FacebookTabsExample/ScrollableTabsExample.js).

[OverlayExample](https://github.com/skv-headless/react-native-scrollable-tab-view/blob/master/examples/FacebookTabsExample/OverlayExample.js).

[FacebookExample](https://github.com/skv-headless/react-native-scrollable-tab-view/blob/master/examples/FacebookTabsExample/FacebookExample.js).

## Props

- **`renderTabBar`** _(Function:ReactComponent)_ - accept 1 argument `props` and should return a component to use as
  the tab bar. The component has `goToPage`, `tabs`, `activeTab` and
  `ref` added to the props, and should implement `setAnimationValue` to
  be able to animate itself along with the tab content. You can manually pass the `props` to the TabBar component.
- **`tabBarPosition`** _(String)_ Defaults to `"top"`.
  - `"bottom"` to position the tab bar below content.
  - `"overlayTop"` or `"overlayBottom"` for a semitransparent tab bar that overlays content. Custom tab bars must consume a style prop on their outer element to support this feature: `style={this.props.style}`.
- **`onChangeTab`** _(Function)_ - function to call when tab changes, should accept 1 argument which is an Object containing two keys: `i`: the index of the tab that is selected, `ref`: the ref of the tab that is selected
- **`onScroll`** _(Function)_ - function to call when the pages are sliding, should accept 1 argument which is an Float number representing the page position in the slide frame.
- **`locked`** _(Bool)_ - disables horizontal dragging to scroll between tabs, default is false.
- **`initialPage`** _(Integer)_ - the index of the initially selected tab, defaults to 0 === first tab.
- **`page`** _(Integer)_ - set selected tab(can be buggy see  [#126](https://github.com/brentvatne/react-native-scrollable-tab-view/issues/126)
- **`children`** _(ReactComponents)_ - each top-level child component should have a `tabLabel` prop that can be used by the tab bar component to render out the labels. The default tab bar expects it to be a string, but you can use anything you want if you make a custom tab bar.
- **`tabBarUnderlineStyle`** _([View.propTypes.style](https://facebook.github.io/react-native/docs/view.html#style))_ - style of the default tab bar's underline.
can set width in tabBarUnderlineStyle.
- **`tabBarBackgroundColor`** _(String)_ - color of the default tab bar's background, defaults to `white`
- **`tabBarActiveTextColor`** _(String)_ - color of the default tab bar's text when active, defaults to `navy`
- **`tabBarInactiveTextColor`** _(String)_ - color of the default tab bar's text when inactive, defaults to `black`
- **`tabBarTextStyle`** _(Object)_ - Additional styles to the tab bar's text. Example: `{fontFamily: 'Roboto', fontSize: 15}`
- **`style`** _([View.propTypes.style](https://facebook.github.io/react-native/docs/view.html#style))_
- **`contentProps`** _(Object)_ - props that are applied to root `ScrollView`/`ViewPagerAndroid`. Note that overriding defaults set by the library may break functionality; see the source for details.
- **`scrollWithoutAnimation`** _(Bool)_ - on tab press change tab without animation.
- **`prerenderingSiblingsNumber`** _(Integer)_ - pre-render nearby # sibling, `Infinity` === render all the siblings, default to 0 === render current page.

## Contribution
**Issues** are welcome. Please add a screenshot of bug and code snippet. Quickest way to solve issue is to reproduce it on one of the examples.

**Pull requests** are welcome. If you want to change API or making something big better to create issue and discuss it first. Before submiting PR please run ```eslint .``` Also all eslint fixes are welcome.

Please attach video or gif to PR's and issues it is super helpful.

<a href="http://www.abeautifulsite.net/recording-a-screencast-with-quicktime/" target="_blank">How to make video</a>

<a href="https://github.com/jclem/gifify" target="_blank">How to make gif from video</a>

---

**MIT Licensed**
