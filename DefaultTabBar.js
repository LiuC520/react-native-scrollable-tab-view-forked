
const React = require('react');
const { ViewPropTypes } = ReactNative = require('react-native');
const PropTypes = require('prop-types');
const createReactClass = require('create-react-class');

const {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
} = ReactNative;
const Button = require('./Button');

const DefaultTabBar = createReactClass({
  propTypes: {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    textStyle: Text.propTypes.style,
    tabStyle: ViewPropTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: ViewPropTypes.style,
    width:PropTypes.number,
  },

  getDefaultProps() {
    return {
      activeTextColor: 'navy',
      inactiveTextColor: 'black',
      backgroundColor: null,
      width:Dimensions.get('window').width
    };
  },
  
  renderTab(child, page, isTabActive, onPressHandler) {
    const { activeTextColor, inactiveTextColor, textStyle } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (
      <Button
        style={{ flex: 1}}
        key={child.tabLabel}
        accessible
        accessibilityLabel={child.tabLabel}
        accessibilityTraits="button"
        onPress={() => onPressHandler(page)}
      >
        <View style={[styles.tab, this.props.tabStyle]}>
          <Text style={[{ color: textColor, fontWeight }, textStyle]}>
            {child.tabLabel}
          </Text>
        </View>
      </Button>
    );
  },

  /**
 * 刘成修改源码：
 * 增加tab可以固定宽度
 */
  render() {
    const width = this.props.width;
    const containerWidth = this.props.containerWidth || width;
    const numberOfTabs = this.props.tabs.length;
    const eachWidth = containerWidth / numberOfTabs
    const tabUnderlineStyle = {
      position: 'absolute',
      width: eachWidth,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };
    let left = 0;
    if(this.props.underlineStyle && this.props.underlineStyle.width){
      left = eachWidth / 2 - this.props.underlineStyle.width / 2;
    }
   const translateX = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, eachWidth],
    });
    return (
      <View style={[styles.tabs,
        {
        backgroundColor: this.props.backgroundColor,
        paddingRight: width - containerWidth
        }, this.props.style]}
      >

        {this.props.tabs.map((child, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(child, page, isTabActive, this.props.goToPage);
        })}

        <Animated.View
          ref={sl=>this.animatedLine = sl}
          style={[
            tabUnderlineStyle,
            {
              left,
            },
             {
              transform: [
                { translateX },
              ],
            },
            this.props.underlineStyle,
          ]}
        />
      </View>
    );
  },
});

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingBottom: 10,
  },
  tabs: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#E6E6E6',
  },
});

module.exports = DefaultTabBar;
