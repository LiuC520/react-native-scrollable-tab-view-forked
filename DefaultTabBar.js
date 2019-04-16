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
  },

  getDefaultProps() {
    return {
      activeTextColor: 'navy',
      inactiveTextColor: 'black',
      backgroundColor: null,
    };
  },
  getInitialState() {
    this._tabsMeasurements = [];
    return {
      _leftTabUnderline: new Animated.Value(0),
      _lineWidth:0,
      _containerWidth: null,

    };
  },
 componentDidMount() {
    this.props.scrollValue.addListener(this.updateView);
  },

  renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
    const { activeTextColor, inactiveTextColor, textStyle } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (
      <Button
        onLayout={onLayoutHandler}
        style={{ flex: 1}}
        key={name}
        accessible
        accessibilityLabel={name}
        accessibilityTraits="button"
        onPress={() => onPressHandler(page)}
      >
        <View style={[styles.tab, this.props.tabStyle]}>
          <Text style={[{ color: textColor, fontWeight }, textStyle]}>
            {name}
          </Text>
        </View>
      </Button>
    );
  },

  updateView(offset) {
    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount = this.props.tabs.length;
    const lastTabPosition = tabCount - 1;

    // console.log(position,offset)
    if (tabCount === 0 || offset.value < 0 || offset.value > lastTabPosition) {
      return;
    }

    if (this.necessarilyMeasurementsCompleted(position, position === lastTabPosition)) {
      this.updateTabUnderline(position, pageOffset, tabCount);
    }
  },

  necessarilyMeasurementsCompleted(position,isLastTab) {
    return this._tabsMeasurements[position] &&
      (isLastTab || this._tabsMeasurements[position + 1])
  },

  updateTabUnderline(position, pageOffset, tabCount) {
    const linewidth = (this._tabsMeasurements[position].width-this.state._lineWidth) /2;
    const lineLeft = this._tabsMeasurements[position].left
    +linewidth;

    if (position < tabCount - 1) {
      const nextTabLeft = this._tabsMeasurements[position + 1].left;
      const newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft);
      this.state._leftTabUnderline.setValue(newLineLeft);
    } else {
      this.state._leftTabUnderline.setValue(lineLeft);
    }
  },
  measureTab(page, event) {
    const { x, width, height } = event.nativeEvent.layout;
    this._tabsMeasurements[page] = {
      left: x, right: x + width, width, height,
    };
    this.updateView({ value: this.props.scrollValue.__getValue() });
  },

  componentWillReceiveProps(nextProps) {
    // If the tabs change, force the width of the tabs container to be recalculated
    if (JSON.stringify(this.props.tabs) !== JSON.stringify(nextProps.tabs) && this.state._containerWidth) {
      this.setState({ _containerWidth: null });
    }
  },
  onTabContainerLayout(e) {
    this._tabContainerMeasurements = e.nativeEvent.layout;
    let width = this._tabContainerMeasurements.width;
    this.setState({ _containerWidth: width });
    this.updateView({ value: this.props.scrollValue.__getValue() });
  },

  /**
 * 刘成修改源码：
 * 增加tab可以固定宽度
 */
  render() {
    const width = Dimensions.get('window').width;
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: this._tabsMeasurements.length > 0 && this._tabsMeasurements[0] &&  this._tabsMeasurements[0].width
        ? this._tabsMeasurements[0].width : containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };
    const translateX = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0,
        // this.state.tabsWidth[this.props.activeTab]]
        containerWidth / numberOfTabs],
    });
    // if(this.props.initialPage){
    //   _tabsMeasurements
    // }
    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0,1],
    });

    // console.log(this.props.scrollValue.__getValue())

    return (
      <View style={[styles.tabs,
        {
        backgroundColor: this.props.backgroundColor,
        paddingRight: width - containerWidth
        }, this.props.style]}
          onLayout={this.onTabContainerLayout}
      >

        {this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage,this.measureTab.bind(this, page));
        })}

        <Animated.View
          style={[
            tabUnderlineStyle,
            {
              left:this.state._leftTabUnderline,
            },
            // {
            //   transform: [
            //     { translateX },
            //   ],
            // },
            this.props.underlineStyle,
          ]}
          onLayout={({nativeEvent:e})=>{
            that = this
            this.setState({_lineWidth:e.layout.width},function(){
              that.updateView({ value: that.props.scrollValue.__getValue() });
            })
            }
          }
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
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
});

module.exports = DefaultTabBar;
